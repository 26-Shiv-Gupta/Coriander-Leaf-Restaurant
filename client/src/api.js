/**
 * api.js — Centralized API service for Coriander Leaf frontend
 * All calls go through here. Set VITE_API_URL in .env
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, opts = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Something went wrong');
    return data;
  } catch (err) {
    throw new Error(err.message || 'Network error — please try again');
  }
}

// ── Menu ──────────────────────────────────────────────────────────────────────

/** Fetch all available menu items grouped by category */
export const fetchMenu = () => request('/menu');

/** Fetch only bestsellers + chef specials */
export const fetchSpecials = () => request('/menu?bestseller=true');

// ── Bookings ──────────────────────────────────────────────────────────────────

/** Submit a new table booking */
export const createBooking = (payload) =>
  request('/bookings', { method: 'POST', body: JSON.stringify(payload) });

/** Check booking status by ref number */
export const checkBooking = (refNo) =>
  request(`/bookings/check?refNo=${encodeURIComponent(refNo)}`);
