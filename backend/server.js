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
const driveRoutes = require("./routes/driveRoutes");
const generateNotesRoute = require("./routes/generateNotes");
const generateScheduleRoute = require("./routes/generateSchedule");
const youtubeSummarizerRoutes = require("./routes/youtubeSummarizer"); //
const flashcardsRoutes = require("./routes/flashcards"); //
const { generateIndexFromText, generateScheduleFromText } = require("./gemini");
const notebookRoutes = require("./routes/notebook");

const extracttextRoutes = require("./routes/extracttext"); 
const quizRoutes = require("./routes/quiz");
const videoRoutes = require("./routes/videoRoutes");
const app = express();
const upload = multer({ dest: "uploads/" });
const uploadMultiple = multer({ dest: "uploads/" });
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8000"] }));
app.use(express.json());

const dns = require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

mongoose
  .connect(process.env.MONGO_URI)
  .then((conn) => {
    console.log(`MongoDB Connected`);
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/drive", driveRoutes); 
app.use("/api/highlights", generateNotesRoute);
app.use("/api", generateScheduleRoute);
app.use("/api", extracttextRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/videos", videoRoutes);

//
app.use(youtubeSummarizerRoutes);
app.use("/api/flashcards", flashcardsRoutes);
app.use("/api/quiz", quizRoutes);

app.get("/version", (req, res) => {
  let pkg = {};
  try {
    // server.js lives in the same folder as package.json
    pkg = require("./package.json");
  } catch {
    pkg = {};
  }

  res.json({
    name: pkg.name || "studybuddy-backend",
    version: pkg.version || "unknown",
    node: process.version,
    express: pkg.dependencies?.express || "unknown",
    time: new Date().toISOString(),
    endpoints: [
      "GET /version",
      "POST /summarize-youtube",
      "POST /generate-flashcards",
      "POST /download-youtube-summary-pdf",
      "POST /download-youtube-summary-docx"
    ],
  });
});
//

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

app.post("/generate-schedule", upload.array("files"), async (req, res) => {
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
    const { startDate, examDate, subject } = req.body;

    const structuredContent = await generateScheduleFromText(
      combinedText,
      startDate,
      examDate,
      subject
    );

    // 3️⃣ Send structured JSON back to frontend
    res.json(structuredContent);

  } catch (error) {
    console.error("🔥 FULL ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});


app.listen(process.env.PORT, () => console.log(`🚀 Server running on http://localhost:${process.env.PORT}`));
