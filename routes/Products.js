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
    const { name, category, price, stock, description } = req.body;

    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);

    const image = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      "INSERT INTO products (user_id, name, category, product_image, price, stock, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, name, category, image, price, stock, description  ]
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

    // Convert filename to full URL
    const updatedProducts = products.map(product => ({
      ...product,
      product_image: product.product_image
        ? `${product.product_image}`
        : null
    }));

    res.json(updatedProducts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;


 