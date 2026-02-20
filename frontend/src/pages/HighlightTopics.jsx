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

        // ✅ Auto-select first topic
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

      // ✅ Auto-select first topic after generation
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
    <div className="h-screen w-full bg-zinc-950 text-white flex">
      <aside className="w-[28%] border-r border-zinc-800 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-purple-400">
          📖 Contents
        </h2>

        {loading && (
          <p className="text-sm text-zinc-400">
            Generating structured notes…
          </p>
        )}

        {Array.isArray(content) &&
          content.map((fileGroup) => (
            <div key={fileGroup.fileName} className="mb-8">
              {/* ✅ File Name */}
              <h3 className="text-sm text-zinc-400 mb-3">
                📄 {fileGroup.fileName}
              </h3>

              {fileGroup.chapters.map((chapter) => (
                <div key={chapter.chapterTitle} className="mb-6">
                  <p className="text-purple-400 font-semibold mb-3">
                    {chapter.chapterTitle}
                  </p>

                  {chapter.topics.map((topic) => (
                    <button
                      key={topic.topicTitle}
                      onClick={() =>
                        setSelectedTopic({
                          title: topic.topicTitle,
                          content: topic.content,
                        })
                      }
                      className="block text-left w-full px-2 py-1 rounded-md hover:bg-zinc-800 transition"
                    >
                      • {topic.topicTitle}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
      </aside>

      <main className="flex-1 p-10 flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-purple-300">
          {selectedTopic.title}
        </h1>

        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 leading-relaxed text-zinc-200 whitespace-pre-wrap">
          {selectedTopic.content}
        </div>

        <div className="mt-6">
          <button
            onClick={regenerateHighlights}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
          >
            🔄 Regenerate Highlights
          </button>
        </div>
      </main>
    </div>
  );
}
