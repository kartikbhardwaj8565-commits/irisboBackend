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
 router.get("/all", async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT 
        posts.id,
        posts.user_id,
        posts.caption,
        posts.media,
        posts.media_type,
        posts.likes_count,
        posts.shares_count,
        posts.tags,
        posts.created_at,
        users.username,
        users.profile_image
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `);

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
        media_urls: mediaFiles.map(file =>
          `${req.protocol}://${req.get("host")}/uploads/${file}`
        ),
        profile_image_url: post.profile_image
          ? `${req.protocol}://${req.get("host")}/uploads/${post.profile_image}`
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