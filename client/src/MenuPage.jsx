import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MenuPage.css';
import { fetchMenu } from './api.js';

// ── Category Meta ─────────────────────────────────────────────────────────────
const CATEGORY_META = {
  starters:   { label: 'Starters',      emoji: '🥗' },
  chinese:    { label: 'Chinese',        emoji: '🍜' },
  mainCourse: { label: 'Main Course',    emoji: '🍛' },
  biryani:    { label: 'Biryani & Rice', emoji: '🍚' },
  breads:     { label: 'Breads',         emoji: '🫓' },
  beverages:  { label: 'Beverages',      emoji: '🥤' },
  desserts:   { label: 'Desserts',       emoji: '🍨' },
};
const CATEGORY_ORDER = ['starters','chinese','mainCourse','biryani','breads','beverages','desserts'];

const BG_COLORS = {
  starters:   ['#2d5a1e','#3a7a28'],
  chinese:    ['#1e3a5a','#285a7a'],
  mainCourse: ['#5a2d1e','#7a3a28'],
  biryani:    ['#5a4a1e','#7a6428'],
  breads:     ['#4a3a1e','#6a5528'],
  beverages:  ['#1e4a5a','#28607a'],
  desserts:   ['#5a1e3a','#7a2850'],
};

const normalise = (item) => ({
  id:          item._id,
  name:        item.name,
  desc:        item.description,
  price:       item.price,
  category:    item.category,
  spice:       item.spiceLevel ?? 0,
  bestseller:  item.isBestseller ?? false,
  chefSpecial: item.isChefSpecial ?? false,
  vegan:       item.isVegan ?? false,
  emoji:       item.emoji || '🍽️',
  available:   item.isAvailable ?? true,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const SpiceBar = ({ level }) => (
  <div className="spice-bar">
    {[1,2,3].map(n => (
      <span key={n} className={`spice-dot ${n <= level ? 'spice-dot--on' : ''}`} />
    ))}
  </div>
);

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="dish-card skeleton-card">
      <div className="skeleton skeleton--img" />
      <div className="dish-card__body">
        <div className="skeleton skeleton--line" style={{width:'60%',height:14,marginBottom:8}} />
        <div className="skeleton skeleton--line" style={{width:'100%',height:12,marginBottom:4}} />
        <div className="skeleton skeleton--line" style={{width:'80%',height:12,marginBottom:16}} />
        <div className="skeleton skeleton--line" style={{width:60,height:20}} />
      </div>
    </div>
  );
}

// ── Dish Card — display only, no add-to-cart ──────────────────────────────────
function DishCard({ item, catKey }) {
  const bg  = BG_COLORS[catKey]?.[0] || '#2d3d1e';
  const bg2 = BG_COLORS[catKey]?.[1] || '#3a5028';

  return (
    <div className={`dish-card ${item.chefSpecial ? 'dish-card--special' : ''}`}>
      {(item.bestseller || item.chefSpecial) && (
        <div className="dish-card__ribbon">
          {item.chefSpecial ? "Chef's Special" : '⭐ Bestseller'}
        </div>
      )}
      <div className="dish-card__img" style={{ background: `linear-gradient(135deg,${bg},${bg2})` }}>
        <span>{item.emoji}</span>
        {item.vegan && <span className="dish-card__vegan-badge">🌱 Vegan</span>}
      </div>
      <div className="dish-card__body">
        <div className="dish-card__top">
          <span className="dish-card__veg">🟢</span>
          {item.spice > 0 && <SpiceBar level={item.spice} />}
        </div>
        <h3 className="dish-card__name">{item.name}</h3>
        <p className="dish-card__desc">{item.desc}</p>
        <div className="dish-card__footer">
          <span className="dish-card__price">₹{item.price}</span>
        </div>
      </div>
    </div>
  );
}

// ── Error Banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="menu-error-banner">
      <span>⚠️</span>
      <div>
        <strong>Could not load menu</strong>
        <p>{message}</p>
      </div>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}

// ── Main MenuPage ─────────────────────────────────────────────────────────────
export default function MenuPage({ onBack, onBook }) {
  const [menuData,     setMenuData]     = useState({});
  const [chefSpecials, setChefSpecials] = useState([]);
  const [apiLoading,   setApiLoading]   = useState(true);
  const [apiError,     setApiError]     = useState('');
  const [activeTab,    setActiveTab]    = useState('all');
  const [search,       setSearch]       = useState('');
  const [filterVegan,  setFilterVegan]  = useState(false);
  const [filterBest,   setFilterBest]   = useState(false);
  const [filterSpicy,  setFilterSpicy]  = useState(false);
  const [stickyNav,    setStickyNav]    = useState(false);
  const navRef = useRef(null);

  // ── Load from API ─────────────────────────────────────────────────────────
  const loadMenu = useCallback(async () => {
    setApiLoading(true); setApiError('');
    try {
      const data = await fetchMenu();
      const grouped = data.grouped || {};
      const normGrouped = {};
      Object.entries(grouped).forEach(([cat, items]) => {
        normGrouped[cat] = items.map(normalise);
      });
      setMenuData(normGrouped);
      setChefSpecials(
        Object.values(normGrouped).flat()
          .filter(i => i.bestseller || i.chefSpecial)
          .slice(0, 6)
      );
    } catch (err) {
      setApiError(err.message || 'Failed to load menu.');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  // ── Sticky nav ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => {
      if (navRef.current) setStickyNav(navRef.current.getBoundingClientRect().top <= 0);
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── Filters ───────────────────────────────────────────────────────────────
  const getFiltered = (catKey) => (menuData[catKey] || []).filter(item => {
    if (!item.available) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
        !item.desc.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterVegan && !item.vegan)                            return false;
    if (filterBest  && !item.bestseller && !item.chefSpecial) return false;
    if (filterSpicy && item.spice < 2)                        return false;
    return true;
  });

  const hasActiveFilter  = filterVegan || filterBest || filterSpicy || search;
  const categoriesToShow = activeTab === 'all' ? CATEGORY_ORDER : [activeTab];
  const availableCats    = CATEGORY_ORDER.filter(k => (menuData[k] || []).length > 0);
  const clearFilters     = () => { setFilterVegan(false); setFilterBest(false); setFilterSpicy(false); setSearch(''); };

  return (
    <div className="menu-page">

      {/* ── Top Bar ── */}
      <div className="menu-topbar">
        <div className="menu-topbar__left">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div className="menu-topbar__brand">
            <span className="menu-topbar__logo">🌿</span>
            <div>
              <div className="menu-topbar__name">Coriander Leaf</div>
              <div className="menu-topbar__tag">Pure Veg Restaurant</div>
            </div>
          </div>
        </div>
        <div className="menu-topbar__right">
          <span className="menu-topbar__rating">⭐ 4.1 · 1900+ reviews</span>
          <span className="menu-topbar__loc">📍 Geeta Bhawan, Indore</span>
          <button className="menu-topbar__book-btn" onClick={onBook}>🍽️ Book a Table</button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="menu-hero">
        <div className="menu-hero__overlay" />
        <div className="menu-hero__content">
          <p className="menu-hero__eyebrow">OUR MENU</p>
          <h1>Explore Our <span>Delicious Menu</span></h1>
          <p>Pure Veg Multi-Cuisine Delights — 100% Vegetarian</p>
          <div className="menu-hero__ctas">
            <a href="#menu-content" className="btn-primary-sm">Browse Menu ↓</a>
            <button className="btn-ghost-sm" onClick={onBook}>🍽️ Reserve a Table</button>
          </div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="menu-filters" id="menu-content">
        <div className="search-wrap">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search dishes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-chips">
          <button className={`chip ${filterVegan ? 'chip--on' : ''}`} onClick={() => setFilterVegan(v => !v)}>🌱 Vegan</button>
          <button className={`chip ${filterBest  ? 'chip--on' : ''}`} onClick={() => setFilterBest(v => !v)}>⭐ Bestseller</button>
          <button className={`chip ${filterSpicy ? 'chip--on' : ''}`} onClick={() => setFilterSpicy(v => !v)}>🌶️ Spicy</button>
          {hasActiveFilter && (
            <button className="chip chip--clear" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div ref={navRef} className={`category-nav ${stickyNav ? 'category-nav--sticky' : ''}`}>
        <button className={`cat-tab ${activeTab === 'all' ? 'cat-tab--active' : ''}`} onClick={() => setActiveTab('all')}>
          🍽️ All
        </button>
        {availableCats.map(key => (
          <button
            key={key}
            className={`cat-tab ${activeTab === key ? 'cat-tab--active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {CATEGORY_META[key]?.emoji} {CATEGORY_META[key]?.label}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {apiError && (
        <div className="menu-sections" style={{ paddingTop: '2rem' }}>
          <ErrorBanner message={apiError} onRetry={loadMenu} />
        </div>
      )}

      {/* ── Loading Skeletons ── */}
      {apiLoading && (
        <div className="menu-sections">
          <div className="chef-section">
            <div className="chef-section__header">
              <div className="skeleton skeleton--line" style={{ width: 200, height: 20, margin: '0 auto 12px' }} />
              <div className="skeleton skeleton--line" style={{ width: 320, height: 36, margin: '0 auto' }} />
            </div>
            <div className="chef-grid">{[1,2,3,4,5,6].map(n => <SkeletonCard key={n} />)}</div>
          </div>
        </div>
      )}

      {/* ── Chef's Specials ── */}
      {!apiLoading && !apiError && activeTab === 'all' && !hasActiveFilter && chefSpecials.length > 0 && (
        <section className="chef-section">
          <div className="chef-section__header">
            <p className="section-eyebrow-gold">CHEF'S PICKS</p>
            <h2>Bestsellers & <span className="text-green">Chef's Specials</span></h2>
            <p>Our most-loved dishes — tried, tasted & celebrated</p>
          </div>
          <div className="chef-grid">
            {chefSpecials.map(item => (
              <DishCard key={item.id} item={item} catKey={item.category} />
            ))}
          </div>
        </section>
      )}

      {/* ── Category Sections ── */}
      {!apiLoading && !apiError && (
        <div className="menu-sections">
          {categoriesToShow.map(catKey => {
            const filtered = getFiltered(catKey);
            if (filtered.length === 0) return null;
            const meta = CATEGORY_META[catKey] || { label: catKey, emoji: '🍽️' };
            return (
              <section key={catKey} className="menu-cat-section" id={`cat-${catKey}`}>
                <div className="menu-cat-section__header">
                  <h2>{meta.emoji} {meta.label}</h2>
                  <span className="item-count">{filtered.length} items</span>
                </div>
                <div className="dish-grid">
                  {filtered.map(item => (
                    <DishCard key={item.id} item={item} catKey={catKey} />
                  ))}
                </div>
              </section>
            );
          })}

          {categoriesToShow.every(k => getFiltered(k).length === 0) && (
            <div className="no-results">
              <span>🔍</span>
              <p>No dishes match your filters</p>
              <button onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </div>
      )}

      {/* ── Info Bar ── */}
      <div className="info-bar">
        <span>🕒 11 AM–4 PM | 6 PM–11 PM</span>
        <a href="tel:+917314000000" className="info-bar__btn">📞 Call Now</a>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Coriander+Leaf+Restaurant,+Geeta+Bhawan,+Indore"
          target="_blank" rel="noreferrer"
          className="info-bar__btn info-bar__btn--gold"
        >
          📍 Get Directions
        </a>
      </div>

      {/* ── Final CTA ── */}
      <section className="menu-cta">
        <div className="menu-cta__overlay" />
        <div className="menu-cta__content">
          <span className="menu-cta__badge">🌿 100% Pure Vegetarian</span>
          <h2>Loved What You See?</h2>
          <p>Come dine with us at Geeta Bhawan, Indore and experience these dishes in person</p>
          <div className="menu-cta__btns">
            <button className="btn-primary-lg" onClick={onBook}>🍽️ Reserve a Table</button>
            <a href="tel:+917314000000" className="btn-ghost-lg">📞 Call Us</a>
          </div>
        </div>
      </section>

    </div>
  );
}