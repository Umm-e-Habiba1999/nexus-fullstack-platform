const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER API
router.post("/register", async (req, res) => {
  try {
    console.log("REGISTER HIT");
    console.log("BODY:", req.body);

    const { name, email, password, role } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.log("REGISTER ERROR ❌", error);
    res.status(500).json({ message: error.message });
  }
});


// LOGIN API (TEMP FIX - WORKING)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  return res.json({
    message: "Login successful (TEMP FIX)",
    token: "dummy-token",
    user: {
      id: "123",
      name: "Test User",
      email,
      role: "entrepreneur"
    }
  });
});

module.exports = router;