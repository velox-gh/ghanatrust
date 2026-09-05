import prisma from '../config/database.js';

// ─── Saved providers (bookmarks) ──────────────────────────────────────────────
const providerCardInclude = {
  user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, profileImage: true } },
  services: { include: { service: { include: { category: true } } } },
  locations: { include: { location: { include: { region: true } } } },
  reviews: { include: { customer: { select: { firstName: true, lastName: true } } } },
  portfolio: true,
};

const buildEffectiveTier = (p) => {
  const now = new Date();
  const active = p.subscriptionExpiresAt && p.subscriptionExpiresAt > now;
  if (!active) return 'FREE';
  return p.subscriptionTier === 'FEATURED' ? 'FEATURED' : p.subscriptionTier === 'PRO' ? 'PRO' : 'FREE';
};

// @desc    List the customer's saved providers
// @route   GET /api/users/saved-providers
// @access  Private
export const listSavedProviders = async (req, res) => {
  try {
    const saved = await prisma.savedProvider.findMany({
      where: { customerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    const ids = saved.map((s) => s.providerId);
    const providers = await prisma.provider.findMany({
      where: { id: { in: ids } },
      include: providerCardInclude,
    });
    // preserve saved order
    const ordered = ids
      .map((id) => providers.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ ...p, effectiveTier: buildEffectiveTier(p) }));
    res.json({ success: true, providers: ordered });
  } catch (error) {
    console.error('List saved providers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Save a provider
// @route   POST /api/users/saved-providers/:providerId
// @access  Private (customer)
export const saveProvider = async (req, res) => {
  try {
    if (req.user.role !== 'CUSTOMER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only customers can save providers' });
    }
    const providerId = parseInt(req.params.providerId, 10);
    if (!providerId) return res.status(400).json({ success: false, message: 'Invalid provider id' });
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    await prisma.savedProvider.upsert({
      where: { customerId_providerId: { customerId: req.user.id, providerId } },
      update: {},
      create: { customerId: req.user.id, providerId },
    });
    res.json({ success: true, saved: true });
  } catch (error) {
    console.error('Save provider error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unsave a provider
// @route   DELETE /api/users/saved-providers/:providerId
// @access  Private
export const unsaveProvider = async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId, 10);
    await prisma.savedProvider.deleteMany({
      where: { customerId: req.user.id, providerId },
    });
    res.json({ success: true, saved: false });
  } catch (error) {
    console.error('Unsave provider error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk: which of the given providerIds are saved by the current user
// @route   GET /api/users/saved-providers/ids?providerIds=1,2,3
// @access  Private
export const listSavedProviderIds = async (req, res) => {
  try {
    const raw = (req.query.providerIds || '').toString();
    const ids = raw.split(',').map((s) => parseInt(s, 10)).filter(Boolean);
    if (ids.length === 0) return res.json({ success: true, savedIds: [] });
    const saved = await prisma.savedProvider.findMany({
      where: { customerId: req.user.id, providerId: { in: ids } },
      select: { providerId: true },
    });
    res.json({ success: true, savedIds: saved.map((s) => s.providerId) });
  } catch (error) {
    console.error('List saved ids error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
