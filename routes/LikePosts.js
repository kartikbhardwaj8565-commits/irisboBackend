 const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:id/like", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const reelId = req.params.id;

    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT id FROM post_likes WHERE post_id=? AND user_id=? LIMIT 1",
      [reelId, userId]
    );

    let liked;

    if (existing.length > 0) {

      // UNLIKE
      await connection.query(
        "DELETE FROM post_likes WHERE post_id=? AND user_id=?",
        [reelId, userId]
      );

      await connection.query(
        "UPDATE posts SET likes_count = GREATEST(likes_count-1,0) WHERE id=?",
        [reelId]
      );

      liked = false;

    } else {

      // LIKE
      await connection.query(
        "INSERT INTO post_likes (post_id,user_id) VALUES (?,?)",
        [reelId, userId]
      );

      await connection.query(
        "UPDATE posts SET likes_count = likes_count+1 WHERE id=?",
        [reelId]
      );

      liked = true;
    }

    const [[reel]] = await connection.query(
      "SELECT likes_count FROM posts WHERE id=?",
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

module.exports = router;