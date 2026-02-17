 /* ADD COMMENT */
router.post("/comment/:id", auth, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;

    await pool.query(
      "INSERT INTO video_comments (user_id, video_id, comment) VALUES (?, ?, ?)",
      [userId, videoId, comment]
    );

    await pool.query(
      "UPDATE videos SET comments_count = comments_count + 1 WHERE id = ?",
      [videoId]
    );

    res.json({ message: "Comment added" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
