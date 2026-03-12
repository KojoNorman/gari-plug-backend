// models/Product.js
const mongoose = require('mongoose');

// We define the blueprint for Aunty Vero's Gari inventory
const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // e.g., "The Olonka Pack", "Full Sack"
  
  category: { 
    type: String, 
    required: true // We removed the 'enum' array so you can type ANY category name now!
  },
  
  weight: { 
    type: String, 
    required: true 
  }, // e.g., "1kg", "50kg"
  
  standardPrice: { 
    type: Number, 
    required: true 
  }, // Price in GHS
  
  subscriberPrice: { 
    type: Number 
  }, // 5% off price for students
  
  isB2BOnly: { 
    type: Boolean, 
    default: false // If true, only users with the 'vendor' role can see this
  },
  
  inStock: { 
    type: Boolean, 
    default: true 
  },
  
  // 📸 Added Image URL field so Aunty Vero can show off the Gari!
  imageUrl: { 
    type: String, 
    default: 'https://via.placeholder.com/300x200?text=Premium+Gari' 
  },

  // 📦 THE LIVE INVENTORY TRACKER (Now safely inside the schema!)
  stockQuantity: { 
    type: Number, 
    default: 100 // Defaults to 100 so your existing items don't suddenly vanish!
  }
  
}, { timestamps: true }); // <--- Notice how everything is safely above this line!

module.exports = mongoose.model('Product', productSchema);