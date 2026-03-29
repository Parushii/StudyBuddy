import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DownloadFile from "./DownloadFile";

/* ===== Botanical illustration for empty state ===== */
const BotanicalIllustration = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M130 240 Q128 200 125 170 Q120 140 115 110 Q110 80 120 50" stroke="#6b8c4e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M120 140 C100 130, 75 120, 60 100 C75 105, 95 115, 118 128Z" fill="#5a8f4e" opacity="0.85" />
    <path d="M120 140 C100 130, 75 120, 60 100" stroke="#3d6b35" strokeWidth="0.8" fill="none" />
    <path d="M118 115 C138 105, 162 95, 178 75 C163 82, 142 95, 120 112Z" fill="#4a7c3f" opacity="0.85" />
    <path d="M118 115 C138 105, 162 95, 178 75" stroke="#2d5a27" strokeWidth="0.8" fill="none" />
    <path d="M115 160 C95 148, 72 140, 55 122 C70 130, 92 142, 114 158Z" fill="#6aaa5a" opacity="0.75" />
    <path d="M115 160 C95 148, 72 140, 55 122" stroke="#4a7c3f" strokeWidth="0.8" fill="none" />
    <path d="M122 90 C140 78, 162 68, 180 50 C164 60, 144 72, 123 88Z" fill="#5a8f4e" opacity="0.80" />
    <path d="M122 90 C140 78, 162 68, 180 50" stroke="#3d6b35" strokeWidth="0.8" fill="none" />
    <path d="M120 60 C108 50, 95 42, 82 32 C96 40, 110 50, 121 58Z" fill="#7ab86a" opacity="0.70" />
    <path d="M121 55 C130 44, 142 36, 156 26 C143 36, 132 46, 122 54Z" fill="#5a8f4e" opacity="0.70" />
    <path d="M116 175 C105 168, 94 164, 82 158" stroke="#6b8c4e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <ellipse cx="82" cy="157" rx="7" ry="4" fill="#6aaa5a" opacity="0.7" transform="rotate(-30 82 157)" />
    <ellipse cx="94" cy="163" rx="5" ry="3" fill="#5a8f4e" opacity="0.65" transform="rotate(-20 94 163)" />
    <path d="M117 185 C128 178, 138 174, 150 168" stroke="#6b8c4e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <ellipse cx="150" cy="167" rx="7" ry="4" fill="#4a7c3f" opacity="0.7" transform="rotate(25 150 167)" />
    <ellipse cx="138" cy="173" rx="5" ry="3" fill="#6aaa5a" opacity="0.65" transform="rotate(15 138 173)" />
    <circle cx="120" cy="48" r="5" fill="#e8a87c" opacity="0.9" />
    <circle cx="113" cy="42" r="3.5" fill="#d4956a" opacity="0.85" />
    <circle cx="127" cy="43" r="3" fill="#e8a87c" opacity="0.80" />
    <path d="M118 50 C112 46, 106 44, 100 40" stroke="#5a8f4e" strokeWidth="1" fill="none" />
    <ellipse cx="101" cy="40" rx="5" ry="2.5" fill="#6aaa5a" opacity="0.7" transform="rotate(-40 101 40)" />
    <path d="M122 50 C128 46, 134 44, 140 40" stroke="#5a8f4e" strokeWidth="1" fill="none" />
    <ellipse cx="140" cy="40" rx="5" ry="2.5" fill="#5a8f4e" opacity="0.7" transform="rotate(40 140 40)" />
    <ellipse cx="128" cy="243" rx="22" ry="5" fill="#c4956a" opacity="0.3" />
  </svg>
);

/* ===== Corner vine — botanical decoration for reading card ===== */
const CornerVine = ({ position }) => {
  const isRight = position === "tr" || position === "br";
  const isBottom = position === "bl" || position === "br";
  return (
    <svg
      width="90" height="90" viewBox="0 0 80 80" fill="none"
      style={{
        position: "absolute",
        top: isBottom ? "auto" : -8,
        bottom: isBottom ? -8 : "auto",
        left: isRight ? "auto" : -8,
        right: isRight ? -8 : "auto",
        transform: `scale(${isRight ? -1 : 1}, ${isBottom ? -1 : 1})`,
        pointerEvents: "none",
        opacity: 0.72,
        zIndex: 2,
      }}
    >
      {/* Main curved stem */}
      <path d="M4 76 Q4 40 40 4" stroke="#6b8c4e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Large leaf */}
      <path d="M20 60 C10 50, 4 40, 4 30 C12 38, 18 50, 20 60Z" fill="#5a8f4e" opacity="0.85" />
      <path d="M20 60 C12 50, 8 40, 4 30" stroke="#3d6b35" strokeWidth="0.7" fill="none" />
      {/* Upper leaf */}
      <path d="M36 28 C26 22, 18 18, 12 10 C20 16, 30 22, 36 28Z" fill="#6aaa5a" opacity="0.80" />
      <path d="M36 28 C26 22, 18 18, 12 10" stroke="#4a7c3f" strokeWidth="0.7" fill="none" />
      {/* Side leaf */}
      <path d="M12 44 C6 36, 4 28, 8 18 C10 28, 10 36, 12 44Z" fill="#4a7c3f" opacity="0.75" />
      {/* Small sprig */}
      <path d="M28 14 C22 10, 16 8, 10 4" stroke="#6b8c4e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="10" cy="4" rx="5" ry="2.5" fill="#7ab86a" opacity="0.70" transform="rotate(-40 10 4)" />
      {/* Berry at tip */}
      <circle cx="40" cy="4" r="3.5" fill="#e8a87c" opacity="0.90" />
      <circle cx="35" cy="7" r="2" fill="#d4956a" opacity="0.80" />
    </svg>
  );
};

export default function HighlightTopics() {
  const { notebookId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [startTime, setStartTime] = useState(null);
  const [notebook, setNotebook] = useState(null);

  const API ="https://studybuddy-backend-7r0s.onrender.com";
  useEffect(() => {
    const fetchNotebook = async () => {
      const res = await fetch(`${API}/api/notebooks/${notebookId}`);
      const data = await res.json();
      setNotebook(data);
    };

    fetchNotebook();
  }, [notebookId]);
  const subject = notebook?.name || "Unknown";


  useEffect(() => { if (notebookId) loadHighlights(); }, [notebookId]);

  const getAllContent = () => {
  let fullText = "";

  content.forEach(fileGroup => {
    fullText += `\n\n${fileGroup.fileName}\n`;

    fileGroup.chapters.forEach(chapter => {
      fullText += `\n${chapter.chapterTitle}\n`;

      chapter.topics.forEach(topic => {
        fullText += `\n${topic.topicTitle}\n`;
        fullText += `${topic.content}\n`;
      });
    });
  });

  return fullText;
};
  const loadHighlights = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/highlights/${notebookId}`);
      if (res.data && res.data.chapters?.length > 0) {
        setContent(res.data.chapters);
        const firstTopic = res.data.chapters[0]?.chapters?.[0]?.topics?.[0];
        if (firstTopic) setSelectedTopic({ title: firstTopic.topicTitle, content: firstTopic.content });
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
      const res = await axios.post(`${API}/api/highlights/generate/${notebookId}`, {
        userId: localStorage.getItem("userId"),
      });
      setContent(res.data.chapters);
      const firstTopic = res.data.chapters?.[0]?.chapters?.[0]?.topics?.[0];
      if (firstTopic) setSelectedTopic({ title: firstTopic.topicTitle, content: firstTopic.content });
    } catch (err) {
      console.error(err);
      alert("Failed to generate highlights");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = async (topic) => {

    if (startTime && selectedTopic.title) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      await axios.post(`${API}/api/progress/time`, {
        userId: localStorage.getItem("userId"),
        notebookId,
        subject,
        topicTitle: selectedTopic.title,
        timeSpent
      });
    }

    setSelectedTopic({
      title: topic.topicTitle,
      content: topic.content
    });

    setStartTime(Date.now());

    try {
      await axios.post(`${API}/api/progress/topic-visit`, {
        userId: localStorage.getItem("userId"),
        notebookId,
        subject,
        topicTitle: topic.topicTitle
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (startTime && selectedTopic.title) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        axios.post(`${API}/api/progress/time`, {
          userId: localStorage.getItem("userId"),
          notebookId,
          subject,
          topicTitle: selectedTopic.title,
          timeSpent
        });
      }
    };
  }, [selectedTopic]);

  return (
    <div className="h-screen w-full flex" style={{ fontFamily: "Georgia, serif", backgroundColor: "#f0e6d3" }}>

      {/* ===== SIDEBAR ===== */}
      <aside
        className="w-[26%] min-w-[260px] flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #fdf6ec 0%, #f5e8d0 60%, #eedfc4 100%)",
          borderRight: "3px solid #c4956a",
          boxShadow: "4px 0 16px rgba(139,94,60,0.12)",
        }}
      >
        <div className="px-6 py-5 flex-shrink-0" style={{
          background: "linear-gradient(135deg, #8B5E3C 0%, #a07050 50%, #8B5E3C 100%)",
          borderBottom: "3px solid #6b3f1f",
          boxShadow: "0 3px 8px rgba(107,63,31,0.3)",
        }}>
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 mb-4 
                       rounded-xl backdrop-blur-md 
                       bg-[rgba(80,50,20,0.55)] 
                       border border-amber-200/20 
                       text-amber-200 
                       hover:bg-amber-200/10 
                       hover:shadow-[0_0_10px_rgba(251,191,36,0.4)] 
                       hover:scale-105 
                       transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-base font-bold tracking-wide" style={{ color: "#fff8f0" }}>Contents</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,248,240,0.6)" }}>Select a topic to read</p>
            </div>
          </div>
        </div>

        <div className="flex items-center px-4 py-2" style={{ borderBottom: "1px solid rgba(196,149,106,0.2)" }}>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(196,149,106,0.5), transparent)" }} />
          <span className="mx-2 text-xs" style={{ color: "#c4956a" }}>🌿</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(196,149,106,0.5), transparent)" }} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex items-center gap-1.5 text-sm mt-4 px-2" style={{ color: "#9a6840" }}>
              <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" style={{ animationDelay: "0.3s" }} />
              <span className="ml-1">Generating…</span>
            </div>
          )}

          {Array.isArray(content) && content.map((fileGroup) => (
            <div key={fileGroup.fileName} className="mb-7">
              <div className="text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1.5 rounded-lg" style={{
                color: "#fff8f0",
                background: "linear-gradient(to right, #9a6840, #b07d52)",
                boxShadow: "2px 2px 0px rgba(107,63,31,0.3)",
              }}>
                {fileGroup.fileName}
              </div>

              {fileGroup.chapters.map((chapter) => (
                <div key={chapter.chapterTitle} className="mb-4">
                  <div className="flex items-center gap-2 mb-2 pl-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#c4956a" }} />
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#7a5030" }}>
                      {chapter.chapterTitle}
                    </p>
                  </div>

                  {chapter.topics.map((topic) => {
                    const isActive = selectedTopic.title === topic.topicTitle;
                    return (
                      <button
                        key={topic.topicTitle}
                        onClick={() => handleTopicClick(topic)}
                        className="block text-left w-full px-3 py-2 rounded-lg text-sm mb-1"
                        style={{
                          background: isActive ? "linear-gradient(to right, #fff8f0, #fdf0e0)" : "transparent",
                          color: isActive ? "#5a3a1a" : "#7a5030",
                          fontWeight: isActive ? "600" : "400",
                          border: isActive ? "1.5px solid #c4956a" : "1.5px solid transparent",
                          boxShadow: isActive ? "2px 2px 6px rgba(196,149,106,0.35)" : "none",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(253,246,236,0.7)"; e.currentTarget.style.borderColor = "rgba(196,149,106,0.35)"; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
                      >
                        <span style={{ color: "#c4956a", marginRight: "6px" }}>{isActive ? "🍀" : "·"}</span>
                        {topic.topicTitle}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "2px solid rgba(196,149,106,0.3)" }}>
          <button
            onClick={regenerateHighlights}
            className="w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #7a4e2a, #5a3418)",
              border: "2px solid #d4af37",
              color: "#fff8f0",
              boxShadow: "0 4px 12px rgba(90,52,24,0.4)",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.04em",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(90,52,24,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(90,52,24,0.4)";
            }}

          >
            Invoke New Highlights
          </button>
        </div>
      </aside>

      {/* ===== READING PANEL ===== */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#f0e6d3" }}>

        <div className="px-8 py-4 flex items-center justify-between flex-shrink-0" style={{
          background: "linear-gradient(to bottom, #fdf6ec, #f7eedc)",
          borderBottom: "2.5px solid #c4956a",
          boxShadow: "0 2px 8px rgba(139,94,60,0.1)",
        }}>
          <h1 className="text-xl font-bold truncate pr-4" style={{ color: "#4a2e10", fontFamily: "Georgia, serif" }}>
            {selectedTopic.title || "📖 Open a topic to begin reading"}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DownloadFile
              content={getAllContent()}
              title="Full Highlights"
            />
            <span className="text-xs font-medium" style={{ color: "#9a6840" }}>Size</span>
            <button onClick={() => setFontSize(f => Math.max(13, f - 1))}
              className="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center"
              style={{ background: "linear-gradient(to bottom, #fdf6ec, #f0e6d3)", border: "1.5px solid #c4956a", color: "#6b3f1f", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff8f0"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}
            >A−</button>
            <span className="text-xs w-5 text-center font-medium" style={{ color: "#9a6840" }}>{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(26, f + 1))}
              className="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center"
              style={{ background: "linear-gradient(to bottom, #fdf6ec, #f0e6d3)", border: "1.5px solid #c4956a", color: "#6b3f1f", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fff8f0"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}
            >A+</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {selectedTopic.content ? (

            /* ===== READING CARD — wrapped in relative container for corner vines ===== */
            <div className="max-w-3xl mx-auto" style={{ position: "relative" }}>

              {/* Corner vines sit outside the card */}
              <CornerVine position="tl" />
              <CornerVine position="tr" />
              <CornerVine position="bl" />
              <CornerVine position="br" />

              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "2.5px solid #c4956a",
                  boxShadow: "5px 5px 0px rgba(196,149,106,0.45), 0 10px 32px rgba(139,94,60,0.12)",
                }}
              >
                {/* Wooden top strip — unchanged */}
                <div style={{
                  background: "linear-gradient(to right, #8B5E3C, #a07050, #8B5E3C)",
                  padding: "9px 18px",
                  borderBottom: "2px solid #6b3f1f",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <span className="ml-2 text-xs" style={{ color: "rgba(255,248,240,0.7)", fontFamily: "Georgia, serif" }}>
                    {selectedTopic.title}
                  </span>
                </div>

                {/* White reading content — unchanged */}
                <div
                  className="p-10"
                  style={{
                    backgroundColor: "#fffef9",
                    color: "#2c1a0e",
                    fontSize: `${fontSize}px`,
                    lineHeight: "1.95",
                    fontFamily: "Georgia, serif",
                    whiteSpace: "pre-wrap",
                    minHeight: "400px",
                  }}
                >
                  {selectedTopic.content}
                </div>
              </div>
            </div>

          ) : (
            /* ===== BOTANICAL EMPTY STATE — unchanged ===== */
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-full py-16">
              <div
                className="rounded-3xl p-12 flex flex-col items-center text-center"
                style={{
                  background: "linear-gradient(135deg, #fdf6ec, #f5e8d0)",
                  border: "2.5px solid #c4956a",
                  boxShadow: "5px 5px 0px rgba(196,149,106,0.4), 0 12px 36px rgba(139,94,60,0.1)",
                }}
              >
                <BotanicalIllustration />
                <h2 className="text-2xl font-bold mt-4 mb-2" style={{ color: "#5a3a1a", fontFamily: "Georgia, serif" }}>
                  Your reading awaits
                </h2>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#9a6840" }}>
                  Select a topic from the contents panel to begin reading your structured notes.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: "#c4956a" }}>
                  <span>🌿</span>
                  <span>Knowledge grows like a garden — one leaf at a time</span>
                  <span>🌿</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}