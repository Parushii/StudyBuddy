const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { processFile } = require("../fileParser"); // uses your fileParser.js & gemini.js
const downloadDriveFile = require("../services/downloadDriveFile");


router.post("/generate-notes", upload.array("files"), async (req, res) => {
  try {
    const allFiles = [];

    // 1️⃣ Uploaded files (WORKS AS BEFORE)
    if (req.files && req.files.length > 0) {
      allFiles.push(...req.files);
    }

    // 2️⃣ Drive files (NEW)
    if (req.body.driveFiles) {
      const driveFiles = Array.isArray(req.body.driveFiles)
        ? req.body.driveFiles
        : [req.body.driveFiles];

      for (const df of driveFiles) {
        const { id, name } = JSON.parse(df);

        const localPath = await downloadDriveFile(id, name);

        allFiles.push({
          path: localPath,
          originalname: name,
          mimetype: name.endsWith(".pdf")
            ? "application/pdf"
            : name.endsWith(".docx")
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "text/plain",
        });
      }
    }

    // 3️⃣ Final safety check
    if (allFiles.length === 0) {
      return res.status(400).json({ message: "No files provided" });
    }

    const results = {};

    for (const file of allFiles) {
      // This function should:
      // 1. Read the file
      // 2. Extract text (TXT/PDF/DOCX)
      // 3. Send text to Gemini to get structured notes
      const structuredNotes = await processFile(file);
      results[file.originalname] = structuredNotes;
    }

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate notes" });
  }
});

module.exports = router;
