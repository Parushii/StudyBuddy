const mongoose = require("mongoose");

const CalendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    start: {
      type: Date,
      required: true,
    },

    end: {
      type: Date,
      required: true,
    },

    googleEventId: {
      type: String,
      required: true,
      unique: true,
    },

    googleUserId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CalendarEvent", CalendarEventSchema);