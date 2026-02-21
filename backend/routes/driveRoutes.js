const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const {
  drive,
  findOrCreateFolder,
  fetchDriveTree,
} = require("../services/drive");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * MULTI FILE UPLOAD
 */
router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];
    const rootFolder = await findOrCreateFolder("StudyBuddyAI");

    for (const file of req.files) {
      const filePath = file.path;

      try {
        const formData = new FormData();
        formData.append(
          "file",
          fs.createReadStream(filePath),
          file.originalname
        );

        const classifyRes = await axios.post(
  "http://127.0.0.1:8000/classify",
  formData,
  { headers: formData.getHeaders() }
);

        const { subject: predictedSubject, unit: predictedUnit } =
          classifyRes.data;

        console.log("📘 Classified File:", file.originalname);
        console.log("➡️ Subject:", predictedSubject);
        console.log("➡️ Unit:", predictedUnit);

        const subjectFolder = await findOrCreateFolder(
          predictedSubject,
          rootFolder
        );
        const unitFolder = await findOrCreateFolder(
          predictedUnit,
          subjectFolder
        );

        // ---- DUPLICATE CHECK (UNCHANGED LOGIC) ----
        const existingFile = await drive.files.list({
          q: `'${unitFolder}' in parents and name='${file.originalname}' and trashed=false`,
          fields: "files(id, name)",
        });

        if (existingFile.data.files.length > 0) {
          fs.unlinkSync(filePath);
          results.push({
            file: file.originalname,
            status: "failed",
            reason: "File already exists in this folder",
          });
          continue;
        }

        // ---- UPLOAD ----
        const fileMetadata = {
          name: file.originalname,
          parents: [unitFolder],
        };

        const media = {
          mimeType: file.mimetype,
          body: fs.createReadStream(filePath),
        };

        const uploadedFile = await drive.files.create({
          resource: fileMetadata,
          media,
          fields: "id",
        });

        fs.unlinkSync(filePath);

        results.push({
          file: file.originalname,
          status: "success",
          subject: predictedSubject,
          unit: predictedUnit,
          link: `https://drive.google.com/file/d/${uploadedFile.data.id}/view`,
        });
      } catch (fileErr) {
        console.error("========== FILE ERROR ==========");
  console.error("File:", file.originalname);
  console.error("Message:", fileErr.message);
  console.error("Stack:", fileErr.stack);
  console.error("Response:", fileErr.response?.data);
  console.error("================================");

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        results.push({
          file: file.originalname,
          status: "failed",
          reason: "Processing error",
        });
      }
    }

    res.json({
      message: "Upload completed",
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/**
 * DRIVE STRUCTURE (unchanged)
 */
router.get("/drive-structure", async (req, res) => {
  try {
    // 1️⃣ Find StudyBuddyAI root folder
    const rootRes = await drive.files.list({
      q: "name='StudyBuddyAI' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id)",
    });

    if (rootRes.data.files.length === 0) {
      return res.json([]);
    }

    const studyBuddyRootId = rootRes.data.files[0].id;

    // 2️⃣ Fetch ONLY folders inside StudyBuddyAI (subjects)
    const subjectsRes = await drive.files.list({
      q: `'${studyBuddyRootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    const structure = [];

    // 3️⃣ For each subject, fetch its children
    for (const subjectFolder of subjectsRes.data.files) {
      structure.push({
        subject: subjectFolder.name,
        children: await fetchDriveTree(subjectFolder.id),
      });
    }

    res.json(structure);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch drive structure" });
  }
});


module.exports = router;
