// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
// const { processFile } = require("../fileParser"); // uses your fileParser.js & gemini.js

// router.post("/generate-schedule", upload.array("files"), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }

//     const results = {};

//     for (const file of req.files) {
//       // This function should:
//       // 1. Read the file
//       // 2. Extract text (TXT/PDF/DOCX)
//       // 3. Send text to Gemini to get structured notes
//       const structuredNotes = await processFile(file);
//       results[file.originalname] = structuredNotes;
//     }

//     res.json(results);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to generate notes" });
//   }
// });

// module.exports = router;







// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

// const { extractTextFromFiles } = require("../fileParser");
// const { generateScheduleFromText } = require("../gemini");

// const { google } = require("googleapis");
// const GoogleAuth = require("../models/GoogleAuth");
// const CalendarEvent = require("../models/CalendarEvent");

// /* ===== AUTH CLIENT ===== */
// async function getAuthClient() {
//   const token = await GoogleAuth.findOne();
//   if (!token) throw new Error("Google not connected");

//   const oAuth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
//   );

//   oAuth2Client.setCredentials({
//     access_token: token.accessToken,
//     refresh_token: token.refreshToken,
//     expiry_date: token.expiryDate,
//   });

//   return oAuth2Client;
// }

// /* ===== GENERATE + SAVE ===== */
// router.post("/generate-schedule", upload.array("files"), async (req, res) => {
//   try {
//     const { startDate, examDate } = req.body;

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }

//     // 🔥 Combine all file text
//     const text = await extractTextFromFiles(req.files);

//     // 🔥 Generate schedule
//     const schedule = await generateScheduleFromText(
//       text,
//       startDate,
//       examDate,
//       "General"
//     );

//     // 🔥 Google Calendar
//     const auth = await getAuthClient();
//     const calendar = google.calendar({ version: "v3", auth });

//     for (const [date, task] of Object.entries(schedule)) {
//       const startDateTime = new Date(date);
//       startDateTime.setHours(10, 0);

//       const endDateTime = new Date(date);
//       endDateTime.setHours(12, 0);

//       // 🚫 Prevent duplicates
//       const exists = await CalendarEvent.findOne({
//         title: task,
//         start: startDateTime,
//       });

//       if (exists) continue;

//       const event = await calendar.events.insert({
//         calendarId: "primary",
//         requestBody: {
//           summary: `📘 Study: ${task.split(":")[0]}`,
//           description: task,
//           start: {
//             dateTime: startDateTime.toISOString(),
//             timeZone: "Asia/Kolkata",
//           },
//           end: {
//             dateTime: endDateTime.toISOString(),
//             timeZone: "Asia/Kolkata",
//           },
//         },
//       });

//       // 🔥 Save to DB
//       await CalendarEvent.create({
//         title: task,
//         start: startDateTime,
//         end: endDateTime,
//         googleEventId: event.data.id,
//         googleUserId: (await GoogleAuth.findOne()).googleId,
//       });
//     }

//     res.json(schedule);

//   } catch (err) {
//     console.error("🔥 Schedule Error:", err);
//     res.status(500).json({ message: "Failed to generate schedule" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { extractTextFromFiles } = require("../fileParser");
const { generateScheduleFromText } = require("../gemini");

const { google } = require("googleapis");
const { getAuthClient } = require("../utils/googleAuth");

const GoogleAuth = require("../models/GoogleAuth");
const CalendarEvent = require("../models/CalendarEvent");

router.post("/generate-schedule", upload.array("files"), async (req, res) => {
  try {
    const { startDate, examDate } = req.body;

    console.log("📅 Dates:", startDate, examDate);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    /* ===== STEP 1: TEXT EXTRACTION ===== */
    const text = await extractTextFromFiles(req.files);

    console.log("📄 TEXT LENGTH:", text.length);

    if (!text || text.length < 50) {
      throw new Error("❌ Failed to extract meaningful text");
    }

    /* ===== STEP 2: GENERATE SCHEDULE ===== */
    const schedule = await generateScheduleFromText(
      text,
      startDate,
      examDate,
      "General"
    );

    console.log("🧠 SCHEDULE:", schedule);

    if (!schedule || Object.keys(schedule).length === 0) {
      throw new Error("❌ Schedule generation failed");
    }

    /* ===== STEP 3: GOOGLE AUTH ===== */
    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const user = await GoogleAuth.findOne();

    /* ===== STEP 4: INSERT EVENTS ===== */
    for (const [date, task] of Object.entries(schedule)) {
      console.log("➡️ Creating event:", date, task);

      const startDateTime = new Date(`${date}T10:00:00`);
      const endDateTime = new Date(`${date}T12:00:00`);

      // Skip invalid dates
      if (isNaN(startDateTime)) {
        console.log("❌ Invalid date:", date);
        continue;
      }

      console.log("TEXT LENGTH:", text.length);
      console.log("SCHEDULE:", schedule);

      try {
        const event = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: `📘 Study: ${task.split(":")[0]}`,
            description: task,
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: "Asia/Kolkata",
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: "Asia/Kolkata",
            },
          },
        });

        console.log("✅ Event created:", event.data.id);

        await CalendarEvent.create({
          title: task,
          start: startDateTime,
          end: endDateTime,
          googleEventId: event.data.id,
          googleUserId: user.googleId,
        });

      } catch (err) {
        console.error("❌ Calendar Insert Error:", err.message);
      }
    }

    res.json(schedule);

  } catch (err) {
    console.error("🔥 FINAL ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;