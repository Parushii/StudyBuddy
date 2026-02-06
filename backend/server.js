require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const { extractTextFromFiles } = require("./fileParser");
const { generateIndexFromText } = require("./gemini");
const app = express();
const upload = multer({ dest: "uploads/" });
const uploadMultiple = multer({ dest: "uploads/" });
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8000"] }));
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.use("/api/auth", authRoutes);

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oAuth2Client });

async function findOrCreateFolder(name, parentId = null) {
  const query = `'${parentId || "root"}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await drive.files.list({ q: query, fields: "files(id, name)" });
  if (res.data.files.length > 0) return res.data.files[0].id;
  const folderMetadata = { name, mimeType: "application/vnd.google-apps.folder" };
  if (parentId) folderMetadata.parents = [parentId];
  const folder = await drive.files.create({ resource: folderMetadata, fields: "id" });
  return folder.data.id;
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), req.file.originalname);
    const classifyRes = await axios.post("http://127.0.0.1:8000/classify", formData, { headers: formData.getHeaders() });
    const { subject: predictedSubject, unit: predictedUnit } = classifyRes.data;
    const rootFolder = await findOrCreateFolder("StudyBuddyAI");
    const subjectFolder = await findOrCreateFolder(predictedSubject, rootFolder);
    const unitFolder = await findOrCreateFolder(predictedUnit, subjectFolder);
    const existingFile = await drive.files.list({
      q: `'${unitFolder}' in parents and name='${req.file.originalname}' and trashed=false`,
      fields: "files(id, name)"
    });
    if (existingFile.data.files.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "File already exists in this folder.", fileName: req.file.originalname });
    }
    const fileMetadata = { name: req.file.originalname, parents: [unitFolder] };
    const media = { mimeType: req.file.mimetype, body: fs.createReadStream(filePath) };
    const file = await drive.files.create({ resource: fileMetadata, media, fields: "id" });
    fs.unlinkSync(filePath);
    const link = `https://drive.google.com/file/d/${file.data.id}/view`;
    res.json({ message: "File uploaded successfully", link, subject: predictedSubject, unit: predictedUnit });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

async function fetchDriveTree(parentId) {
  const res = await drive.files.list({ q: `'${parentId}' in parents and trashed=false`, fields: "files(id, name, mimeType)" });
  const items = [];
  for (const file of res.data.files) {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      items.push({ id: file.id, name: file.name, type: "folder", children: await fetchDriveTree(file.id) });
    } else {
      items.push({ id: file.id, name: file.name, type: "file", mimeType: file.mimeType, link: `https://drive.google.com/file/d/${file.id}/view` });
    }
  }
  return items;
}

app.get("/drive-structure", async (req, res) => {
  try {
    const rootRes = await drive.files.list({
      q: "name='StudyBuddyAI' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id, name)"
    });
    if (rootRes.data.files.length === 0) return res.json([]);
    const structure = [];
    for (const subject of rootRes.data.files) {
      structure.push({ subject: subject.name, children: await fetchDriveTree(subject.id) });
    }
    res.json(structure);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drive structure" });
  }
});

app.post("/summarize", async (req, res) => {
  const { notes } = req.body;
  if (!notes || notes.trim() === "") return res.status(400).json({ error: "No notes provided" });
  try {
    const response = await axios.post("http://localhost:5001/api/summarize", { text: notes });
    res.json({ summary: response.data.summary });
  } catch (error) {
    res.status(500).json({ error: "Failed to summarize text" });
  }
});

app.post("/generate-index", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log("📂 Files received:", req.files.length);

    // 1️⃣ Extract text from uploaded files
    const combinedText = await extractTextFromFiles(req.files);

    if (!combinedText || combinedText.trim() === "") {
      return res.status(400).json({ error: "No readable text found in files" });
    }

    // 2️⃣ Send to Gemini
    const structuredContent = await generateIndexFromText(combinedText);

    // 3️⃣ Send structured JSON back to frontend
    res.json(structuredContent);

  } catch (error) {
    console.error("🔥 FULL ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});


app.listen(process.env.PORT, () => console.log(`🚀 Server running on http://localhost:${process.env.PORT}`));
