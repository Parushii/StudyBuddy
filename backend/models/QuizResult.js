// models/QuizResult.js
const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  notebookId: { type: mongoose.Schema.Types.ObjectId, ref: "Notebook", required: true },
  score: Number,
  total: Number,
  percentage: Number,
}, { timestamps: true });

module.exports = mongoose.model("QuizResult", quizResultSchema);