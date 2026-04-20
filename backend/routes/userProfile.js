import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMe, updateMe, uploadProfileImage, requestDeletion } from "../controllers/userProfileController.js";

const router = express.Router();

// Get logged-in user profile
router.get("/me", authMiddleware(), getMe);

// Update profile fields
router.patch("/me", authMiddleware(), updateMe);

// Upload profile image
router.post("/me/profile-image", authMiddleware(), uploadProfileImage);

// Request account deletion
router.post("/deletion-request", authMiddleware(), requestDeletion);

export default router;
