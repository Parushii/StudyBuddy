import React, { useRef } from "react";
import {
  Upload,
  Mic,
  Plus,
  Sparkles,
  BookOpen,
  Video,
  Trash2,
  Clock,
  Calendar,
} from "lucide-react";
import SubjectSidebar from "./SubjectSidebar";
import { useNavigate } from "react-router-dom";
import { useSelectedFiles } from "../context/SelectedFilesContext";
import axios from "axios";

const FeatureCard = ({ icon: Icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="relative group cursor-pointer rounded-2xl p-6
      bg-white dark:bg-black
      border border-black/10 dark:border-white/10
      overflow-hidden"
  >
    {/* Aceternity glow */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100
      transition duration-300
      bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-indigo-500/10"
    />

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="text-cyan-500" />
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-sm text-black/70 dark:text-white/70">
        {description}
      </p>
    </div>
  </div>
);

export default function NotebookView() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const {
    selectedFiles,
    toggleFile,
    removeFile,
    clearAll,
    addLocalFiles,
  } = useSelectedFiles();

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      id: `${file.name}-${crypto.randomUUID()}`,
      name: file.name,
      localFile: file,
      source: "local",
    }));

    addLocalFiles(mapped);
    e.target.value = "";
  };

  const requireFiles = (action) => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }
    action();
  };

  const generateFlashcardsFromFiles = async () => {
  const formData = new FormData();

  selectedFiles.forEach(f => {
    formData.append("files", f.localFile);
  });

  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const res = await axios.post(`${API}/api/extract-text`, formData);

  navigate("/flashcards", {
    state: { extractedText: res.data.text }
  });
};

  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      {/* LEFT */}
      <div className="w-[26%] min-w-[280px] flex flex-col gap-4 p-6 border-r border-black/10 dark:border-white/10">

        {/* Upload */}
        <div className="rounded-2xl p-4 border border-black/10 dark:border-white/10">
          <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Upload size={16} className="text-cyan-500" />
            Upload Study Material
          </h2>

          <div
            onClick={() => fileInputRef.current.click()}
            className="rounded-xl border border-dashed
              border-black/20 dark:border-white/20
              p-4 text-xs text-center cursor-pointer
              hover:border-cyan-400 transition"
          >
            Click or drag files here
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleUpload}
          />
        </div>

        {/* SELECTED FILES / EMPTY STATE */}
        {selectedFiles.length > 0 ? (
          <div className="rounded-2xl p-4 border border-black/10 dark:border-white/10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">
                Selected Files ({selectedFiles.length})
              </h3>

              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center
                    text-sm p-2 rounded
                    bg-black/5 dark:bg-white/5"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="relative rounded-2xl p-6 text-center
            border border-white/10 dark:border-white/10
            bg-white dark:bg-black
            overflow-hidden group"
          >
            {/* gradient glow */}
            <div
              className="absolute inset-0 opacity-100
              bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-indigo-500/20"
            />

            {/* dotted overlay */}
            <div
              className="absolute inset-0
              bg-[radial-gradient(#0000001a_1px,transparent_1px)]
              dark:bg-[radial-gradient(#ffffff1a_1px,transparent_1px)]
              bg-[size:20px_20px]"
            />

            <div className="relative z-10">
              <div className="text-xl font-semibold text-black dark:text-white mb-2">
                No files selected
              </div>
              <div className="text-sm text-black/70 dark:text-white/70">
                Upload files or select from the sidebar to get started
              </div>
            </div>
          </div>
        )}

        {/* Drive Sidebar */}
        <div className="flex-1 overflow-y-auto">
          <SubjectSidebar
            selectedFiles={selectedFiles}
            onAddFile={toggleFile}
          />
        </div>

        <button className="rounded-xl py-3 border border-black/10 dark:border-white/10
          flex items-center justify-center gap-2 cursor-pointer" onClick={()=>navigate("/voicetotext")}>
          <Mic size={16} />
          Record Voice Note
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex-1 grid grid-cols-2 gap-6 p-6">
        <FeatureCard
          icon={Sparkles}
          title="Highlight Key Topics"
          description="Identify important concepts automatically from your notes."
          onClick={() => navigate("/highlighttopics")}
        />
        <FeatureCard
          icon={BookOpen}
          title="Summaries & Flashcards"
          description="Create concise summaries and quick revision flashcards."
          onClick={() => requireFiles(generateFlashcardsFromFiles)}
        />
        <FeatureCard
          icon={Clock}
          title="Daily Study Reminders"
          description="Smart reminders to keep your study routine consistent."
        />
        <FeatureCard
          icon={Calendar}
          title="Personalized Study Schedule"
          description="Auto-generated schedules based on exams and syllabus."
        />
        <FeatureCard
          icon={Plus}
          title="Generate Quiz"
          description="Auto-generated quizzes based on your study material."
          onClick={() => navigate("/quiz")}
        />
        <FeatureCard
          icon={Video}
          title="Youtube Search"
          description="Find relevant videos based on your notes and topics."
          onClick={() => navigate("/youtubelink")}
        />
        <FeatureCard
          title="Youtube Summarizer"
          icon={BookOpen}
          description="Get concise summaries of YouTube videos."
          onClick={() => navigate("/youtube-summarizer")}
        />
      </div>
    </div>
  );
}
