import nodemailer from 'nodemailer';

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.ethereal.email';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER || 'test@ethereal.email';
const EMAIL_PASS = process.env.EMAIL_PASS || 'test';
const EMAIL_FROM = process.env.EMAIL_FROM || 'GhanaTrust <no-reply@ghanatrust.com>';

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
};

export const sendBookingConfirmation = async (booking, recipientEmail, recipientName) => {
  const subject = `Booking Request Received - ${booking.service?.name || 'Service'}`;
  const text = `Hi ${recipientName},\n\nYou have a new booking request for ${booking.service?.name}.\nBooking ID: ${booking.id}\nStatus: ${booking.status}\n\nPlease log in to your GhanaTrust dashboard to respond.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Booking Request Received</h2>
      <p>Hi ${recipientName},</p>
      <p>You have a new booking request for <strong>${booking.service?.name || 'Service'}</strong>.</p>
      <p><strong>Booking ID:</strong> #${booking.id}</p>
      <p><strong>Status:</strong> ${booking.status}</p>
      <p>Please log in to your <a href="http://localhost:5000">GhanaTrust dashboard</a> to respond.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">GhanaTrust - Building a trusted digital marketplace for Ghana's local service economy.</p>
    </div>
  `;

  return sendEmail({ to: recipientEmail, subject, html, text });
};

export const sendVerificationUpdate = async (recipientEmail, recipientName, type, status) => {
  const subject = `Verification ${status} - ${type}`;
  const text = `Hi ${recipientName},\n\nYour ${type} verification request has been updated to: ${status}.\n\nPlease log in to your GhanaTrust dashboard for more details.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Verification Update</h2>
      <p>Hi ${recipientName},</p>
      <p>Your <strong>${type}</strong> verification request has been updated to: <strong>${status}</strong>.</p>
      <p>Please log in to your <a href="http://localhost:5000">GhanaTrust dashboard</a> for more details.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">GhanaTrust - Building a trusted digital marketplace for Ghana's local service economy.</p>
    </div>
  `;

  return sendEmail({ to: recipientEmail, subject, html, text });
};

export default transporter;
