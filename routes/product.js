// routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import our Product blueprint

// ==========================================
// 1. ADD A NEW GARI PRODUCT (Admin)
// ==========================================
router.post('/add', async (req, res) => {
  try {
    // Grab the product details sent from the internet
    const { name, category, weight, standardPrice, subscriberPrice, isB2BOnly } = req.body;

    const newProduct = new Product({
      name,
      category,
      weight,
      standardPrice,
      subscriberPrice,
      isB2BOnly
    });

    await newProduct.save(); // Save it to MongoDB
    res.status(201).json({ message: 'Product added to inventory successfully!', product: newProduct });

  } catch (error) {
    res.status(500).json({ message: 'Failed to add product.', error: error.message });
  }
});

// ==========================================
// 2. FETCH INVENTORY (The Split-World Logic)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // The frontend will tell us who is asking by sending a query like: /api/products?role=vendor
    const userRole = req.query.role || 'student'; // Default to student just to be safe

    let inventory;

    if (userRole === 'vendor') {
      // B2B VENDORS: Fetch only the 25kg and 50kg wholesale sacks
      inventory = await Product.find({ isB2BOnly: true });
    } else {
      // UCC STUDENTS: Fetch the Essentials and Survival Mixes
      inventory = await Product.find({ isB2BOnly: false });
    }

    // Send the correct inventory back to the app!
    res.status(200).json(inventory);

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory.', error: error.message });
  }
});

// 👑 ADMIN: Get absolutely ALL products (Retail + Wholesale)
router.get('/all', async (req, res) => {
  try {
    const allProducts = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(allProducts);
  } catch (error) {
    console.error("❌ Failed to fetch all products:", error);
    res.status(500).json({ message: "Failed to fetch all products" });
  }
});

// 👑 ADMIN: Create a brand new product
router.post('/new', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("❌ Failed to create product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// 👑 ADMIN: Update a product's details (Name, Price, Image, etc.)
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // This securely updates only the fields that were changed
      { new: true, runValidators: true } // Returns the updated product and checks for errors
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("❌ Failed to update product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

module.exports = router;