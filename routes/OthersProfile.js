const express = require("express");
const pool = require("../db");
const router = express.Router();

/*
GET USER PUBLIC ACTIVITY
*/
router.get("/users/:id/activity", async (req, res) => {
  try {
    const userId = req.params.id;

    //  Get public user info
    const [users] = await pool.query(
      `SELECT id, username, profile_image, bio, location 
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Get posts
    const [posts] = await pool.query(
      `SELECT id, image, caption, created_at 
       FROM posts 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    //  Get reels
    const [reels] = await pool.query(
      `SELECT id, video_url, caption, created_at 
       FROM reels 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Send combined response
    res.json({
      user: users[0],
      total_posts: posts.length,
      total_reels: reels.length,
      posts,
      reels
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
