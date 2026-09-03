import crypto from 'crypto';
import prisma from '../config/database.js';
import { initializeTransaction, verifyTransaction, isConfigured, resolveClientBase } from '../services/paystackService.js';
import { settleSubscription } from './subscriptionController.js';

const round2 = (n) => Math.round(n * 100) / 100;

// Idempotent booking-payment settlement — called from webhook AND verify
const settlePayment = async (reference) => {
  // transactionId is not @unique on Payment (bookingId is) — use findFirst
  const payment = await prisma.payment.findFirst({
    where: { transactionId: reference },
    orderBy: { id: 'desc' },
    include: { booking: { include: { provider: true } } },
  });
  if (!payment || payment.status === 'COMPLETED') return payment;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paymentDate: new Date() },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    }),
    prisma.notification.create({
      data: {
        userId: payment.booking.provider.userId,
        title: 'Payment Received 💰',
        message: `You have received a payment of GH₵ ${payment.amount} for booking #${payment.bookingId}.`,
        type: 'PAYMENT_RECEIVED',
        link: `/my-bookings/${payment.bookingId}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: payment.booking.customerId,
        title: 'Payment Confirmed ✅',
        message: `Your payment of GH₵ ${payment.amount} for booking #${payment.bookingId} was successful. You can now rate your experience!`,
        type: 'PAYMENT_CONFIRMED',
        link: `/my-bookings/${payment.bookingId}`,
      },
    }),
  ]);

  return prisma.payment.findFirst({ where: { transactionId: reference }, orderBy: { id: 'desc' } });
};

// @desc    Initialize a Paystack checkout for a booking
// @route   POST /api/payments/initialize
// @access  Private/Customer
export const initializePayment = async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured (PAYSTACK_SECRET_KEY missing)' });
    }

    const bookingId = parseInt(req.body?.bookingId);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customerId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    if (booking.status === 'PAID') return res.status(400).json({ success: false, message: 'Booking is already paid' });
    if (!booking.price) return res.status(400).json({ success: false, message: 'No price set on this booking yet' });

    const rate = parseFloat(process.env.COMMISSION_RATE || '0.10');
    const platformFee = round2(booking.price * rate);
    const providerAmount = round2(booking.price - platformFee);
    const reference = `GT-B${bookingId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const tx = await initializeTransaction({
      email: booking.customer.email,
      amount: Math.round(booking.price * 100), // pesewas
      currency: 'GHS',
      reference,
      callback_url: `${resolveClientBase(req)}/payments/callback`,
      metadata: { purpose: 'BOOKING', bookingId },
    });

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      update: { amount: booking.price, method: 'MOBILE_MONEY', status: 'PENDING', transactionId: reference, platformFee, providerAmount, payoutStatus: 'PENDING' },
      create: { bookingId, amount: booking.price, method: 'MOBILE_MONEY', status: 'PENDING', transactionId: reference, platformFee, providerAmount, payoutStatus: 'PENDING' },
    });

    res.status(201).json({
      success: true,
      message: 'Redirecting to secure checkout…',
      authorizationUrl: tx.authorization_url,
      reference,
      payment,
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Verify a payment by Paystack reference (fallback for missed webhooks)
// @route   GET /api/payments/verify/:reference
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const remote = await verifyTransaction(reference);
    if (remote.status === 'success') await settlePayment(reference);
    const payment = await prisma.payment.findFirst({ where: { transactionId: reference }, orderBy: { id: 'desc' } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, status: payment.status, payment });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// @desc    Paystack webhook (signature-verified, raw body)
// @route   POST /api/payments/webhook
// @access  Public (HMAC signature)
export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
    if (hash !== signature) return res.status(401).send('Invalid signature');

    const event = JSON.parse(req.body.toString());
    const reference = event.data?.reference;

    if (event.event === 'charge.success') {
      // Route by reference prefix: GT-B* = booking payment, GT-SUB* = subscription
      if (reference?.startsWith('GT-SUB')) {
        await settleSubscription(reference);
      } else {
        await settlePayment(reference);
      }
    }

    if (event.event === 'charge.failed') {
      await prisma.payment.updateMany({
        where: { transactionId: reference, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
      await prisma.subscription.updateMany({
        where: { transactionId: reference, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // always 200 — retry storms hurt more than a missed event
  }
};

// @desc    Get transaction history for a user
// @route   GET /api/payments/history
// @access  Private
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let where = {};

    if (role === 'CUSTOMER') {
      where = { booking: { customerId: userId } };
    } else if (role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      if (!provider) return res.json({ success: true, payments: [] });
      where = { booking: { providerId: provider.id } };
    }

    // Self-healing: settle PENDING payments in this user's scope via Paystack
    const pendingPayments = await prisma.payment.findMany({
      where: { ...where, status: 'PENDING' },
      select: { transactionId: true },
    });
    for (const p of pendingPayments) {
      try {
        const remote = await verifyTransaction(p.transactionId);
        if (remote.status === 'success') {
          await settlePayment(p.transactionId);
        } else if (remote.status === 'failed' || remote.status === 'abandoned') {
          await prisma.payment.update({ where: { transactionId: p.transactionId }, data: { status: 'FAILED' } });
        }
      } catch (reconcileErr) {
        console.error(`Reconcile ${p.transactionId} failed:`, reconcileErr.message);
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            service: { select: { name: true } },
            customer: { select: { firstName: true, lastName: true } },
            provider: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
