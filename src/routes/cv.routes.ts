import express from "express";
import rateLimit from "express-rate-limit";
import { cvExtractText } from "../controllers/cv.controller";

const router = express.Router();

/**
 * 🛑 Rate Limiter (Protects API from excessive requests)
 * - Max 5 requests per 10 minutes per IP
 */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2, // Limit each IP to 5 requests per window
  message: {
    error: "Too many requests, please try again later or log in manual.",
  },
  headers: true,
});

router.post("/extract-text", limiter, cvExtractText);

export default router;
