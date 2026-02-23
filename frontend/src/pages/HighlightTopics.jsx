import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function HighlightTopics() {
  const { notebookId } = useParams();

  const [content, setContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState({
    title: "Select a topic",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  const API =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (!notebookId) return;
    loadHighlights();
  }, [notebookId]);

  const loadHighlights = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/api/highlights/${notebookId}`
      );

      if (res.data && res.data.chapters?.length > 0) {
        setContent(res.data.chapters);

        const firstFile = res.data.chapters[0];
        const firstChapter = firstFile?.chapters?.[0];
        const firstTopic = firstChapter?.topics?.[0];

        if (firstTopic) {
          setSelectedTopic({
            title: firstTopic.topicTitle,
            content: firstTopic.content,
          });
        }
      } else {
        await regenerateHighlights();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const regenerateHighlights = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/api/highlights/generate/${notebookId}`,
        {
          userId: localStorage.getItem("userId"),
        }
      );

      setContent(res.data.chapters);

      const firstFile = res.data.chapters?.[0];
      const firstChapter = firstFile?.chapters?.[0];
      const firstTopic = firstChapter?.topics?.[0];

      if (firstTopic) {
        setSelectedTopic({
          title: firstTopic.topicTitle,
          content: firstTopic.content,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate highlights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#fdf6ec] flex relative overflow-hidden">

      {/* ✨ Glitter Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-20 animate-pulse bg-[radial-gradient(circle_at_20%_30%,#ffffff_2px,transparent_3px),radial-gradient(circle_at_70%_60%,#fff8dc_2px,transparent_3px)] bg-[length:120px_120px]" />

      {/* SIDEBAR */}
      <aside className="w-[28%] border-r border-[#e6c79c] p-8 overflow-y-auto bg-[#fff8ee]">
        <h2 className="text-2xl font-bold mb-6 text-[#5c4033]">
          📖 Contents
        </h2>

        {loading && (
          <p className="text-base text-[#8b6f47]">
            Generating structured notes…
          </p>
        )}

        {Array.isArray(content) &&
          content.map((fileGroup) => (
            <div key={fileGroup.fileName} className="mb-10">
              
              <h3 className="text-base text-[#8b6f47] mb-4 font-medium">
                📄 {fileGroup.fileName}
              </h3>

              {fileGroup.chapters.map((chapter) => (
                <div key={chapter.chapterTitle} className="mb-6">
                  <p className="text-lg font-semibold mb-3 text-[#4b2e2e]">
                    {chapter.chapterTitle}
                  </p>

                  {chapter.topics.map((topic) => {
                    const isActive =
                      selectedTopic.title === topic.topicTitle;

                    return (
                      <button
                        key={topic.topicTitle}
                        onClick={() =>
                          setSelectedTopic({
                            title: topic.topicTitle,
                            content: topic.content,
                          })
                        }
                        className={`block text-left w-full px-4 py-2 rounded-xl transition text-base
                        ${
                          isActive
                            ? "bg-[#d2b48c] text-[#3e2723] font-medium shadow-sm"
                            : "hover:bg-[#f5deb3]/70 text-[#5c4033]"
                        }`}
                      >
                        • {topic.topicTitle}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 flex flex-col relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-[#4b2e2e]">
          {selectedTopic.title}
        </h1>

        <div className="flex-1 bg-[#d2b48c] border border-[#c19a6b] rounded-2xl p-8 leading-relaxed text-[#3e2723] whitespace-pre-wrap shadow-md text-lg">
          {selectedTopic.content}
        </div>

        <div className="mt-8">
          <button
            onClick={regenerateHighlights}
            className="px-6 py-3 rounded-xl bg-[#8b5e3c] hover:bg-[#6f4e37] text-white transition text-lg shadow-sm"
          >
            🔄 Regenerate Highlights
          </button>
        </div>
      </main>
    </div>
  );
}