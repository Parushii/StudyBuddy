const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Using the working model from your logs
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

async function generateIndexFromText(textContent) {
  try {
    const prompt = `
You are an expert academic content organizer.

Convert the following study material into a STRICTLY VALID JSON format.

Rules:
1. Group content into Chapters.
2. Each Chapter must contain Topics.
3. Each Topic must contain a detailed explanation.
4. Keep explanations clear, structured, and exam-ready.
5. Return ONLY valid JSON.
6. Do NOT include markdown.
7. Do NOT include backticks.
8. Do NOT add any text outside JSON.

Format example:

{
  "Chapter 1: Chapter Name": {
    "Topic Name": "Detailed explanation..."
  }
}

Study Material:
${textContent}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 🔥 Clean accidental markdown if model adds it
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // ✅ Try parsing
    const parsed = JSON.parse(text);

    return parsed;
  } catch (error) {
    console.error("🔥 FULL ERROR:", error.message);

    if (error.response) {
      console.error("🔥 RESPONSE ERROR:", error.response.data);
    }

    throw new Error("Gemini content generation failed");
  }
}

module.exports = { generateIndexFromText };
