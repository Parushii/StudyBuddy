const mongoose = require("mongoose");

const TextbookChunkSchema = new mongoose.Schema({
    text: String,
    embedding: [Number],
    fileName: String,
    page: Number,
});

module.exports = mongoose.model("TextbookChunk", TextbookChunkSchema);