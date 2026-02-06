const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractTextFromFiles(files) {
  let combinedText = "";

  for (const file of files) {
    const filePath = file.path;

    try {
      // PDF
      if (file.mimetype === "application/pdf") {
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        combinedText += "\n" + data.text;
      }

      // DOCX
      else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ path: filePath });
        combinedText += "\n" + result.value;
      }

      // TXT
      else if (file.mimetype === "text/plain") {
        const text = fs.readFileSync(filePath, "utf-8");
        combinedText += "\n" + text;
      }

      else {
        console.log("Unsupported file type:", file.mimetype);
      }
    } catch (err) {
      console.error("Error parsing file:", file.originalname, err.message);
    }

    // Delete uploaded temp file
    fs.unlinkSync(filePath);
  }

  return combinedText.trim();
}

module.exports = { extractTextFromFiles };
