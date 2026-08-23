import prisma from '../config/database.js';

// @desc    Get all service categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { services: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const { categoryId, search } = req.query;

    const where = { isActive: true };
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        providerServices: {
          include: {
            provider: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, profileImage: true }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        providerServices: {
          where: { isActive: true },
          include: {
            provider: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, profileImage: true }
                },
                locations: {
                  include: { location: true }
                },
                reviews: true
              }
            }
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get regions and locations in Ghana
// @route   GET /api/locations
// @access  Public
export const getLocations = async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      include: {
        locations: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      regions
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
