const nodemailer = require('nodemailer');

// ── Email Setup ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── WhatsApp via Twilio ───────────────────────────────────────────────────────
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  console.warn('⚠️  Twilio not configured:', e.message);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const occasionLabel = {
  birthday: '🎂 Birthday Celebration',
  anniversary: '💍 Anniversary Dinner',
  family: '👨‍👩‍👧 Family Get-together',
  corporate: '💼 Corporate Lunch',
  date: '🌹 Date Night',
  none: 'Regular Dining',
  '': 'Regular Dining',
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

// ── 1. Guest Confirmation Email ───────────────────────────────────────────────
const sendGuestConfirmationEmail = async (booking, guestEmail) => {
  if (!guestEmail) return; // email is optional in this app
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:DM Sans,Arial,sans-serif;background:#f4f8f4;margin:0;padding:20px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
        <div style="background:#1e3d1e;padding:32px;text-align:center;">
          <div style="font-size:2rem;">🌿</div>
          <h1 style="color:#e8b86d;font-size:1.4rem;margin:8px 0 4px;">Coriander Leaf Restaurant</h1>
          <p style="color:rgba(255,255,255,.7);font-size:.85rem;margin:0;">Pure Veg · Geeta Bhawan, Indore</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1e3d1e;margin-top:0;">🎉 Booking Confirmed!</h2>
          <p style="color:#555;">Hi <strong>${booking.name}</strong>, your table has been reserved. We can't wait to serve you!</p>
          <div style="background:#eef5ee;border-radius:12px;padding:20px;margin:20px 0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span style="color:#777;font-size:.88rem;">Booking Ref</span><strong style="color:#1e3d1e;font-size:1rem;letter-spacing:.05em;">${booking.refNo}</strong></div>
            <hr style="border:1px solid #d0dcd0;margin:12px 0;">
            <table style="width:100%;border-collapse:collapse;font-size:.88rem;">
              <tr><td style="padding:5px 0;color:#777;">📅 Date</td><td style="color:#222;text-align:right;">${formatDate(booking.date)}</td></tr>
              <tr><td style="padding:5px 0;color:#777;">⏰ Time</td><td style="color:#222;text-align:right;">${booking.time} (${booking.session === 'lunch' ? 'Lunch' : 'Dinner'})</td></tr>
              <tr><td style="padding:5px 0;color:#777;">👥 Guests</td><td style="color:#222;text-align:right;">${booking.guests}</td></tr>
              <tr><td style="padding:5px 0;color:#777;">🏛️ Seating</td><td style="color:#222;text-align:right;">Indoor Dining Hall</td></tr>
              <tr><td style="padding:5px 0;color:#777;">🎉 Occasion</td><td style="color:#222;text-align:right;">${occasionLabel[booking.occasion] || 'Regular Dining'}</td></tr>
            </table>
          </div>
          ${booking.requests ? `<div style="background:#fff8e8;border:1px solid #e8b86d;border-radius:10px;padding:14px;margin-bottom:16px;font-size:.85rem;color:#7a5000;">📝 Special Request: ${booking.requests}</div>` : ''}
          <div style="background:#1e3d1e;border-radius:12px;padding:16px;text-align:center;margin-top:20px;">
            <p style="color:rgba(255,255,255,.8);font-size:.82rem;margin:0 0 6px;">📍 Plot No 2, Opp. Vishesh Hospital, Geeta Bhawan, Indore</p>
            <p style="color:rgba(255,255,255,.8);font-size:.82rem;margin:0;">🕐 Lunch: 11AM–4PM &nbsp;|&nbsp; Dinner: 6PM–11PM</p>
          </div>
          <p style="text-align:center;margin-top:20px;font-size:.82rem;color:#999;">Need to cancel or change? Call us at <a href="tel:+918717984084" style="color:#4a8c3f;">+91-731-400-0000</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: guestEmail,
    subject: `✅ Booking Confirmed — ${booking.refNo} | Coriander Leaf`,
    html,
  });
};

// ── 2. Admin Alert Email ──────────────────────────────────────────────────────
const sendAdminAlertEmail = async (booking) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#f0f0f0;padding:20px;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,.1);">
        <h2 style="color:#1e3d1e;margin-top:0;">🔔 New Table Booking!</h2>
        <table style="width:100%;border-collapse:collapse;font-size:.9rem;">
          <tr style="background:#eef5ee;"><td style="padding:8px 12px;font-weight:600;">Ref No</td><td style="padding:8px 12px;">${booking.refNo}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;">Guest</td><td style="padding:8px 12px;">${booking.name}</td></tr>
          <tr style="background:#eef5ee;"><td style="padding:8px 12px;font-weight:600;">Phone</td><td style="padding:8px 12px;">+91 ${booking.phone}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;">Guests</td><td style="padding:8px 12px;">${booking.guests}</td></tr>
          <tr style="background:#eef5ee;"><td style="padding:8px 12px;font-weight:600;">Date</td><td style="padding:8px 12px;">${formatDate(booking.date)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;">Time</td><td style="padding:8px 12px;">${booking.time} (${booking.session})</td></tr>
          <tr style="background:#eef5ee;"><td style="padding:8px 12px;font-weight:600;">Occasion</td><td style="padding:8px 12px;">${occasionLabel[booking.occasion] || '-'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;">Requests</td><td style="padding:8px 12px;">${booking.requests || 'None'}</td></tr>
          <tr style="background:#eef5ee;"><td style="padding:8px 12px;font-weight:600;">Confirm via</td><td style="padding:8px 12px;">${booking.confirmMethod}</td></tr>
        </table>
        <div style="margin-top:20px;padding:12px;background:#fff8e8;border-radius:8px;font-size:.82rem;color:#7a5000;">
          ⚡ Log into your admin dashboard to manage this booking.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New Booking: ${booking.name} — ${formatDate(booking.date)} ${booking.time}`,
    html,
  });
};

// ── 3. WhatsApp — Guest Confirmation ─────────────────────────────────────────
const sendGuestWhatsApp = async (booking) => {
  if (!twilioClient) return;
  const msg = `✅ *Booking Confirmed!*\n\n🌿 *Coriander Leaf Restaurant*\n\n📋 *Ref:* ${booking.refNo}\n👤 *Name:* ${booking.name}\n📅 *Date:* ${formatDate(booking.date)}\n⏰ *Time:* ${booking.time} (${booking.session === 'lunch' ? 'Lunch' : 'Dinner'})\n👥 *Guests:* ${booking.guests}\n🎉 *Occasion:* ${occasionLabel[booking.occasion] || 'Regular Dining'}\n\n📍 Plot No 2, Opp. Vishesh Hospital, Geeta Bhawan, Indore\n\nNeed to cancel? Call: +91-731-400-0000`;

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:+91${booking.phone}`,
    body: msg,
  });
};

// ── 4. WhatsApp — Admin Alert ─────────────────────────────────────────────────
const sendAdminWhatsApp = async (booking) => {
  if (!twilioClient) return;
  const msg = `🔔 *New Booking Alert!*\n\n👤 *${booking.name}*\n📞 +91 ${booking.phone}\n👥 ${booking.guests} guests\n📅 ${formatDate(booking.date)}\n⏰ ${booking.time} (${booking.session})\n🎉 ${occasionLabel[booking.occasion] || 'Regular Dining'}\n📋 Ref: ${booking.refNo}\n\n${booking.requests ? '📝 Request: ' + booking.requests : ''}`;

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: process.env.RESTAURANT_WHATSAPP,
    body: msg,
  });
};

// ── Main: Send All Notifications ──────────────────────────────────────────────
const sendBookingNotifications = async (booking) => {
  const results = { email: false, whatsapp: false };

  // Email
  try {
    await sendAdminAlertEmail(booking);
    results.email = true;
    console.log(`📧 Admin email sent for booking ${booking.refNo}`);
  } catch (err) {
    console.error('❌ Admin email failed:', err.message);
  }

  // WhatsApp to restaurant
  try {
    await sendAdminWhatsApp(booking);
    results.whatsapp = true;
    console.log(`📱 Admin WhatsApp sent for booking ${booking.refNo}`);
  } catch (err) {
    console.error('❌ Admin WhatsApp failed:', err.message);
  }

  // Guest WhatsApp (if confirmMethod is whatsapp or always)
  try {
    await sendGuestWhatsApp(booking);
    console.log(`📱 Guest WhatsApp sent for booking ${booking.refNo}`);
  } catch (err) {
    console.error('❌ Guest WhatsApp failed:', err.message);
  }

  return results;
};

module.exports = {
  sendBookingNotifications,
  sendGuestConfirmationEmail,
  sendAdminAlertEmail,
};
