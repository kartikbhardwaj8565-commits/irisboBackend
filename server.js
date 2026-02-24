 const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// Static folder
app.use("/uploads", express.static("uploads"));

// AUTH
app.use("/api/auth", require("./routes/auth"));

// PROFILE
app.use("/api/profile", require("./routes/editProfile"));
app.use("/api/profile", require("./routes/profile"));

// POSTS
app.use("/api/posts", require("./routes/post"));
app.use("/api/likePosts", require("./routes/LikePosts"));
app.use("/api/savePosts", require("./routes/SavePosts"));

// REELS
app.use("/api/reels", require("./routes/reels"));
app.use("/api/likeReels", require("./routes/LikeReels"));
app.use("/api/saveReels", require("./routes/SaveReels"));

//products
app.use("/api/products", require("./routes/products"));                   

// OTHER USER PROFILE
const otherProfileRoutes = require("./routes/OthersProfile");
app.use("/api", otherProfileRoutes);

// USER ACTIVITY (Liked + Saved Posts)
const userActivityRoutes = require("./routes/userActivity");
app.use("/api/activity", userActivityRoutes);

//cart routes
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);
//wishlist routes
const wishlistRoutes = require("./routes/Wishlist");
app.use("/api/wishlist", wishlistRoutes);

// SERVER
app.listen(3000, "0.0.0.0", () => {
  console.log("JWT_SECRET =", process.env.JWT_SECRET);
  console.log(`Server running on port ${process.env.PORT}`);
});
