import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import { config } from "../config";
import routes from "./routes";

dotenv.config();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(
  fileUpload({
    useTempFiles: true, // ⚡ Ensures large files are handled properly
    tempFileDir: "/tmp/",
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit (Ensure `config.fileUploadLimits` is correctly set!)
    abortOnLimit: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Start server
const server = app.listen(config.port, () =>
  console.log(`🚀 Server running on port ${config.port}`)
);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
