const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { generateIndexFromText } = require("./gemini");

async function extractText(filePath, mimetype) {
  let text = "";

  if (mimetype === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    text = data.text;
  }

  else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  }

  else if (mimetype === "text/plain") {
    text = fs.readFileSync(filePath, "utf-8");
  }

  return text;
}

async function processFile(file) {
  const text = await extractText(file.path, file.mimetype);

  const structuredNotes = await generateIndexFromText(text);

  fs.unlinkSync(file.path); // delete temp upload

  return structuredNotes;
}

async function extractTextFromFiles(files) {
  let combinedText = "";

  for (const file of files) {
    const text = await extractText(file.path, file.mimetype);
    combinedText += "\n\n" + text;

    fs.unlinkSync(file.path); // delete temp upload
  }

  return combinedText;
}


module.exports = { processFile, extractTextFromFiles };
