const TextbookChunk = require("../models/TextbookChunk");
const { chunkText, cleanText } = require("../utils/chunking");
const { getEmbedding } = require("./embeddingService");
const { cosineSimilarity } = require("./similarityService");
async function processTextbook(text, fileName) {

    const cleaned = cleanText(text);
const chunks = chunkText(cleaned);

    console.log("📦 Total chunks:", chunks.length);

    let page = 1;

    for (const chunk of chunks) {
        try {
            if (!chunk || chunk.length < 50) continue;

            const embedding = await getEmbedding(chunk);

            await TextbookChunk.create({
                text: chunk,
                embedding,
                fileName,
                page
            });

            page++;

        } catch (err) {
            console.error("❌ Chunk failed:", err.message);
        }
    }

    console.log("✅ Done processing");
}
async function findRelevantChunks(queryEmbedding, queryText) {

    const chunks = await TextbookChunk.find();

    const scored = chunks.map(chunk => {

    const semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);

    // 🔥 keyword match
    const keywordScore = chunk.text.toLowerCase().includes(queryText.toLowerCase())
        ? 0.3
        : 0;

    // 🔥 phrase boost
    const importantPhrases = [
        "core properties",
        "ubicom systems",
        "properties of"
    ];

    let phraseBoost = 0;

    for (let phrase of importantPhrases) {
        if (chunk.text.toLowerCase().includes(phrase)) {
            phraseBoost += 0.2;
        }
    }

    return {
        ...chunk.toObject(),
        score: semanticScore + keywordScore + phraseBoost
    };
});

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 7);
}
module.exports = {
    processTextbook,
    findRelevantChunks
};