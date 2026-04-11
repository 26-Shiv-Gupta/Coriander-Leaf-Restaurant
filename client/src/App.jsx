import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import MenuPage from './MenuPage.jsx';
import BookingPage from './BookingPage.jsx';
import ContactPage from './ContactPage.jsx';
import GalleryPage from './GalleryPage.jsx';

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onMenuClick, onBookClick, onGalleryClick, onContactClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Menu', action: onMenuClick },
    { label: 'About Us', action: null },
    { label: 'Gallery', action: onGalleryClick },
    { label: 'Contact Us', action: onContactClick },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__logo">
        <div className="logo-icon">
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="22" cy="30" rx="18" ry="9" fill="#c8651b" opacity="0.9" />
            <path d="M22 4 C14 10 10 18 16 24 C20 28 24 26 26 22 C30 14 28 6 22 4Z" fill="#2d6a2d" />
            <path d="M22 4 C30 10 34 18 28 24 C24 28 20 26 18 22 C14 14 16 6 22 4Z" fill="#3a8a3a" opacity="0.7" />
            <circle cx="22" cy="4" r="2.5" fill="#4aaa4a" />
          </svg>
        </div>
        <div className="logo-text">
          <span className="logo-name">Coriander Leaf</span>
          <span className="logo-sub">RESTAURANT</span>
        </div>
      </div>

      <button className="navbar__burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        <span /><span /><span />
      </button>

      <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
        {navLinks.map(({ label, action }) => (
          <li key={label}>
            {action
              ? <a href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); action(); }}>{label}</a>
              : <a href="#about-us" onClick={() => setMenuOpen(false)}>{label}</a>
            }
          </li>
        ))}
      </ul>

      <button className="navbar__cta" onClick={onBookClick}>Reserve Your Table</button>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onBook }) {
  return (
    <section className="hero" id="home">
      <div className="hero__overlay" />
      <div className="hero__content">
        <div className="hero__badges">
          <span className="badge badge--green">🌿 100% Pure Veg</span>
          <span className="badge badge--gold">⭐ 4.1 (1900+ Reviews)</span>
        </div>
        <h1 className="hero__title">
          Pure Veg Dining<br />
          <span className="hero__title--accent">Experience in Indore</span>
        </h1>
        <p className="hero__sub">
          Delight in rich vegetarian flavors, live music &amp; a warm family‑friendly ambiance at Coriander Leaf Restaurant
        </p>
        <div className="hero__btns">
          <button className="btn btn--primary" onClick={onBook}>Book a Table</button>
          <a href="#menu" className="btn btn--outline">View Menu</a>
        </div>
        <div className="hero__meta">
          <span>🕐 11 AM – 4 PM | 6 PM – 11 PM</span>
          <span>📍 Geeta Bhawan, Indore</span>
        </div>
      </div>
    </section>
  );
}

// ── About ────────────────────────────────────────────────────────────────────
function About() {
  const features = [
    { icon: '🌿', label: 'Pure Veg' },
    { icon: '🎵', label: 'Live Music' },
    { icon: '👨‍👩‍👧', label: 'Family-Friendly' },
    { icon: '🌱', label: 'Vegan Options' },
  ];
  return (
    <section className="about" id="about-us">
      <div className="about__img-wrap">
        <div className="about__img-grid">
          <div className="about__img about__img--1" style={{ background: 'linear-gradient(135deg,#2d5a27,#4a8c3f)' }}><span>🍛</span></div>
          <div className="about__img about__img--2" style={{ background: 'linear-gradient(135deg,#5a3e28,#8c6440)' }}><span>☕</span></div>
          <div className="about__img about__img--3" style={{ background: 'linear-gradient(135deg,#3a5c2a,#5a8c3a)' }}><span>🥗</span></div>
          <div className="about__img about__img--4" style={{ background: 'linear-gradient(135deg,#6a4a2a,#a07040)' }}><span>🍰</span></div>
        </div>
        <div className="about__badge-float">
          <div className="about__badge-icon">✨</div>
          <div>
            <div className="about__badge-num">10+</div>
            <div className="about__badge-label">Years Serving</div>
          </div>
        </div>
      </div>

      <div className="about__body">
        <p className="section-eyebrow">ABOUT US</p>
        <h2 className="about__heading">
          Where Vegetarian Culinary Art Meets{' '}
          <span className="text-green">Warm Hospitality</span>
        </h2>
        <p className="about__desc">
          Located in the heart of Geeta Bhawan, Coriander Leaf Restaurant brings together authentic vegetarian flavors, modern ambiance, and exceptional service. Every dish tells a story of tradition, crafted with the freshest ingredients and a passion for pure vegetarian cuisine.
        </p>
        <div className="about__features">
          {features.map(f => (
            <div className="feature-card" key={f.label}>
              <span className="feature-card__icon">{f.icon}</span>
              <span className="feature-card__label">{f.label}</span>
            </div>
          ))}
        </div>
        <a href="#about-us" className="link-arrow">Discover Our Story →</a>
      </div>
    </section>
  );
}

// ── Menu ─────────────────────────────────────────────────────────────────────
const menuItems = [
  { badge: 'POPULAR', emoji: '🧀', title: 'Paneer Specialties', desc: 'Tender paneer in rich, aromatic gravies crafted with authentic spices', tag: 'Pure Veg' },
  { badge: 'SIGNATURE', emoji: '🍚', title: 'Biryani & Rice', desc: 'Fragrant basmati rice layered with fresh vegetables and aromatic spices', tag: 'Pure Veg' },
  { badge: 'CRISPY', emoji: '🥟', title: 'Veg Starters', desc: 'Crispy pakodas, finger chips and more — perfect starters for your meal', tag: 'Pure Veg' },
  { badge: null, emoji: '🍽️', title: 'North Indian Classics', desc: 'Rich curries and traditional recipes that warm the soul', tag: 'Pure Veg' },
  { badge: null, emoji: '🫓', title: 'Fresh Breads', desc: 'Freshly baked naan, rotis and more, straight from the tandoor', tag: 'Pure Veg' },
  { badge: 'CHINESE', emoji: '🍜', title: 'Chinese Delights', desc: 'Noodles, fried rice and more with an authentic Chinese twist', tag: 'Pure Veg' },
];

function MenuSection({ onExplore }) {
  return (
    <section className="menu-section" id="menu">
      <div className="menu-section__header">
        <p className="section-eyebrow section-eyebrow--gold">OUR MENU</p>
        <h2 className="menu-section__title">Signature Dishes</h2>
        <p className="menu-section__sub">From aromatic North Indian curries to flavorful Chinese delights, explore our carefully crafted vegetarian menu</p>
      </div>
      <div className="menu-grid">
        {menuItems.map((item, i) => (
          <div className="menu-card" key={i}>
            {item.badge && <span className="menu-card__badge">{item.badge}</span>}
            <div className="menu-card__img">
              <span>{item.emoji}</span>
            </div>
            <div className="menu-card__body">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="menu-card__tag">🌿 {item.tag}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="menu-section__cta">
        <button className="btn btn--primary" onClick={onExplore}>Explore Full Menu →</button>
      </div>
    </section>
  );
}

// ── Why Choose Us ─────────────────────────────────────────────────────────────
const whyCards = [
  { icon: '🌿', title: '100% Pure Veg', desc: 'Committed to pure vegetarian cuisine with the freshest ingredients and authentic flavors' },
  { icon: '🎵', title: 'Live Music Nights', desc: 'Enjoy your meal with soulful live music performances that elevate your dining experience' },
  { icon: '👨‍👩‍👧', title: 'Family-Friendly', desc: 'Warm, welcoming atmosphere perfect for family gatherings and celebrations' },
  { icon: '🌱', title: 'Vegan Options', desc: 'Wide variety of vegan-friendly dishes prepared with plant-based ingredients' },
  { icon: '📅', title: 'Easy Reservation', desc: 'Book your table online in minutes — same-day bookings welcome, no deposit required' },
  { icon: '⭐', title: '4.1 Star Rated', desc: 'Trusted by 1900+ happy customers who keep coming back for more' },
];

function WhyUs() {
  return (
    <section className="why-us">
      <p className="section-eyebrow">WHY CHOOSE US</p>
      <h2 className="why-us__title">The Coriander Leaf <span className="text-green">Experience</span></h2>
      <p className="why-us__sub">More than just a restaurant — it's a destination for memorable dining experiences</p>
      <div className="why-grid">
        {whyCards.map((c, i) => (
          <div className="why-card" key={i}>
            <div className="why-card__icon-wrap">
              <span>{c.icon}</span>
            </div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Location ──────────────────────────────────────────────────────────────────
function Location() {
  const MAPS_QUERY = encodeURIComponent('Coriander Leaf Restaurant, Plot No 2, Opp Vishesh Hospital, Geeta Bhawan, Indore, Madhya Pradesh');
  const MAPS_EMBED = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${MAPS_QUERY}&zoom=16`;
  const MAPS_OPEN = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
  const MAPS_DIR = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`;
  const Phone = '8717984084';

  return (
    <section className="location" id="contact-us">
      <p className="section-eyebrow">VISIT US</p>
      <h2 className="location__title">Find Us in <span className="text-green">Indore</span></h2>
      <p className="location__sub">Located in the heart of Geeta Bhawan, we're easily accessible and ready to welcome you</p>

      <div className="location__body">
        <div className="location__map">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.3069487839603!2d75.8811952793457!3d22.7168298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd2ac51668a9%3A0xcb43b52ee4f294f0!2sCoriander%20Leaf%20Restaurant!5e0!3m2!1sen!2sin!4v1775811674222!5m2!1sen!2sin" width="600" height="450" loading="lazy" />
        </div>

        <div className="location__info">
          <div className="info-row">
            <div className="info-icon">📍</div>
            <div>
              <strong>Address</strong>
              <p>Plot No 2, Opp. Vishesh Hospital,<br />Geeta Bhawan, Indore</p>
            </div>
          </div>
          <div className="info-row">
            <div className="info-icon">🕐</div>
            <div>
              <strong>Opening Hours</strong>
              <p>Lunch: 11:00 AM – 4:00 PM<br />Dinner: 6:00 PM – 11:00 PM</p>
              <span className="open-tag">Open All Days</span>
            </div>
          </div>
          <div className="location__btns">
            <a href={`tel: +91${Phone}`} className="btn btn--dark">📞 Call Now</a>
            <a href="https://maps.app.goo.gl/gq1XFjhqxx67ds5z8" target="_blank" rel="noreferrer" className="btn btn--primary">🗺️ Get Directions</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────
const Faq = [
  { q: 'Do you offer home delivery?',              a: 'Currently we offer dine-in only. Walk in or book a table in advance — we welcome you every day!' },
  { q: 'Is advance booking mandatory?',            a: 'Not mandatory, but we strongly recommend booking, especially for weekends and special occasions.' },
  { q: 'Do you accommodate Jain food requests?',  a: 'Absolutely. Please mention it in the special requests when booking or call us in advance.' },
  { q: 'Is there parking near the restaurant?',   a: 'Yes, parking is available in the Geeta Bhawan area. Our staff can guide you on arrival.' },
  { q: 'Can we host a private event or party?',   a: 'Yes! We accommodate corporate lunches, birthday parties, and family gatherings up to 100 guests.' },
  { q: 'What are your opening hours?',             a: 'We are open every day — Lunch: 11:00 AM–4:00 PM and Dinner: 6:00 PM–11:00 PM.' },
];

function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <section className="ct-faq">
      <div className="ct-faq__header">
        <p className="ct-eyebrow">FAQ</p>
        <h2>Frequently Asked <span>Questions</span></h2>
        <p>Quick answers to the things guests ask us most</p>
      </div>
      <div className="ct-faq-list">
        {Faq.map((item, i) => (
          <div key={i} className={`ct-faq-item ${openFaq === i ? 'ct-faq-item--open' : ''}`}>
            <button className="ct-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{item.q}</span>
              <span className="ct-faq-arrow">{openFaq === i ? '▲' : '▼'}</span>
            </button>
            {openFaq === i && <div className="ct-faq-a">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner({ onBook }) {
  return (
    <section className="cta-banner" id="reserve">
      <div className="cta-banner__overlay" />
      <div className="cta-banner__content">
        <span className="badge badge--dark">🌿 100% Pure Vegetarian</span>
        <h2>Experience the Best<br /><span className="text-gold">Pure Veg Dining</span><br />in Indore</h2>
        <p>Book your table today and treat yourself to an unforgettable culinary journey at Coriander Leaf Restaurant</p>
        <div className="cta-banner__btns">
          <button className="btn btn--primary" onClick={onBook}>Book a Table</button>
          <a href="#menu" className="btn btn--outline-light">View Menu</a>
        </div>
        <div className="cta-banner__stats">
          <span>⭐ 4.1 Star Rating</span>
          <span>|</span>
          <span>1900+ Happy Customers</span>
          <span>|</span>
          <span>10+ Years Serving</span>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ onBook, onGallery, onContact }) {
  const [email, setEmail] = useState('');
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <div className="footer__logo">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
              <ellipse cx="22" cy="30" rx="18" ry="9" fill="#c8651b" opacity="0.9" />
              <path d="M22 4 C14 10 10 18 16 24 C20 28 24 26 26 22 C30 14 28 6 22 4Z" fill="#2d6a2d" />
              <path d="M22 4 C30 10 34 18 28 24 C24 28 20 26 18 22 C14 14 16 6 22 4Z" fill="#3a8a3a" opacity="0.7" />
            </svg>
            <div>
              <div className="footer__logo-name">Coriander Leaf</div>
              <div className="footer__logo-sub">RESTAURANT</div>
            </div>
          </div>
          <p>Experience authentic vegetarian cuisine in the heart of Indore. Where flavors meet tradition.</p>
          <div className="footer__socials">
            {['IG', 'TW', 'FB'].map(s => <a key={s} href="#social" className="social-btn">{s === 'IG' ? '📸' : s === 'TW' ? '🐦' : '📘'}</a>)}
          </div>
        </div>

        <div className="footer__col">
          <h4>Quick Links</h4>
          <a href="#about-us">About Us</a>
          <a href="#menu" onClick={e => { e.preventDefault(); }} style={{ cursor: 'pointer' }}>Menu</a>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', fontSize: '.875rem', textAlign: 'left', padding: 0, marginBottom: '.5rem', transition: 'color .2s' }} onClick={onGallery}>Gallery</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', fontSize: '.875rem', textAlign: 'left', padding: 0, marginBottom: '.5rem', transition: 'color .2s' }} onClick={onContact}>Contact Us</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', fontSize: '.875rem', textAlign: 'left', padding: 0, transition: 'color .2s' }} onClick={onBook}>Book a Table</button>
        </div>

        <div className="footer__col">
          <h4>Contact Us</h4>
          <p>📍 Plot No 2, Opp. Vishesh Hospital, Geeta Bhawan, Indore</p>
          <p>🕐 11 AM – 4 PM | 6 PM – 11 PM</p>
        </div>

        <div className="footer__col">
          <h4>Stay Updated</h4>
          <p>Subscribe for special offers and updates</p>
          <div className="footer__newsletter">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="button">→</button>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 Coriander Leaf Restaurant. All rights reserved.</span>
        <div className="footer__bottom-links">
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home'); // 'home'|'menu'|'booking'|'gallery'|'contact'

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  if (page === 'menu') return <MenuPage onBack={() => setPage('home')} onBook={() => setPage('booking')} />;
  if (page === 'booking') return <BookingPage onHome={() => setPage('home')} />;
  if (page === 'gallery') return <GalleryPage onHome={() => setPage('home')} onBook={() => setPage('booking')} />;
  if (page === 'contact') return <ContactPage onHome={() => setPage('home')} onBook={() => setPage('booking')} />;

  return (
    <>
      <Navbar
        onMenuClick={() => setPage('menu')}
        onBookClick={() => setPage('booking')}
        onGalleryClick={() => setPage('gallery')}
        onContactClick={() => setPage('contact')}
      />
      <Hero onBook={() => setPage('booking')} />
      <About />
      <MenuSection onExplore={() => setPage('menu')} />
      <WhyUs />
      <Location />
      <FAQ />
      <CTABanner onBook={() => setPage('booking')} />
      <Footer onBook={() => setPage('booking')} onGallery={() => setPage('gallery')} onContact={() => setPage('contact')} />
    </>
  );
}