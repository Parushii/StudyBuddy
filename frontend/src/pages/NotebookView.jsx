import React, { useRef, useEffect, useState } from "react";
import { Upload, Mic, Plus, Sparkles, BookOpen, Video, Trash2, Clock, Calendar } from "lucide-react";
import SubjectSidebar from "./SubjectSidebar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

/* ===== Wooden Feature Card ===== */
const FeatureCard = ({ icon: Icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="relative cursor-pointer p-8 rounded-xl transition hover:scale-[1.03]"
    style={{
      backgroundColor: "#d2b48c",
      border: "3px solid #8B5E3C",
      boxShadow: "4px 4px 0px #5a3a1a",
      fontFamily: "Garamond, Georgia, serif",
    }}
  >
    <div className="absolute inset-0 rounded-xl pointer-events-none" />
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-4">
        <Icon size={26} className="text-[#5a3a1a]" />
        <h3
          className="text-2xl tracking-wide"
          style={{ color: "#5a3a1a", textShadow: "1px 1px #c19a6b" }}
        >
          {title}
        </h3>
      </div>
      <p style={{ color: "#4b2e1e" }} className="text-lg">
        {description}
      </p>
    </div>
  </div>
);

export default function NotebookView() {
  const navigate = useNavigate();
  const { notebookId } = useParams();

  const [notebookName, setNotebookName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const refreshFiles = async () => {
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const res = await axios.get(`${API}/api/notebooks/${notebookId}`);
    setNotebookName(res.data.name);
    setSelectedFiles(res.data.sourceFiles.map((f) => ({
      id: f._id,
      name: f.name,
      source: f.source,
      driveFileId: f.driveFileId || null,
    })));
  };

  useEffect(() => { if (notebookId) refreshFiles(); }, [notebookId]);

  const handleUpload = async (e) => {
    const formData = new FormData();
    Array.from(e.target.files).forEach((f) => formData.append("files", f));
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    await axios.post(`${API}/api/notebooks/${notebookId}/add-files`, formData);
    await refreshFiles();
    e.target.value = "";
  };

  const handleDriveFileClick = async (file) => {
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const existing = selectedFiles.find((f) => f.driveFileId === file.id);
    if (existing) {
      await axios.delete(`${API}/api/notebooks/${notebookId}/remove-file/${existing.id}`);
    } else {
      await axios.post(`${API}/api/notebooks/${notebookId}/add-files`, {
        driveFiles: JSON.stringify([{ id: file.id, name: file.name }]),
      });
    }
    await refreshFiles();
  };

  const handleRemoveFile = async (fileId) => {
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    await axios.delete(`${API}/api/notebooks/${notebookId}/remove-file/${fileId}`);
    await refreshFiles();
  };

  const handleClearAll = async () => {
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    await axios.delete(`${API}/api/notebooks/${notebookId}/clear-files`);
    setSelectedFiles([]);
  };

  const generateFlashcardsFromFiles = async () => {
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const textRes = await axios.get(`${API}/api/notebooks/${notebookId}/text`);
    navigate("/flashcards/" + notebookId, {
      state: { extractedText: textRes.data.text },
    });
  };

  const generateQuizFromFiles = async () => {
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    await axios.get(`${API}/api/notebooks/${notebookId}/text`);
    navigate(`/quiz/${notebookId}`);
  };

  const requireFiles = (action) => {
    if (selectedFiles.length === 0) return alert("Please select at least one file.");
    action();
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{
        fontFamily: "Garamond, Georgia, serif",
        backgroundColor: "#E8DCC8",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(210,180,140,0.25) 0px, rgba(210,180,140,0.25) 2px, transparent 2px, transparent 40px)",
      }}
    >

      {/* ===== FLOATING GLITTER ===== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-amber-300 rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* LEFT PANEL */}
      <div className="w-[28%] min-w-[320px] p-8 flex flex-col gap-8 border-r border-amber-900/40 relative z-10">

        <h1
          className="text-3xl text-center"
          style={{ color: "#5a3a1a", textShadow: "1px 1px #c19a6b" }}
        >
          {notebookName}
        </h1>

        {/* Upload */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: "#d2b48c",
            border: "3px solid #8B5E3C",
            boxShadow: "4px 4px 0px #5a3a1a",
          }}
        >
          <h2 className="text-xl mb-4 flex items-center gap-3 text-[#5a3a1a]">
            <Upload size={22} /> Upload Study Material
          </h2>

          <div
            onClick={() => fileInputRef.current.click()}
            className="p-5 text-lg text-center cursor-pointer rounded-md"
            style={{
              backgroundColor: "#E8DCC8",
              border: "2px dashed #8B5E3C",
            }}
          >
            Click to add scrolls 📜
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleUpload}
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: "#d2b48c",
              border: "3px solid #8B5E3C",
              boxShadow: "4px 4px 0px #5a3a1a",
            }}
          >
            <div className="flex justify-between mb-4 text-lg">
              <span>Selected Scrolls ({selectedFiles.length})</span>
              <button
                onClick={handleClearAll}
                style={{ color: "#8b0000" }}
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center p-3 rounded text-lg"
                  style={{
                    backgroundColor: "#E8DCC8",
                    border: "1px solid #8B5E3C",
                  }}
                >
                  <span className="truncate">{file.name}</span>
                  <button onClick={() => handleRemoveFile(file.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drive Files Container Styled */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "#d2b48c",
            border: "3px solid #8B5E3C",
            boxShadow: "4px 4px 0px #5a3a1a",
          }}
        >
          <SubjectSidebar
            selectedFiles={selectedFiles}
            onFileClick={handleDriveFileClick}
          />
        </div>

        {/* Voice Button */}
        <button
          onClick={() => navigate("/voicetotext")}
          className="py-4 text-xl rounded-md"
          style={{
            background: "linear-gradient(to bottom, #8B5E3C, #5a3a1a)",
            border: "2px solid #3e2412",
            color: "#f5e6cc",
            boxShadow: "4px 4px 0px #2e1a0d",
          }}
        >
          🎙 Record Voice Note
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 grid grid-cols-2 gap-10 p-10 relative z-10">
        <FeatureCard icon={Sparkles} title="Highlight Key Topics" description="Identify important concepts automatically." onClick={() => requireFiles(() => navigate("/highlighttopics/" + notebookId))} />
        <FeatureCard icon={BookOpen} title="Summaries & Flashcards" description="Create concise summaries and flashcards." onClick={() => requireFiles(generateFlashcardsFromFiles)} />
        <FeatureCard icon={Clock} title="Daily Study Reminders" description="Smart reminders for consistency." />
        <FeatureCard icon={Calendar} title="Study Schedule" description="Auto-generated schedules." onClick={() => navigate("/scheduleplanner")} />
        <FeatureCard icon={Plus} title="Generate Quiz" description="Auto-generated quizzes." onClick={() => requireFiles(generateQuizFromFiles)} />
        <FeatureCard icon={BookOpen} title="YouTube Summarizer" description="Summarize YouTube lectures." onClick={() => navigate("/youtube-summarizer")} />
        <FeatureCard icon={Video} title="Recommended Videos" description="AI-picked study videos." onClick={() => navigate(`/videos/${notebookId}`)} />
      </div>
    </div>
  );
}