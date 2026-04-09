const express  = require('express');
const { protect, ownerOnly } = require('../middleware/auth');
const Booking  = require('../models/Booking');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// GET /api/admin/dashboard — unified dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayBookings, pendingCount, monthCount, totalBookings,
      menuTotal, menuUnavailable, recentBookings,
    ] = await Promise.all([
      Booking.find({ date: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } }).sort({ time: 1 }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ createdAt: { $gte: monthStart } }),
      Booking.countDocuments(),
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: false }),
      Booking.find().sort({ createdAt: -1 }).limit(8),
    ]);

    const todayGuests = todayBookings.reduce((s, b) => s + (parseInt(b.guests) || 0), 0);

    // 7-day booking trend
    const trend = await Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24*60*60*1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Occasion breakdown
    const occasionStats = await Booking.aggregate([
      { $match: { occasion: { $nin: ['none', '', null] } } },
      { $group: { _id: '$occasion', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      dashboard: {
        todayBookings,
        todayCount: todayBookings.length,
        todayGuests,
        pendingCount,
        monthCount,
        totalBookings,
        menuTotal,
        menuUnavailable,
        recentBookings,
        bookingTrend: trend,
        occasionStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
