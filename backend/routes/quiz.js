const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const JSZip = require("jszip");
const WordExtractor = require("word-extractor");
const Quiz = require("../models/Quiz");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const GEMINI_QUIZ_MODEL = "gemini-2.5-flash-lite";

function decodeXmlEntities(value) {
  if (!value) return "";
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

async function extractPptxText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter(
      (name) =>
        name.startsWith("ppt/slides/slide") && name.toLowerCase().endsWith(".xml")
    )
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const slideTexts = [];
  const textRegex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;

  for (const slide of slideFiles) {
    const xml = await zip.file(slide).async("string");
    let match;
    while ((match = textRegex.exec(xml))) {
      slideTexts.push(decodeXmlEntities(match[1]));
    }
  }

  return slideTexts.join("\n");
}

async function extractText(filePath, mimetype) {
  let text = "";

  if (mimetype === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    text = data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  } else if (mimetype === "application/msword") {
    const extractor = new WordExtractor();
    const doc = await extractor.extract(filePath);
    text = doc.getBody();
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    text = await extractPptxText(filePath);
  } else if (mimetype === "text/plain") {
    text = fs.readFileSync(filePath, "utf-8");
  }

  return text;
}


function extractJsonArray(text) {
  if (!text) return null;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] || text;
  const match = candidate.match(/\[[\s\S]*\]/);
  return match ? match[0] : null;
}

function normalizeQuizArray(value) {
  if (!Array.isArray(value)) return null;

  const quiz = value
    .map((q) => {
      const question = q?.question ?? q?.q;
      const options = Array.isArray(q?.options) ? q.options : q?.choices;
      const answerIndex =
        Number.isInteger(q?.answer) ? q.answer : Number.isInteger(q?.answerIndex) ? q.answerIndex : null;
      const answerText = typeof q?.answer === "string" ? q.answer : null;

      if (!question || !Array.isArray(options)) return null;

      const normalizedOptions = options.map((opt) => String(opt)).slice(0, 4);
      if (normalizedOptions.length < 2) return null;

      let normalizedAnswer = answerIndex;
      if (normalizedAnswer == null && answerText) {
        normalizedAnswer = normalizedOptions.findIndex(
          (opt) => opt.toLowerCase() === answerText.toLowerCase()
        );
      }

      if (normalizedAnswer == null || normalizedAnswer < 0 || normalizedAnswer >= normalizedOptions.length) {
        return null;
      }

      return {
        question: String(question),
        options: normalizedOptions,
        answer: normalizedAnswer,
      };
    })
    .filter(Boolean);

  if (quiz.length < 5) return null;
  return quiz.slice(0, 5);
}

async function generateQuizFromText(text) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `Create a quiz from the study material below.

Return ONLY a JSON array of EXACTLY 5 objects with this format:
{
  "question": "string",
  "options": ["option A", "option B", "option C", "option D"],
  "answer": 0
}

Rules:
- Use exactly 4 options per question.
- "answer" is the zero-based index of the correct option.
- The correct answer must be supported by the provided material.
- Do NOT include any extra text or markdown.

Study material:
${text}`;

  const geminiResponse = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_QUIZ_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
    throw new Error("Model did not return a JSON array");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonArrayText);
  } catch {
    throw new Error("Returned JSON was not valid");
  }

  const quiz = normalizeQuizArray(parsed);
  if (!quiz) {
    throw new Error("JSON parsed, but did not match expected format");
  }

  return quiz;
}

router.post("/generate-quiz", async (req, res) => {
  try {
    const { text } = req.body || {};

    if (!text || String(text).trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    const trimmed = String(text).trim();
    const quiz = await generateQuizFromText(trimmed);
    return res.json({ quiz, model: GEMINI_QUIZ_MODEL });
  } catch (error) {
    console.error("Quiz Error:", error.message || error);
    return res.status(500).json({
      error: "Failed to generate quiz",
      details: error.message,
    });
  }
});
router.post("/generate/:notebookId", async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { text, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

    // Generate from AI
    const generated = await generateQuizFromText(text);

    // REPLACE existing quiz
    const quiz = await Quiz.findOneAndUpdate(
      { notebookId },
      {
        userId,
        notebookId,
        questions: generated,
      },
      { upsert: true, new: true }
    );

    res.json(quiz);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});


router.post("/generate-quiz-file", upload.single("file"), async (req, res) => {
  let tempPath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
    ]);

    if (!allowedTypes.has(req.file.mimetype)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    tempPath = req.file.path;
    const text = await extractText(req.file.path, req.file.mimetype);
    const trimmed = String(text || "").trim();

    if (!trimmed) {
      return res.status(400).json({ error: "File contains no readable text" });
    }

    const quiz = await generateQuizFromText(trimmed);
    return res.json({ quiz, model: GEMINI_QUIZ_MODEL });
  } catch (error) {
    console.error("Quiz File Error:", error.message || error);
    return res.status(500).json({
      error: "Failed to generate quiz",
      details: error.message,
    });
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
});

router.get("/:notebookId", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      notebookId: req.params.notebookId,
    });

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});


module.exports = router;
