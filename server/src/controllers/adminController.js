import prisma from '../config/database.js';
import { sendVerificationUpdate } from '../services/emailService.js';
import { createAuditLog, getAuditLogs as fetchAuditLogs } from '../services/auditService.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalCustomers,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      openDisputes,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.dispute.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          provider: { include: { user: { select: { firstName: true, lastName: true } } } },
          service: true,
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        totalCustomers,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingVerifications,
        openDisputes,
        recentBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          createdAt: true,
          provider: {
            select: {
              id: true,
              businessName: true,
              trustScore: true,
              identityVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive, role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      adminId: req.user.id,
      action: 'USER_UPDATE',
      targetType: 'User',
      targetId: userId,
      details: { isActive, role, updatedFields: Object.keys(req.body) },
      req,
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user (soft delete by deactivating)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await createAuditLog({
      adminId: req.user.id,
      action: 'USER_DELETE',
      targetType: 'User',
      targetId: userId,
      details: { email: user.email, role: user.role },
      req,
    });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all providers
// @route   GET /api/admin/providers
// @access  Private/Admin
export const getAllProviders = async (req, res) => {
  try {
    const { search, verified, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { description: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
      ];
    }
    if (verified === 'true') {
      where.identityVerified = true;
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              isActive: true,
              createdAt: true,
            },
          },
          services: {
            include: { service: true },
          },
          reviews: {
            select: { id: true, rating: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({
      success: true,
      providers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update provider
// @route   PUT /api/admin/providers/:id
// @access  Private/Admin
export const updateProvider = async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const { identityVerified, skillsVerified, locationVerified, phoneVerified, trustScore } = req.body;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        identityVerified,
        skillsVerified,
        locationVerified,
        phoneVerified,
        trustScore: trustScore ? parseFloat(trustScore) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            isActive: true,
          },
        },
        services: {
          include: { service: true },
        },
      },
    });

    await createAuditLog({
      adminId: req.user.id,
      action: 'PROVIDER_UPDATE',
      targetType: 'Provider',
      targetId: providerId,
      details: { identityVerified, skillsVerified, locationVerified, phoneVerified, trustScore },
      req,
    });

    res.json({ success: true, provider: updatedProvider });
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { customer: { firstName: { contains: search } } },
        { provider: { user: { firstName: { contains: search } } } },
        { service: { name: { contains: search } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          provider: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          service: true,
          payment: true,
          review: true,
          dispute: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin cancel booking
// @route   PATCH /api/admin/bookings/:id/cancel
// @access  Private/Admin
export const adminCancelBooking = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        provider: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        service: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
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

    await createAuditLog({
      adminId: req.user.id,
      action: 'BOOKING_CANCEL',
      targetType: 'Booking',
      targetId: bookingId,
      details: { reason, bookingId, customerId: booking.customerId, providerId: booking.providerId },
      req,
    });

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Refund payment
// @route   PATCH /api/admin/payments/:id/refund
// @access  Private/Admin
export const refundPayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ success: false, message: 'Payment already refunded' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
      include: {
        booking: {
          include: {
            service: true,
            customer: { select: { firstName: true, lastName: true } },
            provider: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });

    await createAuditLog({
      adminId: req.user.id,
      action: 'PAYMENT_REFUND',
      targetType: 'Payment',
      targetId: paymentId,
      details: { reason, amount: payment.amount, bookingId: payment.bookingId },
      req,
    });

    res.json({ success: true, payment: updatedPayment });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
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
        skip,
        take: parseInt(limit),
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all disputes (admin view)
// @route   GET /api/admin/disputes
// @access  Private/Admin
export const getAllDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          booking: {
            include: {
              service: true,
              customer: { select: { firstName: true, lastName: true, email: true } },
              provider: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
            },
          },
          raiser: { select: { firstName: true, lastName: true, email: true, role: true } },
          assignedAdmin: { select: { firstName: true, lastName: true } },
          resolver: { select: { firstName: true, lastName: true } },
          evidence: {
            include: {
              user: { select: { firstName: true, lastName: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.dispute.count({ where }),
    ]);

    res.json({
      success: true,
      disputes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
export const getAuditLogs = async (req, res) => {
  try {
    const { adminId, action, targetType, targetId, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await fetchAuditLogs({
      adminId,
      action,
      targetType,
      targetId,
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      logs: result.logs,
      total: result.total,
      page: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all verification requests
// @route   GET /api/admin/verifications
// @access  Private/Admin
export const getVerifications = async (req, res) => {
  try {
    const verifications = await prisma.verificationRequest.findMany({
      include: {
        provider: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        },
        user: { select: { firstName: true, lastName: true } }
      },
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

// @desc    Update verification request status
// @route   PUT /api/admin/verifications/:id/status
// @access  Private/Admin
export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await prisma.verificationRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    const updatedRequest = await prisma.verificationRequest.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminNotes,
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      }
    });

    if (status === 'VERIFIED') {
      const updateData = {};
      if (request.type === 'IDENTITY') updateData.identityVerified = true;
      else if (request.type === 'SKILLS') updateData.skillsVerified = true;
      else if (request.type === 'LOCATION') updateData.locationVerified = true;

      if (Object.keys(updateData).length > 0) {
        await prisma.provider.update({
          where: { id: request.providerId },
          data: updateData
        });
      }
    }

    // Send verification update email
    try {
      const providerUser = await prisma.user.findUnique({
        where: { id: request.userId },
        select: { email: true, firstName: true },
      });
      if (providerUser?.email) {
        await sendVerificationUpdate(providerUser.email, providerUser.firstName, request.type, status);
      }
    } catch (_) { /* email failure should not block status update */ }

    res.json({
      success: true,
      verification: updatedRequest
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
