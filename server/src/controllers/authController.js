import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import prisma from '../config/database.js';
import { sendEmail } from '../services/emailService.js';
import { isUnclaimed } from '../services/guestService.js';

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
      // Provider-specific fields
      businessName, description, experienceYears, categoryId, serviceId
    } = req.body;

    const normalisedEmail = String(email || '').trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } });

    // An unclaimed row is one this person created implicitly by booking as a
    // guest. Registering with the same email is them claiming it, not a
    // collision — rejecting it would strand their existing bookings behind an
    // email they can never register.
    if (existing && !isUnclaimed(existing)) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber: phoneNumber || existing.phoneNumber,
            // A guest row is always CUSTOMER; honour a provider signup here.
            role: role || existing.role,
          },
        })
      : await prisma.user.create({
          data: {
            email: normalisedEmail,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            role: role || 'CUSTOMER',
          },
        });

    // If provider, create provider profile and link service
    if (role === 'PROVIDER') {
      const provider = await prisma.provider.create({
        data: {
          userId: user.id,
          businessName: businessName || null,
          description: description || null,
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
        },
      });

      // Link the selected service to this provider
      if (serviceId) {
        await prisma.providerService.create({
          data: {
            providerId: provider.id,
            serviceId: parseInt(serviceId),
          },
        });
      }
    }

    const token = generateToken(user.id);

    // Send welcome email
    try {
      const welcomeSubject = role === 'PROVIDER' ? 'Welcome to GhanaTrust - Provider Account Created' : 'Welcome to GhanaTrust';
      const welcomeText = `Hi ${firstName},\n\nWelcome to GhanaTrust! Your account has been created successfully.\n\nEmail: ${email}\nRole: ${role}\n\nLog in at http://localhost:5000 to get started.`;
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Welcome to GhanaTrust!</h2>
          <p>Hi ${firstName},</p>
          <p>Your account has been created successfully.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p>Log in at <a href="http://localhost:5000">GhanaTrust</a> to get started.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">GhanaTrust - Building a trusted digital marketplace for Ghana's local service economy.</p>
        </div>
      `;
      await sendEmail({ to: email, subject: welcomeSubject, html: welcomeHtml, text: welcomeText });
    } catch (_) { /* email failure should not block registration */ }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
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

    // Emails are stored lowercase, so the lookup must normalise too.
    const user = await prisma.user.findUnique({
      where: { email: String(email || '').trim().toLowerCase() },
      include: { provider: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Passwordless accounts: either Google sign-in, or a guest row created by a
    // booking that has never been claimed. bcrypt.compare would throw on null.
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: user.googleId
          ? 'This account was created with Google. Please use "Sign in with Google".'
          : 'You booked as a guest with this email. Create a password to claim your account.',
        code: user.googleId ? 'GOOGLE_ONLY' : 'UNCLAIMED_GUEST',
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
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
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
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
            services: {
              include: {
                service: true,
              },
            },
            locations: {
              include: {
                location: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};