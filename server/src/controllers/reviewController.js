import prisma from '../config/database.js';

// @desc    Create a review for a provider
// @route   POST /api/reviews
// @access  Private/Customer
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user.id;

    // Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customerId !== customerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'COMPLETED' && booking.status !== 'PAID') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: parseInt(bookingId) }
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this booking' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId: parseInt(bookingId),
        customerId,
        providerId: booking.providerId,
        rating: parseInt(rating),
        comment
      }
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { status: 'REVIEWED' }
    });

    // Update provider's trust score (dummy logic)
    const providerReviews = await prisma.review.findMany({
      where: { providerId: booking.providerId }
    });

    const totalRating = providerReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRating / providerReviews.length;
    // Assuming trustScore is out of 100, we could multiply by 20. Or if it's out of 5, just use averageRating.
    // The schema says trustScore Float @default(0). We'll set it to averageRating * 20.
    const trustScore = averageRating * 20;

    await prisma.provider.update({
      where: { id: booking.providerId },
      data: { trustScore }
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { providerId: parseInt(providerId), isPublic: true },
      include: {
        customer: {
          select: { firstName: true, lastName: true, profileImage: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
