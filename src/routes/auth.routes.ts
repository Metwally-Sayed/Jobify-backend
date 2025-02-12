import express from "express";
import {
  login,
  logout,
  refreshToken,
  signup,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authMiddleware, logout);

export default router;
