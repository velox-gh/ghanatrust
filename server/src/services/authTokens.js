import crypto from 'crypto';
import prisma from '../config/database.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';

const APP_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

const TOKEN_BYTES = 32;
const VERIFY_TTL_HOURS = 24;
const RESET_TTL_HOURS = 1;

const generateToken = () => crypto.randomBytes(TOKEN_BYTES).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const expiresIn = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

export const createVerifyEmailToken = async (userId) => {
  const raw = generateToken();
  const token = hashToken(raw);
  await prisma.emailToken.create({
    data: { userId, token, purpose: 'VERIFY_EMAIL', expiresAt: expiresIn(VERIFY_TTL_HOURS) },
  });
  return { raw, url: `${APP_URL}/verify-email?token=${raw}` };
};

export const createPasswordResetToken = async (userId) => {
  const raw = generateToken();
  const token = hashToken(raw);
  await prisma.emailToken.create({
    data: { userId, token, purpose: 'RESET_PASSWORD', expiresAt: expiresIn(RESET_TTL_HOURS) },
  });
  return { raw, url: `${APP_URL}/reset-password?token=${raw}` };
};

export const consumeToken = async (rawToken, purpose) => {
  if (!rawToken) return { error: 'Missing token' };
  const token = hashToken(rawToken);
  const record = await prisma.emailToken.findUnique({ where: { token } });
  if (!record || record.purpose !== purpose) return { error: 'Invalid token' };
  if (record.usedAt) return { error: 'Token already used' };
  if (record.expiresAt < new Date()) return { error: 'Token expired' };
  await prisma.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { record, userId: record.userId };
};

// High-level helpers used by controllers
export const sendVerifyEmailForUser = async (user) => {
  const { url } = await createVerifyEmailToken(user.id);
  try {
    await sendVerificationEmail(user, url);
  } catch (err) {
    // Dev aid: SMTP creds often absent locally — print the link so it's still testable
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 [dev] Email send failed (${err.message}) — verify link for ${user.email}:\n${url}\n`);
    }
  }
  return url;
};

export const sendPasswordResetForEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null; // silent — don't reveal whether the email exists
  const { url } = await createPasswordResetToken(user.id);
  try {
    await sendPasswordResetEmail(user, url);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 [dev] Email send failed (${err.message}) — reset link for ${user.email}:\n${url}\n`);
    }
  }
  return url;
};
