import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    topicTitle: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    referenceFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    chapterTitle: {
      type: String,
      required: true,
    },

    topics: [topicSchema],
  },
  { _id: false }
);

const highlightsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
    },

    chapters: [chapterSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Highlights", highlightsSchema);
