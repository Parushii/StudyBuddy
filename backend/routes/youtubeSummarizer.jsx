const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

// Gemini text model to use (must be present in ListModels for your key)
const GEMINI_YOUTUBE_MODEL = "gemini-2.5-flash";

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// YouTube Summarization Endpoint - Direct video processing (no transcript needed)
router.post("/summarize-youtube", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    // Validate it's a YouTube URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL format" });
    }

    const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("📺 Summarizing video:", fullUrl);
    console.log(
      "🔑 Using Gemini API Key:",
      process.env.GEMINI_API_KEY ? "✓ Found" : "✗ NOT FOUND"
    );

    // Initialize new Gemini SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log("🔄 Sending YouTube URL directly to Gemini 2.5 Flash...");

    // Use the new SDK format to process video directly
    const response = await ai.models.generateContent({
      model: GEMINI_YOUTUBE_MODEL,
      contents: [
        {
          fileData: {
            fileUri: fullUrl,
            mimeType: "video/mp4",
          },
        },
        {
          text: `You are an expert content summarizer. Please analyze this YouTube video and provide a concise, focused summary.

Provide ONLY:
1. **Key Topics** (3-5 main topics covered)
   - List each topic as a bullet point with a brief 1-line description

2. **Points to Remember** (5-8 most important takeaways)
   - List critical insights, facts, or lessons
   - Each point should be actionable or memorable
   - Focus on what students/learners MUST know

Format your response with clear markdown formatting. Be concise and student-friendly.`,
        },
      ],
    });

    const summary = response.text;
    console.log("✅ Summary generated successfully");

    res.json({
      success: true,
      videoId,
      url: fullUrl,
      summary,
      model: GEMINI_YOUTUBE_MODEL,
      method: "direct-video-processing",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Summarization error:", error.message);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API Key is not configured",
        hint: "Add GEMINI_API_KEY to your .env file",
      });
    }

    res.status(500).json({
      error: "Failed to summarize video",
      details: error.message,
    });
  }
});

// Download YouTube summary as PDF
router.post("/download-youtube-summary-pdf", async (req, res) => {
  try {
    const { summary, videoTitle } = req.body;

    if (!summary) {
      return res.status(400).json({ error: "Summary is required" });
    }

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    const filename = `YouTube_Summary_${videoTitle || "Video"}_${Date.now()}.pdf`.replace(
      /[^a-zA-Z0-9_.-]/g,
      "_"
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).font("Helvetica-Bold").text("YouTube Video Summary", {
      align: "center",
    });
    doc.moveDown();

    if (videoTitle) {
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Video: ", { continued: true });
      doc.font("Helvetica").text(videoTitle);
      doc.moveDown();
    }

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleDateString()}`, {
        align: "right",
      });
    doc.moveDown(2);

    // Add summary content
    doc.fontSize(11).font("Helvetica");

    // Parse and format the summary
    const lines = summary.split("\n");
    for (const line of lines) {
      if (line.startsWith("**") && line.endsWith("**")) {
        // Bold headings
        doc.moveDown(0.5);
        doc.font("Helvetica-Bold").fontSize(13).text(line.replace(/\*\*/g, ""));
        doc.font("Helvetica").fontSize(11);
      } else if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
        // Bullet points
        doc.text(line, { indent: 20 });
      } else if (line.trim()) {
        doc.text(line);
      } else {
        doc.moveDown(0.3);
      }
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("❌ PDF generation error:", error.message);
    res.status(500).json({ error: "Failed to generate PDF", details: error.message });
  }
});

// Download YouTube summary as DOCX
router.post("/download-youtube-summary-docx", async (req, res) => {
  try {
    const { summary, videoTitle } = req.body;

    if (!summary) {
      return res.status(400).json({ error: "Summary is required" });
    }

    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
    const docx = require("docx");

    const paragraphs = [];

    // Title
    paragraphs.push(
      new Paragraph({
        text: "YouTube Video Summary",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    // Video title
    if (videoTitle) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Video: ", bold: true }),
            new TextRun({ text: videoTitle }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    // Date
    paragraphs.push(
      new Paragraph({
        text: `Generated on: ${new Date().toLocaleDateString()}`,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 },
      })
    );

    // Parse and format summary
    const lines = summary.split("\n");
    for (const line of lines) {
      if (line.startsWith("**") && line.endsWith("**")) {
        // Bold headings
        paragraphs.push(
          new Paragraph({
            text: line.replace(/\*\*/g, ""),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
        // Bullet points
        paragraphs.push(
          new Paragraph({
            text: line.replace(/^[-•]\s*/, ""),
            bullet: { level: 0 },
          })
        );
      } else if (line.trim()) {
        paragraphs.push(
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await docx.Packer.toBuffer(doc);

    const filename = `YouTube_Summary_${videoTitle || "Video"}_${Date.now()}.docx`.replace(
      /[^a-zA-Z0-9_.-]/g,
      "_"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("❌ DOCX generation error:", error.message);
    res.status(500).json({ error: "Failed to generate DOCX", details: error.message });
  }
});

module.exports = router;
