import prisma from '../config/database.js';
import { sendBookingConfirmation } from '../services/emailService.js';
import { getIO } from '../services/socketService.js';

// @desc    Create new booking request
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res) => {
  try {
    const { providerId, serviceId, locationId, scheduledDate, scheduledEndDate, description, price, address } = req.body;
    const customerId = req.user.id;

    if (!providerId || !serviceId) {
      return res.status(400).json({ success: false, message: 'Provider and service are required' });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId,
        providerId: parseInt(providerId),
        serviceId: parseInt(serviceId),
        locationId: locationId ? parseInt(locationId) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledEndDate: scheduledEndDate ? new Date(scheduledEndDate) : null,
        description: description || null,
        price: price ? parseFloat(price) : null,
        status: 'REQUESTED',
      },
      include: {
        provider: { include: { user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } } } },
        service: true,
        location: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
      },
    });

    // Create notification for provider
    try {
      await prisma.notification.create({
        data: {
          userId: booking.provider.user.id || booking.provider.userId,
          title: 'New Job Request 📋',
          message: `${booking.customer.firstName} ${booking.customer.lastName} has requested your "${booking.service.name}" service.`,
          type: 'BOOKING_REQUEST',
          link: `/my-bookings/${booking.id}`,
        },
      });
    } catch (_) { /* notification failure should not block booking */ }

    // Send booking confirmation email
    try {
      const providerUser = await prisma.user.findUnique({
        where: { id: booking.provider.userId },
        select: { email: true, firstName: true },
      });
      if (providerUser?.email) {
        await sendBookingConfirmation(booking, providerUser.email, providerUser.firstName);
      }
    } catch (_) { /* email failure should not block booking */ }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get bookings for logged in user (customer or provider)
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { status } = req.query;

    let where = {};

    if (role === 'CUSTOMER') {
      where.customerId = userId;
    } else if (role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      if (!provider) return res.json({ success: true, bookings: [] });
      where.providerId = provider.id;
    } else if (role === 'ADMIN') {
      // Admin sees all
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        provider: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
          },
        },
        service: true,
        location: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Customer who owns it, Provider assigned to it, or Admin)
export const getBookingById = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        provider: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
          },
        },
        service: true,
        location: true,
        review: true,
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Access control
    const isCustomer = booking.customerId === userId;
    const isProvider = booking.provider?.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update booking status (provider accepts / starts job)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Provider)
export const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
        service: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the assigned provider can update status
    if (booking.provider.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the assigned provider can update status' });
    }

    // Validate transitions
    const allowedTransitions = {
      REQUESTED: ['ACCEPTED'],
      ACCEPTED: ['SCHEDULED'],
      PRICE_AGREED: ['IN_PROGRESS', 'SCHEDULED'],
      SCHEDULED: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED'],
    };

    if (!allowedTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${booking.status} to ${status}`,
      });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        provider: { include: { user: { select: { firstName: true, lastName: true } } } },
        service: true,
        location: true,
        review: true,
        payment: true,
      },
    });

    try {
      const io = getIO();
      // Notify customer that the provider updated the status
      io.to(`user_${booking.customerId}`).emit('new_notification', {
        title: 'Booking Updated',
        body: `Your booking for ${booking.service.name} is now ${status.replace('_', ' ')}.`,
        link: `/my-bookings/${bookingId}`
      });
      // Also emit an update to the booking room so UI can refresh
      io.to(`booking_${bookingId}`).emit('booking_updated', updated);
    } catch (err) {
      console.error('Socket error:', err);
    }

    // Notify customer
    try {
      const messages = {
        ACCEPTED: `Your booking for "${booking.service.name}" has been accepted! 🎉`,
        IN_PROGRESS: `Your job "${booking.service.name}" has started. The provider is now working.`,
        SCHEDULED: `Your booking for "${booking.service.name}" has been scheduled.`,
      };
      if (messages[status]) {
        await prisma.notification.create({
          data: {
            userId: booking.customer.id,
            title: `Booking ${status.replace('_', ' ')}`,
            message: messages[status],
            type: `BOOKING_${status}`,
            link: `/my-bookings/${bookingId}`,
          },
        });
      }
    } catch (_) {}

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark booking as complete (provider) — updates provider stats
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Provider)
export const agreePrice = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { price } = req.body;
    const userId = req.user.id;

    const provider = await prisma.provider.findUnique({ where: { userId } });
    if (!provider) return res.status(403).json({ success: false, message: 'Only providers can set the price' });

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, providerId: provider.id }
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'ACCEPTED') return res.status(400).json({ success: false, message: 'Booking must be ACCEPTED to set price' });
    if (!price || isNaN(price)) return res.status(400).json({ success: false, message: 'A valid final price must be provided' });

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PRICE_AGREED', price: parseFloat(price) }
    });

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Complete a booking
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Provider)
export const completeBooking = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
        service: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.provider.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the assigned provider can complete this job' });
    }

    if (booking.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: `Job must be IN_PROGRESS to mark as complete. Current status: ${booking.status}`,
      });
    }

    // Update booking status to COMPLETED
    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          provider: { include: { user: { select: { firstName: true, lastName: true } } } },
          service: true,
          location: true,
          review: true,
        },
      }),
      // Increment jobsCompleted on provider
      prisma.provider.update({
        where: { id: booking.providerId },
        data: {
          jobsCompleted: { increment: 1 },
        },
      }),
    ]);

    // Recalculate completion rate
    const allBookings = await prisma.booking.count({
      where: { providerId: booking.providerId, status: { not: 'REQUESTED' } },
    });
    const completedCount = await prisma.booking.count({
      where: { providerId: booking.providerId, status: 'COMPLETED' },
    });

    const completionRate = allBookings > 0 ? Math.round((completedCount / allBookings) * 100) : 0;
    await prisma.provider.update({
      where: { id: booking.providerId },
      data: { completionRate },
    });

    // Notify customer: job done, prompt review
    try {
      await prisma.notification.create({
        data: {
          userId: booking.customer.id,
          title: 'Job Completed ✅',
          message: `Your "${booking.service.name}" job is complete! Please leave a review.`,
          type: 'BOOKING_COMPLETED',
          link: `/my-bookings/${bookingId}`,
        },
      });
    } catch (_) {}

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Customer who owns it, or Admin)
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        customer: { select: { id: true, firstName: true, lastName: true } },
        service: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customerId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the booking customer or admin can cancel' });
    }

    // Can only cancel if not already completed or paid
    const cancellableStatuses = ['REQUESTED', 'ACCEPTED', 'SCHEDULED'];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.status}`,
      });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        provider: { include: { user: { select: { firstName: true, lastName: true } } } },
        service: true,
        location: true,
        review: true,
      },
    });

    // Notify provider
    try {
      await prisma.notification.create({
        data: {
          userId: booking.provider.userId,
          title: 'Booking Cancelled ❌',
          message: `${booking.customer.firstName} ${booking.customer.lastName} cancelled the "${booking.service.name}" booking.${reason ? ` Reason: ${reason}` : ''}`,
          type: 'BOOKING_CANCELLED',
          link: `/my-bookings/${bookingId}`,
        },
      });
    } catch (_) {}

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const messages = await prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, firstName: true } } }
    });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { content } = req.body;
    const senderId = req.user.id;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { provider: true } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Determine receiver
    const receiverId = senderId === booking.customerId ? booking.provider.userId : booking.customerId;

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        bookingId,
        content
      },
      include: { sender: { select: { id: true, firstName: true } } }
    });

    // Emit real-time message to the booking room and receiver's personal room
    try {
      const io = getIO();
      // To people looking at the booking chat
      io.to(`booking_${bookingId}`).emit('new_message', message);
      // To the receiver for global notifications
      io.to(`user_${receiverId}`).emit('new_notification', {
        title: 'New Message',
        body: `You have a new message from ${message.sender.firstName}`,
        link: `/my-bookings/${bookingId}`
      });
    } catch (socketErr) {
      console.error('Socket error:', socketErr);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
