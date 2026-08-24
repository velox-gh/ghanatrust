import prisma from '../config/database.js';

// @desc    Get all service providers with filters
// @route   GET /api/providers
// @access  Public
export const getProviders = async (req, res) => {
  try {
    const { categoryId, locationId, verifiedOnly, search } = req.query;

    const where = {};

    if (verifiedOnly === 'true') {
      where.identityVerified = true;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { description: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } }
      ];
    }

    if (categoryId) {
      where.services = {
        some: {
          service: { categoryId: parseInt(categoryId) }
        }
      };
    }

    if (locationId) {
      where.locations = {
        some: { locationId: parseInt(locationId) }
      };
    }

    const providers = await prisma.provider.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, profileImage: true }
        },
        services: {
          include: { service: { include: { category: true } } }
        },
        locations: {
          include: { location: { include: { region: true } } }
        },
        reviews: {
          include: {
            customer: { select: { firstName: true, lastName: true } }
          }
        },
        portfolio: true
      },
      orderBy: { trustScore: 'desc' }
    });

    res.json({
      success: true,
      providers
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get provider profile by ID
// @route   GET /api/providers/:id
// @access  Public
export const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, profileImage: true, createdAt: true }
        },
        services: {
          include: { service: { include: { category: true } } }
        },
        locations: {
          include: { location: { include: { region: true } } }
        },
        reviews: {
          include: {
            customer: { select: { firstName: true, lastName: true, profileImage: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        portfolio: true
      }
    });

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.json({
      success: true,
      provider
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit verification request
// @route   POST /api/providers/verifications
// @access  Private/Provider
export const submitVerification = async (req, res) => {
  try {
    const { type, documentUrl, notes } = req.body;

    if (!['IDENTITY', 'SKILLS', 'LOCATION'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid verification type' });
    }

    const providerId = req.user.provider.id;

    const request = await prisma.verificationRequest.create({
      data: {
        providerId,
        userId: req.user.id,
        type,
        documentUrl,
        notes
      }
    });

    res.status(201).json({
      success: true,
      verification: request
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get provider's own verification requests
// @route   GET /api/providers/verifications
// @access  Private/Provider
export const getMyVerifications = async (req, res) => {
  try {
    const providerId = req.user.provider.id;

    const verifications = await prisma.verificationRequest.findMany({
      where: { providerId },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({
      success: true,
      verifications
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
