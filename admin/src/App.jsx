import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import './admin.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Auth Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('cl_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.success) setUser(d.user); else logout(); })
        .catch(logout)
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = (tok, usr) => {
    localStorage.setItem('cl_token', tok);
    setToken(tok); setUser(usr);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('cl_token');
    setToken(null); setUser(null);
  }, []);

  const authFetch = useCallback((url, opts = {}) => {
    return fetch(`${API}${url}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    }).then(async r => {
      const d = await r.json();
      if (r.status === 401) { logout(); throw new Error('Session expired'); }
      return d;
    });
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage() {
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) login(data.token, data.user);
      else setError(data.message);
    } catch { setError('Network error. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>🌿</span>
          <div>
            <div className="login-title">Coriander Leaf</div>
            <div className="login-sub">Admin Dashboard</div>
          </div>
        </div>
        <h2>Welcome back</h2>
        <p className="login-desc">Sign in to manage bookings and menu</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="owner@corianderleaf.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••" required />
          </div>
          {error && <div className="error-banner">{error}</div>}
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? '⏳ Signing in…' : 'Sign In →'}
          </button>
        </form>
        <p className="login-hint">Default: owner@corianderleaf.com / Owner@1234</p>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'bookings',  icon: '📅', label: 'Bookings' },
  { id: 'menu',      icon: '🍽️', label: 'Menu Manager' },
  { id: 'users',     icon: '👥', label: 'Admin Users', ownerOnly: true },
  { id: 'settings',  icon: '⚙️', label: 'Settings' },
];

function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span>🌿</span>
        <div>
          <div className="sidebar__name">Coriander Leaf</div>
          <div className="sidebar__sub">Admin Panel</div>
        </div>
      </div>
      <nav className="sidebar__nav">
        {NAV.filter(n => !n.ownerOnly || user?.role === 'owner').map(n => (
          <button key={n.id} className={`nav-item ${page === n.id ? 'nav-item--active' : ''}`} onClick={() => setPage(n.id)}>
            <span>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__user">
        <div className="sidebar__avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="sidebar__uname">{user?.name}</div>
          <div className="sidebar__urole">{user?.role}</div>
        </div>
        <button className="sidebar__logout" onClick={logout} title="Logout">⎋</button>
      </div>
    </aside>
  );
}

// ── Dashboard Overview ─────────────────────────────────────────────────────────
function Dashboard() {
  const { authFetch } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/admin/dashboard')
      .then(d => { if (d.success) setData(d.dashboard); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">⏳ Loading dashboard…</div>;
  if (!data)   return <div className="page-loading">❌ Failed to load</div>;

  const STATUS_COLOR = { pending:'#f59e0b', confirmed:'#10b981', cancelled:'#ef4444', completed:'#6366f1', 'no-show':'#6b7280' };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <span className="page-date">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</span>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {[
          { icon:'📅', label:"Today's Bookings", value: data.todayCount,    color:'#1e3d1e' },
          { icon:'👥', label:"Today's Guests",   value: data.todayGuests,   color:'#2d5a27' },
          { icon:'⏳', label:'Pending Approval', value: data.pendingCount,  color:'#c8921b' },
          { icon:'📆', label:'This Month',       value: data.monthCount,    color:'#4a8c3f' },
          { icon:'📚', label:'Total Bookings',   value: data.totalBookings, color:'#1e3d1e' },
          { icon:'🍽️', label:'Menu Items',       value: data.menuTotal,     color:'#2d5a27' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ borderTopColor: s.color }}>
            <div className="stat-card__icon">{s.icon}</div>
            <div className="stat-card__num">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Today's Schedule */}
        <div className="dash-card">
          <h3>🕐 Today's Schedule</h3>
          {data.todayBookings.length === 0
            ? <p className="empty-state">No bookings today</p>
            : data.todayBookings.map(b => (
              <div className="schedule-row" key={b._id}>
                <div className="schedule-time">{b.time}</div>
                <div className="schedule-info">
                  <strong>{b.name}</strong>
                  <span>{b.guests} guests · {b.session}</span>
                </div>
                <span className="status-pill" style={{ background: STATUS_COLOR[b.status] + '22', color: STATUS_COLOR[b.status] }}>{b.status}</span>
              </div>
            ))
          }
        </div>

        {/* Recent Bookings */}
        <div className="dash-card">
          <h3>🕒 Recent Bookings</h3>
          {data.recentBookings.map(b => (
            <div className="recent-row" key={b._id}>
              <div className="recent-avatar">{b.name[0]}</div>
              <div className="recent-info">
                <strong>{b.name}</strong>
                <span>{b.refNo} · {new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} {b.time}</span>
              </div>
              <span className="status-pill" style={{ background: STATUS_COLOR[b.status] + '22', color: STATUS_COLOR[b.status] }}>{b.status}</span>
            </div>
          ))}
        </div>

        {/* 7-day Trend */}
        <div className="dash-card dash-card--wide">
          <h3>📈 7-Day Booking Trend</h3>
          <div className="trend-chart">
            {data.bookingTrend.length === 0
              ? <p className="empty-state">Not enough data yet</p>
              : (() => {
                  const max = Math.max(...data.bookingTrend.map(t => t.count), 1);
                  return data.bookingTrend.map(t => (
                    <div className="trend-bar-wrap" key={t._id}>
                      <div className="trend-bar" style={{ height: `${(t.count / max) * 100}%` }} title={`${t.count} bookings`}>
                        <span>{t.count}</span>
                      </div>
                      <div className="trend-label">{t._id.slice(5)}</div>
                    </div>
                  ));
                })()
            }
          </div>
        </div>

        {/* Occasion Breakdown */}
        <div className="dash-card">
          <h3>🎉 Popular Occasions</h3>
          {data.occasionStats.length === 0
            ? <p className="empty-state">No occasion data yet</p>
            : data.occasionStats.map(o => (
              <div className="occasion-row" key={o._id}>
                <span>{o._id}</span>
                <div className="occasion-bar-wrap">
                  <div className="occasion-bar" style={{ width: `${Math.min(o.count * 20, 100)}%` }} />
                </div>
                <span>{o.count}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── Bookings Manager ───────────────────────────────────────────────────────────
const STATUS_OPTS = ['pending','confirmed','cancelled','completed','no-show'];
const STATUS_COLOR = { pending:'#f59e0b', confirmed:'#10b981', cancelled:'#ef4444', completed:'#6366f1', 'no-show':'#6b7280' };

function BookingsManager() {
  const { authFetch } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status:'', date:'', search:'' });
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null); // detail modal

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit:15, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
    authFetch(`/bookings?${q}`)
      .then(d => { if (d.success) { setBookings(d.bookings); setTotal(d.total); } })
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    const d = await authFetch(`/bookings/${id}`, { method:'PATCH', body: JSON.stringify({ status }) });
    if (d.success) {
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status } : b));
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
    }
  };

  const saveNotes = async (id, adminNotes) => {
    await authFetch(`/bookings/${id}`, { method:'PATCH', body: JSON.stringify({ adminNotes }) });
    setSelected(s => ({ ...s, adminNotes }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📅 Bookings</h1>
        <span className="total-badge">{total} total</span>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input placeholder="🔍 Search name, phone, ref…" value={filters.search}
          onChange={e => { setFilters(f => ({...f, search:e.target.value})); setPage(1); }} />
        <select value={filters.status} onChange={e => { setFilters(f => ({...f, status:e.target.value})); setPage(1); }}>
          <option value="">All Status</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={filters.date}
          onChange={e => { setFilters(f => ({...f, date:e.target.value})); setPage(1); }} />
        <button className="btn-clear" onClick={() => { setFilters({ status:'', date:'', search:'' }); setPage(1); }}>✕ Clear</button>
      </div>

      {/* Table */}
      {loading ? <div className="page-loading">⏳ Loading…</div> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref</th><th>Guest</th><th>Phone</th><th>Date</th><th>Time</th><th>Guests</th><th>Occasion</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0
                ? <tr><td colSpan="9" className="empty-td">No bookings found</td></tr>
                : bookings.map(b => (
                  <tr key={b._id} onClick={() => setSelected(b)} className="table-row">
                    <td><code>{b.refNo}</code></td>
                    <td><strong>{b.name}</strong></td>
                    <td>+91 {b.phone}</td>
                    <td>{new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                    <td>{b.time}</td>
                    <td>{b.guests}</td>
                    <td>{b.occasion !== 'none' && b.occasion ? b.occasion : '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select className="status-select" value={b.status}
                        style={{ color: STATUS_COLOR[b.status] }}
                        onChange={e => updateStatus(b._id, e.target.value)}>
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" onClick={() => setSelected(b)} title="View">👁️</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(p => p-1)}>← Prev</button>
        <span>Page {page} · {total} results</span>
        <button disabled={page * 15 >= total} onClick={() => setPage(p => p+1)}>Next →</button>
      </div>

      {/* Detail Modal */}
      {selected && <BookingModal booking={selected} onClose={() => setSelected(null)} onStatusChange={updateStatus} onSaveNotes={saveNotes} />}
    </div>
  );
}

function BookingModal({ booking: b, onClose, onStatusChange, onSaveNotes }) {
  const [notes, setNotes] = useState(b.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSaveNotes(b._id, notes);
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{b.name}</h3>
            <code>{b.refNo}</code>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-grid">
            {[
              ['📞 Phone',   `+91 ${b.phone}`],
              ['👥 Guests',  b.guests],
              ['📅 Date',    new Date(b.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })],
              ['⏰ Time',    `${b.time} (${b.session})`],
              ['🏛️ Seating', b.seating || 'Indoor'],
              ['🎉 Occasion',b.occasion !== 'none' ? b.occasion : 'Regular dining'],
              ['✅ Confirm via', b.confirmMethod],
              ['📅 Booked on', new Date(b.createdAt).toLocaleString('en-IN')],
            ].map(([l, v]) => (
              <div className="modal-info-row" key={l}>
                <span className="modal-info-label">{l}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          {b.requests && (
            <div className="modal-requests">
              📝 <strong>Special Request:</strong> {b.requests}
            </div>
          )}
          <div className="modal-status">
            <label>Status</label>
            <select value={b.status} onChange={e => onStatusChange(b._id, e.target.value)} style={{ color: STATUS_COLOR[b.status] }}>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="modal-notes">
            <label>Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes about this booking…" rows={3} />
            <button className="btn-save-notes" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Notes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Menu Manager ───────────────────────────────────────────────────────────────
const CATEGORIES = ['starters','chinese','mainCourse','biryani','breads','beverages','desserts'];

function MenuManager() {
  const { authFetch, user } = useAuth();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCat] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ ...(catFilter && { category: catFilter }), ...(search && { search }) });
    authFetch(`/menu/admin/all?${q}`)
      .then(d => { if (d.success) setItems(d.items); })
      .finally(() => setLoading(false));
  }, [catFilter, search]);

  useEffect(() => { load(); }, [load]);

  const toggleAvailability = async (id) => {
    const d = await authFetch(`/menu/${id}/toggle`, { method:'PATCH' });
    if (d.success) setItems(is => is.map(i => i._id === id ? d.item : i));
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    const d = await authFetch(`/menu/${id}`, { method:'DELETE' });
    if (d.success) setItems(is => is.filter(i => i._id !== id));
  };

  const onSave = (item, isNew) => {
    if (isNew) setItems(is => [item, ...is]);
    else setItems(is => is.map(i => i._id === item._id ? item : i));
    setShowForm(false); setEditing(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🍽️ Menu Manager</h1>
        <button className="btn-add" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Item</button>
      </div>

      <div className="filters-bar">
        <input placeholder="🔍 Search dishes…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={catFilter} onChange={e => setCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="total-badge">{items.length} items</span>
      </div>

      {loading ? <div className="page-loading">⏳ Loading menu…</div> : (
        <div className="menu-admin-grid">
          {items.map(item => (
            <div className={`menu-admin-card ${!item.isAvailable ? 'menu-admin-card--unavail' : ''}`} key={item._id}>
              <div className="menu-admin-card__top">
                <span className="menu-admin-card__emoji">{item.emoji}</span>
                <div className="menu-admin-card__badges">
                  {item.isBestseller  && <span className="badge-small badge-gold">⭐ Best</span>}
                  {item.isChefSpecial && <span className="badge-small badge-green">👨‍🍳 Chef</span>}
                  {item.isVegan      && <span className="badge-small badge-veg">🌱 Vegan</span>}
                </div>
                <span className="menu-admin-card__cat">{item.category}</span>
              </div>
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <div className="menu-admin-card__footer">
                <span className="menu-admin-card__price">₹{item.price}</span>
                <div className="menu-admin-card__actions">
                  <button className={`toggle-btn ${item.isAvailable ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                    onClick={() => toggleAvailability(item._id)} title="Toggle availability">
                    {item.isAvailable ? '✅' : '❌'}
                  </button>
                  <button className="btn-icon" onClick={() => { setEditing(item); setShowForm(true); }} title="Edit">✏️</button>
                  {user?.role === 'owner' && (
                    <button className="btn-icon btn-icon--danger" onClick={() => deleteItem(item._id)} title="Delete">🗑️</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <MenuItemForm
          item={editing}
          onSave={onSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
          authFetch={authFetch}
        />
      )}
    </div>
  );
}

function MenuItemForm({ item, onSave, onClose, authFetch }) {
  const isNew = !item;
  const [form, setForm] = useState({
    name: item?.name || '', description: item?.description || '',
    price: item?.price || '', category: item?.category || 'starters',
    isVegan: item?.isVegan || false, spiceLevel: item?.spiceLevel ?? 0,
    isBestseller: item?.isBestseller || false, isChefSpecial: item?.isChefSpecial || false,
    isAvailable: item?.isAvailable ?? true, emoji: item?.emoji || '🍽️',
    sortOrder: item?.sortOrder || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handle = async () => {
    setSaving(true); setError('');
    try {
      const d = await authFetch(isNew ? '/menu' : `/menu/${item._id}`, {
        method: isNew ? 'POST' : 'PATCH',
        body: JSON.stringify({ ...form, price: Number(form.price), spiceLevel: Number(form.spiceLevel), sortOrder: Number(form.sortOrder) }),
      });
      if (d.success) onSave(d.item, isNew);
      else setError(d.message);
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const F = ({ label, children }) => <div className="form-group">{label && <label>{label}</label>}{children}</div>;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isNew ? '+ Add Menu Item' : `Edit: ${item.name}`}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-two-col">
            <F label="Item Name *"><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Paneer Tikka" /></F>
            <F label="Category *">
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
            <F label="Price (₹) *"><input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="250" min="1" /></F>
            <F label="Emoji Icon"><input value={form.emoji} onChange={e => setForm(f => ({...f, emoji: e.target.value}))} placeholder="🍛" /></F>
            <F label="Spice Level (0–3)"><input type="number" value={form.spiceLevel} onChange={e => setForm(f => ({...f, spiceLevel: e.target.value}))} min="0" max="3" /></F>
            <F label="Sort Order"><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({...f, sortOrder: e.target.value}))} /></F>
          </div>
          <F label="Description *">
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Short appetizing description…" />
          </F>
          <div className="checkbox-row">
            {[
              ['isVegan',       '🌱 Vegan'],
              ['isBestseller',  '⭐ Bestseller'],
              ['isChefSpecial', "👨‍🍳 Chef's Special"],
              ['isAvailable',   '✅ Available'],
            ].map(([key, label]) => (
              <label className="checkbox-label" key={key}>
                <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.checked}))} />
                {label}
              </label>
            ))}
          </div>
          {error && <div className="error-banner">{error}</div>}
          <div className="modal-footer-btns">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-save" onClick={handle} disabled={saving}>{saving ? 'Saving…' : isNew ? 'Add Item' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Users ────────────────────────────────────────────────────────────────
function AdminUsers() {
  const { authFetch } = useAuth();
  const [users, setUsers]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'staff' });
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/auth/users').then(d => { if (d.success) setUsers(d.users); });
  }, []);

  const createUser = async () => {
    setError('');
    const d = await authFetch('/auth/register', { method:'POST', body: JSON.stringify(form) });
    if (d.success) { setUsers(us => [d.user, ...us]); setShowForm(false); setForm({ name:'', email:'', password:'', role:'staff' }); }
    else setError(d.message);
  };

  const toggleUser = async (id, isActive) => {
    const d = await authFetch(`/auth/users/${id}`, { method:'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    if (d.success) setUsers(us => us.map(u => u._id === id ? d.user : u));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 Admin Users</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>+ Add User</button>
      </div>
      <div className="users-list">
        {users.map(u => (
          <div className="user-card" key={u._id}>
            <div className="user-card__avatar">{u.name[0].toUpperCase()}</div>
            <div className="user-card__info">
              <strong>{u.name}</strong>
              <span>{u.email}</span>
              <div className="user-card__meta">
                <span className={`role-badge role-badge--${u.role}`}>{u.role}</span>
                {u.lastLogin && <span>Last login: {new Date(u.lastLogin).toLocaleDateString('en-IN')}</span>}
              </div>
            </div>
            <button className={`toggle-user-btn ${u.isActive ? 'active' : 'inactive'}`} onClick={() => toggleUser(u._id, u.isActive)}>
              {u.isActive ? '✅ Active' : '❌ Inactive'}
            </button>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>+ New Admin User</h3><button className="modal-close" onClick={() => setShowForm(false)}>✕</button></div>
            <div className="modal-body">
              {[['Name','name','text'],['Email','email','email'],['Password','password','password']].map(([l,k,t]) => (
                <div className="form-group" key={k}><label>{l}</label><input type={t} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} /></div>
              ))}
              <div className="form-group"><label>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                  <option value="staff">Staff</option><option value="owner">Owner</option>
                </select>
              </div>
              {error && <div className="error-banner">{error}</div>}
              <div className="modal-footer-btns">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-save" onClick={createUser}>Create User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────────
function Settings() {
  const { authFetch, user } = useAuth();
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [msg, setMsg]   = useState('');
  const [err, setErr]   = useState('');

  const changePass = async () => {
    setMsg(''); setErr('');
    if (form.newPassword !== form.confirmPassword) { setErr('Passwords do not match'); return; }
    if (form.newPassword.length < 8) { setErr('Password must be at least 8 characters'); return; }
    const d = await authFetch('/auth/change-password', { method:'PATCH', body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
    if (d.success) { setMsg('✅ Password changed successfully'); setForm({ currentPassword:'', newPassword:'', confirmPassword:'' }); }
    else setErr(d.message);
  };

  return (
    <div className="page">
      <div className="page-header"><h1>⚙️ Settings</h1></div>
      <div className="settings-card">
        <h3>👤 Your Profile</h3>
        <div className="profile-info">
          <div className="profile-avatar">{user?.name?.[0]}</div>
          <div><strong>{user?.name}</strong><br/><span>{user?.email}</span><br/><span className={`role-badge role-badge--${user?.role}`}>{user?.role}</span></div>
        </div>
      </div>
      <div className="settings-card">
        <h3>🔑 Change Password</h3>
        {['currentPassword','newPassword','confirmPassword'].map(k => (
          <div className="form-group" key={k}>
            <label>{k === 'currentPassword' ? 'Current Password' : k === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
            <input type="password" value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} />
          </div>
        ))}
        {err && <div className="error-banner">{err}</div>}
        {msg && <div className="success-banner">{msg}</div>}
        <button className="btn-save" onClick={changePass}>Update Password</button>
      </div>
      <div className="settings-card">
        <h3>🌐 API Info</h3>
        <div className="api-info">
          <code>API Base: {API}</code>
          <p style={{color:'#777',fontSize:'.85rem',marginTop:'.5rem'}}>Set VITE_API_URL in your frontend .env to point to your deployed backend.</p>
        </div>
      </div>
    </div>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────────
function AdminApp() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) return <div className="full-loading">⏳ Loading…</div>;
  if (!user)   return <LoginPage />;

  const PAGES = { dashboard: Dashboard, bookings: BookingsManager, menu: MenuManager, users: AdminUsers, settings: Settings };
  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div className="admin-layout">
      <Sidebar page={page} setPage={setPage} />
      <main className="admin-main">
        <PageComponent />
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AdminApp /></AuthProvider>;
}
