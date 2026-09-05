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

/**
 * Great-circle distance in km. Locations are city districts a few km apart, so
 * the haversine formula is well within the accuracy this needs.
 */
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// @desc    Resolve browser coordinates to the nearest serviced location
// @route   GET /api/locations/nearest?lat=..&lng=..
// @access  Public
export const getNearestLocation = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng are required' });
    }

    const locations = await prisma.location.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      include: { region: true },
    });

    if (locations.length === 0) {
      return res.json({ success: true, location: null });
    }

    let nearest = null;
    let nearestDistance = Infinity;
    for (const loc of locations) {
      const d = distanceKm(lat, lng, loc.latitude, loc.longitude);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearest = loc;
      }
    }

    // Past this radius the "nearest" district is a bad guess — better to show
    // the whole country than to silently filter to somewhere they aren't.
    const MAX_MATCH_KM = 120;
    if (nearestDistance > MAX_MATCH_KM) {
      return res.json({ success: true, location: null, reason: 'OUT_OF_RANGE' });
    }

    res.json({
      success: true,
      location: {
        id: nearest.id,
        name: nearest.name,
        region: nearest.region ? { id: nearest.region.id, name: nearest.region.name } : null,
        distanceKm: Math.round(nearestDistance * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error resolving nearest location:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
