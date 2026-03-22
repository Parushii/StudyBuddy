require("dotenv").config();

const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const QuizResult = require("../models/QuizResult");
const StudentProgress = require("../models/StudentProgress");
const LearningPath = require("../models/LearningPath");

const calculateStreak = require("../utils/calculateStreak");

// ================= GEMINI SETUP =================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const gemini = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

// ================= HELPERS =================

// Clean markdown
function cleanJSON(text) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

// Safe JSON parse
function safeParseJSON(text) {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\[.*\]/s);
        if (match) return JSON.parse(match[0]);
        throw new Error("Invalid JSON from AI");
    }
}

// ================= STUDENT INSIGHTS =================

async function getStudentInsights(userId) {
    const quizResults = await QuizResult.find({ userId });
    const progress = await StudentProgress.find({ userId });

    const quizAccuracy =
        quizResults.length > 0
            ? quizResults.reduce((sum, q) => sum + q.percentage, 0) /
            quizResults.length
            : 0;

    const subjectMap = {};

    progress.forEach((p) => {
        if (!subjectMap[p.subject]) {
            subjectMap[p.subject] = { score: 0, count: 0 };
        }
        subjectMap[p.subject].score += p.lastQuizScore || 0;
        subjectMap[p.subject].count += 1;
    });

    let weakSubject = "None";
    let minScore = Infinity;

    Object.keys(subjectMap).forEach((sub) => {
        const avg =
            subjectMap[sub].count > 0
                ? subjectMap[sub].score / subjectMap[sub].count
                : 0;

        if (avg < minScore) {
            minScore = avg;
            weakSubject = sub;
        }
    });

    const studyTime =
        progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60;

    let correct = 0,
        wrong = 0;

    progress.forEach((p) => {
        correct += p.flashcardCorrect || 0;
        wrong += p.flashcardWrong || 0;
    });

    const flashcardAccuracy =
        correct + wrong > 0 ? (correct / (correct + wrong)) * 100 : 0;

    const streak = await calculateStreak(userId);

    return {
        quizAccuracy: Math.round(quizAccuracy),
        weakSubject,
        studyTime: Math.round(studyTime),
        flashcardAccuracy: Math.round(flashcardAccuracy),
        streak,
    };
}

// ================= WEAK TOPICS =================

function getWeakTopics(progress) {
    return progress
        .map((p) => {
            if (!p.topicTitle || p.topicTitle.toLowerCase() === "quiz" || p.topicTitle.toLowerCase() === "flashcard")
                return null;

            const accuracy = p.lastQuizScore || 0;
            let weaknessScore = 0;
            let reasons = [];

            if (accuracy < 50) {
                weaknessScore += 3;
                reasons.push("low_score");
            } else if (accuracy < 70) {
                weaknessScore += 2;
                reasons.push("moderate_score");
            }

            if ((p.flashcardCorrect + p.flashcardWrong) === 0) {
                weaknessScore += 2;
                reasons.push("no_revision");
            }

            if (p.timeSpent < 20) {
                weaknessScore += 1;
                reasons.push("low_time");
            }

            const daysSinceLastVisit = Math.floor(
                (Date.now() - new Date(p.lastVisited)) /
                (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastVisit > 3) {
                weaknessScore += 2;
                reasons.push("forgotten");
            }

            return {
                subject: p.subject,
                topic: p.topicTitle || "Unknown Topic",
                score: accuracy,
                weaknessScore,
                reasons,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.weaknessScore - a.weaknessScore)
        .slice(0, 3);
}

// ================= GEMINI =================

async function generatePathWithAI(studentData, weakTopics) {
    const prompt = `
You are an AI tutor.

Student Overall Stats:
- Quiz Accuracy: ${studentData.quizAccuracy}%
- Study Time: ${studentData.studyTime} mins
- Streak: ${studentData.streak}

Weak Topics:
${weakTopics.length > 0
            ? weakTopics
                .map(
                    (t) => `
- ${t.subject} → ${t.topic}
  Score: ${t.score}
  Reasons: ${t.reasons.join(", ")}
`
                )
                .join("\n")
            : "No weak topics found"
        }

Rules:
- Focus ONLY on weak topics
- Start with revision
- Then practice
- Then quiz
- Keep 3–6 steps
- Make steps specific

Return ONLY JSON array:
[
  {
    "step": 1,
    "title": "Revise topic",
    "type": "flashcard",
  }
]
`;

    try {
        const result = await gemini.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        console.log("🤖 Gemini:", rawText);

        const cleaned = cleanJSON(rawText);
        return safeParseJSON(cleaned);
    } catch (err) {
        console.error("❌ Gemini Error:", err);

        return [
            { step: 1, title: "Revise weak topics", type: "read", duration: 15 },
            {
                step: 2,
                title: "Practice flashcards",
                type: "flashcard",
                duration: 10,
            },
            { step: 3, title: "Attempt quiz", type: "quiz", duration: 15 },
        ];
    }
}

// ================= GENERATE PATH =================

router.post("/generate", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "UserId required" });
        }

        const studentData = await getStudentInsights(userId);
        const progress = await StudentProgress.find({ userId });

        const weakTopics = getWeakTopics(progress);

        console.log("🔥 Weak Topics:", weakTopics);

        const steps = await generatePathWithAI(studentData, weakTopics);

        // deactivate old paths
        await LearningPath.updateMany(
            { userId, status: "active" },
            { status: "archived" }
        );

        const formattedSteps = steps.map((s, i) => ({
            title: s.title || `Step ${i + 1}`,
            type: s.type || "read",
            topic: weakTopics[i]?.topic || "general", 
            duration: s.duration || 10,
            completed: false,
            reason: weakTopics[i]?.reasons?.join(", ") || ""
        }));

        const newPath = new LearningPath({
            userId,
            steps: formattedSteps,
            status: "active",
        });

        await newPath.save();

        res.json(newPath);
    } catch (err) {
        console.error("❌ Generate Error:", err);
        res.status(500).json({ error: "Failed to generate path" });
    }
});

// ================= TEST ROUTES =================

router.get("/path/test-gemini", async (req, res) => {
    try {
        const result = await gemini.generateContent(
            "Return JSON: [{\"step\":1}]"
        );
        const response = await result.response;
        res.send(response.text());
    } catch {
        res.status(500).send("Gemini failed");
    }
});

router.get("/test-insights/:userId", async (req, res) => {
    const data = await getStudentInsights(req.params.userId);
    res.json(data);
});

// ================= GET PATH =================

router.get("/path/:userId", async (req, res) => {
    try {
        const path = await LearningPath.findOne({
            userId: req.params.userId,
            status: "active",
        });

        if (!path) {
            return res.status(404).json({ message: "No path found" });
        }

        res.json(path);
    } catch {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// ================= COMPLETE STEP =================

router.put("/path/complete-step", async (req, res) => {
    try {
        const { pathId, stepIndex } = req.body;

        const path = await LearningPath.findById(pathId);

        if (!path) {
            return res.status(404).json({ error: "Not found" });
        }

        path.steps[stepIndex].completed = true;

        if (path.steps.every((s) => s.completed)) {
            path.status = "completed";
        }

        await path.save();

        res.json(path);
    } catch {
        res.status(500).json({ error: "Update failed" });
    }
});

module.exports = router;