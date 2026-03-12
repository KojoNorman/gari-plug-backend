// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // We need the User blueprint

// 1. Find all vendors waiting for approval
router.get('/vendors/pending', async (req, res) => {
  try {
    const pendingVendors = await User.find({ role: 'vendor', isApprovedVendor: false });
    res.status(200).json(pendingVendors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendors.', error: error.message });
  }
});

// 2. Approve a vendor
router.put('/vendors/:id/approve', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isApprovedVendor: true });
    res.status(200).json({ message: 'Vendor officially approved!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve vendor.', error: error.message });
  }
});

module.exports = router;