import prisma from '../config/database.js';

// @desc    Initiate a mobile money payment
// @route   POST /api/payments
// @access  Private/Customer
export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, mobileMoneyNumber, method = 'MOBILE_MONEY' } = req.body;
    const customerId = req.user.id;

    // Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        customer: true,
        provider: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customerId !== customerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    if (booking.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    // Upsert Payment Record (in case they tried before and it failed/pending)
    const transactionId = 'MOMO_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const payment = await prisma.payment.upsert({
      where: { bookingId: parseInt(bookingId) },
      update: {
        amount: parseFloat(amount),
        method,
        status: 'PENDING',
        transactionId,
        mobileMoneyNumber
      },
      create: {
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        method,
        status: 'PENDING',
        transactionId,
        mobileMoneyNumber
      }
    });

    // MOCK MOBILE MONEY API DELAY & SUCCESS
    setTimeout(async () => {
      try {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED', paymentDate: new Date() }
          }),
          prisma.booking.update({
            where: { id: parseInt(bookingId) },
            data: { status: 'PAID' }
          }),
          prisma.notification.create({
            data: {
              userId: booking.provider.userId,
              title: 'Payment Received 💰',
              message: `You have received a payment of GH₵ ${amount} for booking #${bookingId}.`,
              type: 'PAYMENT_RECEIVED',
              link: `/my-bookings/${bookingId}`,
            }
          })
        ]);
      } catch (err) {
        console.error('Async payment update error:', err);
      }
    }, 3000); // 3 second delay to simulate payment prompt

    res.status(201).json({
      success: true,
      message: 'Payment prompt sent to your device. Please authorize the transaction.',
      payment
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get transaction history for a user
// @route   GET /api/payments/history
// @access  Private
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let where = {};

    if (role === 'CUSTOMER') {
      where = {
        booking: {
          customerId: userId
        }
      };
    } else if (role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      if (!provider) {
        return res.json({ success: true, payments: [] });
      }
      where = {
        booking: {
          providerId: provider.id
        }
      };
    } else if (role === 'ADMIN') {
      // Admins can see all
      where = {};
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            service: { select: { name: true } },
            customer: { select: { firstName: true, lastName: true } },
            provider: { include: { user: { select: { firstName: true, lastName: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
