import React, { useRef, useEffect, useState } from "react";
import { Upload, Mic, Plus, Sparkles, BookOpen, Video, Trash2, Clock, Calendar } from "lucide-react";
import SubjectSidebar from "./SubjectSidebar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

/* ===== Translucent Wooden Card ===== */
const FeatureCard = ({ icon: Icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="relative cursor-pointer p-8 rounded-2xl transition hover:scale-[1.04] backdrop-blur-md"
    style={{
      background: "rgba(101, 67, 33, 0.55)", // translucent wood
      border: "1px solid rgba(255, 223, 150, 0.25)",
      boxShadow: "0 0 25px rgba(255, 200, 120, 0.15)",
    }}
  >
    <div className="relative z-10 text-amber-100">
      <div className="flex items-center gap-4 mb-4">
        <Icon size={26} className="text-amber-300 drop-shadow-[0_0_6px_rgba(255,200,120,0.7)]" />
        <h3 className="text-2xl tracking-wide font-semibold">
          {title}
        </h3>
      </div>
      <p className="text-lg text-amber-200/90">
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

  const API = "https://studybuddy-backend-7r0s.onrender.com";

  const refreshFiles = async () => {
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
    Array.from(e.target.files).forEach((f) =>
      formData.append("files", f)
    );

    await axios.post(`${API}/api/notebooks/${notebookId}/add-files`, formData);
    await refreshFiles();
    e.target.value = "";
  };

  const handleDriveFileClick = async (file) => {
    const existing = selectedFiles.find(
      (f) => f.driveFileId === file.id
    );

    if (existing) {
      await axios.delete(
        `${API}/api/notebooks/${notebookId}/remove-file/${existing.id}`
      );
    } else {
      await axios.post(`${API}/api/notebooks/${notebookId}/add-files`, {
        driveFiles: JSON.stringify([{ id: file.id, name: file.name }]),
      });
    }

    await refreshFiles();
  };

  const handleRemoveFile = async (fileId) => {
    await axios.delete(
      `${API}/api/notebooks/${notebookId}/remove-file/${fileId}`
    );
    await refreshFiles();
  };

  const handleClearAll = async () => {
    await axios.delete(
      `${API}/api/notebooks/${notebookId}/clear-files`
    );
    setSelectedFiles([]);
  };

  const generateFlashcardsFromFiles = async () => {
    const textRes = await axios.get(
      `${API}/api/notebooks/${notebookId}/text`
    );
    navigate("/flashcards/" + notebookId, {
      state: { extractedText: textRes.data.text },
    });
  };

  const generateQuizFromFiles = async () => {
    await axios.get(
      `${API}/api/notebooks/${notebookId}/text`
    );
    navigate(`/quiz/${notebookId}`);
  };
  const requireFiles = (action) => {
    if (selectedFiles.length === 0) {
      alert("Select at least one scroll 🌿");
      return;
    }
    action();
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden font-serif"
      style={{
        backgroundImage: "url('/enchanted-forest.jpg')", // 🔥 replace with your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Dark overlay for depth */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* 🐞 Fireflies */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {[...Array(45)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-yellow-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: "0 0 12px 4px rgba(255, 230, 150, 0.8)",
              animation: `firefly ${6 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* LEFT PANEL */}
      <div className="w-[28%] min-w-[320px] p-8 flex flex-col gap-8 border-r border-amber-200/20 relative z-10 text-amber-100">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
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
          Return to Library
        </button>
        <h1 className="text-3xl text-center font-semibold tracking-wide drop-shadow-lg">
          {notebookName}
        </h1>

        {/* Upload Box */}
        <div className="p-6 rounded-2xl backdrop-blur-md bg-[rgba(80,50,20,0.55)] border border-amber-200/20 shadow-lg">
          <h2 className="text-xl mb-4 flex items-center gap-3 text-amber-200">
            <Upload size={22} /> Add Scrolls
          </h2>

          <div
            onClick={() => fileInputRef.current.click()}
            className="p-5 text-lg text-center cursor-pointer rounded-lg border border-dashed border-amber-300/40 hover:bg-amber-200/10 transition"
          >
            Click to add ancient texts 📜
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleUpload}
          />
        </div>
        {selectedFiles.length > 0 && (
          <div className="p-6 rounded-2xl backdrop-blur-md bg-[rgba(80,50,20,0.55)] border border-amber-200/20 shadow-lg">
            <div className="flex justify-between mb-4 text-lg">
              <span>Selected Scrolls ({selectedFiles.length})</span>
              <button
                onClick={handleClearAll}
                className="text-red-300 hover:text-red-400 transition"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-amber-100/10 border border-amber-300/20"
                >
                  <span className="truncate">{file.name}</span>
                  <button onClick={() => handleRemoveFile(file.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="rounded-2xl p-4 backdrop-blur-md bg-[rgba(80,50,20,0.55)] border border-amber-200/20">
          <SubjectSidebar
            selectedFiles={selectedFiles}
            onFileClick={handleDriveFileClick}
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 grid grid-cols-2 gap-10 p-12 relative z-10">

        <FeatureCard icon={Sparkles} title="Highlight Key Topics" description="Let the forest spirits reveal important concepts." onClick={() => requireFiles(() => navigate("/highlighttopics/" + notebookId))} />
        <FeatureCard
          icon={BookOpen}
          title="Summaries & Flashcards"
          description="Turn scrolls into wisdom fragments."
          onClick={() => requireFiles(generateFlashcardsFromFiles)}
        />
        <FeatureCard icon={Clock} title="Daily Study Reminders" description="Whispers from the woodland to stay consistent." />
        <FeatureCard
          icon={Calendar}
          title="Study Schedule"
          description="Align your study rhythm with nature."
          onClick={() => navigate(`/scheduleplanner/${notebookId}`)}
        />
        <FeatureCard
          icon={Plus}
          title="Generate Quiz"
          description="Test your arcane knowledge."
          onClick={() => requireFiles(generateQuizFromFiles)}
        />
        <FeatureCard
          icon={Video}
          title="Recommended Videos"
          description="Dive into the stream of knowledge."
          onClick={() => navigate(`/videos/${notebookId}`)}
        />

      </div>

      {/* 🔥 Firefly animation keyframes */}
      <style>
        {`
          @keyframes firefly {
            0% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
            25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
            50% { transform: translateY(-10px) translateX(-15px); opacity: 0.6; }
            75% { transform: translateY(-25px) translateX(5px); opacity: 1; }
            100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          }
        `}
      </style>

    </div>
  );
}