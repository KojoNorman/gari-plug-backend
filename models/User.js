// models/User.js
const mongoose = require('mongoose');

// We define the blueprint for every person who logs into the app
const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true // Perfect for MoMo integration and login
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'vendor', 'admin', 'rider'], 
    default: 'student' // Defaults to B2C. Vendors must be approved by admin.
  },
  // B2C Specific Fields
  campusZone: { 
    type: String, 
    enum: ['Casford', 'ATL', 'Amamoma', 'Valco', 'Diaspora', 'None'],
    default: 'None'
  },
  isSubscriber: { 
    type: Boolean, 
    default: false // Activates the "Free Delivery for Subscribers" perk
  },
  referralCode: { 
    type: String, 
    unique: true, // <-- The missing comma goes here!
    sparse: true  // <-- This allows multiple users to have an empty/null code
  },
  // B2B Specific Fields
  businessName: { 
    type: String 
  },
  isApprovedVendor: { 
    type: Boolean, 
    default: false // Keeps the Wholesale Hub locked until you approve them
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);