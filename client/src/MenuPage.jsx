import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MenuPage.css';
import { fetchMenu } from './api.js';

const CATEGORY_META = {
  starters:   { label: 'Starters',       emoji: '🥗' },
  chinese:    { label: 'Chinese',         emoji: '🍜' },
  mainCourse: { label: 'Main Course',     emoji: '🍛' },
  biryani:    { label: 'Biryani & Rice',  emoji: '🍚' },
  breads:     { label: 'Breads',          emoji: '🫓' },
  beverages:  { label: 'Beverages',       emoji: '🥤' },
  desserts:   { label: 'Desserts',        emoji: '🍨' },
};
const CATEGORY_ORDER = ['starters','chinese','mainCourse','biryani','breads','beverages','desserts'];
const BG_COLORS = {
  starters:['#2d5a1e','#3a7a28'],chinese:['#1e3a5a','#285a7a'],
  mainCourse:['#5a2d1e','#7a3a28'],biryani:['#5a4a1e','#7a6428'],
  breads:['#4a3a1e','#6a5528'],beverages:['#1e4a5a','#28607a'],desserts:['#5a1e3a','#7a2850'],
};

const normalise = (item) => ({
  id:item._id, name:item.name, desc:item.description, price:item.price,
  category:item.category, spice:item.spiceLevel??0, bestseller:item.isBestseller??false,
  chefSpecial:item.isChefSpecial??false, vegan:item.isVegan??false,
  emoji:item.emoji||'🍽️', available:item.isAvailable??true,
});

const SpiceBar = ({ level }) => (
  <div className="spice-bar">
    {[1,2,3].map(n=><span key={n} className={`spice-dot ${n<=level?'spice-dot--on':''}`}/>)}
  </div>
);

function SkeletonCard() {
  return (
    <div className="dish-card skeleton-card">
      <div className="skeleton skeleton--img"/>
      <div className="dish-card__body">
        <div className="skeleton skeleton--line" style={{width:'60%',height:14,marginBottom:8}}/>
        <div className="skeleton skeleton--line" style={{width:'100%',height:12,marginBottom:4}}/>
        <div className="skeleton skeleton--line" style={{width:'80%',height:12,marginBottom:16}}/>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <div className="skeleton skeleton--line" style={{width:50,height:18}}/>
          <div className="skeleton skeleton--line" style={{width:70,height:32,borderRadius:8}}/>
        </div>
      </div>
    </div>
  );
}

function CartItem({ item, qty, onAdd, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item__info">
        <span className="cart-item__name">{item.name}</span>
        <span className="cart-item__price">₹{item.price*qty}</span>
      </div>
      <div className="cart-item__controls">
        <button onClick={()=>onRemove(item.id)}>−</button>
        <span>{qty}</span>
        <button onClick={()=>onAdd(item)}>+</button>
      </div>
    </div>
  );
}

function DishCard({ item, catKey, cart, onAdd, onRemove }) {
  const qty = cart[item.id]||0;
  const bg  = BG_COLORS[catKey]?.[0]||'#2d3d1e';
  const bg2 = BG_COLORS[catKey]?.[1]||'#3a5028';
  return (
    <div className={`dish-card ${item.chefSpecial?'dish-card--special':''}`}>
      {(item.bestseller||item.chefSpecial)&&(
        <div className="dish-card__ribbon">{item.chefSpecial?"Chef's Special":'⭐ Bestseller'}</div>
      )}
      <div className="dish-card__img" style={{background:`linear-gradient(135deg,${bg},${bg2})`}}>
        <span>{item.emoji}</span>
        {item.vegan&&<span className="dish-card__vegan-badge">🌱 Vegan</span>}
      </div>
      <div className="dish-card__body">
        <div className="dish-card__top">
          <span className="dish-card__veg">🟢</span>
          {item.spice>0&&<SpiceBar level={item.spice}/>}
        </div>
        <h3 className="dish-card__name">{item.name}</h3>
        <p className="dish-card__desc">{item.desc}</p>
        <div className="dish-card__footer">
          <span className="dish-card__price">₹{item.price}</span>
          {qty===0?(
            <button className="add-btn" onClick={()=>onAdd(item)}>+ Add</button>
          ):(
            <div className="qty-ctrl">
              <button onClick={()=>onRemove(item.id)}>−</button>
              <span>{qty}</span>
              <button onClick={()=>onAdd(item)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, allItems, onAdd, onRemove, onClose }) {
  const cartEntries = Object.entries(cart).filter(([,q])=>q>0);
  const total = cartEntries.reduce((sum,[id,q])=>sum+(allItems[id]?.price||0)*q,0);
  const waText = cartEntries.map(([id,q])=>`${allItems[id]?.name} x${q}`).join('%0A');
  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={e=>e.stopPropagation()}>
        <div className="cart-drawer__header">
          <h3>🛒 Your Order</h3>
          <button className="cart-drawer__close" onClick={onClose}>✕</button>
        </div>
        {cartEntries.length===0?(
          <div className="cart-empty"><span>🍽️</span><p>Your cart is empty</p><small>Add items from the menu</small></div>
        ):(
          <>
            <div className="cart-drawer__items">
              {cartEntries.map(([id,qty])=>(
                <CartItem key={id} item={allItems[id]} qty={qty} onAdd={onAdd} onRemove={onRemove}/>
              ))}
            </div>
            <div className="cart-drawer__footer">
              <div className="cart-total"><span>Subtotal</span><span>₹{total}</span></div>
              <div className="cart-total cart-total--gst"><span>GST (5%)</span><span>₹{Math.round(total*0.05)}</span></div>
              <div className="cart-total cart-total--bold"><span>Total</span><span>₹{total+Math.round(total*0.05)}</span></div>
              <a href={`https://wa.me/918717984084?text=Hi! I'd like to order:%0A${waText}%0ATotal: ₹${total+Math.round(total*0.05)}`}
                target="_blank" rel="noreferrer" className="btn-whatsapp">📱 Order via WhatsApp</a>
              <button className="btn-checkout">Proceed to Checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MenuPage({ onBack }) {
  const [menuData,     setMenuData]     = useState({});
  const [allItems,     setAllItems]     = useState({});
  const [chefSpecials, setChefSpecials] = useState([]);
  const [apiLoading,   setApiLoading]   = useState(true);
  const [apiError,     setApiError]     = useState('');
  const [activeTab,    setActiveTab]    = useState('all');
  const [search,       setSearch]       = useState('');
  const [filterVegan,  setFilterVegan]  = useState(false);
  const [filterBest,   setFilterBest]   = useState(false);
  const [filterSpicy,  setFilterSpicy]  = useState(false);
  const [cart,         setCart]         = useState({});
  const [cartOpen,     setCartOpen]     = useState(false);
  const [stickyNav,    setStickyNav]    = useState(false);
  const navRef = useRef(null);

  const loadMenu = useCallback(async () => {
    setApiLoading(true); setApiError('');
    try {
      const data = await fetchMenu();
      const grouped = data.grouped || {};
      const normGrouped = {}; const lookup = {};
      Object.entries(grouped).forEach(([cat,items])=>{
        normGrouped[cat] = items.map(normalise);
        normGrouped[cat].forEach(i=>{ lookup[i.id]=i; });
      });
      setMenuData(normGrouped); setAllItems(lookup);
      setChefSpecials(Object.values(normGrouped).flat().filter(i=>i.bestseller||i.chefSpecial).slice(0,6));
    } catch(err) { setApiError(err.message||'Failed to load menu.'); }
    finally { setApiLoading(false); }
  }, []);

  useEffect(()=>{ loadMenu(); },[loadMenu]);

  useEffect(()=>{
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    navRef.current?.parentElement?.insertBefore(sentinel, navRef.current);
    const observer = new IntersectionObserver(
      ([entry]) => setStickyNav(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );
    if(sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  },[]);

  const totalQty = Object.values(cart).reduce((a,b)=>a+b,0);
  const totalAmt = Object.entries(cart).reduce((s,[id,q])=>s+(allItems[id]?.price||0)*q,0);

  const addToCart    = useCallback((item)=>setCart(c=>({...c,[item.id]:(c[item.id]||0)+1})),[]);
  const removeFromCart = useCallback((id)=>setCart(c=>{ const n={...c}; if(n[id]>1)n[id]--; else delete n[id]; return n; }),[]);

  const getFiltered = (catKey) => (menuData[catKey]||[]).filter(item=>{
    if(!item.available) return false;
    if(search&&!item.name.toLowerCase().includes(search.toLowerCase())&&!item.desc.toLowerCase().includes(search.toLowerCase())) return false;
    if(filterVegan&&!item.vegan) return false;
    if(filterBest&&!item.bestseller&&!item.chefSpecial) return false;
    if(filterSpicy&&item.spice<2) return false;
    return true;
  });

  const hasActiveFilter = filterVegan||filterBest||filterSpicy||search;
  const categoriesToShow = activeTab==='all'?CATEGORY_ORDER:[activeTab];
  const availableCats    = CATEGORY_ORDER.filter(k=>(menuData[k]||[]).length>0);
  const clearFilters     = ()=>{ setFilterVegan(false);setFilterBest(false);setFilterSpicy(false);setSearch(''); };

  return (
    <div className="menu-page">
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
          <button className="cart-fab" onClick={()=>setCartOpen(true)}>
            🛒 Cart {totalQty>0&&<span className="cart-badge">{totalQty}</span>}
          </button>
        </div>
      </div>

      <div className="menu-hero">
        <div className="menu-hero__overlay"/>
        <div className="menu-hero__content">
          <p className="menu-hero__eyebrow">OUR MENU</p>
          <h1>Explore Our <span>Delicious Menu</span></h1>
          <p>Pure Veg Multi-Cuisine Delights in Indore</p>
          <div className="menu-hero__ctas">
            <a href="#menu-content" className="btn-primary-sm">Browse Menu ↓</a>
            <a href="https://wa.me/918717984084" target="_blank" rel="noreferrer" className="btn-ghost-sm">📱 Order on WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="menu-filters" id="menu-content">
        <div className="search-wrap">
          <span>🔍</span>
          <input type="text" placeholder="Search dishes…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search&&<button className="search-clear" onClick={()=>setSearch('')}>✕</button>}
        </div>
        <div className="filter-chips">
          <button className={`chip ${filterVegan?'chip--on':''}`} onClick={()=>setFilterVegan(v=>!v)}>🌱 Vegan</button>
          <button className={`chip ${filterBest?'chip--on':''}`}  onClick={()=>setFilterBest(v=>!v)}>⭐ Bestseller</button>
          <button className={`chip ${filterSpicy?'chip--on':''}`} onClick={()=>setFilterSpicy(v=>!v)}>🌶️ Spicy</button>
          {hasActiveFilter&&<button className="chip chip--clear" onClick={clearFilters}>✕ Clear</button>}
        </div>
      </div>

      <div ref={navRef} className={`category-nav ${stickyNav?'category-nav--sticky':''}`}>
        <button className={`cat-tab ${activeTab==='all'?'cat-tab--active':''}`} onClick={()=>setActiveTab('all')}>🍽️ All</button>
        {availableCats.map(key=>(
          <button key={key} className={`cat-tab ${activeTab===key?'cat-tab--active':''}`} onClick={()=>setActiveTab(key)}>
            {CATEGORY_META[key]?.emoji} {CATEGORY_META[key]?.label}
          </button>
        ))}
      </div>

      {apiError&&(
        <div className="menu-sections" style={{paddingTop:'2rem'}}>
          <div className="menu-error-banner">
            <span>⚠️</span>
            <div><strong>Could not load menu</strong><p>{apiError}</p></div>
            <button onClick={loadMenu}>Retry</button>
          </div>
        </div>
      )}

      {apiLoading&&(
        <div className="menu-sections">
          <div className="chef-section">
            <div className="chef-section__header">
              <div className="skeleton skeleton--line" style={{width:200,height:20,margin:'0 auto 12px'}}/>
              <div className="skeleton skeleton--line" style={{width:320,height:36,margin:'0 auto'}}/>
            </div>
            <div className="chef-grid">{[1,2,3,4,5,6].map(n=><SkeletonCard key={n}/>)}</div>
          </div>
        </div>
      )}

      {!apiLoading&&!apiError&&activeTab==='all'&&!hasActiveFilter&&chefSpecials.length>0&&(
        <section className="chef-section">
          <div className="chef-section__header">
            <p className="section-eyebrow-gold">CHEF'S PICKS</p>
            <h2>Bestsellers & <span className="text-green">Chef's Specials</span></h2>
            <p>Our most-loved dishes — tried, tasted & celebrated</p>
          </div>
          <div className="chef-grid">
            {chefSpecials.map(item=>(
              <DishCard key={item.id} item={item} catKey={item.category} cart={cart} onAdd={addToCart} onRemove={removeFromCart}/>
            ))}
          </div>
        </section>
      )}

      {!apiLoading&&!apiError&&(
        <div className="menu-sections">
          {categoriesToShow.map(catKey=>{
            const filtered=getFiltered(catKey);
            if(filtered.length===0) return null;
            const meta=CATEGORY_META[catKey]||{label:catKey,emoji:'🍽️'};
            return (
              <section key={catKey} className="menu-cat-section" id={`cat-${catKey}`}>
                <div className="menu-cat-section__header">
                  <h2>{meta.emoji} {meta.label}</h2>
                  <span className="item-count">{filtered.length} items</span>
                </div>
                <div className="dish-grid">
                  {filtered.map(item=>(
                    <DishCard key={item.id} item={item} catKey={catKey} cart={cart} onAdd={addToCart} onRemove={removeFromCart}/>
                  ))}
                </div>
              </section>
            );
          })}
          {categoriesToShow.every(k=>getFiltered(k).length===0)&&(
            <div className="no-results">
              <span>🔍</span><p>No dishes match your filters</p>
              <button onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </div>
      )}

      <div className="info-bar">
        <span>🕒 11 AM–4 PM | 6 PM–11 PM</span>
        <a href="tel:+918717984084" className="info-bar__btn">📞 Call Now</a>
        <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="info-bar__btn info-bar__btn--gold">📍 Get Directions</a>
      </div>

      <section className="menu-cta">
        <div className="menu-cta__overlay"/>
        <div className="menu-cta__content">
          <span className="menu-cta__badge">🌿 100% Pure Vegetarian</span>
          <h2>Craving Delicious Veg Food?</h2>
          <p>Visit us at Geeta Bhawan, Indore or order from the comfort of your home</p>
          <div className="menu-cta__btns">
            <a href="https://wa.me/918717984084" target="_blank" rel="noreferrer" className="btn-primary-lg">📱 Order Now</a>
            <button className="btn-ghost-lg" onClick={onBack}>🍽️ Reserve Table</button>
          </div>
        </div>
      </section>

      {totalQty>0&&(
        <button className="cart-float" onClick={()=>setCartOpen(true)}>
          🛒 {totalQty} item{totalQty>1?'s':''} · ₹{totalAmt}
        </button>
      )}

      {cartOpen&&(
        <CartDrawer cart={cart} allItems={allItems} onAdd={addToCart} onRemove={removeFromCart} onClose={()=>setCartOpen(false)}/>
      )}
    </div>
  );
}
