// models/PromoCode.js
const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true // Forces codes like 'gari' to become 'GARI'
  },
  discountPercentage: { 
    type: Number, 
    required: true 
  }, // e.g., 10 for 10% off
  isActive: { 
    type: Boolean, 
    default: true 
  }, // Aunty Vero can turn it off when the promo ends
  usageCount: { 
    type: Number, 
    default: 0 
  } // Tracks how many times students have used it!
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);