import nodemailer from 'nodemailer';

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.ethereal.email';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || 'test@ethereal.email';
const EMAIL_PASS = process.env.EMAIL_PASS || 'test';
const EMAIL_FROM = process.env.EMAIL_FROM || 'GhanaTrust <no-reply@ghanatrust.com>';
// Public base URL of the client (used in email CTAs). Defaults to localhost in dev.
const APP_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const baseLayout = (title, body) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#0f172a;border-radius:16px 16px 0 0;padding:20px 24px;display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#10b981,#047857);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;">G</div>
        <div>
          <div style="color:white;font-weight:800;font-size:18px;line-height:1;">GhanaTrust</div>
          <div style="color:#94a3b8;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;margin-top:2px;">Verified Service Marketplace</div>
        </div>
      </div>
      <div style="background:#ffffff;padding:32px 24px;border:1px solid #e2e8f0;border-top:none;">
        <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;">${escape(title)}</h1>
        ${body}
      </div>
      <div style="padding:16px 24px;text-align:center;font-size:12px;color:#64748b;">
        GhanaTrust — Connecting Ghanaians to trusted, verified service professionals.<br/>
        <a href="${APP_URL}" style="color:#10b981;text-decoration:none;">${APP_URL}</a>
      </div>
    </div>
  </body>
</html>
`;

const cta = (label, url) => `
  <div style="margin:24px 0;text-align:center;">
    <a href="${escape(url)}" style="display:inline-block;background:#10b981;color:#ffffff !important;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;">${escape(label)}</a>
  </div>
`;

const footer = 'If you didn\'t request this, you can safely ignore this email.';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({ from: EMAIL_FROM, to, subject, text, html });
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email sent:', info.messageId, '→', nodemailer.getTestMessageUrl(info) || '(no preview)');
    }
    return info;
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw error;
  }
};

// ─── Welcome ──────────────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to GhanaTrust — your verified marketplace is here';
  const isProvider = user.role === 'PROVIDER';
  const text = `Hi ${user.firstName},

Welcome to GhanaTrust — Ghana's trust-first marketplace for verified local service professionals.

${isProvider
  ? 'You\'re set up as a Service Professional. To start receiving jobs, complete identity & skills verification from your dashboard, and add at least one service.'
  : 'You\'re set up as a Customer. Search for a verified professional near you, check their trust score, and book with confidence.'}

Open GhanaTrust: ${APP_URL}

— The GhanaTrust team`;
  const body = `
    <p>Hi <strong>${escape(user.firstName)}</strong>,</p>
    <p>Welcome to <strong>GhanaTrust</strong> — Ghana's trust-first marketplace for verified local service professionals.</p>
    ${isProvider
      ? '<p>You\'re set up as a <strong>Service Professional</strong>. To start receiving jobs:</p><ol><li>Complete <strong>Identity &amp; Skills verification</strong> from your dashboard</li><li>Add at least one service you offer</li><li>Reply fast to booking requests — top response rates climb search results</li></ol>'
      : '<p>You\'re set up as a <strong>Customer</strong>. Find a verified professional near you, check their trust score, and book with confidence.</p>'}
    ${cta('Open GhanaTrust', APP_URL)}
    <p style="color:#64748b;font-size:13px;">${footer}</p>
  `;
  return sendEmail({ to: user.email, subject, html: baseLayout('Welcome aboard 👋', body), text });
};

// ─── Email verification ───────────────────────────────────────────────────────
export const sendVerificationEmail = async (user, verifyUrl) => {
  const subject = 'Verify your GhanaTrust email address';
  const text = `Hi ${user.firstName},

Thanks for signing up to GhanaTrust. Please confirm your email address to unlock bookings, reviews, and the full marketplace.

Verify here: ${verifyUrl}

This link expires in 24 hours.`;
  const body = `
    <p>Hi <strong>${escape(user.firstName)}</strong>,</p>
    <p>Thanks for signing up to <strong>GhanaTrust</strong>. Please confirm your email address to unlock bookings, reviews, and the full marketplace.</p>
    ${cta('Verify my email', verifyUrl)}
    <p style="color:#64748b;font-size:13px;">This link expires in 24 hours. ${footer}</p>
  `;
  return sendEmail({ to: user.email, subject, html: baseLayout('Verify your email', body), text });
};

// ─── Password reset ───────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = 'Reset your GhanaTrust password';
  const text = `Hi ${user.firstName},

We received a request to reset the password for your GhanaTrust account.

Reset here: ${resetUrl}

This link expires in 1 hour. If you didn't request a reset, ignore this email and your password will stay the same.`;
  const body = `
    <p>Hi <strong>${escape(user.firstName)}</strong>,</p>
    <p>We received a request to reset the password for your GhanaTrust account.</p>
    ${cta('Reset my password', resetUrl)}
    <p style="color:#64748b;font-size:13px;">This link expires in 1 hour. ${footer}</p>
  `;
  return sendEmail({ to: user.email, subject, html: baseLayout('Reset your password', body), text });
};

// ─── Booking notifications ────────────────────────────────────────────────────
export const sendBookingRequestToProvider = async (providerUser, booking) => {
  const subject = `New booking request — ${booking.service?.name || 'Service'}`;
  const link = `${APP_URL}/my-bookings/${booking.id}`;
  const text = `Hi ${providerUser.firstName},

You have a new booking request on GhanaTrust.

Service: ${booking.service?.name}
Customer: ${booking.customer?.firstName} ${booking.customer?.lastName}
Date: ${booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleString('en-GH') : 'TBD'}

Open the dashboard to accept or decline: ${link}`;
  const body = `
    <p>Hi <strong>${escape(providerUser.firstName)}</strong>,</p>
    <p>You have a <strong>new booking request</strong> on GhanaTrust.</p>
    <table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:14px;">
      <tr><td style="color:#64748b;width:120px;">Service</td><td><strong>${escape(booking.service?.name || '—')}</strong></td></tr>
      <tr><td style="color:#64748b;">Customer</td><td>${escape(booking.customer?.firstName || '')} ${escape(booking.customer?.lastName || '')}</td></tr>
      <tr><td style="color:#64748b;">Date</td><td>${booking.scheduledDate ? escape(new Date(booking.scheduledDate).toLocaleString('en-GH')) : 'TBD'}</td></tr>
    </table>
    ${cta('Accept or decline', link)}
    <p style="color:#64748b;font-size:13px;">Quick replies win you higher placement in search results.</p>
  `;
  return sendEmail({ to: providerUser.email, subject, html: baseLayout('New booking request', body), text });
};

export const sendBookingStatusToCustomer = async (customerUser, booking, action) => {
  const subject = `Booking #${booking.id} ${action}`;
  const link = `${APP_URL}/my-bookings/${booking.id}`;
  const verb = {
    accepted: 'has been accepted',
    declined: 'was declined',
    started: 'has started',
    completed: 'has been marked complete',
    cancelled: 'has been cancelled',
  }[action] || 'was updated';
  const text = `Hi ${customerUser.firstName},

Your booking #${booking.id} for ${booking.service?.name || 'the service'} ${verb}.

View: ${link}`;
  const body = `
    <p>Hi <strong>${escape(customerUser.firstName)}</strong>,</p>
    <p>Your booking <strong>#${booking.id}</strong> for <strong>${escape(booking.service?.name || 'the service')}</strong> ${verb}.</p>
    ${cta('View booking', link)}
  `;
  return sendEmail({ to: customerUser.email, subject, html: baseLayout(`Booking #${booking.id} ${action}`, body), text });
};

// ─── Payment receipt ──────────────────────────────────────────────────────────
export const sendPaymentReceipt = async (user, payment) => {
  const subject = `Payment confirmed — GH₵ ${payment.amount.toFixed(2)} for booking #${payment.bookingId}`;
  const link = `${APP_URL}/my-bookings/${payment.bookingId}`;
  const text = `Hi ${user.firstName},

We've received your payment of GH₵ ${payment.amount.toFixed(2)} for booking #${payment.bookingId}.

View receipt: ${link}

Thank you for using GhanaTrust.`;
  const body = `
    <p>Hi <strong>${escape(user.firstName)}</strong>,</p>
    <p>We've received your payment of <strong>GH₵ ${payment.amount.toFixed(2)}</strong> for booking <strong>#${payment.bookingId}</strong>.</p>
    <div style="background:#f1f5f9;border-radius:10px;padding:16px;margin:16px 0;">
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;"><span>Amount paid</span><strong>GH₵ ${payment.amount.toFixed(2)}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;color:#64748b;"><span>Reference</span><span>${escape(payment.transactionId || '—')}</span></div>
    </div>
    ${cta('View booking', link)}
    <p style="color:#64748b;font-size:13px;">Thank you for using GhanaTrust.</p>
  `;
  return sendEmail({ to: user.email, subject, html: baseLayout('Payment confirmed', body), text });
};

// ─── Subscription activated / expiring ────────────────────────────────────────
export const sendSubscriptionActivated = async (user, plan, expiresAt) => {
  const subject = `Your ${plan} plan is active 🚀`;
  const text = `Hi ${user.firstName},

Your GhanaTrust ${plan} plan is now active until ${new Date(expiresAt).toDateString()}.

You now rank above Free providers in search results and show a ${plan} badge on your profile.`;

  const benefits = plan === 'FEATURED'
    ? ['Top placement in customer searches', 'Featured badge on your profile', 'Maximum visibility for 30 days']
    : ['Ranked above Free providers', 'Pro badge on your profile', 'Priority in search filters'];

  const body = `
    <p>Hi <strong>${escape(user.firstName)}</strong>,</p>
    <p>Your GhanaTrust <strong>${escape(plan)}</strong> plan is now active until <strong>${escape(new Date(expiresAt).toDateString())}</strong>.</p>
    <ul style="padding-left:18px;">${benefits.map((b) => `<li>${escape(b)}</li>`).join('')}</ul>
    ${cta('Open dashboard', `${APP_URL}/dashboard`)}
  `;
  return sendEmail({ to: user.email, subject, html: baseLayout(`${plan} plan activated`, body), text });
};

export const sendSubscriptionExpiring = async (user, plan, expiresAt) => {
  const subject = `Your ${plan} plan expires in 3 days`;
  const text = `Hi ${user.firstName},

Your GhanaTrust ${plan} plan expires on ${new Date(expiresAt).toDateString()}. Renew to keep your boosted ranking and badge.`;
  const body = `
    <p>Hi <strong>${escape(user.firstName)}</strong>,</p>
    <p>Your GhanaTrust <strong>${escape(plan)}</strong> plan expires on <strong>${escape(new Date(expiresAt).toDateString())}</strong>.</p>
    <p>Renew to keep your boosted search ranking and your <strong>${escape(plan)}</strong> badge.</p>
    ${cta('Renew plan', `${APP_URL}/dashboard`)}
  `;
  return sendEmail({ to: user.email, subject, html: baseLayout('Your plan is expiring', body), text });
};

// ─── Review prompt ────────────────────────────────────────────────────────────
export const sendReviewPrompt = async (user, booking) => {
  const subject = `How was your experience with ${booking.provider?.user?.firstName || 'your provider'}?`;
  const link = `${APP_URL}/my-bookings/${booking.id}`;
  const text = `Hi ${user.firstName},

Your booking #${booking.id} was marked complete. Your review helps other customers find great providers and helps ${booking.provider?.user?.firstName || 'them'} grow.

Leave a review: ${link}`;
  const body = `
    <p>Hi <strong>${escape(user.firstName)}</strong>,</p>
    <p>Your booking <strong>#${booking.id}</strong> with <strong>${escape(booking.provider?.user?.firstName || 'your provider')}</strong> was marked complete.</p>
    <p>Your review helps other customers find great providers and helps ${escape(booking.provider?.user?.firstName || 'them')} grow their business.</p>
    ${cta('Leave a review', link)}
  `;
  return sendEmail({ to: user.email, subject, html: baseLayout('Quick favour — leave a review', body), text });
};

// Legacy export aliases
export const sendBookingConfirmation = sendBookingRequestToProvider;
export const sendVerificationUpdate = async (user, type, status) => {
  const subject = `${type} verification ${status}`;
  const text = `Hi ${user.firstName}, your ${type} verification has been updated to ${status}.`;
  const body = `<p>Hi <strong>${escape(user.firstName)}</strong>,</p><p>Your <strong>${escape(type)}</strong> verification has been updated to <strong>${escape(status)}</strong>.</p>`;
  return sendEmail({ to: user.email, subject, html: baseLayout('Verification update', body), text });
};

export default transporter;
