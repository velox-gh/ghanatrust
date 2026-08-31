import prisma from '../config/database.js';
import { sendVerificationUpdate } from '../services/emailService.js';

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
