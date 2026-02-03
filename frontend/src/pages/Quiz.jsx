import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const quizData = [
  {
    question: "Which IoT device optimizes temperature in smart homes?",
    options: ["Smart locks", "Smart thermostats", "Smart bins", "Smart shelves"],
    answer: 1,
  },
  {
    question: "Main benefit of intelligent parking systems?",
    options: [
      "Manual tolling",
      "Guides drivers to spaces",
      "Tracks pollution",
      "Bus locations",
    ],
    answer: 1,
  },
  {
    question: "IoT system for disaster warnings?",
    options: [
      "Smart bins",
      "Weather apps",
      "Detection sensors",
      "Streetlights",
    ],
    answer: 2,
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const score = quizData.filter(
    (q, i) => answers[i] === q.answer
  ).length;

  const selectedAnswer = answers[current];
  const isCurrentRevealed = revealed[current] === true;
  const currentCorrectIndex = quizData[current]?.answer;
  const isCurrentCorrect =
    isCurrentRevealed && selectedAnswer === currentCorrectIndex;

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

        {!started ? (
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
                setStarted(false);
                setAnswers({});
                setRevealed({});
                setSubmitted(false);
                setCurrent(0);
              }}
              className="w-full rounded-xl py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition"
            >
              Retake Quiz
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
