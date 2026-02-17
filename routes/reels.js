const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

 
router.post(
  "/upload",
  authMiddleware,
  upload.single("video"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const caption = req.body?.caption || null;

      if (!req.file) {
        return res.status(400).json({ error: "Video is required" });
      }

      const video = req.file.filename;

      const [result] = await pool.query(
        "INSERT INTO reels (user_id, video, caption) VALUES (?, ?, ?)",
        [userId, video, caption]
      );

      res.status(201).json({
        message: "Reel uploaded successfully",
        reelId: result.insertId
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//get all reels 
router.get("/all", authMiddleware, async (req, res) => {
  try {

    const userId = req.user.id;

    const [reels] = await pool.query(`
      SELECT 
        r.id,
        r.user_id,
        r.video,
        r.caption,
        r.likes_count,
        r.created_at,
        u.username,
        u.profile_image,

        IF(rl.user_id IS NULL, 0, 1) AS is_liked

      FROM reels r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN reel_likes rl
        ON rl.reel_id = r.id AND rl.user_id = ?

      ORDER BY r.created_at DESC
    `, [userId]);

    const updatedReels = reels.map(reel => ({
      ...reel,
      is_liked: !!reel.is_liked,
      video_url: `${req.protocol}://${req.get("host")}/uploads/${reel.video}`,
      profile_image_url: reel.profile_image
        ? `${req.protocol}://${req.get("host")}/uploads/${reel.profile_image}`
        : null
    }));

    res.status(200).json({
      success: true,
      total_reels: updatedReels.length,
      reels: updatedReels
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;