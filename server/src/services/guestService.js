import prisma from '../config/database.js';

/**
 * "Guest" customers are real User rows that the person never consciously
 * created: no password, no Google link. Booking.customerId is a required FK, so
 * a genuinely account-less booking would mean a schema fork and a second code
 * path through notifications, payments and disputes. Creating the row up front
 * keeps one path, and the person can claim the account later by setting a
 * password.
 *
 * An account is UNCLAIMED while it has neither a password nor a googleId.
 */
export const isUnclaimed = (user) => !user.password && !user.googleId;

/**
 * Resolve the customer behind a guest booking.
 *
 * Security: the caller proves nothing about the email they typed. If it belongs
 * to a CLAIMED account, issuing a session for it would hand any stranger that
 * account — so we refuse and make them log in. Only a brand-new row, or one
 * still unclaimed, may be signed into.
 *
 * @returns {{ user, created: boolean }}
 * @throws  {Error & { code: 'ACCOUNT_EXISTS', statusCode: 409 }}
 */
export const findOrCreateGuestCustomer = async ({ email, firstName, lastName, phoneNumber }) => {
  const normalisedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } });

  if (existing) {
    if (!isUnclaimed(existing)) {
      const err = new Error(
        'An account already uses this email. Please sign in to continue with your booking.'
      );
      err.code = 'ACCOUNT_EXISTS';
      err.statusCode = 409;
      throw err;
    }

    // A returning guest — refresh the details they just typed, which are more
    // current than whatever they left last time.
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: { firstName, lastName, phoneNumber: phoneNumber || existing.phoneNumber },
    });
    return { user, created: false };
  }

  const user = await prisma.user.create({
    data: {
      email: normalisedEmail,
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      password: null,
      role: 'CUSTOMER',
    },
  });

  return { user, created: true };
};
