import { useState, useEffect } from "react";
import axios from "axios";
import { useSelectedFiles } from "../context/SelectedFilesContext";
import { useNavigate } from "react-router-dom";

export default function HighlightTopics() {
  const navigate = useNavigate();
  const { selectedFiles } = useSelectedFiles();

  const [content, setContent] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState({
    title: "Generating notes…",
    content: "Please wait while we analyze your study material.",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      navigate("/notebookview");
      return;
    }

    generateNotesFromContext();
  }, []);

const generateNotesFromContext = async () => {
  try {
    setLoading(true);

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      if (file.localFile) {
        // uploaded files
        formData.append("files", file.localFile);
      } else if (file.source === "drive") {
        // drive files → send metadata
        formData.append(
          "driveFiles",
          JSON.stringify({
            id: file.id,
            name: file.name,
          })
        );
      }
    });

    const API =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const res = await axios.post(
      `${API}/api/generate-notes`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setContent(res.data);
  } catch (err) {
    console.error(err);
    alert("Failed to generate notes");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="h-screen w-full bg-zinc-950 text-white flex">
      {/* LEFT PANE */}
      <aside className="w-[28%] border-r border-zinc-800 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2 text-purple-400">
          📖 Contents
        </h2>

        <p className="text-sm text-zinc-400 mb-4">
          Using {selectedFiles.length} selected file(s)
        </p>

        {loading && (
          <p className="text-sm text-zinc-400">
            Generating structured notes…
          </p>
        )}

        {content && (
          <div className="space-y-6 text-sm">
            {Object.entries(content).map(([fileName, chapters]) => (
              <div key={fileName}>
                <p className="text-purple-400 font-semibold mb-3">
                  {fileName}
                </p>

                {Object.entries(chapters).map(
                  ([chapterTitle, topics]) => (
                    <div key={chapterTitle} className="ml-2 mb-3">
                      <p className="text-zinc-400 font-medium mb-2">
                        {chapterTitle}
                      </p>

                      <div className="ml-4 space-y-1">
                        {Object.entries(topics).map(
                          ([topic, explanation]) => (
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
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* CENTER PANE */}
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
