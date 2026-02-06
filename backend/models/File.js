import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
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

    name: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      enum: ["local", "google-drive"],
      required: true,
    },

    mimeType: String,
    size: Number,

    storageUrl: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String, // OCR / parsed text
    },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
