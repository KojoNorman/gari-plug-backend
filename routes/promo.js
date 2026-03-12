// routes/promo.js
const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');

// 👑 ADMIN: Get all promo codes for the dashboard
router.get('/all', async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json(promos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch promo codes." });
  }
});

// 👑 ADMIN: Create a new promo code
router.post('/new', async (req, res) => {
  try {
    const { code, discountPercentage } = req.body;
    const newPromo = new PromoCode({ code, discountPercentage });
    await newPromo.save();
    res.status(201).json(newPromo);
  } catch (error) {
    res.status(500).json({ message: "Failed to create promo code. Make sure the code is unique!" });
  }
});

// 👑 ADMIN: Toggle Promo Active/Inactive
router.put('/:id/toggle', async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    promo.isActive = !promo.isActive;
    await promo.save();
    res.status(200).json(promo);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle status." });
  }
});

// 🎓 STUDENTS: Validate a promo code at Checkout
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const promo = await PromoCode.findOne({ code: code.toUpperCase() });

    // Does it exist?
    if (!promo) {
      return res.status(404).json({ message: "Invalid promo code." });
    }
    // Is it turned on?
    if (!promo.isActive) {
      return res.status(400).json({ message: "This promo code has expired." });
    }

    // Success! Increase the usage counter and send back the discount
    promo.usageCount += 1;
    await promo.save();

    res.status(200).json({ 
      discountPercentage: promo.discountPercentage,
      message: `Success! ${promo.discountPercentage}% discount applied.`
    });

  } catch (error) {
    res.status(500).json({ message: "Validation error." });
  }
});

module.exports = router;