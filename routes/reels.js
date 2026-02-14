 const express = require("express");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  uploadReel,
  getReels,
  likeReel,
  deleteReel,
} = require("../controllers/reelsController");

const router = express.Router();

router.post("/upload", auth, upload.single("video"), uploadReel);
router.get("/", auth, getReels);
router.post("/:id/like", auth, likeReel);
router.delete("/:id", auth, deleteReel);

module.exports = router;
