// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // The password scrambler
const jwt = require('jsonwebtoken'); // The ID badge generator
const User = require('../models/User'); // Import our User blueprint

// ==========================================
// 1. REGISTER A NEW USER
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { fullName, phoneNumber, password, role, businessName } = req.body;

    // Check if the phone number is already registered
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered.' });
    }

    // Scramble the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = new User({
      fullName,
      phoneNumber,
      password: hashedPassword,
      role: role || 'student', // Defaults to student if no role is provided
      businessName
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });

  } catch (error) {
    // 👇 Here is our new detailed error logger!
    console.error("🚨 DETAILED REGISTRATION ERROR:", error); 
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
}); // <-- This is the little bracket that went missing!

// ==========================================
// 2. LOGIN & THE "SPLIT-WORLD" LOGIC
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find the user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare the entered password with the scrambled one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate the Secure ID Badge (Token)
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'super_secret_backup_key', 
      { expiresIn: '30d' } // Keeps them logged in for 30 days
    );

    // Send back the token and the user's role for the Split-World redirect
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role, // The frontend will use THIS to route them!
        isApprovedVendor: user.isApprovedVendor
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// 👑 ADMIN: Get all registered users (hiding their passwords!)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// 👑 ADMIN: Change a user's role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ Failed to update role:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
});

module.exports = router;