import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import extractCVRoute from "./routes/cv";
import jobRoutes from "./routes/jobs";

dotenv.config();
const app = express();

app.use(cors());
// Enable file upload middleware
app.use(
  fileUpload({
    useTempFiles: true, // Store files temporarily to avoid in-memory issues
    tempFileDir: "/tmp/", // Path for temporary file storage
    limits: { fileSize: 5 * 1024 * 1024 }, // Set max file size to 5MB
    abortOnLimit: true,
  })
);
app.use(express.json());

app.use("/api/extract-text", extractCVRoute);
app.use("/api/jobs", jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
