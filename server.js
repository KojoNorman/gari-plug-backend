// server.js

// 1. IMPORT OUR TOOLS
require('dotenv').config(); // Loads our secret .env variables
const express = require('express'); // The web framework
const mongoose = require('mongoose'); // The database connector
const cors = require('cors'); // Allows our frontend app to talk to this backend


// 2. INITIALIZE THE APP
const app = express();

// 3. MIDDLEWARE (The Security & Translation Layer)
// The Bouncer lets everyone in
app.use(cors()); // Opens the doors for your frontend to make requests
app.use(express.json()); // Translates incoming internet data into readable JSON
// Add this right under app.use(express.json());
app.use('/api/settings', require('./routes/settings'));
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// Add this right under your auth routes in server.js
const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);
// Add this right under your product routes in server.js
const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/promo', require('./routes/promo'));

// 4. DATABASE CONNECTION
// We tell Mongoose to connect using the secret link in our .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Success: Connected to the Aunty Vero Database!');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });

// 5. A SIMPLE TEST ROUTE
// This is just to prove our server is alive when we visit it in a browser
app.get('/', (req, res) => {
  res.send('Welcome to the Aunty Vero PWA API Engine!');
});

// 6. START THE ENGINE
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live and running on http://localhost:${PORT}`);
});