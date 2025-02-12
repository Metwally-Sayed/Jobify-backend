import { exec } from "child_process";
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export const cvExtractText = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Received files:", req.files);

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.cv) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const file = req.files.cv as UploadedFile;

    console.log("File Name:", file.name);
    console.log("File Size:", file.size);
    console.log("File Type:", file.mimetype);
    console.log("File Buffer Length:", file.data.length);

    /** 🛑 Security: Check File Size (Max 1MB) */
    if (file.size > 1024 * 1024) {
      res.status(400).json({ error: "File is too large (Max: 1MB)" });
      return;
    }

    /** 🛑 Security: Allow Only PDFs */
    if (file.mimetype !== "application/pdf") {
      res.status(400).json({ error: "Only PDF resumes are supported" });
      return;
    }

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file temporarily before parsing
    const uploadPath = path.join(uploadDir, file.name);
    await file.mv(uploadPath);

    // Verify file was saved
    if (!fs.existsSync(uploadPath)) {
      console.error("File not found after upload:", uploadPath);
      res.status(500).json({ error: "File upload failed" });
      return;
    }

    // Read and parse PDF
    const pdfBuffer = fs.readFileSync(uploadPath);
    let parsedPdf;
    try {
      parsedPdf = await pdfParse(pdfBuffer);
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      res.status(400).json({ error: "Failed to extract text from PDF" });
      return;
    } finally {
      fs.unlinkSync(uploadPath); // Delete temp file
    }

    if (!parsedPdf.text || parsedPdf.text.trim().length === 0) {
      res.status(400).json({ error: "Failed to extract text from PDF" });
      return;
    }

    // Save extracted text to a temporary file
    const tempFilePath = path.join(__dirname, "resume_text.txt");
    fs.writeFileSync(tempFilePath, parsedPdf.text);

    // Run Python NLP script
    exec(`python3 extract_resume_nlp.py "${tempFilePath}"`, (error, stdout) => {
      fs.unlinkSync(tempFilePath); // Delete temp file

      if (error) {
        console.error("Python script error:", error);
        res.status(500).json({ error: "Failed to process resume" });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseError) {
        console.error("Error parsing Python output:", parseError);
        res.status(500).json({ error: "Invalid response from NLP script" });
      }
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
