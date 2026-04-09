/**
 * Seed Script — run once to initialize DB
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const MenuItem = require('./models/MenuItem');

const ADMIN_USERS = [
  { name: 'Restaurant Owner', email: 'owner@corianderleaf.com', password: 'Owner@1234', role: 'owner' },
  { name: 'Staff Manager',    email: 'staff@corianderleaf.com',  password: 'Staff@1234',  role: 'staff' },
];

const MENU_ITEMS = [
  // Starters
  { name:'Paneer Tikka',      description:'Smoky marinated paneer cubes grilled to perfection in tandoor with peppers & onions', price:220, category:'starters', isVegan:false, spiceLevel:2, isBestseller:true,  isChefSpecial:false, emoji:'🥗', sortOrder:1 },
  { name:'Paneer Pakoda',     description:'Crispy golden batter-fried paneer with mint chutney — a teatime classic',             price:160, category:'starters', isVegan:false, spiceLevel:1, isBestseller:false, isChefSpecial:false, emoji:'🧀', sortOrder:2 },
  { name:'Veg Manchurian',    description:'Crispy veggie balls tossed in tangy Indo-Chinese sauce with spring onions',           price:180, category:'starters', isVegan:true,  spiceLevel:2, isBestseller:true,  isChefSpecial:false, emoji:'🥢', sortOrder:3 },
  { name:'Hara Bhara Kabab',  description:'Pan-seared spinach & pea patties with a blend of herbs and paneer stuffing',         price:190, category:'starters', isVegan:true,  spiceLevel:1, isBestseller:false, isChefSpecial:true,  emoji:'🫛', sortOrder:4 },
  { name:'Finger Chips',      description:'Crispy golden French fries seasoned with house spice blend, served with ketchup',    price:120, category:'starters', isVegan:true,  spiceLevel:1, isBestseller:false, isChefSpecial:false, emoji:'🍟', sortOrder:5 },
  { name:'Dahi Ke Sholey',    description:'Crispy bread rolls stuffed with hung curd, green chutney & spiced veggies',          price:200, category:'starters', isVegan:false, spiceLevel:2, isBestseller:false, isChefSpecial:true,  emoji:'🥙', sortOrder:6 },
  // Chinese
  { name:'Veg Hakka Noodles', description:'Stir-fried noodles with fresh vegetables in soy-garlic sauce',                      price:170, category:'chinese',    isVegan:true,  spiceLevel:1, isBestseller:true,  isChefSpecial:false, emoji:'🍜', sortOrder:1 },
  { name:'Schezwan Noodles',  description:'Fiery Schezwan sauce tossed noodles with crunchy veggies — bold & spicy',           price:190, category:'chinese',    isVegan:true,  spiceLevel:3, isBestseller:false, isChefSpecial:false, emoji:'🔥', sortOrder:2 },
  { name:'Veg Fried Rice',    description:'Wok-tossed fragrant rice with seasonal vegetables',                                  price:160, category:'chinese',    isVegan:true,  spiceLevel:1, isBestseller:false, isChefSpecial:false, emoji:'🍚', sortOrder:3 },
  { name:'Manchurian Gravy',  description:'Fluffy veggie balls simmered in rich, glossy Manchurian gravy',                     price:200, category:'chinese',    isVegan:true,  spiceLevel:2, isBestseller:false, isChefSpecial:false, emoji:'🥡', sortOrder:4 },
  { name:'Chilli Paneer',     description:'Crispy paneer cubes wok-tossed with bell peppers in spicy chilli-garlic sauce',     price:240, category:'chinese',    isVegan:false, spiceLevel:3, isBestseller:true,  isChefSpecial:true,  emoji:'🌶️', sortOrder:5 },
  { name:'Veg Spring Rolls',  description:'Crispy rolls filled with seasoned cabbage, carrots & glass noodles',                price:150, category:'chinese',    isVegan:true,  spiceLevel:1, isBestseller:false, isChefSpecial:false, emoji:'🥟', sortOrder:6 },
  // Main Course
  { name:'Paneer Butter Masala', description:'Velvety tomato-cream gravy with soft paneer — the crown jewel of Indian veg cuisine', price:280, category:'mainCourse', isVegan:false, spiceLevel:2, isBestseller:true,  isChefSpecial:true,  emoji:'🍛', sortOrder:1 },
  { name:'Kadai Paneer',         description:'Rustic wok-cooked paneer with capsicum & whole spices in bold kadai masala',          price:270, category:'mainCourse', isVegan:false, spiceLevel:3, isBestseller:true,  isChefSpecial:false, emoji:'🫕', sortOrder:2 },
  { name:'Shahi Paneer',         description:'Royal Mughlai-style paneer in rich cashew-cream-saffron gravy',                       price:290, category:'mainCourse', isVegan:false, spiceLevel:1, isBestseller:false, isChefSpecial:true,  emoji:'👑', sortOrder:3 },
  { name:'Dal Makhani',          description:'Slow-cooked black lentils in buttery tomato gravy, simmered overnight for depth',     price:230, category:'mainCourse', isVegan:false, spiceLevel:1, isBestseller:true,  isChefSpecial:false, emoji:'🫘', sortOrder:4 },
  { name:'Mix Veg',              description:'Seasonal vegetables cooked in aromatic home-style masala gravy',                      price:210, category:'mainCourse', isVegan:true,  spiceLevel:2, isBestseller:false, isChefSpecial:false, emoji:'🥦', sortOrder:5 },
  { name:'Palak Paneer',         description:'Fresh spinach purée with soft paneer cubes, tempered with garlic & cream',            price:260, category:'mainCourse', isVegan:false, spiceLevel:1, isBestseller:false, isChefSpecial:false, emoji:'🥬', sortOrder:6 },
  // Biryani
  { name:'Veg Biryani',    description:'Aromatic basmati layered with seasonal vegetables, fried onions & saffron', price:240, category:'biryani', isVegan:true,  spiceLevel:2, isBestseller:true,  isChefSpecial:true,  emoji:'🍚', sortOrder:1 },
  { name:'Jeera Rice',     description:'Fragrant basmati tempered with cumin, ghee & whole spices',                 price:130, category:'biryani', isVegan:false, spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🌾', sortOrder:2 },
  { name:'Plain Rice',     description:'Steamed long-grain basmati rice — simple & perfect with any curry',         price:90,  category:'biryani', isVegan:true,  spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🍙', sortOrder:3 },
  { name:'Veg Pulao',      description:'Lightly spiced basmati cooked with mixed vegetables and whole aromatics',   price:170, category:'biryani', isVegan:true,  spiceLevel:1, isBestseller:false, isChefSpecial:false, emoji:'🥘', sortOrder:4 },
  { name:'Kashmiri Pulao', description:'Mild saffron rice studded with nuts, raisins and rose-water',               price:200, category:'biryani', isVegan:false, spiceLevel:0, isBestseller:false, isChefSpecial:true,  emoji:'🌹', sortOrder:5 },
  // Breads
  { name:'Butter Naan',    description:'Soft leavened flatbread baked in tandoor, finished with melted butter', price:60, category:'breads', isVegan:false, spiceLevel:0, isBestseller:true,  isChefSpecial:false, emoji:'🫓', sortOrder:1 },
  { name:'Garlic Naan',    description:'Naan loaded with garlic, butter & fresh coriander — irresistible aroma',price:70, category:'breads', isVegan:false, spiceLevel:0, isBestseller:true,  isChefSpecial:false, emoji:'🧄', sortOrder:2 },
  { name:'Tandoori Roti',  description:'Whole wheat flatbread baked on tandoor wall — crisp outside, soft inside',price:40, category:'breads', isVegan:false, spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🌾', sortOrder:3 },
  { name:'Lachha Paratha', description:'Flaky multi-layered whole wheat paratha, butter-roasted to golden perfection', price:65, category:'breads', isVegan:false, spiceLevel:0, isBestseller:false, isChefSpecial:true,  emoji:'🥞', sortOrder:4 },
  { name:'Missi Roti',     description:'Spiced gram-flour flatbread from Rajasthani tradition, roasted on tawa', price:55, category:'breads', isVegan:true,  spiceLevel:1, isBestseller:false, isChefSpecial:false, emoji:'🌿', sortOrder:5 },
  // Beverages
  { name:'Sweet Lassi',       description:'Thick chilled yoghurt blended with sugar & cardamom — cooling & rich',           price:90,  category:'beverages', isVegan:false, spiceLevel:0, isBestseller:true,  isChefSpecial:false, emoji:'🥛', sortOrder:1 },
  { name:'Fresh Lime Soda',   description:'Refreshing fizzy lime with your choice of sweet, salted or masala',               price:70,  category:'beverages', isVegan:true,  spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🍋', sortOrder:2 },
  { name:'Soft Drinks',       description:'Chilled selection of Coca-Cola, Sprite, Thumbs Up & more',                       price:60,  category:'beverages', isVegan:true,  spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🥤', sortOrder:3 },
  { name:'Mango Mocktail',    description:'Fresh Alphonso mango blended with mint, lime & soda — tropical delight',         price:130, category:'beverages', isVegan:true,  spiceLevel:0, isBestseller:false, isChefSpecial:true,  emoji:'🥭', sortOrder:4 },
  { name:'Rose Sharbat',      description:'Chilled rose syrup with milk & basil seeds — a desi classic',                    price:80,  category:'beverages', isVegan:false, spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🌹', sortOrder:5 },
  // Desserts
  { name:'Gulab Jamun',          description:'Melt-in-mouth milk-solid dumplings soaked in rose cardamom sugar syrup', price:100, category:'desserts', isVegan:false, spiceLevel:0, isBestseller:true,  isChefSpecial:false, emoji:'🍯', sortOrder:1 },
  { name:'Ice Cream',            description:'Creamy scoops of vanilla, chocolate or butterscotch with wafer',          price:90,  category:'desserts', isVegan:false, spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🍨', sortOrder:2 },
  { name:'Brownie with Ice Cream',description:'Warm chocolate brownie topped with vanilla ice cream & hot chocolate sauce',price:160, category:'desserts', isVegan:false, spiceLevel:0, isBestseller:true,  isChefSpecial:true,  emoji:'🍫', sortOrder:3 },
  { name:'Phirni',               description:'Chilled ground-rice pudding scented with saffron & rosewater, set in clay bowls', price:110, category:'desserts', isVegan:false, spiceLevel:0, isBestseller:false, isChefSpecial:false, emoji:'🫙', sortOrder:4 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Users
    await User.deleteMany({});
    for (const u of ADMIN_USERS) {
      await User.create(u);
      console.log(`👤 Created user: ${u.email} (${u.role})`);
    }

    // Menu
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(MENU_ITEMS);
    console.log(`🍽️  Seeded ${MENU_ITEMS.length} menu items`);

    console.log('\n✅ Seed complete!\n');
    console.log('Admin credentials:');
    ADMIN_USERS.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password}`));
    console.log('\n⚠️  Change passwords after first login!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
