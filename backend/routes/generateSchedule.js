const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { processFile } = require("../fileParser"); // uses your fileParser.js & gemini.js

router.post("/generate-schedule", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const results = {};

    for (const file of req.files) {
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
