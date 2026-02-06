const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const textract = require("textract");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/extract-text", upload.array("files"), async (req, res) => {
  try {
    let combinedText = "";

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
        // fallback for other formats
        text = await new Promise((resolve, reject) => {
          textract.fromFileWithPath(file.path, (err, text) => {
            if (err) reject(err);
            else resolve(text);
          });
        });
      }

      combinedText += `\n\n=== ${file.originalname} ===\n${text}`;
      fs.unlinkSync(file.path); // cleanup
    }

    res.json({ text: combinedText });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

module.exports = router;
