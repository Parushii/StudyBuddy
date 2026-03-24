const { google } = require("googleapis");
const GoogleAuth = require("../models/GoogleAuth");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar.events",
];

async function getAuthClient() {
  const token = await GoogleAuth.findOne();

  if (!token) {
    throw new Error("❌ Google not connected");
  }

  oAuth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiryDate,
  });

  return oAuth2Client;
}

module.exports = {
  getAuthClient,
  oAuth2Client,
  SCOPES,
};