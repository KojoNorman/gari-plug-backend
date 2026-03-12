// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // 1. WHO is ordering? (We link this directly to the User database)
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // 2. WHAT are they ordering? (An array, in case they buy multiple things)
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }
  }],
  
  // 3. FINANCIALS
  totalPrice: { 
    type: Number, 
    required: true 
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Delivered', 'Completed', 'Cancelled'], // 🔓 Lock removed!
    default: 'Pending'
  },
  paymentMethod: { 
    type: String 
  }, // e.g., 'MoMo (Paid)' or 'Cash on Delivery'

  // 🛠️ FINANCIAL TRACKING FIELDS
  rider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Tracks WHICH rider collected the cash
  },
  isCashReconciled: { 
    type: Boolean, 
    default: false // Becomes 'true' when Aunty Vero collects the cash
  }, // <--- 🚨 CRITICAL COMMA ADDED HERE! 🚨
  
  // 4. LOGISTICS & DISPATCH
  deliveryZone: { 
    type: String, 
    required: true 
  }, // e.g., 'Amamoma' or 'Science Lorry Station'
  exactLocation: { 
    type: String, 
    required: true 
  }, // e.g., 'Room 42, ATL Hostel'
  deliveryStatus: { 
    type: String, 
    enum: ['Pending', 'Dispatched', 'Delivered'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);