// routes/order.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // 📦 IMPORTED PRODUCT MODEL FOR INVENTORY TRACKING

// ==========================================
// 1. PLACE A NEW ORDER (Frontend Checkout)
// ==========================================
router.post('/new', async (req, res) => {
  try {
    // 1. Grab EVERYTHING from the frontend
    const { user, userId, products, totalPrice, deliveryZone, exactLocation } = req.body; 

    // 2. Be smart: Use whichever ID field the frontend actually sent
    const activeUser = user || userId;

    if (!activeUser) {
      return res.status(400).json({ message: "Missing User ID in request!" });
    }

    // 3. Create the order
    const newOrder = new Order({
      user: activeUser, 
      products,
      totalPrice,
      deliveryZone,
      exactLocation
    });
    
    // Save the order to the database
    const savedOrder = await newOrder.save();

    // 📦 🛠️ THE AUTO-SUBTRACT ENGINE
    // Loop through every item the student bought and deduct it from the warehouse
    for (let item of products) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity } // Subtracts the exact amount ordered!
        });
      }
    }

    res.status(201).json(savedOrder);

  } catch (error) {
    console.error("❌ CRITICAL BACKEND ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. FETCH ALL ORDERS (For your Admin Dashboard & Riders)
// ==========================================
router.get('/dashboard', async (req, res) => {
  try {
    // Fetch orders and auto-fill the user and product details!
    const orders = await Order.find()
      .populate('user', 'fullName phoneNumber role')
      .populate('products.product', 'name weight category');
      
    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
  }
});

// 🚚 ADMIN & RIDER: Update Order Status & Financials
router.put('/:id/status', async (req, res) => {
  try {
    // 1. Grab EVERYTHING the frontend sends us
    const { paymentStatus, paymentMethod, rider, isCashReconciled } = req.body;
    
    // 2. Build a dynamic update object
    let updateData = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (rider) updateData.rider = rider;
    if (isCashReconciled !== undefined) updateData.isCashReconciled = isCashReconciled;

    // 3. Save to the database
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("❌ Failed to update order:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

// 👑 ADMIN: Get ALL orders across the entire platform
router.get('/all', async (req, res) => {
  try {
    // We grab all orders, sort newest first, and pull in the user's details and product names!
    const allOrders = await Order.find()
      .sort({ createdAt: -1 }) 
      .populate('user', 'fullName email role') 
      .populate('products.product', 'name weight'); 

    res.status(200).json(allOrders);
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
});

// 🛑 ADMIN: Cancel Order & Auto-Refund Stock
router.put('/:id/cancel', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    
    if (!order || order.paymentStatus === 'Cancelled') {
      return res.status(400).json({ message: "Order not found or already cancelled." });
    }

    // 📦 REVERSE INVENTORY ENGINE: Add the stock back to the warehouse!
    for (let item of order.products) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity } // Notice it's positive (+) to add it back!
        });
      }
    }

    // Mark the order as officially dead
    order.paymentStatus = 'Cancelled';
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("❌ Failed to cancel order:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

module.exports = router;