  const express = require("express");
 const pool = require("../db");
 const authMiddleware = require("../middleware/authMiddleware");
 
 const router = express.Router();
 router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const [product] = await pool.query(
      "SELECT id, stock FROM products WHERE id = ?",
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product[0].stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Check if already in cart
    const [existing] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await pool.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity || 1, userId, product_id]
      );

      return res.json({ message: "Cart quantity updated" });
    }

    // Insert new item
    await pool.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, product_id, quantity || 1]
    );

    res.json({ message: "Product added to cart" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ==========================
// GET MY CART
// ==========================
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.product_image,
        p.price,
        c.quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    res.json(items);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
//ADD TO CART
==========================
*/
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const [product] = await pool.query(
      "SELECT id, stock FROM products WHERE id = ?",
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product[0].stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Check if already in cart
    const [existing] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await pool.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity || 1, userId, product_id]
      );

      return res.json({ message: "Cart quantity updated" });
    }

    // Insert new item
    await pool.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, product_id, quantity || 1]
    );

    res.json({ message: "Product added to cart" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================
// DELETE FROM CART
// ==========================
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    // Check if item exists in cart
    const [existing] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Delete item
    await pool.query(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.json({ message: "Product removed from cart successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
