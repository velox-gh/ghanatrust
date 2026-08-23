import prisma from '../config/database.js';

// @desc    Create new booking request
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res) => {
  try {
    const { providerId, serviceId, locationId, scheduledDate, description, price } = req.body;
    const customerId = req.user.id;

    const booking = await prisma.booking.create({
      data: {
        customerId,
        providerId: parseInt(providerId),
        serviceId: parseInt(serviceId),
        locationId: locationId ? parseInt(locationId) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        description,
        price: price ? parseFloat(price) : null,
        status: 'REQUESTED'
      },
      include: {
        provider: { include: { user: true } },
        service: true,
        location: true
      }
    });

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get bookings for logged in user
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let where = {};
    if (role === 'CUSTOMER') {
      where.customerId = userId;
    } else if (role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      if (provider) {
        where.providerId = provider.id;
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        provider: { include: { user: { select: { firstName: true, lastName: true } } } },
        service: true,
        location: true,
        review: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
