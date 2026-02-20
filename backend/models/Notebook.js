// models/Notebook.js
const mongoose = require("mongoose");

const notebookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceFiles: [
    {
      name: String,
      source: String, // "local" | "drive"
      driveFileId: String, 
      extractedText: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notebook", notebookSchema);
