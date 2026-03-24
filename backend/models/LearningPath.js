const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  step: Number,
  title: String,
  type: String, // "read" | "flashcard" | "quiz"
  duration: Number,
  topicId:{type:String},
  completed: {
    type: Boolean,
    default: false,
  },
});

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  steps: [stepSchema],
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LearningPath", learningPathSchema);