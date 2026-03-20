const express = require("express");
const StudentProgress = require("../models/StudentProgress");
const QuizResult = require("../models/QuizResult");

const router = express.Router();

router.post("/time", async (req, res) => {
  const { userId, notebookId, subject,topicTitle, timeSpent } = req.body;

  let progress = await StudentProgress.findOne({
    userId,
    notebookId,
    subject,
    topicTitle
  });

  if (!progress) {
    progress = new StudentProgress({
      userId,
      notebookId,
      subject,
      topicTitle
    });
  }

  progress.timeSpent += timeSpent;
  progress.lastVisited = new Date();

  await progress.save();

  res.json(progress);
});

router.post("/topic-visit", async (req, res) => {
  const { userId, notebookId, subject,topicTitle } = req.body;

  let progress = await StudentProgress.findOne({
    userId,
    notebookId,
    subject,
    topicTitle
  });

  if (!progress) {
    progress = new StudentProgress({
      userId,
      notebookId,
      subject,
      topicTitle
    });
  }

  progress.visitCount += 1;
  progress.lastVisited = new Date();

  await progress.save();

  res.json(progress);
});

router.post("/flashcard", async (req, res) => {
  const { userId, notebookId, subject, topicTitle, correct } = req.body;

  let progress = await StudentProgress.findOne({
    userId,
    notebookId,
    subject,
    topicTitle
  });

  if (!progress) {
    progress = new StudentProgress({
      userId,
      notebookId,
      subject,
      topicTitle
    });
  }

  if (correct) progress.flashcardCorrect += 1;
  else progress.flashcardWrong += 1;

  await progress.save();

  res.json(progress);
});

router.post("/submit", async (req, res) => {
  try {
    const { userId, notebookId, subject, topicTitle, score, total } = req.body;

    const percentage = (score / total) * 100;

    const result = new QuizResult({
      userId,
      notebookId,
      subject,
      topicTitle,
      score,
      total,
      percentage
    });

    await result.save();

    let progress = await StudentProgress.findOne({
      userId,
      notebookId,
      subject,
      topicTitle
    });

    if (!progress) {
      progress = new StudentProgress({
        userId,
        notebookId,
        subject,
        topicTitle
      });
    }

    if (progress) {
  progress.lastQuizScore = percentage;
  progress.bestQuizScore = Math.max(progress.bestQuizScore, percentage);
  await progress.save();
}

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await StudentProgress.find({ userId });

    res.json(progress);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;