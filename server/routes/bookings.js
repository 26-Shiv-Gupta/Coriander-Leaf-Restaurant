const express  = require('express');
const Booking  = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { sendBookingNotifications } = require('../services/notifications');

const router = express.Router();

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// POST /api/bookings  — Guest creates a booking
router.post('/', async (req, res) => {
  try {
    const { name, phone, guests, date, session, time, seating, occasion, requests, confirmMethod } = req.body;

    // Validate date is not in the past
    const bookingDate = new Date(date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (bookingDate < today)
      return res.status(400).json({ success: false, message: 'Booking date cannot be in the past' });

    const booking = await Booking.create({
      name, phone, guests, date: bookingDate, session, time,
      seating: seating || 'indoor',
      occasion: occasion || 'none',
      requests: requests || '',
      confirmMethod: confirmMethod || 'screen',
      status: 'pending',
    });

    // Send notifications (non-blocking)
    sendBookingNotifications(booking)
      .then(results => {
        Booking.findByIdAndUpdate(booking._id, {
          'notificationSent.email': results.email,
          'notificationSent.whatsapp': results.whatsapp,
        }).exec();
      })
      .catch(err => console.error('Notification error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        _id: booking._id,
        refNo: booking.refNo,
        name: booking.name,
        date: booking.date,
        time: booking.time,
        session: booking.session,
        guests: booking.guests,
        status: booking.status,
        occasion: booking.occasion,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/check?refNo=CLR-XXXX — Guest checks booking status
router.get('/check', async (req, res) => {
  try {
    const { refNo } = req.query;
    if (!refNo) return res.status(400).json({ success: false, message: 'Ref number required' });
    const booking = await Booking.findOne({ refNo }).select('-adminNotes -handledBy');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN (Protected) ─────────────────────────────────────────────────────────

// GET /api/bookings — list all bookings with filters
router.get('/', protect, async (req, res) => {
  try {
    const { status, date, session, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status)  filter.status = status;
    if (session) filter.session = session;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { refNo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/stats — dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayCount, todayGuests, pendingCount, confirmedCount,
      monthCount, totalCount, recentBookings, upcomingToday,
    ] = await Promise.all([
      Booking.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Booking.aggregate([{ $match: { date: { $gte: today, $lt: tomorrow } } }, { $group: { _id: null, total: { $sum: { $toInt: '$guests' } } } }]),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ date: { $gte: monthStart } }),
      Booking.countDocuments(),
      Booking.find().sort({ createdAt: -1 }).limit(5),
      Booking.find({ date: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } }).sort({ time: 1 }),
    ]);

    // Monthly booking trend (last 7 days)
    const trend = await Booking.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        todayBookings: todayCount,
        todayGuests: todayGuests[0]?.total || 0,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        monthBookings: monthCount,
        totalBookings: totalCount,
        recentBookings,
        upcomingToday,
        bookingTrend: trend,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('handledBy', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id — update status, notes, etc.
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = { handledBy: req.user._id };
    if (status)     update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/bookings/:id  (hard delete, owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'owner')
      return res.status(403).json({ success: false, message: 'Owner only' });
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
