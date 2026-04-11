import React, { useState, useEffect, useRef } from 'react';
import './GalleryPage.css';

// ── Gallery Data ──────────────────────────────────────────────────────────────
// In production: replace `img` with real photo URLs from Cloudinary / your server
// Each item: { id, cat, label, img, size, tag }
// size: 'tall' | 'wide' | 'normal'  — controls masonry span
// img:  URL string or null (shows emoji placeholder when null)

const GALLERY = [
  // ── Food ──────────────────────────────────────────────────────────────────
  { id:1,  cat:'food',    label:'Paneer Butter Masala',    emoji:'🍛', img:null, color:['#5a2d1e','#8a4428'], size:'tall',   tag:'Chef Special' },
  { id:2,  cat:'food',    label:'Chilli Paneer',           emoji:'🌶️', img:null, color:['#4a1e1e','#7a3228'], size:'normal', tag:'Bestseller'   },
  { id:3,  cat:'food',    label:'Veg Biryani',             emoji:'🍚', img:null, color:['#4a3a1e','#7a5a28'], size:'wide',   tag:'Signature'    },
  { id:4,  cat:'food',    label:'Paneer Tikka',            emoji:'🥗', img:null, color:['#2d5a1e','#3a7a28'], size:'normal', tag:null           },
  { id:5,  cat:'food',    label:'Garlic Naan & Breads',    emoji:'🫓', img:null, color:['#4a3a1e','#6a5028'], size:'normal', tag:null           },
  { id:6,  cat:'food',    label:'Dal Makhani',             emoji:'🫘', img:null, color:['#5a2a1e','#7a4028'], size:'normal', tag:'Bestseller'   },
  { id:7,  cat:'food',    label:'Hakka Noodles',           emoji:'🍜', img:null, color:['#1e3a5a','#285a7a'], size:'tall',   tag:null           },
  { id:8,  cat:'food',    label:'Mango Mocktail',          emoji:'🥤', img:null, color:['#5a3a1e','#7a5228'], size:'normal', tag:'Refreshing'   },
  { id:9,  cat:'food',    label:'Brownie & Ice Cream',     emoji:'🍫', img:null, color:['#3a1e1e','#5a2828'], size:'normal', tag:'Chef Special' },
  { id:10, cat:'food',    label:'Kadai Paneer',            emoji:'🫕', img:null, color:['#5a2d1e','#7a3d28'], size:'wide',   tag:null           },
  { id:11, cat:'food',    label:'Gulab Jamun',             emoji:'🍯', img:null, color:['#5a3820','#7a5030'], size:'normal', tag:'Loved By All' },
  { id:12, cat:'food',    label:'Fresh Juice Platter',     emoji:'🧃', img:null, color:['#1e4a2a','#286a3a'], size:'normal', tag:null           },

  // ── Ambiance ──────────────────────────────────────────────────────────────
  { id:13, cat:'ambiance',label:'Main Dining Hall',        emoji:'🏛️', img:null, color:['#1e3d1e','#2d5a27'], size:'wide',   tag:null           },
  { id:14, cat:'ambiance',label:'Candlelit Evening',       emoji:'🕯️', img:null, color:['#3a2d1e','#6a4828'], size:'tall',   tag:null           },
  { id:15, cat:'ambiance',label:'Live Music Night',        emoji:'🎵', img:null, color:['#1e2a3d','#284060'], size:'normal', tag:'Every Weekend' },
  { id:16, cat:'ambiance',label:'Cozy Corner Seating',     emoji:'🪑', img:null, color:['#2d1e1e','#4a3030'], size:'normal', tag:null           },
  { id:17, cat:'ambiance',label:'Restaurant Entrance',     emoji:'🌿', img:null, color:['#1e3d20','#2a5a2c'], size:'tall',   tag:null           },
  { id:18, cat:'ambiance',label:'Bar & Beverage Counter',  emoji:'🫙', img:null, color:['#2a1e3d','#402860'], size:'normal', tag:null           },
  { id:19, cat:'ambiance',label:'Outdoor Seating Area',    emoji:'🌳', img:null, color:['#1e3a20','#285a2c'], size:'wide',   tag:'Open Evenings' },
  { id:20, cat:'ambiance',label:'Elegant Table Setup',     emoji:'🍽️', img:null, color:['#3a2820','#5a4030'], size:'normal', tag:null           },

  // ── Events ────────────────────────────────────────────────────────────────
  { id:21, cat:'events',  label:'Birthday Celebration',   emoji:'🎂', img:null, color:['#5a1e3a','#8a2858'], size:'wide',   tag:'Special Decor' },
  { id:22, cat:'events',  label:'Anniversary Dinner',     emoji:'💍', img:null, color:['#3a1e5a','#58288a'], size:'tall',   tag:'Candlelit'    },
  { id:23, cat:'events',  label:'Family Get-together',    emoji:'👨‍👩‍👧',img:null, color:['#2d1e3a','#4a2858'], size:'normal', tag:null           },
  { id:24, cat:'events',  label:'Corporate Lunch',        emoji:'💼', img:null, color:['#1e3d2d','#2d5a42'], size:'normal', tag:'Group Booking' },
  { id:25, cat:'events',  label:'Date Night Setup',       emoji:'🌹', img:null, color:['#5a1e2a','#8a2840'], size:'normal', tag:'Romantic'     },
  { id:26, cat:'events',  label:'Kitty Party',            emoji:'🎊', img:null, color:['#4a1e4a','#6a2868'], size:'wide',   tag:null           },

  // ── Team ──────────────────────────────────────────────────────────────────
  { id:27, cat:'team',    label:'Our Head Chef',          emoji:'👨‍🍳', img:null, color:['#1e3d1e','#2a5a26'], size:'tall',   tag:'10+ Years Exp' },
  { id:28, cat:'team',    label:'The Kitchen Team',       emoji:'🍳', img:null, color:['#1e2a3d','#283a5a'], size:'wide',   tag:null           },
  { id:29, cat:'team',    label:'Front-of-House Staff',   emoji:'🙋', img:null, color:['#2d1e1e','#4a2a2a'], size:'normal', tag:'Always Smiling'},
  { id:30, cat:'team',    label:'Our Founder',            emoji:'🌿', img:null, color:['#1e3d28','#265a38'], size:'normal', tag:'Est. 2014'    },
  { id:31, cat:'team',    label:'Live Music Artist',      emoji:'🎤', img:null, color:['#2a1e3d','#3a2858'], size:'normal', tag:'Weekends'     },
  { id:32, cat:'team',    label:'The Full Team',          emoji:'👥', img:null, color:['#1e3020','#2a4830'], size:'wide',   tag:'Team Coriander'},
];

const CATS = [
  { id:'all',     label:'All',      icon:'🖼️', count: GALLERY.length },
  { id:'food',    label:'Food',     icon:'🍽️', count: GALLERY.filter(g=>g.cat==='food').length },
  { id:'ambiance',label:'Ambiance', icon:'✨', count: GALLERY.filter(g=>g.cat==='ambiance').length },
  { id:'events',  label:'Events',   icon:'🎉', count: GALLERY.filter(g=>g.cat==='events').length },
  { id:'team',    label:'Our Team', icon:'👥', count: GALLERY.filter(g=>g.cat==='team').length },
];

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ item, items, onClose }) {
  const [current, setCurrent] = useState(item);

  // Keyboard navigation
  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft')  navigate(-1);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [current]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const navigate = (dir) => {
    const idx  = items.findIndex(g => g.id === current.id);
    const next = items[(idx + dir + items.length) % items.length];
    setCurrent(next);
  };

  const catLabel = CATS.find(c => c.id === current.cat);

  return (
    <div className="gl-lightbox" onClick={onClose}>
      <button className="gl-lb-close" onClick={onClose} title="Close (Esc)">✕</button>

      <button className="gl-lb-nav gl-lb-nav--prev" onClick={e => { e.stopPropagation(); navigate(-1); }} title="Previous (←)">
        ‹
      </button>

      <div className="gl-lb-content" onClick={e => e.stopPropagation()}>
        {/* Image or placeholder */}
        <div className="gl-lb-img"
          style={{ background: `linear-gradient(135deg, ${current.color[0]}, ${current.color[1]})` }}>
          {current.img
            ? <img src={current.img} alt={current.label} />
            : <span className="gl-lb-emoji">{current.emoji}</span>
          }
          {current.tag && <span className="gl-lb-tag">{current.tag}</span>}
        </div>

        {/* Info bar */}
        <div className="gl-lb-info">
          <div className="gl-lb-info__left">
            <span className="gl-lb-cat">{catLabel?.icon} {catLabel?.label}</span>
            <h3 className="gl-lb-label">{current.label}</h3>
            <p className="gl-lb-credit">📍 Coriander Leaf Restaurant · Geeta Bhawan, Indore</p>
          </div>
          <div className="gl-lb-info__right">
            <span className="gl-lb-counter">
              {items.findIndex(g => g.id === current.id) + 1} / {items.length}
            </span>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="gl-lb-thumbs">
          {items.map(g => (
            <button
              key={g.id}
              className={`gl-lb-thumb ${g.id === current.id ? 'gl-lb-thumb--active' : ''}`}
              onClick={() => setCurrent(g)}
              style={{ background: `linear-gradient(135deg,${g.color[0]},${g.color[1]})` }}
            >
              <span>{g.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="gl-lb-nav gl-lb-nav--next" onClick={e => { e.stopPropagation(); navigate(1); }} title="Next (→)">
        ›
      </button>
    </div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────
function GalleryCard({ item, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`gl-card gl-card--${item.size}`}
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}
      aria-label={`View ${item.label}`}
    >
      {/* Actual image or emoji placeholder */}
      <div
        className="gl-card__img"
        style={{ background: `linear-gradient(135deg,${item.color[0]},${item.color[1]})` }}
      >
        {item.img ? (
          <>
            {!loaded && <span className="gl-card__emoji">{item.emoji}</span>}
            <img
              src={item.img}
              alt={item.label}
              onLoad={() => setLoaded(true)}
              style={{ opacity: loaded ? 1 : 0 }}
            />
          </>
        ) : (
          <span className="gl-card__emoji">{item.emoji}</span>
        )}
      </div>

      {/* Hover overlay */}
      <div className={`gl-card__overlay ${hovered ? 'gl-card__overlay--show' : ''}`}>
        <div className="gl-card__overlay-inner">
          {item.tag && <span className="gl-card__tag">{item.tag}</span>}
          <h4 className="gl-card__label">{item.label}</h4>
          <span className="gl-card__zoom">🔍 View Photo</span>
        </div>
      </div>

      {/* Always-visible category dot */}
      <span className="gl-card__cat-dot" data-cat={item.cat} />
    </div>
  );
}

// ── Main GalleryPage ──────────────────────────────────────────────────────────
export default function GalleryPage({ onHome, onBook }) {
  const [activeCat,  setActiveCat]  = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);
  const [animKey,    setAnimKey]    = useState(0); // triggers re-animation on filter change
  const filterRef = useRef(null);

  const filtered = activeCat === 'all'
    ? GALLERY
    : GALLERY.filter(g => g.cat === activeCat);

  const handleCat = (cat) => {
    setActiveCat(cat);
    setAnimKey(k => k + 1); // re-trigger entry animation
  };

  const openLightbox  = (item) => setLightboxItem(item);
  const closeLightbox = ()     => setLightboxItem(null);

  return (
    <div className="gallery-page">

      {/* ── Top Bar ── */}
      <div className="gallery-topbar">
        <button className="gl-back-btn" onClick={onHome}>← Home</button>
        <div className="gallery-topbar__brand">
          <span>🌿</span>
          <div>
            <div className="gl-brand-name">Coriander Leaf</div>
            <div className="gl-brand-sub">Photo Gallery</div>
          </div>
        </div>
        <button className="gl-book-btn" onClick={onBook}>Reserve Table</button>
      </div>

      {/* ── Hero ── */}
      <div className="gallery-hero">
        <div className="gallery-hero__overlay" />
        <div className="gallery-hero__content">
          <p className="gl-eyebrow">OUR GALLERY</p>
          <h1>A Feast for <span>the Eyes</span></h1>
          <p>Explore our food, ambiance, events and the team that makes it all happen</p>
          <div className="gallery-hero__stats">
            {CATS.filter(c => c.id !== 'all').map(c => (
              <button key={c.id} className="gl-hero-stat" onClick={() => handleCat(c.id)}>
                <span className="gl-hero-stat__icon">{c.icon}</span>
                <span className="gl-hero-stat__count">{c.count}</span>
                <span className="gl-hero-stat__label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="gl-masonry-wrap">
        <div className="gl-masonry" key={animKey}>
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="gl-masonry__item"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <GalleryCard item={item} onClick={openLightbox} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="gl-empty">
            <span>📷</span>
            <p>No photos in this category yet</p>
          </div>
        )}
      </div>

      {/* ── Photo Upload CTA ── */}
      <div className="gl-share-section">
        <div className="gl-share-section__inner">
          <div className="gl-share-section__text">
            <h3>📸 Add Your Real Photos Here</h3>
            <p>
              Replace the placeholder items in <code>GalleryPage.jsx</code> by setting <code>img: "YOUR_PHOTO_URL"</code> on each item.
              Host photos on <strong>Cloudinary</strong>, <strong>Google Drive</strong>, or your own server.
            </p>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="gl-instagram-btn"
          >
            📸 Follow on Instagram
          </a>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <section className="gl-cta">
        <div className="gl-cta__overlay" />
        <div className="gl-cta__content">
          <p className="gl-eyebrow">VISIT US</p>
          <h2>Come Experience it <span>In Person</span></h2>
          <p>No photo captures the taste of our food or the warmth of our hospitality.</p>
          <div className="gl-cta__btns">
            <button className="gl-cta-primary" onClick={onBook}>🍽️ Book a Table</button>
            <a href="tel:+917314000000" className="gl-cta-call">📞 Call Us</a>
            <button className="gl-cta-ghost" onClick={onHome}>← Back to Home</button>
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          items={filtered}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}