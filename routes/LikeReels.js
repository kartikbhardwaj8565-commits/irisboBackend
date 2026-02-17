 const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
LIKE / UNLIKE REEL
*/
router.post("/:id/like", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const reelId = req.params.id;

    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT id FROM reel_likes WHERE reel_id=? AND user_id=? LIMIT 1",
      [reelId, userId]
    );

    let liked;

    if (existing.length > 0) {

      // UNLIKE
      await connection.query(
        "DELETE FROM reel_likes WHERE reel_id=? AND user_id=?",
        [reelId, userId]
      );

      await connection.query(
        "UPDATE reels SET likes_count = GREATEST(likes_count-1,0) WHERE id=?",
        [reelId]
      );

      liked = false;

    } else {

      // LIKE
      await connection.query(
        "INSERT INTO reel_likes (reel_id,user_id) VALUES (?,?)",
        [reelId, userId]
      );

      await connection.query(
        "UPDATE reels SET likes_count = likes_count+1 WHERE id=?",
        [reelId]
      );

      liked = true;
    }

    const [[reel]] = await connection.query(
      "SELECT likes_count FROM reels WHERE id=?",
      [reelId]
    );

    await connection.commit();

    res.json({
      success: true,
      liked,
      likes_count: reel.likes_count
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});
/*
DELETE REEL
*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const reelId = req.params.id;

    const [reel] = await pool.query(
      "SELECT * FROM reels WHERE id = ? AND user_id = ?",
      [reelId, userId]
    );

    if (reel.length === 0) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await pool.query("DELETE FROM reels WHERE id = ?", [reelId]);

    res.json({ message: "Reel deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

 
