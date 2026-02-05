const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { findOrCreateFolder, fetchDriveTree, drive } = require("../services/drive");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload and classify files
router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files uploaded" });

    const results = [];
    const rootFolder = await findOrCreateFolder("StudyBuddyAI");

    for (const file of req.files) {
      const filePath = file.path;

      try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath), file.originalname);

        const classifyRes = await axios.post("http://127.0.0.1:8000/classify", formData, { headers: formData.getHeaders() });
        const { subject: predictedSubject, unit: predictedUnit } = classifyRes.data;

        if (!predictedSubject || !predictedUnit) {
          fs.unlinkSync(filePath);
          results.push({ file: file.originalname, status: "skipped", reason: "Could not classify file" });
          continue;
        }
        console.log("📘 Classified File:", file.originalname);
console.log("➡️ Subject:", predictedSubject);
console.log("➡️ Unit:", predictedUnit);

        const subjectFolder = await findOrCreateFolder(predictedSubject, rootFolder);
        const unitFolder = await findOrCreateFolder(predictedUnit, subjectFolder);

        c// ---- Duplicate check ----
  const existingFile = await drive.files.list({
    q: `'${unitFolder}' in parents and name='${file.originalname}' and trashed=false`,
    fields: "files(id, name)",
  });
console.log("Checking for duplicates:", file.originalname, "in folder", unitFolder);

  if (existingFile.data.files.length > 0) {
    return { status: "failed", reason: "File already exists" };
  }
        const uploadedFileId = await require("../services/drive").uploadFile(filePath, file.originalname, unitFolder);
        fs.unlinkSync(filePath);

        results.push({
          file: file.originalname,
          status: "success",
          subject: predictedSubject,
          unit: predictedUnit,
          link: `https://drive.google.com/file/d/${uploadedFileId}/view`
        });
      } catch (fileErr) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        results.push({ file: file.originalname, status: "failed", reason: "Processing error" });
      }
    }

    res.json({ message: "Upload completed", results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get drive structure
router.get("/structure", async (req, res) => {
  try {
    const rootRes = await drive.files.list({
      q: "name='StudyBuddyAI' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id)"
    });

    if (rootRes.data.files.length === 0) return res.json([]);

    const rootFolderId = rootRes.data.files[0].id;
    const subjectsRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)"
    });

    const structure = [];
    for (const folder of subjectsRes.data.files) {
      structure.push({ subject: folder.name, children: await fetchDriveTree(folder.id) });
    }

    res.json(structure);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch drive structure" });
  }
});

module.exports = router;
