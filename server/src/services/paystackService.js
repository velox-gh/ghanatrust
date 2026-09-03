const BASE = 'https://api.paystack.co';

const call = async (path, method = 'GET', body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Paystack request failed');
  return data.data;
};

export const initializeTransaction = (params) =>
  call('/transaction/initialize', 'POST', params);

export const verifyTransaction = (reference) =>
  call(`/transaction/verify/${encodeURIComponent(reference)}`);

export const isConfigured = () => !!process.env.PAYSTACK_SECRET_KEY;

// Paystack redirects the payer's browser to callback_url — derive it from the
// requesting device (Origin header) so phones on the LAN land back on the app.
// Only trusted dev origins qualify; anything else falls back to CLIENT_URL.
const TRUSTED_ORIGIN = /^(http:\/\/(localhost|127\.0\.0\.1|(192|10)\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d{2,5})?|https:\/\/[\w-]+\.ngrok-free\.app)$/i;

export const resolveClientBase = (req) => {
  const origin = req?.headers?.origin;
  if (origin && TRUSTED_ORIGIN.test(origin)) return origin.replace(/\/+$/, '');
  return (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
};

export const PLAN_PRICES = {
  PRO: parseFloat(process.env.PRO_PLAN_PRICE || '50'),
  FEATURED: parseFloat(process.env.FEATURED_PLAN_PRICE || '120'),
};
