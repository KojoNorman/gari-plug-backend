// routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// 1. GET the current store status (Everyone can read this)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    // If no settings exist yet, create the default one automatically
    if (!settings) {
      settings = await Settings.create({ isStoreOpen: true });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// 2. ADMIN: Toggle the store Open/Closed
router.put('/toggle', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ isStoreOpen: true });
    }
    
    // Flip the boolean! (If true, make false. If false, make true)
    settings.isStoreOpen = !settings.isStoreOpen;
    await settings.save();
    
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle store status" });
  }
});

module.exports = router;