// const express = require("express");
// const { google } = require("googleapis");
// const mongoose = require("mongoose");
// const CalendarEvent = require("../models/CalendarEvent");
// const GoogleAuth = require("../models/GoogleAuth");
// const { getAuthClient } = require("../utils/googleAuth");
// const router = express.Router();


// /* ==================== OAuth Client ==================== */
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// const SCOPES = [
//   "openid",
//   "https://www.googleapis.com/auth/userinfo.profile",
//   "https://www.googleapis.com/auth/userinfo.email",
//   "https://www.googleapis.com/auth/calendar.events",
// ];

// /* ==================== Helper ==================== */
// async function getAuthClient() {
//   const token = await GoogleAuth.findOne();
//   if (!token) throw new Error("Google not connected");

//   oAuth2Client.setCredentials({
//     access_token: token.accessToken,
//     refresh_token: token.refreshToken,
//     expiry_date: token.expiryDate,
//   });

//   return oAuth2Client;
// }

// /* ==================== AUTH ==================== */

// router.get("/auth/google", (req, res) => {
//   const url = oAuth2Client.generateAuthUrl({
//     access_type: "offline",
//     prompt: "consent",
//     scope: SCOPES,
//   });

//   res.redirect(url);
// });

// router.get("/auth/google/callback", async (req, res) => {
//   try {
//     const { code } = req.query;

//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
//     const { data } = await oauth2.userinfo.get();

//     const existing = await GoogleAuth.findOne({ googleId: data.id });

//     await GoogleAuth.findOneAndUpdate(
//       { googleId: data.id },
//       {
//         googleId: data.id,
//         accessToken: tokens.access_token,
//         refreshToken: tokens.refresh_token || existing?.refreshToken,
//         expiryDate: tokens.expiry_date,
//       },
//       { upsert: true }
//     );

//     res.redirect(`${process.env.FRONTEND_URL}/calendar`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Google auth failed");
//   }
// });

// /* ==================== CALENDAR ==================== */


// router.get("/calendar/events", async (req, res) => {
//   try {
//     const events = await CalendarEvent.find().sort({ start: 1 });
//     res.json(events);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch events" });
//   }
// });

// /* ---------- CREATE ---------- */
// router.post("/calendar/create", async (req, res) => {
//   try {
//     const auth = await getAuthClient();
//     const calendar = google.calendar({ version: "v3", auth });

//     const event = await calendar.events.insert({
//       calendarId: "primary",
//       requestBody: {
//         summary: req.body.title,
//         start: { dateTime: req.body.start, timeZone: "Asia/Kolkata" },
//         end: { dateTime: req.body.end, timeZone: "Asia/Kolkata" },
//       },
//     });

//     // Save to MongoDB
//     await CalendarEvent.create({
//       title: req.body.title,
//       start: req.body.start,
//       end: req.body.end,
//       googleEventId: event.data.id,
//       googleUserId: (await GoogleAuth.findOne()).googleId,
//     });

//     res.json({ id: event.data.id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Calendar create failed" });
//   }
// });

// /* ---------- UPDATE ---------- */
// router.put("/calendar/update/:id", async (req, res) => {
//   try {
//     const auth = await getAuthClient();
//     const calendar = google.calendar({ version: "v3", auth });

//     await calendar.events.patch({
//       calendarId: "primary",
//       eventId: req.params.id,
//       requestBody: {
//         summary: req.body.title,
//         start: { dateTime: req.body.start },
//         end: { dateTime: req.body.end },
//       },
//     });

//     // Update MongoDB
//     await CalendarEvent.findOneAndUpdate(
//       { googleEventId: req.params.id },
//       {
//         title: req.body.title,
//         start: req.body.start,
//         end: req.body.end,
//       }
//     );

//     res.json({ success: true });
//   } catch (err) {
//     if (err.code === 404 || err.code === 410) {
//       console.log("Event missing → creating new one");

//       const newEvent = await calendar.events.insert({
//         calendarId: "primary",
//         requestBody: {
//           summary: req.body.title,
//           start: { dateTime: req.body.start },
//           end: { dateTime: req.body.end },
//         },
//       });

//       // Update DB with NEW event ID
//       await CalendarEvent.findOneAndUpdate(
//         { googleEventId: req.params.id },
//         {
//           googleEventId: newEvent.data.id,
//           title: req.body.title,
//           start: req.body.start,
//           end: req.body.end,
//         }
//       );

//       return res.json({
//         success: true,
//         message: "Event recreated",
//       });
//     }

//     res.status(500).json({ error: "Calendar update failed" });
//   }
// });

// /* ---------- DELETE ---------- */
// router.delete("/calendar/delete/:id", async (req, res) => {
//   try {
//     const auth = await getAuthClient();
//     const calendar = google.calendar({ version: "v3", auth });

//     await calendar.events.delete({
//       calendarId: "primary",
//       eventId: req.params.id,
//     });

//     // Delete from MongoDB
//     await CalendarEvent.findOneAndDelete({
//       googleEventId: req.params.id,
//     });

//     res.json({ success: true });
//   } catch (err) {
//     if (err.code === 404 || err.code === 410) {
//       console.log("Event already deleted from Google Calendar");

//       await CalendarEvent.findOneAndDelete({
//         googleEventId: req.params.id,
//       });

//       return res.json({
//         success: true,
//         message: "Event already deleted",
//       });
//     }

//     console.error(err);
//     res.status(500).json({ error: "Calendar delete failed" });
//   }
// });

// module.exports = router;



const express = require("express");
const { google } = require("googleapis");
const CalendarEvent = require("../models/CalendarEvent");
const GoogleAuth = require("../models/GoogleAuth");
const { getAuthClient, oAuth2Client, SCOPES } = require("../utils/googleAuth");

const router = express.Router();

/* ==================== AUTH ==================== */

// Redirect to Google login
router.get("/auth/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  res.redirect(url);
});

// Callback
router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data } = await oauth2.userinfo.get();

    const existing = await GoogleAuth.findOne({ googleId: data.id });

    await GoogleAuth.findOneAndUpdate(
      { googleId: data.id },
      {
        googleId: data.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || existing?.refreshToken,
        expiryDate: tokens.expiry_date,
      },
      { upsert: true }
    );

    res.redirect(`${process.env.FRONTEND_URL}/calendar`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Google auth failed");
  }
});

/* ==================== GET EVENTS ==================== */

router.get("/calendar/events", async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ start: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

/* ==================== CREATE ==================== */

router.post("/calendar/create", async (req, res) => {
  try {
    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: req.body.title,
        start: { dateTime: req.body.start, timeZone: "Asia/Kolkata" },
        end: { dateTime: req.body.end, timeZone: "Asia/Kolkata" },
      },
    });

    await CalendarEvent.create({
      title: req.body.title,
      start: req.body.start,
      end: req.body.end,
      googleEventId: event.data.id,
      googleUserId: (await GoogleAuth.findOne()).googleId,
    });

    res.json({ id: event.data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Calendar create failed" });
  }
});

/* ==================== UPDATE ==================== */

router.put("/calendar/update/:id", async (req, res) => {
  try {
    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    await calendar.events.patch({
      calendarId: "primary",
      eventId: req.params.id,
      requestBody: {
        summary: req.body.title,
        start: { dateTime: req.body.start },
        end: { dateTime: req.body.end },
      },
    });

    await CalendarEvent.findOneAndUpdate(
      { googleEventId: req.params.id },
      {
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
      }
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);

    if (err.code === 404 || err.code === 410) {
      try {
        const auth = await getAuthClient();
        const calendar = google.calendar({ version: "v3", auth });

        const newEvent = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: req.body.title,
            start: { dateTime: req.body.start },
            end: { dateTime: req.body.end },
          },
        });

        await CalendarEvent.findOneAndUpdate(
          { googleEventId: req.params.id },
          {
            googleEventId: newEvent.data.id,
            title: req.body.title,
            start: req.body.start,
            end: req.body.end,
          }
        );

        return res.json({
          success: true,
          message: "Event recreated",
        });

      } catch (err2) {
        console.error(err2);
      }
    }

    res.status(500).json({ error: "Calendar update failed" });
  }
});

/* ==================== DELETE ==================== */

router.delete("/calendar/delete/:id", async (req, res) => {
  try {
    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: req.params.id,
    });

    await CalendarEvent.findOneAndDelete({
      googleEventId: req.params.id,
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);

    if (err.code === 404 || err.code === 410) {
      await CalendarEvent.findOneAndDelete({
        googleEventId: req.params.id,
      });

      return res.json({
        success: true,
        message: "Event already deleted",
      });
    }

    res.status(500).json({ error: "Calendar delete failed" });
  }
});

module.exports = router;