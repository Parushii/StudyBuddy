const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const textract = require("textract");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const downloadDriveFile = require("../services/downloadDriveFile");

router.post("/extract-text", upload.array("files"), async (req, res) => {
  try {
    let combinedText = "";

    /* ===============================
       1️⃣ HANDLE UPLOADED FILES
    =============================== */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const ext = file.originalname.split(".").pop().toLowerCase();
        let text = "";

        if (ext === "pdf") {
          const data = await pdf(fs.readFileSync(file.path));
          text = data.text;

        } else if (ext === "docx") {
          const result = await mammoth.extractRawText({ path: file.path });
          text = result.value;

        } else if (ext === "txt") {
          text = fs.readFileSync(file.path, "utf-8");

        } else {
          text = await new Promise((resolve, reject) => {
            textract.fromFileWithPath(file.path, (err, text) => {
              if (err) reject(err);
              else resolve(text);
            });
          });
        }

        combinedText += `\n\n=== ${file.originalname} ===\n${text}`;
        fs.unlinkSync(file.path);
      }
    }

    /* ===============================
       2️⃣ HANDLE DRIVE FILES
    =============================== */
    if (req.body.driveFiles) {
      const driveFiles = JSON.parse(req.body.driveFiles);

      for (const file of driveFiles) {
        const tempPath = await downloadDriveFile(file.id, file.name);
        const ext = file.name.split(".").pop().toLowerCase();
        let text = "";

        if (ext === "pdf") {
          const data = await pdf(fs.readFileSync(tempPath));
          text = data.text;

        } else if (ext === "docx") {
          const result = await mammoth.extractRawText({ path: tempPath });
          text = result.value;

        } else if (ext === "txt") {
          text = fs.readFileSync(tempPath, "utf-8");

        } else {
          text = await new Promise((resolve, reject) => {
            textract.fromFileWithPath(tempPath, (err, text) => {
              if (err) reject(err);
              else resolve(text);
            });
          });
        }

        combinedText += `\n\n=== ${file.name} ===\n${text}`;
        fs.unlinkSync(tempPath);
      }
    }

    res.json({ text: combinedText });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

module.exports = router;
