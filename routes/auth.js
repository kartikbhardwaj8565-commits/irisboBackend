const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();
console.log("AUTH ROUTES LOADED");

/* REGISTER */
 /* REGISTER */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, username) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, username]
    );

    //  Generate token immediately
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    /* FORGOT PASSWORD */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Generate reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "Reset token generated",
      resetToken   // In production, send via email
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


    //  SEND RESPONSE
    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
});
/* RESET PASSWORD */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    /*  Validate Fields */
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    /* Check Password Match */
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    /*  Verify Token */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    /*  Hash Password */
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    /* Update Database */
    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, decoded.id]
    );

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (err) {
    res.status(500).json({
      message: "Reset failed",
      error: err.message
    });
  }
});


 
 

/* LOGOUT */
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const token = req.token;     // Already extracted in middleware
    const decoded = req.user;    // Already verified in middleware

    const expiresAt = new Date(decoded.exp * 1000);

    // Check if already blacklisted
    const [existing] = await pool.query(
      "SELECT id FROM blacklisted_tokens WHERE token = ? LIMIT 1",
      [token]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Token already logged out" });
    }

    // Insert into blacklist
    await pool.query(
      "INSERT INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)",
      [token, expiresAt]
    );

    res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.log("LOGOUT ERROR:", err.message);
    res.status(500).json({ message: "Logout failed" });
  }
});

module.exports = router;
  
