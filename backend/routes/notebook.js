const express = require("express");
const Notebook = require("../models/Notebook");
const authMiddleware = require("../middleware/authMiddleware");

const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const textract = require("textract");
const fs = require("fs");

const downloadDriveFile = require("../services/downloadDriveFile");

const router = express.Router();

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });


/* CREATE NOTEBOOK */
router.post("/", authMiddleware, async (req, res) => {
    try {
        const notebook = await Notebook.create({
            name: req.body.name,
            user: req.user.userId,  
        });

        res.status(201).json(notebook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

/* GET USER NOTEBOOKS */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notebooks = await Notebook.find({
            user: req.user.userId,
        }).sort({ createdAt: -1 });
        res.json(notebooks || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/:id/add-files", upload.array("files"), async (req, res) => {
  try {
    const notebook = await Notebook.findById(req.params.id);
    if (!notebook)
      return res.status(404).json({ error: "Notebook not found" });

    /* ===============================
       HANDLE LOCAL FILES
    =============================== */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const ext = file.originalname.split(".").pop().toLowerCase();
        let text = "";

        if (ext === "pdf") {
          const data = await pdf(fs.readFileSync(file.path));
          text = data.text;
        } else if (ext === "docx") {
          const result = await mammoth.extractRawText({ path: file.path });
          text = result.value;
        } else if (ext === "txt") {
          text = fs.readFileSync(file.path, "utf-8");
        } else {
          text = await new Promise((resolve, reject) => {
            textract.fromFileWithPath(file.path, (err, t) => {
              if (err) resolve("");
              else resolve(t);
            });
          });
        }

        const exists = notebook.sourceFiles.some(
          (f) => f.name === file.originalname && f.extractedText === text
        );

        if (!exists) {
          notebook.sourceFiles.push({
            name: file.originalname,
            source: "local",
            extractedText: text,
          });
        }

        fs.unlinkSync(file.path);
      }
    }

    /* ===============================
       HANDLE DRIVE FILES
    =============================== */
    let driveFiles = [];
    if (req.body.driveFiles) {
      driveFiles = Array.isArray(req.body.driveFiles)
        ? req.body.driveFiles
        : JSON.parse(req.body.driveFiles);
    }

    for (const file of driveFiles) {
      const tempPath = await downloadDriveFile(file.id, file.name);
      const ext = file.name.split(".").pop().toLowerCase();
      let text = "";

      try {
        if (ext === "pdf") {
          const data = await pdf(fs.readFileSync(tempPath));
          text = data.text;
        } else if (ext === "docx") {
          const result = await mammoth.extractRawText({ path: tempPath });
          text = result.value;
        } else if (ext === "txt") {
          text = fs.readFileSync(tempPath, "utf-8");
        } else {
          text = await new Promise((resolve) => {
            textract.fromFileWithPath(tempPath, (err, t) => {
              if (err) resolve("");
              else resolve(t);
            });
          });
        }
      } catch (err) {
        console.error("Drive extraction error:", err);
        text = "";
      }
      const existsDrive = notebook.sourceFiles.some((f) => f.driveFileId === file.id);
        if (existsDrive) continue;

      const exists = notebook.sourceFiles.some(
        (f) => f.name === file.name && f.extractedText === text
      );

      if (!exists) {
        notebook.sourceFiles.push({
          name: file.name,
          source: "drive",
          driveFileId: file.id,
          extractedText: text,
        });
      }

      fs.unlinkSync(tempPath);
    }

    await notebook.save();

    res.json({ message: "Files added successfully", notebook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process files" });
  }
});

router.delete("/:id/remove-file/:fileId", async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const notebook = await Notebook.findById(id);
    if (!notebook) return res.status(404).json({ error: "Notebook not found" });

    notebook.sourceFiles = notebook.sourceFiles.filter(
      (file) => file._id.toString() !== fileId
    );

    await notebook.save();

    res.json({ message: "File removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove file" });
  }
});

router.delete("/:id/clear-files", async (req, res) => {
  try {
    const notebook = await Notebook.findById(req.params.id);
    if (!notebook) return res.status(404).json({ error: "Notebook not found" });

    notebook.sourceFiles = [];
    await notebook.save();

    res.json({ message: "All files cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear files" });
  }
});

router.get("/:id/text", async (req, res) => {
    try {
        const notebook = await Notebook.findById(req.params.id);
        if (!notebook) {
            return res.status(404).json({ error: "Notebook not found" });
        }

        const combinedText = notebook.sourceFiles
            .map(f => `\n\n=== ${f.name} ===\n${f.extractedText}`)
            .join("");

        res.json({ text: combinedText });

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notebook text" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const notebook = await Notebook.findById(req.params.id);
        res.json(notebook);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notebook" });
    }
});

module.exports = router;
