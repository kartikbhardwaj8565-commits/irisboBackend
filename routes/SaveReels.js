const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
console.log("SaveReels route loaded");

const router = express.Router();

/*
SAVE / UNSAVE REEL
*/
router.post("/:id/save", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const reelId = req.params.id;

    const [existing] = await pool.query(
      "SELECT * FROM saved_reels WHERE user_id = ? AND reel_id = ?",
      [userId, reelId]
    );

    if (existing.length > 0) {
      await pool.query(
        "DELETE FROM saved_reels WHERE user_id = ? AND reel_id = ?",
        [userId, reelId]
      );

      return res.json({ message: "Reel unsaved" });
    }

    await pool.query(
      "INSERT INTO saved_reels (user_id, reel_id) VALUES (?, ?)",
      [userId, reelId]
    );

    res.json({ message: "Reel saved successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
GET ALL SAVED REELS
*/
router.get("/my-saved", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [saved] = await pool.query(
      `SELECT r.* FROM saved_reels s
       JOIN reels r ON s.reel_id = r.id
       WHERE s.user_id = ?`,
      [userId]
    );

    res.json(saved);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
