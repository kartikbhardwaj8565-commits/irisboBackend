 // GET SAVED REELS
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
 

/*
TOGGLE SAVE / UNSAVE REEL
*/
router.post("/toggle/:postId", authMiddleware, async (req, res) => {
  try {

    const userId = req.user.id;
    const postId = req.params.postId;

    // Check post exists
    const [post] = await pool.query(
      "SELECT id FROM posts WHERE id = ?",
      [postId]
    );

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check already saved or not
    const [existing] = await pool.query(
      "SELECT * FROM saved_posts WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    // IF SAVED → UNSAVE
    if (existing.length > 0) {

      await pool.query(
        "DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );

      return res.json({
        saved: false,
        message: "Post unsaved successfully"
      });
    }

    // IF NOT SAVED → SAVE
    await pool.query(
      "INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)",
      [userId, postId]
    );

    res.json({
      saved: true,
      message: "Post saved successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

 
