import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdFlip } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Flashcards() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const extractedText = location.state?.extractedText || "";

  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- UTILS ---------------- */
  const normalizeCardText = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value))
      return value.map((v) => normalizeCardText(v)).join("\n");
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  /* ---------------- AUTO GENERATE ---------------- */
  useEffect(() => {
    if (!extractedText) {
      setError("No study material found to generate flashcards.");
      setLoading(false);
      return;
    }

    generateFlashcards(extractedText);
  }, [extractedText]);

  const generateFlashcards = async (text) => {
    try {
      const res = await axios.post(`${API}/generate-flashcards`, {
        paragraph: text,
      });

      setFlashcards(res.data.flashcards || []);
    } catch (err) {
      setError("Failed to generate flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (i) =>
    setFlipped((prev) => ({ ...prev, [i]: !prev[i] }));

  /* ---------------- LOADING ---------------- */
  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="p-10 rounded-2xl border border-black/10 dark:border-white/10 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Generating Flashcards
          </h1>
          <p className="text-black/60 dark:text-white/60">
            Extracting key concepts from your notes…
          </p>
          <div className="mt-6 animate-pulse text-sm">
            Please wait a moment
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="p-10 rounded-2xl border border-red-500/40 bg-red-500/10 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Flashcard Generation Failed
          </h2>
          <p className="text-red-400 text-sm">{error}</p>

          <button
            onClick={() => navigate("/notebookview")}
            className="mt-6 px-6 py-2 rounded-xl border border-red-400/40"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      {/* grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <button
          onClick={() => navigate("/notebookview")}
          className="mb-8 px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
        >
          ← Back
        </button>

        <h1 className="text-5xl font-bold mb-4 text-center">
          Flashcards
        </h1>
        <p className="text-black/60 dark:text-white/60 text-center mb-10">
          {flashcards.length} cards generated from your notes
        </p>

        {/* CARD */}
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

        {/* NAVIGATION */}
        <div className="flex justify-between items-center mb-10">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40"
          >
            ← Previous
          </button>

          <span className="text-black/60 dark:text-white/60">
            {currentIndex + 1} / {flashcards.length}
          </span>

          <button
            disabled={currentIndex === flashcards.length - 1}
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40"
          >
            Next →
          </button>
        </div>

        {/* RESET */}
        <button
          onClick={() => navigate("/notebookview")}
          className="w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition"
        >
          Back to Notebook
        </button>
      </div>
    </div>
  );
}
