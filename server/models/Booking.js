const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Guest Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [80, 'Name too long'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number'],
  },

  // Booking Details
  guests: {
    type: mongoose.Mixed, // number or '10+'
    required: [true, 'Guest count is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  session: {
    type: String,
    enum: ['lunch', 'dinner'],
    required: [true, 'Session is required'],
  },
  time: {
    type: String,
    required: [true, 'Time slot is required'],
  },

  // Preferences
  seating: {
    type: String,
    enum: ['indoor', 'outdoor', 'private', 'rooftop'],
    default: 'indoor',
  },
  occasion: {
    type: String,
    enum: ['birthday', 'anniversary', 'family', 'corporate', 'date', 'none', ''],
    default: 'none',
  },
  requests: {
    type: String,
    maxlength: [500, 'Requests too long'],
    default: '',
  },
  confirmMethod: {
    type: String,
    enum: ['screen', 'whatsapp', 'call'],
    default: 'screen',
  },

  // Admin fields
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  },
  refNo: {
    type: String,
    unique: true,
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Notes too long'],
    default: '',
  },
  notificationSent: {
    whatsapp: { type: Boolean, default: false },
    email:    { type: Boolean, default: false },
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

// Auto-generate ref number before save
bookingSchema.pre('save', function (next) {
  if (!this.refNo) {
    this.refNo = 'CLR-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
  }
  next();
});

// Virtual: formatted date
bookingSchema.virtual('formattedDate').get(function () {
  return this.date.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
});

// Index for fast admin queries
bookingSchema.index({ date: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ phone: 1 });
bookingSchema.index({ refNo: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
