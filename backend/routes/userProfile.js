const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getMe,
  updateMe,
  uploadProfileImage
} = require("../controllers/userProfileController");

const router = express.Router();

// Get logged-in user profile
router.get("/me", authMiddleware(), getMe);

// Update profile fields
router.patch("/me", authMiddleware(), updateMe);

// Upload profile image
router.post("/me/profile-image", authMiddleware(), uploadProfileImage);

module.exports = router;
