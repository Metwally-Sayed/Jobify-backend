import express from "express";
import authRoutes from "./auth.routes";
import extractCVRoute from "./cv.routes";
import jobRoutes from "./jobs.routes";

const router = express.Router();

router.use("/cv", extractCVRoute);
router.use("/jobs", jobRoutes);
router.use("/auth", authRoutes);

export default router;
