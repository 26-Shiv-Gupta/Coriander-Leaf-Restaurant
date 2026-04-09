const express   = require('express');
const MenuItem  = require('../models/MenuItem');
const { protect, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/menu — get all available items (grouped by category)
router.get('/', async (req, res) => {
  try {
    const { category, vegan, bestseller } = req.query;
    const filter = { isAvailable: true };
    if (category)   filter.category = category;
    if (vegan === 'true') filter.isVegan = true;
    if (bestseller === 'true') filter.$or = [{ isBestseller: true }, { isChefSpecial: true }];

    const items = await MenuItem.find(filter).sort({ sortOrder: 1, createdAt: 1 });

    // Group by category
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    res.json({ success: true, items, grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/menu/:id — single item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN (Protected) ─────────────────────────────────────────────────────────

// GET /api/menu/admin/all — all items including unavailable
router.get('/admin/all', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    const items = await MenuItem.find(filter).sort({ category: 1, sortOrder: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/menu — add item
router.post('/', protect, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/menu/:id — update item
router.patch('/:id', protect, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/menu/:id — owner only
router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/menu/:id/toggle — toggle availability
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
