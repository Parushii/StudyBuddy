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
    model: "gemini-2.5-flash-lite",
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

    // ================= QUIZ ACCURACY =================
    const quizAccuracy =
        quizResults.length > 0
            ? quizResults.reduce((sum, q) => sum + (q.percentage || 0), 0) /
            quizResults.length
            : 0;

    // ================= SUBJECT ANALYSIS =================
    const subjectMap = {};

    progress.forEach((p) => {
        const subject = p.subject?.trim().toLowerCase();
        if (!subject) return;

        if (!subjectMap[subject]) {
            subjectMap[subject] = {
                score: 0,
                count: 0,
                time: 0,
                correct: 0,
                wrong: 0,
            };
        }

        subjectMap[subject].score += p.lastQuizScore || 0;
        subjectMap[subject].count += p.lastQuizScore ? 1 : 0;
        subjectMap[subject].time += p.timeSpent || 0;
        subjectMap[subject].correct += p.flashcardCorrect || 0;
        subjectMap[subject].wrong += p.flashcardWrong || 0;
    });

    // ================= FIND WEAK SUBJECT =================
    let weakSubject = null;
    let worstScore = -Infinity;

    Object.keys(subjectMap).forEach((sub) => {
        const data = subjectMap[sub];

        const avgScore =
            data.count > 0 ? data.score / data.count : 50;

        const totalFlash = data.correct + data.wrong;
        const flashAcc =
            totalFlash > 0 ? (data.correct / totalFlash) * 100 : 50;

        const hours = data.time / 3600;

        // COMBINED WEAKNESS SCORE (LOW = BAD)
        const combinedScore =
            avgScore * 0.5 + flashAcc * 0.3 + Math.min(hours * 10, 20);

        if (combinedScore < worstScore || weakSubject === null) {
            worstScore = combinedScore;
            weakSubject = sub;
        }
    });

    if (!weakSubject) weakSubject = "general";

    // ================= STUDY TIME =================
    const studyTime =
        progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60;

    // ================= FLASHCARD =================
    let correct = 0,
        wrong = 0;

    progress.forEach((p) => {
        correct += p.flashcardCorrect || 0;
        wrong += p.flashcardWrong || 0;
    });

    const flashcardAccuracy =
        correct + wrong > 0 ? (correct / (correct + wrong)) * 100 : 0;

    // ================= STREAK =================
    const streak = await calculateStreak(userId);

    console.log("📊 Subject Map:", subjectMap);
    console.log("🎯 Weak Subject (FINAL):", weakSubject);

    return {
        quizAccuracy: Math.round(quizAccuracy),
        weakSubject,
        studyTime: Math.round(studyTime),
        flashcardAccuracy: Math.round(flashcardAccuracy),
        streak,
    };
}

// ================= WEAK TOPICS =================

function getWeakTopics(progress, weakSubject) {
    const topicMap = {};

    progress.forEach((p) => {
        if (
            !p.topicTitle ||
            ["quiz", "flashcard"].includes(p.topicTitle.toLowerCase())
        ) return;

        const key = `${p.subject}-${p.topicTitle}`;

        if (!topicMap[key]) {
            topicMap[key] = {
                subject: p.subject,
                topic: p.topicTitle,
                notebookId: p.notebookId,

                totalScore: 0,
                attempts: 0,
                totalTime: 0,

                flashcardCorrect: 0,
                flashcardWrong: 0,

                lastVisited: p.lastVisited,
            };
        }

        topicMap[key].totalScore += p.lastQuizScore || 0;
        topicMap[key].attempts += 1;
        topicMap[key].totalTime += p.timeSpent || 0;

        topicMap[key].flashcardCorrect += p.flashcardCorrect || 0;
        topicMap[key].flashcardWrong += p.flashcardWrong || 0;

        if (new Date(p.lastVisited) > new Date(topicMap[key].lastVisited)) {
            topicMap[key].lastVisited = p.lastVisited;
        }
    });

    const weakTopics = Object.values(topicMap).map((t) => {
        const avgScore = t.attempts > 0 ? t.totalScore / t.attempts : 0;

        const totalFlash = t.flashcardCorrect + t.flashcardWrong;
        const flashAccuracy =
            totalFlash > 0
                ? (t.flashcardCorrect / totalFlash) * 100
                : 0;

        const avgTime = t.totalTime / t.attempts;

        let weaknessScore = 0;
        let reasons = [];

        // SCORE
        if (avgScore < 50) {
            weaknessScore += 5;
            reasons.push("very_low_score");
        } else if (avgScore < 70) {
            weaknessScore += 3;
            reasons.push("low_score");
        }

        // FLASHCARDS
        if (totalFlash === 0) {
            weaknessScore += 3;
            reasons.push("no_revision");
        } else if (flashAccuracy < 60) {
            weaknessScore += 2;
            reasons.push("weak_revision");
        }

        // TIME
        if (avgTime < 10) {
            weaknessScore += 3;
            reasons.push("very_low_time");
        } else if (avgTime < 20) {
            weaknessScore += 2;
            reasons.push("low_time");
        }

        // FORGETTING
        const daysSinceLastVisit = Math.floor(
            (Date.now() - new Date(t.lastVisited)) /
            (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastVisit > 5) {
            weaknessScore += 3;
            reasons.push("forgotten");
        } else if (daysSinceLastVisit > 3) {
            weaknessScore += 2;
            reasons.push("not_recent");
        }

        // SUBJECT PRIORITY (MOST IMPORTANT FIX)
        if (t.subject?.trim().toLowerCase() === weakSubject) {
            weaknessScore += 4;
            reasons.push("weak_subject_priority");
        }

        return {
            subject: t.subject,
            topic: t.topic,
            notebookId: t.notebookId,
            score: Math.round(avgScore),
            timeSpent: Math.round(avgTime),
            flashAccuracy: Math.round(flashAccuracy),
            weaknessScore,
            reasons,
        };
    });

    // STRICT SUBJECT PRIORITY (FIXED)

    const subjectTopics = weakTopics
        .filter(t => t.subject === weakSubject)
        .sort((a, b) => b.weaknessScore - a.weaknessScore);

    // if weak subject exists → ONLY return that
    if (subjectTopics.length > 0) {
        return subjectTopics.slice(0, 3);
    }

    // fallback if no topics found
    return weakTopics
        .sort((a, b) => b.weaknessScore - a.weaknessScore)
        .slice(0, 3);
}

// ================= GEMINI =================

async function generatePathWithAI(studentData, weakTopics) {
    const prompt = `
You are an AI tutor.

Weak Topics:
${weakTopics.map((t, i) => `
${i + 1}. Subject: ${t.subject}
   Topic: ${t.topic}
   NotebookId: ${t.notebookId}
`).join("\n")}

Rules:
- Use "highlight" for topic-specific learning (MOST IMPORTANT)
- Use "quiz" ONLY once per subject
- Use "flashcard" ONLY once per subject
- Avoid repeating quiz/flashcard for same subject
- Prefer highlighttopics for weak topics
- Each step must include: subject, topic, topicId

Return JSON:
[
  {
    "step": 1,
    "title": "Revise Neural Networks",
    "type": "highlight",
    "subject": "ml",
    "topic": "Neural Networks",
    "topicId": "NOTEBOOK_ID"
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

        console.log("🔥 Student Data:", studentData);
        console.log("🔥 Student Weak Subject:", studentData.weakSubject);
        console.log("🔥 Progress Records:", progress);
        const weakTopics = getWeakTopics(progress, studentData.weakSubject);

        console.log("🔥 Weak Topics:", weakTopics);

        const steps = await generatePathWithAI(studentData, weakTopics);

        // deactivate old paths
        await LearningPath.updateMany(
            { userId, status: "active" },
            { status: "archived" }
        );

        const topicData = weakTopics[0];

        function normalize(text) {
    return text?.toLowerCase().replace(/\s+/g, "").trim();
}

const topicLookup = {};
weakTopics.forEach(t => {
    topicLookup[normalize(t.topic)] = t;
});

const usedQuizSubjects = new Set();
const usedFlashSubjects = new Set();

const fallbackTopic = weakTopics[0];

const formattedSteps = steps.map((s, i) => {
    const realTopic =
        topicLookup[normalize(s.topic)] || fallbackTopic;

    let type = s.type;

    // 🚨 Prevent repetition per subject
    if (type === "quiz") {
        if (usedQuizSubjects.has(realTopic.subject)) {
            type = "highlight";
        } else {
            usedQuizSubjects.add(realTopic.subject);
        }
    }

    if (type === "flashcard") {
        if (usedFlashSubjects.has(realTopic.subject)) {
            type = "highlight";
        } else {
            usedFlashSubjects.add(realTopic.subject);
        }
    }

    return {
        title: s.title || `Step ${i + 1}`,
        type,

        subject: realTopic.subject,   // ✅ ALWAYS STORE SUBJECT
        topic: realTopic.topic,

        topicId:
            type === "highlight"
                ? realTopic.notebookId.toString()   // topic-level
                : realTopic.subject.toLowerCase(),  // subject-level ✅ FIXED

        duration: s.duration || 10,
        completed: false,
    };
        });

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