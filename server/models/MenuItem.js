const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name too long'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [300, 'Description too long'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['starters', 'chinese', 'mainCourse', 'biryani', 'breads', 'beverages', 'desserts'],
  },
  isVegan: {
    type: Boolean,
    default: false,
  },
  spiceLevel: {
    type: Number,
    min: 0,
    max: 3,
    default: 0,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isChefSpecial: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  emoji: {
    type: String,
    default: '🍽️',
  },
  tags: [String], // e.g. ['jain', 'gluten-free']
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Indexes
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ isBestseller: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
