const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { processFile } = require("../fileParser"); // uses your fileParser.js & gemini.js
const downloadDriveFile = require("../services/downloadDriveFile");
const Notebook = require("../models/Notebook");
const Highlights = require("../models/Highlights");
const { generateIndexFromText } = require("../gemini"); // your AI function
const mongoose = require("mongoose");

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


router.post("/generate/:notebookId", async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { userId } = req.body;

    const notebook = await Notebook.findById(notebookId);

    if (!notebook) {
      return res.status(404).json({ error: "Notebook not found" });
    }

    let fileGroups = [];

    for (const file of notebook.sourceFiles) {
      if (!file.extractedText?.trim()) continue;

      console.log("Generating highlights for:", file.name);

      const rawChapters = await generateIndexFromText(
        file.extractedText
      );

      if (!rawChapters || typeof rawChapters !== "object") continue;

      const formattedChapters = Object.entries(rawChapters).map(
        ([chapterTitle, topicsObj]) => ({
          chapterTitle,
          topics:
            topicsObj && typeof topicsObj === "object"
              ? Object.entries(topicsObj).map(
                  ([topicTitle, content]) => ({
                    topicTitle,
                    content,
                  })
                )
              : [],
        })
      );

      fileGroups.push({
        fileName: file.name,
        chapters: formattedChapters,
      });
    }

    console.log("Final structured file groups:", fileGroups);

    const highlights = await Highlights.findOneAndUpdate(
      { notebookId: new mongoose.Types.ObjectId(notebookId) },
      {
        userId,
        notebookId: new mongoose.Types.ObjectId(notebookId),
        chapters: fileGroups,
      },
      { upsert: true, new: true }
    );

    res.json(highlights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate highlights" });
  }
});



router.get("/:notebookId", async (req, res) => {
  const highlights = await Highlights.findOne({
    notebookId: new mongoose.Types.ObjectId(req.params.notebookId),
  });

  res.json(highlights);
});


module.exports = router;
