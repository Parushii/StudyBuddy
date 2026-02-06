import { useState } from "react";
import axios from "axios";

export default function HighlightTopics() {
  const [content, setContent] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState({
    title: "Upload a file",
    content: "Upload a PDF, DOCX, or TXT file to generate structured notes.",
  });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/generate-notes",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setContent(res.data);
      setSelectedTopic({
        title: "Notes Generated ✅",
        content: "Select a topic from the left panel.",
      });

    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong while generating notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex">

      {/* Left Pane */}
      <aside className="w-[28%] border-r border-zinc-800 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-purple-400">
          📖 Contents
        </h2>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="text-sm"
          />
        </div>

        {loading && <p className="text-sm text-zinc-400">Generating notes...</p>}

        {/* Dynamic Chapters */}
        {content && (
  <div className="space-y-6 text-sm">
    {Object.entries(content).map(([fileName, chapters]) => (
      <div key={fileName}>
        <p className="text-purple-400 font-semibold mb-3">
          {fileName}
        </p>

        {Object.entries(chapters).map(([chapterTitle, topics]) => (
          <div key={chapterTitle} className="ml-2 mb-3">
            <p className="text-zinc-400 font-medium mb-2">
              {chapterTitle}
            </p>

            <div className="ml-4 space-y-1">
              {Object.entries(topics).map(([topic, explanation]) => (
                <button
                  key={topic}
                  onClick={() =>
                    setSelectedTopic({
                      title: topic,
                      content: explanation,
                    })
                  }
                  className="block text-left w-full px-2 py-1 rounded-md hover:bg-zinc-800 transition"
                >
                  • {topic}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
)}

      </aside>

      {/* Center Pane */}
      <main className="flex-1 p-10 flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-purple-300">
          {selectedTopic.title}
        </h1>

        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 leading-relaxed text-zinc-200 whitespace-pre-wrap">
          {selectedTopic.content}
        </div>

        <div className="mt-6 flex gap-4">
          <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
            💾 Save to Notes
          </button>

          <button className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition">
            📄 Export to Google Docs
          </button>
        </div>
      </main>
    </div>
  );
}
