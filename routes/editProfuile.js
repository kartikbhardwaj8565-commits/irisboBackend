const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

/*
EDIT PROFILE
*/
router.put(
  "/edit",
  auth,
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, username } = req.body;

      let profileImage = null;
      let coverImage = null;

      if (req.files?.profile_image) {
        profileImage = req.files.profile_image[0].filename;
      }

      if (req.files?.cover_image) {
        coverImage = req.files.cover_image[0].filename;
      }

      const [user] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      await pool.query(
        `
        UPDATE users SET
          name = ?,
          username = ?,
          profile_image = COALESCE(?, profile_image),
          cover_image = COALESCE(?, cover_image)
        WHERE id = ?
        `,
        [
          name || user[0].name,
          username || user[0].username,
          profileImage,
          coverImage,
          userId,
        ]
      );

      res.json({ message: "Profile updated successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Profile update failed" });
    }
  }
);

module.exports = router;
