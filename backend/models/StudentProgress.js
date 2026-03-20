const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},

  notebookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notebook",
    required: true,
  },
  subject: {
    type: String,
    required: true
  },

  topicTitle: {
    type: String,
    required: true,
  },

  visitCount: {
    type: Number,
    default: 0,
  },

  timeSpent: {
    type: Number,
    default: 0,
  },

  lastVisited: {
    type: Date,
    default: Date.now,
  },

  lastQuizScore: {
    type: Number,
    default: 0,
  },

  bestQuizScore: {
    type: Number,
    default: 0,
  },

  flashcardCorrect: {
    type: Number,
    default: 0,
  },

  flashcardWrong: {
    type: Number,
    default: 0,
  }

});

progressSchema.index(
  { userId: 1, notebookId: 1, subject: 1, topicTitle: 1 },
  { unique: true }
);

module.exports = mongoose.model("StudentProgress", progressSchema);