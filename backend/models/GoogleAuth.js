const mongoose = require("mongoose");

const GoogleAuthSchema = new mongoose.Schema({
  googleId: String,
  accessToken: String,
  refreshToken: String,
  expiryDate: Number,
});

module.exports = mongoose.model("GoogleAuth", GoogleAuthSchema);