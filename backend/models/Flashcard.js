import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    front: String,
    back: String,
  },
  { _id: false }
);

const flashcardSetSchema = new mongoose.Schema(
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

    sourceFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],

    cards: [flashcardSchema],
  },
  { timestamps: true }
);

export default mongoose.model("FlashcardSet", flashcardSetSchema);
