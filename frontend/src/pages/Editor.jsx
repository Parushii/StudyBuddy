import React, { useContext } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { NotesContext } from "../context/NotesContext";
import VoiceToText from "./VoiceToText";
import DownloadFile from "./DownloadFile";
import SummarizeNotes from "./SummarizeNotes";
import { ArrowLeft } from "lucide-react";

function TextEditor() {
  const {
    notes,
    setNotes,
    quillRef,
    clearNotes,
    lastSaved,
    saveNotes,
  } = useContext(NotesContext);

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 sm:px-6"
      style={{
        fontFamily: "Garamond, Georgia, serif",
        backgroundColor: "#E8DCC8",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(210,180,140,0.25) 0px, rgba(210,180,140,0.25) 2px, transparent 2px, transparent 40px)",
      }}
    >
      {/* ✨ Floating particles */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-300 rounded-full opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* 📄 Card */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-white/80 backdrop-blur-xl border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.18)] p-6 sm:p-10 z-10">

        {/* 🔙 Back */}
        <button
          onClick={() => (window.location.href = "/")}
          className="absolute left-4 sm:left-6 top-4 sm:top-6 flex items-center gap-2 text-xs sm:text-sm text-amber-900 hover:text-yellow-700 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* 🧠 Title */}
        <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-center text-amber-800 tracking-tight">
          Smart Notes Editor
        </h2>

        <p className="mt-3 text-center text-xs sm:text-sm text-amber-900/70 max-w-lg mx-auto">
          Write, organize, and enhance your notes with
          <span className="font-semibold text-amber-600"> AI-powered tools</span>.
        </p>

        {/* ⚡ Features */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-xl p-3 bg-amber-200/20 text-amber-900">
            ✍️ Rich Text Editing
          </div>
          <div className="rounded-xl p-3 bg-amber-200/20 text-amber-900">
            🎤 Voice to Notes
          </div>
          <div className="rounded-xl p-3 bg-amber-200/20 text-amber-900">
            🧠 AI Summaries
          </div>
        </div>

        {/* 🧾 Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold text-amber-900">
            Your Notes
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-amber-900/60">
                Saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}

            <button
              onClick={saveNotes}
              className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-amber-700 text-white hover:bg-amber-600 transition"
            >
              Save
            </button>

            <button
              onClick={clearNotes}
              className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-red-500 text-white hover:bg-red-400 transition"
            >
              Clear
            </button>

            <DownloadFile notes={notes} quillRef={quillRef} />
          </div>
        </div>

        {/* 📝 Editor */}
        <div className="mt-4 bg-white rounded-xl border border-amber-200 overflow-hidden">
          <ReactQuill
            ref={quillRef}
            value={notes}
            onChange={setNotes}
            theme="snow"
            className="h-[200px] sm:h-[300px]"
          />
        </div>

        {/* 🎤 Voice */}
        <div className="mt-6">
          <VoiceToText />
        </div>

        {/* 🧠 Summary */}
        <div className="mt-6">
          <SummarizeNotes notes={notes} />
        </div>
      </div>

      {/* ✨ Animation */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(-10vh) scale(1); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

export default TextEditor;