// models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  isStoreOpen: { 
    type: Boolean, 
    default: true // The store is open by default!
  }
});

module.exports = mongoose.model('Settings', settingsSchema);