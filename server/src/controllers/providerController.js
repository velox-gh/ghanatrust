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

// @desc    Add a service to a provider's profile
// @route   POST /api/providers/services
// @access  Private/Provider
export const addProviderService = async (req, res) => {
  try {
    const providerId = req.user.provider.id;
    const { serviceId, serviceName, price, priceUnit } = req.body;

    let targetServiceId = serviceId ? parseInt(serviceId) : null;

    if (!targetServiceId && serviceName) {
      // Find an existing service by name (case insensitive)
      let service = await prisma.service.findFirst({
        where: { name: { equals: serviceName } }
      });

      if (!service) {
        // Find a default category, or the first one
        let defaultCategory = await prisma.category.findFirst();
        if (!defaultCategory) {
          defaultCategory = await prisma.category.create({
            data: { name: 'General Services', description: 'Uncategorized services' }
          });
        }
        
        service = await prisma.service.create({
          data: {
            name: serviceName,
            categoryId: defaultCategory.id
          }
        });
      }
      targetServiceId = service.id;
    }

    if (!targetServiceId) {
      return res.status(400).json({ success: false, message: 'Service ID or Name is required' });
    }

    // Check if it already exists
    const existing = await prisma.providerService.findFirst({
      where: { providerId, serviceId: targetServiceId }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already offer this service' });
    }

    const providerService = await prisma.providerService.create({
      data: {
        providerId,
        serviceId: targetServiceId,
        price: price ? parseFloat(price) : null,
        priceUnit: priceUnit || null
      },
      include: {
        service: true
      }
    });

    res.status(201).json({
      success: true,
      providerService
    });
  } catch (error) {
    console.error('Error adding provider service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove a service from a provider's profile
// @route   DELETE /api/providers/services/:id
// @access  Private/Provider
export const removeProviderService = async (req, res) => {
  try {
    const providerId = req.user.provider.id;
    const providerServiceId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.providerService.findUnique({
      where: { id: providerServiceId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (existing.providerId !== providerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this service' });
    }

    await prisma.providerService.delete({
      where: { id: providerServiceId }
    });

    res.json({
      success: true,
      message: 'Service removed successfully'
    });
  } catch (error) {
    console.error('Error removing provider service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
