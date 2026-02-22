const express = require("express");
const router = express.Router();
const Notebook = require("../models/Notebook");
const { searchYouTube } = require("../services/youtubeService");
const { generateWithGemini } = require("../gemini");

// POST /api/videos/recommend/:notebookId
router.post("/recommend/:notebookId", async (req, res) => {
  try {
    const { notebookId } = req.params;

    if (!notebookId) {
      return res.status(400).json({ message: "Notebook ID required" });
    }

    const notebook = await Notebook.findById(notebookId);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // 🔹 Combine extracted text
    let combinedText = "";

    notebook.sourceFiles.forEach((file) => {
      if (file.extractedText) {
        combinedText += file.extractedText + " ";
      }
    });

    if (!combinedText.trim()) {
      return res.json({
        message: "No extracted text found in notebook",
        videos: [],
      });
    }

    combinedText = combinedText.substring(0, 1500);

    // 🔹 Ask Gemini for 3 educational topics
    const prompt = `
From the following study material, extract 3 clear educational topics 
that can be used to search for YouTube lectures.

Return ONLY a JSON array like:
["Topic 1", "Topic 2", "Topic 3"]

Text:
${combinedText}
`;

    let topics = [];

    try {
      const geminiResponse = await generateWithGemini(prompt);
      console.log("Raw Gemini response:", geminiResponse);
      // Clean Gemini response (sometimes it wraps in ```json)
      const cleaned = geminiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      topics = JSON.parse(cleaned);
    } catch (err) {
      console.error("Gemini parsing error:", err);
      console.log("Gemini parsing failed. Using fallback topics.");
      topics = [
        "Natural Language Processing",
        "Machine Learning",
        "Concept Drift in AI"
      ];
    }

    console.log("Final Topics Used:", topics);

    // 🔹 Build YouTube queries
    const searchQueries = topics.map(topic => `${topic} lecture`);

    let allVideos = [];

    for (let query of searchQueries) {
      const videos = await searchYouTube(query);
      allVideos.push(...videos);
    }

    // 🔹 Remove duplicates
    const uniqueVideos = Array.from(
      new Map(allVideos.map(v => [v.videoId, v])).values()
    );

    res.json({
      message: "Videos fetched successfully",
      topicsUsed: topics,
      videos: uniqueVideos
    });

  } catch (error) {
    console.error("Video Recommendation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;