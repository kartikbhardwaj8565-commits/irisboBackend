 const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==============================
// GET LIKED POSTS
// ==============================
router.get("/liked-posts", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [posts] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.media,

        p.caption,
        p.created_at,
        u.username,
        u.profile_image
      FROM post_likes pl
      JOIN posts p ON pl.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pl.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      total_liked_posts: posts.length,
      posts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==============================
// GET SAVED POSTS
// ==============================
router.get("/saved-posts", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [posts] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.media,
        p.caption,
        p.created_at,
        u.username,
        u.profile_image
      FROM saved_posts sp
      JOIN posts p ON sp.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE sp.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      total_saved_posts: posts.length,
      posts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
