// utils/downloadDriveFile.js
const fs = require("fs");
const path = require("path");

const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const drive = google.drive({ version: "v3", auth: oAuth2Client });

module.exports = async function downloadDriveFile(fileId, fileName) {
  const destPath = path.join("uploads", `${Date.now()}-${fileName}`);
  const dest = fs.createWriteStream(destPath);

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  await new Promise((resolve, reject) => {
    res.data
      .on("end", resolve)
      .on("error", reject)
      .pipe(dest);
  });

  return destPath;
};
