import React, { useState } from "react";
import axios from "axios";
import { MdFlip } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Flashcards() {
  const navigate = useNavigate();
  const [paragraph, setParagraph] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");

  const normalizeCardText = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map((v) => normalizeCardText(v)).join("\n");
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const generateFlashcards = async () => {
    if (!paragraph.trim()) {
      setError("Please enter some text");
      return;
    }

    // if (paragraph.length > 5000) {
    //   setError("Text exceeds 5000 characters");
    //   return;
    // }

    setError("");
    setFlashcards([]);
    setFlipped({});
    setCurrentIndex(0);

    try {
      const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res = await axios.post(`${API}/generate-flashcards`, { paragraph });
      setFlashcards(res.data.flashcards || []);
    } catch (err) {
      setError("Failed to generate flashcards");
    }
  };

  const location = useLocation();

useEffect(() => {
  if (location.state?.extractedText) {
    setParagraph(location.state.extractedText);
  }
}, []);

  const toggleFlip = (i) =>
    setFlipped((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white relative">
      {/* grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <button
          onClick={() => navigate("/notebookview")}
          className="mb-8 px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-5xl font-bold mb-4 text-center">
          Flashcards Generator
        </h1>
        <p className="text-black/60 dark:text-white/60 text-center mb-10">
          Paste your notes and generate flashcards instantly
        </p>

        {flashcards.length === 0 ? (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-6">
            <textarea
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="Paste your content here (max 5000 characters)"
              className="w-full h-48 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />

            <div className="flex justify-between mt-2 text-sm text-black/50 dark:text-white/50">
              <span>{paragraph.length}/5000</span>
              {error && <span className="text-red-400">{error}</span>}
            </div>

            <button
              onClick={generateFlashcards}
              className="mt-6 w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-400/50 hover:bg-black/10 dark:hover:bg-white/10 transition"
            >
              ✨ Generate Flashcards
            </button>
          </div>
        ) : (
          <>
            {/* main card */}
            <div className="flex justify-center mb-10">
              <div
                onClick={() => toggleFlip(currentIndex)}
                className="w-full max-w-2xl h-80 cursor-pointer bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-8 hover:scale-[1.02] transition relative"
              >
                <p className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50 mb-4">
                  {flipped[currentIndex] ? "Answer" : "Question"}
                </p>

                <p className="text-2xl font-semibold">
                  <span className="block whitespace-pre-wrap break-words max-h-52 overflow-auto pr-1">
                    {normalizeCardText(
                      flipped[currentIndex]
                        ? flashcards[currentIndex]?.answer
                        : flashcards[currentIndex]?.question
                    )}
                  </span>
                </p>

                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-black/40 dark:text-white/40">
                  <MdFlip />
                  Click to flip
                </div>
              </div>
            </div>

            {/* navigation */}
            <div className="flex justify-between items-center mb-10">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-black/60 dark:text-white/60">
                {currentIndex + 1} / {flashcards.length}
              </span>

              <button
                disabled={currentIndex === flashcards.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            {/* reset */}
            <button
              onClick={() => {
                setParagraph("");
                setFlashcards([]);
              }}
              className="w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition"
            >
              Create New Flashcards
            </button>
          </>
        )}
      </div>
    </div>
  );
}
