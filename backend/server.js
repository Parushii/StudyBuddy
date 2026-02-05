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
const driveRoutes = require("./routes/driveRoutes");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8000"] }));
app.use(express.json());
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("MongoDB error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/drive", driveRoutes); 



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

app.listen(process.env.PORT, () => console.log(`🚀 Server running on http://localhost:${process.env.PORT}`));
