import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Quiz() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [inputMode, setInputMode] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const score = quizData.filter((q, i) => answers[i] === q.answer).length;

  const selectedAnswer = answers[current];
  const isCurrentRevealed = revealed[current] === true;
  const currentCorrectIndex = quizData[current]?.answer;
  const isCurrentCorrect =
    isCurrentRevealed && selectedAnswer === currentCorrectIndex;

  const resetQuizState = () => {
    setStarted(false);
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    setCurrent(0);
  };

  const handleGenerateQuiz = async () => {
    setError("");

    if (inputMode === "text") {
      if (!textInput.trim()) {
        setError("Please enter some text");
        return;
      }

    } else {
      if (!fileInput) {
        setError("Please select a file");
        return;
      }
    }

    setLoading(true);
    resetQuizState();
    setQuizData([]);

    try {
      let response;

      if (inputMode === "text") {
        response = await fetch(`${API}/generate-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput.trim() }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", fileInput);
        response = await fetch(`${API}/generate-quiz-file`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to generate quiz");
        return;
      }

      setQuizData(data.quiz || []);
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white relative">
      {/* grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <button
          onClick={() => navigate("/")}
          className="mb-8 px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
        >
          ← Home
        </button>

        {quizData.length === 0 ? (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-8">
            <h1 className="text-4xl font-bold mb-2">Generate a Quiz</h1>
            <p className="text-black/60 dark:text-white/60 mb-8">
              Upload a file or paste text to generate your quiz
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setInputMode("text")}
                className={`px-4 py-2 rounded-xl border transition ${
                  inputMode === "text"
                    ? "border-cyan-400/60 bg-cyan-400/10"
                    : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                Enter text
              </button>
              <button
                onClick={() => setInputMode("file")}
                className={`px-4 py-2 rounded-xl border transition ${
                  inputMode === "file"
                    ? "border-cyan-400/60 bg-cyan-400/10"
                    : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                Upload file
              </button>
            </div>

            {inputMode === "text" ? (
              <div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your content here"
                  className="w-full h-48 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl p-4 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-cyan-400"
                />
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.pptx"
                  onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                  className="w-full rounded-xl px-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white"
                />
                {fileInput && (
                  <p className="text-sm text-black/50 dark:text-white/50 mt-2">
                    Selected: {fileInput.name}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3">
                <p className="text-red-300 text-sm">❌ {error}</p>
              </div>
            )}

            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="mt-6 w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-400/50 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Quiz"}
            </button>
          </div>
        ) : !started ? (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-10 text-center">
              <h1 className="text-5xl font-bold mb-4">Quiz Master</h1>
              <p className="text-black/60 dark:text-white/60 mb-8">
                {quizData.length} questions • Test your knowledge
              </p>

              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-400/50 transition"
              >
                Start Quiz
              </button>

              <button
                onClick={() => {
                  setQuizData([]);
                  resetQuizState();
                }}
                className="mt-3 w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition"
              >
                Change Input
              </button>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-8">
            <h2 className="text-4xl font-bold text-center mb-6">
              Results
            </h2>

            <p className="text-center text-2xl mb-8">
              Score: {score}/{quizData.length}
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {quizData.map((q, i) => {
                const correct = answers[i] === q.answer;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      correct
                        ? "border-green-400/40 bg-green-400/15"
                        : "border-red-400/40 bg-red-400/15"
                    }`}
                  >
                    <p className="font-semibold">{q.question}</p>
                    <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                      Your answer: {q.options[answers[i]] ?? "Not answered"}
                    </p>
                    {!correct && (
                      <p className="text-sm text-black/80 dark:text-white/80 mt-1">
                        Correct answer: {q.options[q.answer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setQuizData([]);
                resetQuizState();
                setTextInput("");
                setFileInput(null);
              }}
              className="w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition"
            >
              Create New Quiz
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-8">
            <p className="text-black/50 dark:text-white/50 mb-2">
              Question {current + 1} of {quizData.length}
            </p>

            <h3 className="text-2xl font-semibold mb-6">
              {quizData[current].question}
            </h3>

            <div className="space-y-3 mb-8">
              {quizData[current].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={isCurrentRevealed}
                  onClick={() => {
                    if (isCurrentRevealed) return;
                    setAnswers((a) => ({ ...a, [current]: i }));
                    setRevealed((r) => ({ ...r, [current]: true }));
                  }}
                  className={`w-full text-left px-5 py-3 rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-90 ${
                    !isCurrentRevealed
                      ? answers[current] === i
                        ? "border-cyan-400/60 bg-cyan-400/10"
                        : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                      : i === currentCorrectIndex
                        ? "border-green-400/60 bg-green-400/15"
                        : i === selectedAnswer
                          ? "border-red-400/60 bg-red-400/15"
                          : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 opacity-60"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {isCurrentRevealed && (
              <div
                className={`mb-8 rounded-xl border px-5 py-3 ${
                  isCurrentCorrect
                    ? "border-green-400/40 bg-green-400/10"
                    : "border-red-400/40 bg-red-400/10"
                }`}
              >
                <p className="font-semibold">
                  {isCurrentCorrect ? "Correct!" : "Wrong."}
                </p>
                {!isCurrentCorrect && (
                  <p className="text-black/80 dark:text-white/80 text-sm mt-1">
                    Correct answer: {quizData[current].options[currentCorrectIndex]}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <button
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40"
              >
                ← Previous
              </button>

              {current === quizData.length - 1 ? (
                <button
                  disabled={!isCurrentRevealed}
                  onClick={() => setSubmitted(true)}
                  className="px-6 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-400/50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              ) : (
                <button
                  disabled={!isCurrentRevealed}
                  onClick={() => setCurrent((c) => c + 1)}
                  className="px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
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
