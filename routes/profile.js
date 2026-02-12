/*
 GET PROFILE PAGE
*/
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user details
    const [user] = await pool.query(
      "SELECT id, username, bio, status, location, works, profile_image, cover_photo FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user posts
    const [posts] = await pool.query(
      "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      user: user[0],
      posts: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
