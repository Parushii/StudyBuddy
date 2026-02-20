const express = require("express");
const axios = require("axios");
const FlashcardSet = require("../models/Flashcard");
const router = express.Router();

// Gemini text model to use (must be present in ListModels for your key)
const GEMINI_FLASHCARDS_MODEL = "gemini-2.5-flash";

function extractJsonArray(text) {
  if (!text) return null;

  // Handle ```json ... ``` or ``` ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] || text;

  // Find the first JSON array in the text
  const match = candidate.match(/\[[\s\S]*\]/);
  return match ? match[0] : null;
}

function normalizeFlashcardsArray(value) {
  if (!Array.isArray(value)) return null;
  const cards = value
    .map((c) => {
      const question = c?.question ?? c?.q;
      const answer = c?.answer ?? c?.a;
      if (!question || !answer) return null;
      return { question: String(question), answer: String(answer) };
    })
    .filter(Boolean);
  return cards.length ? cards : null;
}

// Flashcards generation endpoint
router.post("/generate-flashcards", async (req, res) => {
  const { paragraph } = req.body;

  if (!paragraph || paragraph.trim() === "") {
    return res.status(400).json({ error: "No paragraph provided" });
  }

  // if (paragraph.length > 5000) {
  //   return res
  //     .status(400)
  //     .json({ error: "Text is too long. Please limit to 5000 characters." });
  // }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const prompt = `Create flashcards from the following paragraph.

Return ONLY a JSON array of objects with these fields:
  - question (string)
  - answer (string)

Generate 5-10 flashcards.
Do NOT wrap the JSON in markdown fences.
Do NOT include any explanation or extra text.

Paragraph: ${paragraph}`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_FLASHCARDS_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const content =
      geminiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonArrayText = extractJsonArray(content);
    if (!jsonArrayText) {
      return res.status(500).json({
        error: "Failed to generate flashcards",
        details: "Model did not return a JSON array.",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonArrayText);
    } catch {
      return res.status(500).json({
        error: "Failed to generate flashcards",
        details: "Returned JSON was not valid.",
      });
    }

    const flashcards = normalizeFlashcardsArray(parsed);
    if (!flashcards) {
      return res.status(500).json({
        error: "Failed to generate flashcards",
        details: "JSON parsed, but did not match expected format.",
      });
    }

    return res.json({ flashcards, model: GEMINI_FLASHCARDS_MODEL });
  } catch (error) {
    console.error("Flashcards Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to generate flashcards",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});


/* SAVE FLASHCARDS */
router.post("/", async (req, res) => {
  try {
    const { userId, notebookId, cards } = req.body;

    const updated = await FlashcardSet.findOneAndUpdate(
      { notebookId }, // find existing set
      {
        userId,
        notebookId,
        cards
      },
      { upsert: true, new: true } // create if not exists
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to save flashcards" });
  }
});


/* GET FLASHCARDS BY NOTEBOOK */
router.get("/:notebookId", async (req, res) => {
  try {
    const flashcards = await FlashcardSet.findOne({
      notebookId: req.params.notebookId
    });

    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});



module.exports = router;
