import prisma from '../config/database.js';

// @desc    Create a new dispute
// @route   POST /api/disputes
// @access  Private (Customer / Provider)
export const createDispute = async (req, res) => {
  try {
    const { bookingId, reason, description } = req.body;
    const userId = req.user.id;

    if (!bookingId || !reason) {
      return res.status(400).json({ success: false, message: 'Booking ID and reason are required' });
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify user is part of the booking
    if (booking.customerId !== userId && booking.providerId !== req.user.provider?.id) {
      return res.status(403).json({ success: false, message: 'You are not part of this booking' });
    }

    // Check if dispute already exists for this booking
    const existingDispute = await prisma.dispute.findUnique({
      where: { bookingId: parseInt(bookingId) }
    });

    if (existingDispute) {
      return res.status(400).json({ success: false, message: 'A dispute already exists for this booking' });
    }

    // Determine type
    const type = req.user.role === 'CUSTOMER' ? 'CUSTOMER_COMPLAINT' : 'PROVIDER_COMPLAINT';

    const dispute = await prisma.dispute.create({
      data: {
        bookingId: parseInt(bookingId),
        raisedBy: userId,
        type,
        reason,
        description,
        status: 'OPEN'
      }
    });

    return res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Upload evidence for a dispute
// @route   POST /api/disputes/:id/evidence
// @access  Private
export const uploadEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, description } = req.body;
    const userId = req.user.id;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File URL is required' });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: parseInt(id) },
      include: { booking: true }
    });

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Verify user is part of booking or an admin
    if (dispute.booking.customerId !== userId && dispute.booking.providerId !== req.user.provider?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to upload evidence to this dispute' });
    }

    const evidence = await prisma.disputeEvidence.create({
      data: {
        disputeId: parseInt(id),
        uploadedBy: userId,
        fileUrl,
        description
      }
    });

    return res.status(201).json({ success: true, data: evidence });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get disputes
// @route   GET /api/disputes
// @access  Private
export const getDisputes = async (req, res) => {
  try {
    const userId = req.user.id;
    let whereClause = {};

    // If not admin, only show their own disputes
    if (req.user.role !== 'ADMIN') {
      whereClause = {
        OR: [
          { raisedBy: userId },
          {
            booking: {
              OR: [
                { customerId: userId },
                { providerId: req.user.provider?.id || -1 }
              ]
            }
          }
        ]
      };
    }

    const disputes = await prisma.dispute.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            service: true,
          }
        },
        raiser: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedAdmin: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, data: disputes });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get dispute by ID
// @route   GET /api/disputes/:id
// @access  Private
export const getDisputeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dispute = await prisma.dispute.findUnique({
      where: { id: parseInt(id) },
      include: {
        booking: {
          include: {
            service: true,
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
            provider: { include: { user: { select: { firstName: true, lastName: true, email: true } } } }
          }
        },
        raiser: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedAdmin: { select: { id: true, firstName: true, lastName: true } },
        resolver: { select: { id: true, firstName: true, lastName: true } },
        evidence: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Verify user is part of booking or an admin
    if (dispute.booking.customerId !== userId && dispute.booking.providerId !== req.user.provider?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this dispute' });
    }

    return res.status(200).json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin: Start investigation
// @route   PATCH /api/disputes/:id/investigate
// @access  Private (Admin)
export const investigateDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user.id;

    const dispute = await prisma.dispute.findUnique({
      where: { id: parseInt(id) }
    });

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Cannot investigate a closed or resolved dispute' });
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: parseInt(id) },
      data: {
        status: 'UNDER_INVESTIGATION',
        assignedAdminId: adminId,
        adminNotes: adminNotes || dispute.adminNotes
      }
    });

    return res.status(200).json({ success: true, data: updatedDispute });
  } catch (error) {
    console.error('Error investigating dispute:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin: Resolve dispute
// @route   PATCH /api/disputes/:id/resolve
// @access  Private (Admin)
export const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!resolution) {
      return res.status(400).json({ success: false, message: 'Resolution details are required' });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: parseInt(id) }
    });

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    const data = {
      status: 'RESOLVED',
      resolvedBy: adminId,
      resolvedAt: new Date(),
      resolution
    };

    if (adminNotes) {
      data.adminNotes = adminNotes;
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: parseInt(id) },
      data
    });

    return res.status(200).json({ success: true, data: updatedDispute });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
