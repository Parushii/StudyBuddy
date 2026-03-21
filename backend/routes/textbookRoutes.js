const express = require("express");
const router = express.Router();
const multer = require("multer");
const TextbookChunk = require("../models/TextbookChunk");
const upload = multer({ dest: "uploads/" });
const { processTextbook, findRelevantChunks } = require("../services/processTextbook");
const { getEmbedding } = require("../services/embeddingService");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const gemini = require("../gemini");
console.log(typeof processTextbook);
console.log(typeof findRelevantChunks);
// Upload textbook
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);

        const pdfData = await pdfParse(dataBuffer);
        console.log(pdfData.text.slice(0, 500));
        await processTextbook(pdfData.text, req.file.originalname);

        res.json({ message: "Textbook processed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});


router.delete("/delete-all", async (req, res) => {
    try {
        await TextbookChunk.deleteMany({});
        res.json({ message: "All textbook chunks deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ask question
router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        const queryEmbedding = await getEmbedding(question);

        const chunks = await findRelevantChunks(queryEmbedding, question);
        console.log("Top chunks:", chunks);
        const context = chunks.map(c => c.text).join("\n\n");

const prompt = `
You are a helpful teacher.

Answer ONLY from the given context.
If the exact answer exists, DO NOT guess. Also if the answer exists, you can use your own knowledge to make it simple, just ensure that you keep the keywords and language similar to the given context.

Explain in simple words, and elaborate in around 1000 words more based on the given context's language only. Keep the flow cohesive.

Context:
${context}

Question:
${question}
`;

        const answer = await gemini.generateWithGemini(prompt);

        res.json({
            answer,
            sources: chunks.map(c => ({
                page: c.page,
                file: c.fileName
            })),
            debug_context: chunks.map(c => c.text) // 🔥 for verification
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Query failed" });
    }
});

module.exports = router;