import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database.js';

// Find-or-create logic: Google ID first, then link by verified email
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(null, false, { message: 'Google account has no email' });
        }

        let user = await prisma.user.findUnique({ where: { googleId } });
        if (!user) {
          user = await prisma.user.findUnique({ where: { email } });
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              googleId,
              firstName: profile.name?.givenName || 'Google',
              lastName: profile.name?.familyName || 'User',
              profileImage: profile.photos?.[0]?.value,
              password: null,
              role: 'CUSTOMER',
              // Google has already verified this email — no need to re-verify
              emailVerified: true,
              emailVerifiedAt: new Date(),
            },
          });
        } else if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              profileImage: user.profileImage || profile.photos?.[0]?.value,
              // Signing in via Google proves ownership of the email
              emailVerified: true,
              emailVerifiedAt: user.emailVerifiedAt || new Date(),
            },
          });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account has been deactivated' });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
