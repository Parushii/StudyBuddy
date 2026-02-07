import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const extractedText = location.state?.extractedText || "";

  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = quizData.filter(
    (q, i) => answers[i] === q.answer
  ).length;

  const isCurrentRevealed = revealed[current] === true;
  const selectedAnswer = answers[current];
  const correctIndex = quizData[current]?.answer;
  const isCorrect =
    isCurrentRevealed && selectedAnswer === correctIndex;

  // 🔹 AUTO GENERATE QUIZ ON LOAD
  useEffect(() => {
    if (!extractedText) {
      setError("No study material found to generate quiz.");
      setLoading(false);
      return;
    }

    generateQuiz(extractedText);
  }, [extractedText]);

  const generateQuiz = async (text) => {
    try {
      const response = await fetch(`${API}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Quiz generation failed");
      }

      setQuizData(data.quiz || []);
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 LOADING SCREEN
  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="text-center p-10 rounded-2xl border border-black/10 dark:border-white/10">
          <h1 className="text-3xl font-bold mb-4">
            Generating Quiz
          </h1>
          <p className="text-black/60 dark:text-white/60">
            Analyzing your study material…
          </p>
          <div className="mt-6 animate-pulse text-sm">
            Please wait a few seconds
          </div>
        </div>
      </div>
    );
  }

  // 🔹 ERROR SCREEN
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="p-10 rounded-2xl border border-red-500/40 bg-red-500/10 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Quiz Generation Failed
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

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <button
          onClick={() => navigate("/notebookview")}
          className="mb-6 px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
        >
          ← Back
        </button>

        {/* START SCREEN */}
        {!started ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="p-10 rounded-2xl border border-black/10 dark:border-white/10 text-center">
              <h1 className="text-4xl font-bold mb-4">
                Quiz Ready
              </h1>
              <p className="text-black/60 dark:text-white/60 mb-8">
                {quizData.length} questions generated from your notes
              </p>

              <button
                onClick={() => setStarted(true)}
                className="w-full py-3 rounded-xl border border-black/10 dark:border-white/10 hover:border-cyan-400/50"
              >
                Start Quiz
              </button>
            </div>
          </div>
        ) : submitted ? (
          /* RESULTS */
          <div className="p-8 rounded-2xl border border-black/10 dark:border-white/10">
            <h2 className="text-3xl font-bold text-center mb-6">
              Results
            </h2>

            <p className="text-center text-xl mb-8">
              Score: {score}/{quizData.length}
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {quizData.map((q, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    answers[i] === q.answer
                      ? "border-green-400/40 bg-green-400/10"
                      : "border-red-400/40 bg-red-400/10"
                  }`}
                >
                  <p className="font-semibold">{q.question}</p>
                  <p className="text-sm mt-1">
                    Correct: {q.options[q.answer]}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/notebookview")}
              className="w-full py-3 rounded-xl border border-black/10 dark:border-white/10"
            >
              Back to Notebook
            </button>
          </div>
        ) : (
          /* QUIZ */
          <div className="p-8 rounded-2xl border border-black/10 dark:border-white/10">
            <p className="text-sm mb-2">
              Question {current + 1} of {quizData.length}
            </p>

            <h3 className="text-xl font-semibold mb-6">
              {quizData[current].question}
            </h3>

            <div className="space-y-3 mb-6">
              {quizData[current].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={isCurrentRevealed}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [current]: i }));
                    setRevealed((r) => ({ ...r, [current]: true }));
                  }}
                  className={`w-full text-left px-5 py-3 rounded-xl border ${
                    !isCurrentRevealed
                      ? "border-black/10 dark:border-white/10"
                      : i === correctIndex
                      ? "border-green-400/60 bg-green-400/15"
                      : i === selectedAnswer
                      ? "border-red-400/60 bg-red-400/15"
                      : "border-black/10 dark:border-white/10 opacity-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-40"
              >
                ← Prev
              </button>

              {current === quizData.length - 1 ? (
                <button
                  disabled={!isCurrentRevealed}
                  onClick={() => setSubmitted(true)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10"
                >
                  Submit
                </button>
              ) : (
                <button
                  disabled={!isCurrentRevealed}
                  onClick={() => setCurrent((c) => c + 1)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
