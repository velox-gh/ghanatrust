import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import prisma from '../config/database.js';
import {
  sendWelcomeEmail,
} from '../services/emailService.js';
import {
  consumeToken,
  sendVerifyEmailForUser,
  sendPasswordResetForEmail,
} from '../services/authTokens.js';

// Generate JWT
export const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, phoneNumber, role,
      businessName, description, experienceYears, serviceId
    } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email, password: hashedPassword, firstName, lastName, phoneNumber,
        role: role || 'CUSTOMER',
      },
    });

    if (role === 'PROVIDER') {
      const provider = await prisma.provider.create({
        data: {
          userId: user.id,
          businessName: businessName || null,
          description: description || null,
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
        },
      });

      if (serviceId) {
        await prisma.providerService.create({
          data: { providerId: provider.id, serviceId: parseInt(serviceId) },
        });
      }
    }

    const token = generateToken(user.id);

    // Email side effects — never block registration
    Promise.allSettled([
      sendWelcomeEmail({ email: user.email, firstName: user.firstName, role: user.role }),
      sendVerifyEmailForUser({ id: user.id, email: user.email, firstName: user.firstName }),
    ]).catch(() => {});

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { provider: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is disabled. Contact support.' });
    }
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account was created with Google. Please use "Sign in with Google".',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        isProvider: !!user.provider,
        providerId: user.provider?.id || null,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        provider: {
          include: {
            services: { include: { service: true } },
            locations: { include: { location: true } },
          },
        },
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify email by token (from link in email)
// @route   GET /api/auth/verify-email?token=...
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body?.token;
    if (!token) return res.status(400).json({ success: false, message: 'Missing token' });

    const result = await consumeToken(token, 'VERIFY_EMAIL');
    if (result.error) return res.status(400).json({ success: false, message: result.error });

    await prisma.user.update({
      where: { id: result.userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email is already verified' });
    }
    // Invalidate prior un-used tokens
    await prisma.emailToken.updateMany({
      where: { userId: user.id, purpose: 'VERIFY_EMAIL', usedAt: null },
      data: { usedAt: new Date() },
    });
    await sendVerifyEmailForUser({ id: user.id, email: user.email, firstName: user.firstName });
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Forgot password — send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    await sendPasswordResetForEmail(email);
    // Always return the same message to avoid email-enumeration
    res.json({ success: true, message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password by token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const result = await consumeToken(token, 'RESET_PASSWORD');
    if (result.error) return res.status(400).json({ success: false, message: result.error });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: { id: result.userId },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
