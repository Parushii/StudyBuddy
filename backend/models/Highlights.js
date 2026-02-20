const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    topicTitle: String,
    content: String,
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    chapterTitle: String,
    topics: [topicSchema],
  },
  { _id: false }
);

const fileGroupSchema = new mongoose.Schema(
  {
    fileName: String,
    chapters: [chapterSchema],
  },
  { _id: false }
);

const highlightsSchema = new mongoose.Schema(
  {
    userId: String,
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
    },
    chapters: [fileGroupSchema], // now grouped per file
  },
  { timestamps: true }
);

module.exports = mongoose.model("Highlights", highlightsSchema);
