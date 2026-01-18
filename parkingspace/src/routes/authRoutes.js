import express from "express";
import { register, verifyEmail, login } from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import verifiedMiddleware from "../middleware/verifiedMiddleware.js";

const router = express.Router();

// Protected route (profile)
router.get(
  "/profile",
  authMiddleware,
  verifiedMiddleware,
  (req, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
    });
  }
);

// Auth routes
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);

export default router;
