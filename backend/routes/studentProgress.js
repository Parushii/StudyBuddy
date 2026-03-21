const express = require("express");
const StudentProgress = require("../models/StudentProgress");
const QuizResult = require("../models/QuizResult");
const mongoose = require("mongoose");

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

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const notebookObjectId = new mongoose.Types.ObjectId(notebookId);

    // Get last attempt
    const lastAttempt = await QuizResult.findOne({
      userId: userObjectId,
      notebookId: notebookObjectId,
    }).sort({ attempt: -1 });

    const nextAttempt = lastAttempt ? lastAttempt.attempt + 1 : 1;

    // Save with attempt
    const result = new QuizResult({
      userId: userObjectId,
      notebookId: notebookObjectId,
      subject,
      topicTitle,
      score,
      total,
      percentage,
      attempt: nextAttempt, 
    });

    await result.save();

    let progress = await StudentProgress.findOne({
      userId: userObjectId,
      notebookId: notebookObjectId,
      subject,
      topicTitle
    });

    if (!progress) {
      progress = new StudentProgress({
        userId: userObjectId,
        notebookId: notebookObjectId,
        subject,
        topicTitle
      });
    }

    progress.lastQuizScore = percentage;
    progress.bestQuizScore = Math.max(progress.bestQuizScore || 0, percentage);

    await progress.save();

    res.json(result);

  } catch (err) {
    console.error("Error submitting quiz:", err);
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