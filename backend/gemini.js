const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

async function generateIndexFromText(textContent) {
  try {
    const prompt = `
You are an expert academic content organizer.

Return ONLY valid JSON.
Do NOT add markdown.
Do NOT add explanations.
Do NOT add text before or after JSON.

Structure strictly like:

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
    let text = response.text().trim();

    // 🔥 Remove accidental markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 🔥 Extract JSON block safely
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No valid JSON found in response");
    }

    let jsonString = text.substring(firstBrace, lastBrace + 1);

    // 🔥 Remove trailing commas (common LLM mistake)
    jsonString = jsonString.replace(/,\s*}/g, "}");
    jsonString = jsonString.replace(/,\s*]/g, "]");

    const parsed = JSON.parse(jsonString);

    return parsed;

  } catch (error) {
    console.error("🔥 FULL RAW ERROR:", error);
    throw new Error("Gemini content generation failed");
  }
}

async function generateScheduleFromText(textContent, startDate, examDate, subject) {
  try {
   const prompt = `
You are an expert study planner.

Create a DAY-WISE STUDY SCHEDULE in STRICT JSON format.

IMPORTANT RULES:
1. Return ONLY valid JSON. Do NOT include markdown, headings, explanations, or any extra text.
2. Keys must be dates in YYYY-MM-DD format, starting from ${startDate} to ${examDate}.
3. Values must be plain strings describing the study tasks for that day.
4. Do NOT group by chapters or create nested objects.
5. Do NOT return arrays.
6. Each day should have clear, concise study tasks.
7. JSON must be directly parseable with JSON.parse().

Example output:
{
  "2026-02-03": "Overview of IoT: Definition, key components, what is IoE, difference between IoE and IoT.",
  "2026-02-04": "Evolution of IoT: Phases, characteristics, examples."
}

Subject: ${subject}

Study Material:
${textContent}
`;




    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // 🔥 Remove accidental markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 🔥 Extract JSON block safely
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No valid JSON found in response");
    }

    let jsonString = text.substring(firstBrace, lastBrace + 1);

    // 🔥 Remove trailing commas (common LLM mistake)
    jsonString = jsonString.replace(/,\s*}/g, "}");
    jsonString = jsonString.replace(/,\s*]/g, "]");

    const parsed = JSON.parse(jsonString);

    return parsed;

  } catch (error) {
    console.error("🔥 FULL RAW ERROR:", error);
    throw new Error("Gemini content generation failed");
  }
}
module.exports = { generateIndexFromText, generateScheduleFromText };
