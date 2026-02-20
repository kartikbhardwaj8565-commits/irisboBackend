 const express = require("express");
const pool = require("../db");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================
// ADD PRODUCT
// ==========================
router.post("/add", authMiddleware, upload.single("product_image"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category, price, stock } = req.body;

    const image = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      "INSERT INTO products (user_id, name, category, product_image, price, stock) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, category, image, price, stock]
    );

    res.json({
      message: "Product added successfully",
      productId: result.insertId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================
// GET ALL PRODUCTS
// ==========================
router.get("/all", async (req, res) => {
  try {

    const [products] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.product_image,
        p.price,
        p.stock,
        p.created_at,
        u.username
      FROM products p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================
// ADD TO CART
// ==========================
router.post("/cart/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    await pool.query(
      "INSERT IGNORE INTO cart (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    );

    res.json({ message: "Product added to cart" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================
// GET MY CART
// ==========================
router.get("/my-cart", authMiddleware, async (req, res) => {
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


module.exports = router;
