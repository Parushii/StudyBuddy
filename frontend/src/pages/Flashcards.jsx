import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdFlip } from "react-icons/md";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Flashcards() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [extractedText, setExtractedText] = useState("");
  const {notebookId} = useParams();

  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- FETCH EXISTING ---------------- */
  useEffect(() => {
  const fetchData = async () => {
    try {
      if (!notebookId) {
        setError("Notebook not found.");
        return;
      }

      // Get flashcards
      const flashRes = await axios.get(
        `${API}/api/flashcards/${notebookId}`
      );

      if (flashRes.data?.cards) {
        setFlashcards(
          flashRes.data.cards.map(card => ({
            question: card.front,
            answer: card.back
          }))
        );
      }

      // Get notebook text
      const textRes = await axios.get(
        `${API}/api/notebooks/${notebookId}/text`
      );

      setExtractedText(textRes.data.text);

    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [notebookId]);


  /* ---------------- GENERATE ---------------- */
  const generateFlashcards = async () => {
    if (!extractedText) return;

    try {
      setGenerating(true);
      setError("");

      const res = await axios.post(
        `${API}/api/flashcards/generate-flashcards`,
        { paragraph: extractedText }
      );

      const generated = res.data.flashcards || [];

      setFlashcards(generated);
      setCurrentIndex(0);
      setFlipped({});

      const userId = localStorage.getItem("userId");

      await axios.post(`${API}/api/flashcards`, {
        userId,
        notebookId,
        cards: generated.map(card => ({
          front: card.question,
          back: card.answer
        }))
      });

    } catch (err) {
      console.error(err);
      setError("Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleFlip = (i) =>
    setFlipped(prev => ({ ...prev, [i]: !prev[i] }));

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3 text-black dark:text-white">
            Loading Flashcards...
          </h1>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <button
          onClick={() => navigate("/notebookview/" + notebookId)}
          className="mb-8 px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
        >
          ← Back
        </button>

        <h1 className="text-5xl font-bold mb-6 text-center">
          Flashcards
        </h1>

        {/* EMPTY STATE */}
        {flashcards.length === 0 && (
          <div className="text-center mb-10">
            <p className="text-black/60 dark:text-white/60 mb-6">
              No flashcards generated yet.
            </p>

            {extractedText && (
              <button
                onClick={generateFlashcards}
                disabled={generating}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Flashcards"}
              </button>
            )}
          </div>
        )}

        {/* CARD DISPLAY */}
        {flashcards.length > 0 && (
          <>
            <div className="flex justify-center mb-10">
              <div
                onClick={() => toggleFlip(currentIndex)}
                className="w-full max-w-2xl h-80 cursor-pointer bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-8 hover:scale-[1.02] transition relative"
              >
                <p className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50 mb-4">
                  {flipped[currentIndex] ? "Answer" : "Question"}
                </p>

                <p className="text-2xl font-semibold whitespace-pre-wrap">
                  {flipped[currentIndex]
                    ? flashcards[currentIndex]?.answer
                    : flashcards[currentIndex]?.question}
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
                onClick={() => setCurrentIndex(i => i - 1)}
                className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="text-black/60 dark:text-white/60">
                {currentIndex + 1} / {flashcards.length}
              </span>

              <button
                disabled={currentIndex === flashcards.length - 1}
                onClick={() => setCurrentIndex(i => i + 1)}
                className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            {/* REGENERATE */}
            {extractedText && (
              <div className="text-center">
                <button
                  onClick={generateFlashcards}
                  disabled={generating}
                  className="px-6 py-3 rounded-xl border border-purple-400/40 hover:bg-purple-500/10 transition disabled:opacity-50"
                >
                  {generating ? "Regenerating..." : "Regenerate Flashcards"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
