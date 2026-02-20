 const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router(); 

  router.post(
  "/create",
  auth,
  upload.array("media", 10),
  async (req, res) => {
    try {
      console.log("FILES:", req.files); // DEBUG LINE

      const userId = req.user.id;
      const { caption } = req.body;

      let media = null;
      let mediaType = null;

      if (req.files && req.files.length > 0) {
        const filenames = req.files.map(file => file.filename);
        media = JSON.stringify(filenames);

        if (req.files[0].mimetype.startsWith("image")) {
          mediaType = "image";
        } else if (req.files[0].mimetype.startsWith("video")) {
          mediaType = "video";
        }
      }

      const [result] = await pool.query(
        "INSERT INTO posts (user_id, caption, media, media_type) VALUES (?, ?, ?, ?)",
        [userId, caption, media, mediaType]
      );

      res.status(201).json({
        message: "Post created successfully",
        postId: result.insertId,
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//Fetch posts
// Fetch all posts
 router.get("/all", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [posts] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.caption,
        p.media,
        p.media_type,
        p.likes_count,
        p.shares_count,
        p.tags,
        p.created_at,
        u.username,
        u.profile_image,

        CASE WHEN pl.user_id IS NULL THEN false ELSE true END AS is_liked,
        CASE WHEN sp.user_id IS NULL THEN false ELSE true END AS is_saved

      FROM posts p
      JOIN users u ON p.user_id = u.id

      LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.user_id = ?

      LEFT JOIN saved_posts sp ON sp.post_id = p.id AND sp.user_id = ?

      ORDER BY p.created_at DESC
    `, [userId, userId]);

    const updatedPosts = posts.map(post => {
      let mediaFiles = [];

      if (post.media) {
        try {
          mediaFiles = JSON.parse(post.media);
        } catch (err) {
          mediaFiles = [];
        }
      }

      return {
        ...post,
        is_liked: !!post.is_liked,
        is_saved: !!post.is_saved,
        media_urls: mediaFiles.map(file =>
          `${req.protocol}://${req.get("host")}/uploads/${file}`
        ),
        profile_image_url: post.profile_image
          ? `${req.protocol}://${req.get("host" )}/uploads/${post.profile_image}`
          : null,
      };
    });

    //  YOU FORGOT THIS PART
    res.status(200).json({
      success: true,
      total_posts: updatedPosts.length,
      posts: updatedPosts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;