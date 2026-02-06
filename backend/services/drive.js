require("dotenv").config();
const fs = require("fs");
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

async function findOrCreateFolder(name, parentId = null) {
  const query = `'${parentId || "root"}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await drive.files.list({
    q: query,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folderMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (parentId) folderMetadata.parents = [parentId];

  const folder = await drive.files.create({
    resource: folderMetadata,
    fields: "id",
  });

  return folder.data.id;
}

async function fetchDriveTree(parentId) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType)",
  });

  const items = [];

  for (const file of res.data.files) {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      items.push({
        id: file.id,
        name: file.name,
        type: "folder",
        children: await fetchDriveTree(file.id),
      });
    } else {
      items.push({
        id: file.id,
        name: file.name,
        type: "file",
        mimeType: file.mimeType,
        link: `https://drive.google.com/file/d/${file.id}/view`,
      });
    }
  }

  return items;
}

module.exports = {
  drive,
  findOrCreateFolder,
  fetchDriveTree,
};
