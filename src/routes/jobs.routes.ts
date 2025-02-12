import express from "express";
import { getJobs } from "../controllers/jobs.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = express.Router();

router.get("/scrape", authMiddleware, getJobs);

export default router;
