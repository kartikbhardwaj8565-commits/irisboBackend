 const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
/*
 GET PROFILE PAGE
// */
// router.get("/:id", async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // Get user details
//     const [user] = await pool.query(
//       "SELECT id, username, bio, status, location, works, profile_image, cover_photo FROM users WHERE id = ?",
//       [userId]
//     );

//     if (user.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Get user posts
//     const [posts] = await pool.query(
//       "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC",
//       [userId]
//     );

//     res.json({
//       user: user[0],
//       posts: posts,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

/* GET PROFILE [fetch]*/
/* GET PROFILE */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT 
          name,
          username,
          email,
          bio,
          education,
          work,
          profile_img,
          cover_img
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // build base url dynamically (works on emulator + real phone)
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    //  convert filenames → full urls
    user.profile_img = user.profile_img
      ? `${baseUrl}/uploads/${user.profile_img}`
      : null;

    user.cover_img = user.cover_img
      ? `${baseUrl}/uploads/${user.cover_img}`
      : null;

    res.status(200).json(user);

  } catch (err) {
    console.log("PROFILE ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});
module.exports = router;