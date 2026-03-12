// seed.js
require('dotenv').config(); // Load our secret database link
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Import the Product blueprint

// Aunty Vero's Official Product Database
const gariInventory = [
  // --- THE ESSENTIALS (B2C) ---
  {
    name: 'The Quick Fix Pack',
    category: 'The Essentials',
    weight: '1kg',
    standardPrice: 25.00,
    subscriberPrice: 23.75,
    isB2BOnly: false
  },
  {
    name: 'The Olonka Pack',
    category: 'The Essentials',
    weight: '2.5kg',
    standardPrice: 50.00,
    subscriberPrice: 47.50,
    isB2BOnly: false
  },
  {
    name: 'The Hostel Heavyweight',
    category: 'The Essentials',
    weight: '5kg',
    standardPrice: 95.00,
    subscriberPrice: 90.25,
    isB2BOnly: false
  },

  // --- THE SURVIVAL MIXES (B2C) ---
  {
    name: 'The Basic Soakings',
    category: 'Survival Mixes',
    weight: '500g',
    standardPrice: 20.00,
    subscriberPrice: 19.00,
    isB2BOnly: false
  },
  {
    name: 'The Premium Milky Way',
    category: 'Survival Mixes',
    weight: '500g',
    standardPrice: 30.00,
    subscriberPrice: 28.50,
    isB2BOnly: false
  },
  {
    name: 'The Exam Week Special',
    category: 'Survival Mixes',
    weight: '1kg',
    standardPrice: 55.00,
    subscriberPrice: 52.25,
    isB2BOnly: false
  },

  // --- THE WHOLESALE HUB (B2B Only) ---
  {
    name: 'The Half-Sack',
    category: 'Wholesale Hub',
    weight: '25kg',
    standardPrice: 350.00,
    isB2BOnly: true
  },
  {
    name: 'The Full Sack',
    category: 'Wholesale Hub',
    weight: '50kg',
    standardPrice: 680.00,
    isB2BOnly: true
  }
];

// The function that runs the injection
const runSeed = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('⚙️  Connected to Database. Preparing to seed...');

    // 2. Clear old data to prevent duplicates
    await Product.deleteMany({});
    console.log('🗑️  Cleared old inventory.');

    // 3. Inject the new data
    await Product.insertMany(gariInventory);
    console.log('✅ Success: Aunty Vero\'s shelves are fully stocked!');

    // 4. Close the connection
    process.exit(); 
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1); // Exit with failure code
  }
};

// Execute the function
runSeed();