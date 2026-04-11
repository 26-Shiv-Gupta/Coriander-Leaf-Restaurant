import React, { useState, useEffect } from 'react';
import './BookingPage.css';
import { createBooking } from './api.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const OCCASIONS = [
  { id: 'birthday',    icon: '🎂', label: 'Birthday Celebration' },
  { id: 'anniversary', icon: '💍', label: 'Anniversary Dinner' },
  { id: 'family',      icon: '👨‍👩‍👧', label: 'Family Get-together' },
  { id: 'corporate',   icon: '💼', label: 'Corporate Lunch' },
  { id: 'date',        icon: '🌹', label: 'Date Night' },
  { id: 'none',        icon: '🍽️', label: 'Just Dining' },
];

const TIME_SLOTS = {
  lunch:  ['11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'],
  dinner: ['06:00 PM','06:30 PM','07:00 PM','07:30 PM','08:00 PM','08:30 PM','09:00 PM','09:30 PM','10:00 PM','10:30 PM'],
};

const SEATING = [
  { id: 'indoor', icon: '🏛️', label: 'Indoor Dining Hall', desc: 'Air-conditioned comfort, perfect for families & groups', capacity: '4–100 guests' },
];

const GUEST_OPTIONS = [1,2,3,4,5,6,7,8,9,10,'10+'];

const CONFIRM_METHODS = [
  { id: 'screen',    icon: '✅', label: 'Instant Confirmation',  desc: 'Get confirmed on screen right now' },
  { id: 'whatsapp',  icon: '📱', label: 'WhatsApp Confirmation', desc: 'We\'ll confirm via WhatsApp shortly' },
  { id: 'call',      icon: '📞', label: 'Phone Call Back',       desc: 'Our team will call you to confirm' },
];

// Helper: get today's date string yyyy-mm-dd
const todayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Helper: format date nicely
const formatDate = (str) => {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// ── Step Indicator ─────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Details', 'Date & Time', 'Preferences', 'Confirm'];
  return (
    <div className="step-bar">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step-item ${i + 1 === step ? 'step-item--active' : ''} ${i + 1 < step ? 'step-item--done' : ''}`}>
            <div className="step-circle">
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-line ${i + 1 < step ? 'step-line--done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Summary Card ───────────────────────────────────────────────────────────────
function SummaryCard({ form }) {
  return (
    <div className="summary-card">
      <div className="summary-card__header">
        <span>🌿</span>
        <div>
          <div className="summary-card__title">Coriander Leaf</div>
          <div className="summary-card__sub">Your Booking Summary</div>
        </div>
      </div>
      <div className="summary-card__rows">
        {form.name    && <div className="summary-row"><span>👤</span><span>{form.name}</span></div>}
        {form.phone   && <div className="summary-row"><span>📞</span><span>{form.phone}</span></div>}
        {form.guests  && <div className="summary-row"><span>👥</span><span>{form.guests} Guest{form.guests > 1 ? 's' : ''}</span></div>}
        {form.date    && <div className="summary-row"><span>📅</span><span>{formatDate(form.date)}</span></div>}
        {form.session && <div className="summary-row"><span>🕐</span><span>{form.session === 'lunch' ? 'Lunch (11AM–4PM)' : 'Dinner (6PM–11PM)'}</span></div>}
        {form.time    && <div className="summary-row"><span>⏰</span><span>{form.time}</span></div>}
        {form.seating && <div className="summary-row"><span>🏛️</span><span>Indoor Dining Hall</span></div>}
        {form.occasion && form.occasion !== 'none' && (
          <div className="summary-row">
            <span>{OCCASIONS.find(o => o.id === form.occasion)?.icon}</span>
            <span>{OCCASIONS.find(o => o.id === form.occasion)?.label}</span>
          </div>
        )}
      </div>
      <div className="summary-card__footer">
        <span>📍 Geeta Bhawan, Indore</span>
        <span>Open All Days</span>
      </div>
    </div>
  );
}

// ── Step 1: Guest Details ──────────────────────────────────────────────────────
function Step1({ form, setForm, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())                     e.name  = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(form.phone))     e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.guests)                           e.guests = 'Please select number of guests';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <div className="step-content">
      <div className="step-content__header">
        <h2>👤 Your Details</h2>
        <p>Tell us a bit about yourself so we can set the perfect table</p>
      </div>

      <div className="form-group">
        <label>Full Name <span className="req">*</span></label>
        <input
          type="text"
          placeholder="e.g. Rahul Sharma"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={errors.name ? 'input--error' : ''}
        />
        {errors.name && <span className="error-msg">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Mobile Number <span className="req">*</span></label>
        <div className="phone-wrap">
          <span className="phone-prefix">🇮🇳 +91</span>
          <input
            type="tel"
            placeholder="9876543210"
            value={form.phone}
            maxLength={10}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,'') }))}
            className={errors.phone ? 'input--error' : ''}
          />
        </div>
        {errors.phone && <span className="error-msg">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label>Number of Guests <span className="req">*</span></label>
        <div className="guest-grid">
          {GUEST_OPTIONS.map(g => (
            <button
              key={g}
              type="button"
              className={`guest-btn ${form.guests === g ? 'guest-btn--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, guests: g }))}
            >
              {g}
            </button>
          ))}
        </div>
        {errors.guests && <span className="error-msg">{errors.guests}</span>}
        {form.guests === '10+' && (
          <div className="large-group-note">
            🎉 For large groups, our team will call you to arrange the best setup!
          </div>
        )}
      </div>

      <button className="btn-next" onClick={handleNext}>Continue → Choose Date & Time</button>
    </div>
  );
}

// ── Step 2: Date & Time ────────────────────────────────────────────────────────
function Step2({ form, setForm, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.date)    e.date    = 'Please select a date';
    if (!form.session) e.session = 'Please choose lunch or dinner';
    if (!form.time)    e.time    = 'Please select a time slot';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const selectSession = (s) => {
    setForm(f => ({ ...f, session: s, time: '' }));
    setErrors(e => ({ ...e, session: '', time: '' }));
  };

  return (
    <div className="step-content">
      <div className="step-content__header">
        <h2>📅 Date & Time</h2>
        <p>Pick your preferred day and slot — we're open every day!</p>
      </div>

      <div className="form-group">
        <label>Select Date <span className="req">*</span></label>
        <input
          type="date"
          min={todayStr()}
          value={form.date}
          onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(e2 => ({ ...e2, date: '' })); }}
          className={`date-input ${errors.date ? 'input--error' : ''}`}
        />
        {form.date && <div className="date-display">📅 {formatDate(form.date)}</div>}
        {errors.date && <span className="error-msg">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label>Dining Session <span className="req">*</span></label>
        <div className="session-cards">
          <button
            type="button"
            className={`session-card ${form.session === 'lunch' ? 'session-card--active' : ''}`}
            onClick={() => selectSession('lunch')}
          >
            <span>☀️</span>
            <strong>Lunch</strong>
            <small>11:00 AM – 4:00 PM</small>
          </button>
          <button
            type="button"
            className={`session-card ${form.session === 'dinner' ? 'session-card--active' : ''}`}
            onClick={() => selectSession('dinner')}
          >
            <span>🌙</span>
            <strong>Dinner</strong>
            <small>6:00 PM – 11:00 PM</small>
          </button>
        </div>
        {errors.session && <span className="error-msg">{errors.session}</span>}
      </div>

      {form.session && (
        <div className="form-group">
          <label>Time Slot <span className="req">*</span></label>
          <div className="time-grid">
            {TIME_SLOTS[form.session].map(t => (
              <button
                key={t}
                type="button"
                className={`time-btn ${form.time === t ? 'time-btn--active' : ''}`}
                onClick={() => { setForm(f => ({ ...f, time: t })); setErrors(e => ({ ...e, time: '' })); }}
              >
                {t}
              </button>
            ))}
          </div>
          {errors.time && <span className="error-msg">{errors.time}</span>}
        </div>
      )}

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <button className="btn-next" onClick={() => { if (validate()) onNext(); }}>Continue → Preferences</button>
      </div>
    </div>
  );
}

// ── Step 3: Preferences ────────────────────────────────────────────────────────
function Step3({ form, setForm, onNext, onBack }) {
  return (
    <div className="step-content">
      <div className="step-content__header">
        <h2>✨ Preferences</h2>
        <p>Help us make your visit extra special — all fields optional</p>
      </div>

      <div className="form-group">
        <label>Seating Preference</label>
        <div className="seating-cards">
          {SEATING.map(s => (
            <button
              key={s.id}
              type="button"
              className={`seating-card ${form.seating === s.id ? 'seating-card--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, seating: f.seating === s.id ? '' : s.id }))}
            >
              <span className="seating-card__icon">{s.icon}</span>
              <div>
                <strong>{s.label}</strong>
                <small>{s.desc}</small>
                <div className="seating-card__cap">👥 {s.capacity}</div>
              </div>
              {form.seating === s.id && <span className="seating-card__check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Special Occasion</label>
        <div className="occasion-grid">
          {OCCASIONS.map(o => (
            <button
              key={o.id}
              type="button"
              className={`occasion-btn ${form.occasion === o.id ? 'occasion-btn--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, occasion: f.occasion === o.id ? '' : o.id }))}
            >
              <span>{o.icon}</span>
              <small>{o.label}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Special Requests / Dietary Notes</label>
        <textarea
          placeholder="e.g. Jain food required, wheelchair accessible table, surprise decoration for birthday…"
          value={form.requests}
          onChange={e => setForm(f => ({ ...f, requests: e.target.value }))}
          rows={4}
        />
        <span className="char-count">{form.requests.length}/300</span>
      </div>

      <div className="form-group">
        <label>How would you like us to confirm?</label>
        <div className="confirm-methods">
          {CONFIRM_METHODS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`confirm-card ${form.confirmMethod === c.id ? 'confirm-card--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, confirmMethod: c.id }))}
            >
              <span className="confirm-card__icon">{c.icon}</span>
              <div>
                <strong>{c.label}</strong>
                <small>{c.desc}</small>
              </div>
              {form.confirmMethod === c.id && <span className="confirm-card__check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <button className="btn-next" onClick={onNext}>Review Booking →</button>
      </div>
    </div>
  );
}

// ── Step 4: Review & Submit ────────────────────────────────────────────────────
function Step4({ form, onBack, onSubmit, submitting, submitError }) {
  const [agreed, setAgreed] = useState(false);
  const occasion = OCCASIONS.find(o => o.id === form.occasion);
  const confirmMethod = CONFIRM_METHODS.find(c => c.id === form.confirmMethod);

  const rows = [
    { icon: '👤', label: 'Name',      value: form.name },
    { icon: '📞', label: 'Phone',     value: `+91 ${form.phone}` },
    { icon: '👥', label: 'Guests',    value: `${form.guests} Guest${form.guests > 1 ? 's' : ''}` },
    { icon: '📅', label: 'Date',      value: formatDate(form.date) },
    { icon: '🕐', label: 'Session',   value: form.session === 'lunch' ? 'Lunch (11AM–4PM)' : 'Dinner (6PM–11PM)' },
    { icon: '⏰', label: 'Time',      value: form.time },
    { icon: '🏛️', label: 'Seating',   value: form.seating ? SEATING.find(s => s.id === form.seating)?.label : 'No preference' },
    { icon: '🎉', label: 'Occasion',  value: occasion && occasion.id !== 'none' ? `${occasion.icon} ${occasion.label}` : 'Regular dining' },
    { icon: '✅', label: 'Confirmation', value: confirmMethod ? `${confirmMethod.icon} ${confirmMethod.label}` : 'On screen' },
  ];

  if (form.requests) rows.push({ icon: '📝', label: 'Requests', value: form.requests });

  return (
    <div className="step-content">
      <div className="step-content__header">
        <h2>🔍 Review Your Booking</h2>
        <p>Double-check everything before confirming your table</p>
      </div>

      <div className="review-table">
        {rows.map(r => (
          <div className="review-row" key={r.label}>
            <span className="review-row__icon">{r.icon}</span>
            <span className="review-row__label">{r.label}</span>
            <span className="review-row__value">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="policy-note">
        <label className="checkbox-label">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          <span>I agree that the restaurant may contact me on <strong>+91 {form.phone}</strong> to confirm or modify this reservation if needed.</span>
        </label>
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>← Edit</button>
        <button className="btn-confirm" disabled={!agreed || submitting} onClick={onSubmit}>
          {submitting ? '⏳ Confirming…' : '🎉 Confirm Reservation'}
        </button>
        {submitError && <div className="booking-api-error">⚠️ {submitError}</div>}
      </div>
    </div>
  );
}

// ── Success Screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ form, onBack, onHome }) {
  const confirmMethod = CONFIRM_METHODS.find(c => c.id === form.confirmMethod);
  const refNo = form.refNo || `CLR-${Date.now().toString().slice(-6)}`;

  return (
    <div className="success-screen">
      <div className="success-screen__inner">
        <div className="success-anim">
          <div className="success-ring" />
          <span className="success-checkmark">✓</span>
        </div>
        <h2>Table Reserved! 🎉</h2>
        <p>Your booking at <strong>Coriander Leaf Restaurant</strong> is confirmed. We can't wait to serve you!</p>

        <div className="booking-ref">
          <span className="booking-ref__label">Booking Reference</span>
          <span className="booking-ref__num">{refNo}</span>
        </div>

        <div className="success-details">
          <div className="success-detail-row"><span>📅</span><span>{formatDate(form.date)}</span></div>
          <div className="success-detail-row"><span>⏰</span><span>{form.time} · {form.session === 'lunch' ? 'Lunch' : 'Dinner'}</span></div>
          <div className="success-detail-row"><span>👥</span><span>{form.guests} Guest{form.guests > 1 ? 's' : ''}</span></div>
          <div className="success-detail-row"><span>📍</span><span>Geeta Bhawan, Indore</span></div>
        </div>

        <div className="success-confirm-note">
          {confirmMethod?.icon} {
            form.confirmMethod === 'whatsapp' ? `We'll send a confirmation to your WhatsApp (+91 ${form.phone}) shortly.` :
            form.confirmMethod === 'call'     ? `Our team will call you at +91 ${form.phone} to confirm.` :
            'Your booking is confirmed instantly!'
          }
        </div>

        <div className="success-actions">
          <button className="btn-new-booking" onClick={onBack}>Make Another Booking</button>
          <button className="btn-go-home" onClick={onHome}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}

// ── Main BookingPage ───────────────────────────────────────────────────────────
const INIT_FORM = {
  name: '', phone: '', guests: '', date: '', session: '', time: '',
  seating: 'indoor', occasion: '', requests: '', confirmMethod: 'screen',
};

export default function BookingPage({ onHome }) {
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState(INIT_FORM);
  const [submitted, setSubmit]      = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const data = await createBooking({
        name: form.name, phone: form.phone, guests: form.guests,
        date: form.date, session: form.session, time: form.time,
        seating: form.seating || 'indoor',
        occasion: form.occasion || 'none',
        requests: form.requests || '',
        confirmMethod: form.confirmMethod || 'screen',
      });
      setConfirmedBooking(data.booking);
      setSubmit(true);
    } catch (err) {
      setSubmitError(err.message || 'Booking failed. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INIT_FORM); setStep(1); setSubmit(false);
    setConfirmedBooking(null); setSubmitError('');
  };

  if (submitted) {
    return <SuccessScreen
      form={{ ...form, refNo: confirmedBooking?.refNo }}
      onBack={handleReset} onHome={onHome}
    />;
  }

  return (
    <div className="booking-page">

      {/* ── Top Bar ── */}
      <div className="booking-topbar">
        <button className="back-btn-top" onClick={onHome}>← Home</button>
        <div className="booking-topbar__brand">
          <span>🌿</span>
          <div>
            <div className="booking-topbar__name">Coriander Leaf</div>
            <div className="booking-topbar__sub">Table Reservation</div>
          </div>
        </div>
        <div className="booking-topbar__info">
          <span>📞 Call: <a href="tel:+917314000000">+91-731-400-0000</a></span>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="booking-hero">
        <div className="booking-hero__overlay" />
        <div className="booking-hero__content">
          <p className="booking-hero__eyebrow">RESERVE YOUR EXPERIENCE</p>
          <h1>Book Your <span>Perfect Table</span></h1>
          <p>100% Pure Veg · Geeta Bhawan, Indore · Open All Days</p>
          <div className="booking-hero__pills">
            <span>🕐 11AM–4PM | 6PM–11PM</span>
            <span>⭐ 4.1 · 1900+ Reviews</span>
            <span>👥 Up to 100 Guests</span>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="booking-layout">

        {/* ── Left: Form ── */}
        <div className="booking-form-col">
          <StepBar step={step} />

          {step === 1 && <Step1 form={form} setForm={setForm} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 form={form} setForm={setForm} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <Step4 form={form} onBack={() => setStep(3)} onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />}
        </div>

        {/* ── Right: Summary + Info ── */}
        <div className="booking-info-col">
          <SummaryCard form={form} />

          <div className="booking-info-card">
            <h4>📌 Good to Know</h4>
            <ul>
              <li>✅ Same-day bookings are welcome</li>
              <li>✅ No deposit required to reserve</li>
              <li>✅ Cancellation is free, anytime</li>
              <li>✅ Special decor for occasions available</li>
              <li>✅ Jain / vegan menu on request</li>
              <li>✅ Parking available nearby</li>
            </ul>
          </div>

          <div className="booking-info-card booking-info-card--green">
            <h4>📍 Find Us</h4>
            <p>Plot No 2, Opp. Vishesh Hospital,<br />Geeta Bhawan, Indore</p>
            <div className="find-us-btns">
              <a href="tel:+917314000000" className="find-us-btn">📞 Call</a>
              <a href="https://www.google.com/maps/search/Coriander+Leaf+Restaurant,+Plot+No+2,+Opp+Vishesh+Hospital,+Geeta+Bhawan,+Indore/@22.7196,75.8686,17z" target="_blank" rel="noreferrer" className="find-us-btn find-us-btn--gold">🗺️ Directions</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}