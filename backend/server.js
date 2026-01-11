// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const { google } = require("googleapis");
// const axios = require("axios");
// const FormData = require("form-data");


// const app = express();
// const upload = multer({ dest: "uploads/" });

// const cors = require("cors");
// app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8000"] }));
// app.use(express.json());

// const PORT = process.env.PORT || 5000;

// // Setup OAuth2 client
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// const drive = google.drive({ version: "v3", auth: oAuth2Client });

// // Function: find or create folder
// async function findOrCreateFolder(name, parentId = null) {
//   const query = `'${
//     parentId || "root"
//   }' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
//   const res = await drive.files.list({ q: query, fields: "files(id, name)" });
//   if (res.data.files.length > 0) return res.data.files[0].id;

//   const folderMetadata = {
//     name,
//     mimeType: "application/vnd.google-apps.folder",
//   };
//   if (parentId) folderMetadata.parents = [parentId];
//   const folder = await drive.files.create({
//     resource: folderMetadata,
//     fields: "id",
//   });
//   return folder.data.id;
// }

// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const filePath = req.file.path;

//     // Step 1: Prepare form data for Flask classifier
//     const formData = new FormData();
//     // formData.append("file", fs.createReadStream(filePath));
//     formData.append("file", fs.createReadStream(filePath), req.file.originalname);


//     // Step 2: Call Flask classifier
//     const classifyRes = await axios.post("http://127.0.0.1:8000/classify", formData, {
//       headers: formData.getHeaders(),
//     });
//     const predictedSubject = classifyRes.data.subject;
//     // const chapter = "General";

//     // Step 3: Find/Create folders
//     const rootFolder = await findOrCreateFolder("StudyBuddyAI");
//     const subjectFolder = await findOrCreateFolder(predictedSubject, rootFolder);
//     // const chapterFolder = await findOrCreateFolder(chapter, subjectFolder);

//     const uploadParentfolder = subjectFolder; 

//     // ✅ Step 4: Check if file already exists
//     const existingFile = await drive.files.list({
//       q: `'${uploadParentfolder}' in parents and name='${req.file.originalname}' and trashed=false`,
//       fields: "files(id, name)",
//     });

//     if (existingFile.data.files.length > 0) {
//       fs.unlinkSync(filePath); // clean up temp file
//       return res.status(400).json({
//         error: "File already exists in this folder.",
//         fileName: req.file.originalname,
//       });
//     }

//     // Step 5: Upload new file
//     const fileMetadata = { name: req.file.originalname, parents: [uploadParentfolder] };
//     const media = { mimeType: req.file.mimetype, body: fs.createReadStream(filePath) };

//     const file = await drive.files.create({
//       resource: fileMetadata,
//       media,
//       fields: "id",
//     });

//     fs.unlinkSync(filePath);

//     const link = `https://drive.google.com/file/d/${file.data.id}/view`;
//     res.json({ message: "File uploaded successfully", link, subject: predictedSubject });
//   } catch (err) {
//     console.error("Upload failed:", err.response?.data || err.message || err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// app.get("/drive-structure", async (req, res) => {
//   try {
//     const rootFolderName = "StudyBuddyAI";

//     // 1️⃣ Find root folder ID
//     const rootRes = await drive.files.list({
//       q: `name='${rootFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//       fields: "files(id, name)",
//     });

//     if (rootRes.data.files.length === 0) {
//       return res.json({ folders: [] });
//     }

//     const rootFolderId = rootRes.data.files[0].id;

//     // 2️⃣ Get all subject folders inside StudyBuddyAI
//     const subjectsRes = await drive.files.list({
//       q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//       fields: "files(id, name)",
//     });

//     const structure = [];

//     // 3️⃣ For each subject folder, fetch files inside
//     for (const folder of subjectsRes.data.files) {
//       const filesRes = await drive.files.list({
//         q: `'${folder.id}' in parents and trashed=false`,
//         fields: "files(id, name, mimeType)",
//       });

//       structure.push({
//         subject: folder.name,
//         files: filesRes.data.files.map((f) => ({
//           name: f.name,
//           id: f.id,
//           mimeType: f.mimeType,
//           link: `https://drive.google.com/file/d/${f.id}/view`,
//         })),
//       });
//     }

//     res.json({ folders: structure });
//   } catch (err) {
//     console.error("Error fetching Drive structure:", err.message);
//     res.status(500).json({ error: "Failed to fetch drive structure" });
//   }
// });


// //Summarize notes
// app.post('/summarize', async (req, res) => {
//   const { notes } = req.body;

//   if (!notes || notes.trim() === "") {
//     return res.status(400).json({ error: "No notes provided" });
//   }

//   try {
//     // Sending the notes to the Python server for summarization
//     const response = await axios.post('http://localhost:8000/api/summarize', { text : notes });

//     // Return the summarized text to the React frontend
//     return res.json({ summary: response.data.summary });
//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).json({ error: 'Failed to summarize text' });
//   }
// });



// app.listen(PORT, () =>
//   console.log(`🚀 Server running on http://localhost:${PORT}`)
// );


require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

const cors = require("cors");
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8000"] }));

app.use(express.json());
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oAuth2Client });


async function findOrCreateFolder(name, parentId = null) {
  const query = `'${
    parentId || "root"
  }' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await drive.files.list({ q: query, fields: "files(id, name)" });
  if (res.data.files.length > 0) return res.data.files[0].id;

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

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), req.file.originalname);

    const classifyRes = await axios.post("http://127.0.0.1:8000/classify", formData, {
      headers: formData.getHeaders(),
    });

    const predictedSubject = classifyRes.data.subject;
    const predictedUnit = classifyRes.data.unit;
    


    const rootFolder = await findOrCreateFolder("StudyBuddyAI");

    const subjectFolder = await findOrCreateFolder(predictedSubject, rootFolder);
    const unitFolder = await findOrCreateFolder(predictedUnit, subjectFolder);
    const uploadParentfolder = unitFolder;  

    console.log(`Uploading to Subject: ${predictedSubject}, Unit: ${predictedUnit}`);

    const existingFile = await drive.files.list({
      q: `'${uploadParentfolder}' in parents and name='${req.file.originalname}' and trashed=false`,
      fields: "files(id, name)",
    });

    if (existingFile.data.files.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: "File already exists in this folder.",
        fileName: req.file.originalname,
      });
    }

    const fileMetadata = { name: req.file.originalname, parents: [uploadParentfolder] };
    const media = { mimeType: req.file.mimetype, body: fs.createReadStream(filePath) };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });

    fs.unlinkSync(filePath);

    const link = `https://drive.google.com/file/d/${file.data.id}/view`;
    res.json({ message: "File uploaded successfully", link, subject: predictedSubject, unit: predictedUnit});
  } 
  catch (err) {
    console.error("Upload failed:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Upload failed" });
  }
});

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

app.get("/drive-structure", async (req, res) => {
  try {
    const rootFolderName = "StudyBuddyAI";

    const rootRes = await drive.files.list({
      q: `name='${rootFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (rootRes.data.files.length === 0) {
      return res.json([]);
    }

    const rootFolderId = rootRes.data.files[0].id;

    const subjectsRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    const structure = [];

    for (const subject of subjectsRes.data.files) {
      structure.push({
        subject: subject.name,
        children: await fetchDriveTree(subject.id),
      });
    }

    res.json(structure);
  } catch (err) {
    console.error("Drive error:", err);
    res.status(500).json({ error: "Failed to fetch drive structure" });
  }
});


//Summarize notes
app.post('/summarize', async (req, res) => {
  const { notes } = req.body;

  if (!notes || notes.trim() === "") {
    return res.status(400).json({ error: "No notes provided" });
  }

  try {
    // Sending the notes to the Python server for summarization
    const response = await axios.post('http://localhost:5001/api/summarize', { text : notes });

    // Return the summarized text to the React frontend
    return res.json({ summary: response.data.summary });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to summarize text' });
  }
});


app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
);
