import prisma from '../config/database.js';
import { initializeTransaction, verifyTransaction, isConfigured, PLAN_PRICES, resolveClientBase } from '../services/paystackService.js';

const PLAN_DURATION_DAYS = 30;

// Idempotent subscription settlement — called from webhook AND verify
export const settleSubscription = async (reference) => {
  const subscription = await prisma.subscription.findUnique({
    where: { transactionId: reference },
    include: { provider: true },
  });
  if (!subscription || subscription.status === 'ACTIVE') return subscription;

  // Extend from current expiry if still active, else from now
  const now = new Date();
  const base = subscription.provider.subscriptionExpiresAt && subscription.provider.subscriptionExpiresAt > now
    ? new Date(subscription.provider.subscriptionExpiresAt)
    : now;
  const expiresAt = new Date(base.getTime() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE', startedAt: now, expiresAt },
    }),
    prisma.provider.update({
      where: { id: subscription.providerId },
      data: { subscriptionTier: subscription.plan, subscriptionExpiresAt: expiresAt },
    }),
    prisma.notification.create({
      data: {
        userId: subscription.provider.userId,
        title: `${subscription.plan === 'FEATURED' ? 'Featured' : 'Pro'} Plan Activated 🚀`,
        message: `Your ${subscription.plan} subscription is active until ${expiresAt.toDateString()}. Enjoy your boosted visibility!`,
        type: 'SUBSCRIPTION_ACTIVE',
        link: '/dashboard',
      },
    }),
  ]);

  return prisma.subscription.findUnique({ where: { transactionId: reference } });
};

// @desc    Initialize a Paystack checkout for a subscription plan
// @route   POST /api/subscriptions/initialize
// @access  Private/Provider
export const initializeSubscription = async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured (PAYSTACK_SECRET_KEY missing)' });
    }

    const { plan } = req.body;
    if (!['PRO', 'FEATURED'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan — choose PRO or FEATURED' });
    }

    const provider = req.user.provider;
    if (!provider) return res.status(403).json({ success: false, message: 'Provider account required' });

    const amount = PLAN_PRICES[plan];
    const reference = `GT-SUB${provider.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const tx = await initializeTransaction({
      email: req.user.email,
      amount: Math.round(amount * 100), // pesewas
      currency: 'GHS',
      reference,
      callback_url: `${resolveClientBase(req)}/billing/callback`,
      metadata: { purpose: 'SUBSCRIPTION', plan, providerId: provider.id },
    });

    const subscription = await prisma.subscription.create({
      data: { providerId: provider.id, plan, amount, status: 'PENDING', transactionId: reference },
    });

    res.status(201).json({
      success: true,
      message: 'Redirecting to secure checkout…',
      authorizationUrl: tx.authorization_url,
      reference,
      subscription,
    });
  } catch (error) {
    console.error('Initialize subscription error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Verify a subscription payment by reference
// @route   GET /api/subscriptions/verify/:reference
// @access  Private
export const verifySubscription = async (req, res) => {
  try {
    const { reference } = req.params;
    const remote = await verifyTransaction(reference);
    if (remote.status === 'success') await settleSubscription(reference);
    const subscription = await prisma.subscription.findUnique({ where: { transactionId: reference } });
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, status: subscription.status, subscription });
  } catch (error) {
    console.error('Verify subscription error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// @desc    Get current provider's tier, expiry and billing history
// @route   GET /api/subscriptions/me
// @access  Private/Provider
export const getMySubscriptions = async (req, res) => {
  try {
    const provider = req.user.provider;
    if (!provider) return res.status(403).json({ success: false, message: 'Provider account required' });

    // Self-healing: settle PENDING subscriptions by checking with Paystack.
    // Covers missed callbacks/webhooks (browser closed mid-redirect, no ngrok, etc.)
    const pendingSubs = await prisma.subscription.findMany({
      where: { providerId: provider.id, status: 'PENDING' },
    });
    for (const sub of pendingSubs) {
      try {
        const remote = await verifyTransaction(sub.transactionId);
        if (remote.status === 'success') {
          await settleSubscription(sub.transactionId);
        } else if (remote.status === 'failed' || remote.status === 'abandoned') {
          await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'FAILED' } });
        }
      } catch (reconcileErr) {
        console.error(`Reconcile ${sub.transactionId} failed:`, reconcileErr.message);
      }
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const tierActive = provider.subscriptionExpiresAt && provider.subscriptionExpiresAt > now;

    res.json({
      success: true,
      currentTier: tierActive ? provider.subscriptionTier : 'FREE',
      expiresAt: tierActive ? provider.subscriptionExpiresAt : null,
      subscriptions,
    });
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
