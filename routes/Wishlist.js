const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
========================== 
ADD TO WISHLIST
==========================
*/
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const [product] = await pool.query(
      "SELECT id FROM products WHERE id = ?",
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already in wishlist
    const [existing] = await pool.query(
      "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existing.length > 0) {
      return res.json({ message: "Already in wishlist" });
    }

    await pool.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [userId, product_id]
    );

    res.json({ message: "Product added to wishlist" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
==========================
GET MY WISHLIST
==========================
*/
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.query(`
      SELECT 
        p.id,
        p.username,
        p.name,
         p.product_image,
        p.price
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [userId]);

    res.json(items);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
==========================
REMOVE FROM WISHLIST
==========================
*/
router.delete("/remove/:product_id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.product_id;

    await pool.query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.json({ message: "Removed from wishlist" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;