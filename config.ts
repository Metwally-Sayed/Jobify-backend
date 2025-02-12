import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  fileUploadLimits: 5 * 1024 * 1024, // 5MB
};
