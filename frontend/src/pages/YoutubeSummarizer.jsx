import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function YoutubeSummarizer() {
  const navigate = useNavigate();
  const API_BASE = "https://studybuddy-backend-7r0s.onrender.com";

  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");

  const handleSummarize = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");
    setDetails("");

    try {
      const response = await fetch(`${API_BASE}/summarize-youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        setVideoTitle(data.videoTitle || "Video");
      } else {
        setError(data.error || "Failed to summarize video");
        setDetails(data.details || "");
      }
    } catch (err) {
      setError("Failed to connect to server");
      setDetails(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl("");
    setSummary("");
    setError("");
    setDetails("");
    setVideoTitle("");
  };

  const downloadFile = async (type) => {
    try {
      const response = await fetch(
        `${API_BASE}/download-youtube-summary-${type}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary, videoTitle }),
        }
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `YouTube_Summary_${videoTitle}_${Date.now()}.${type}`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      setError(`Failed to download ${type.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white relative">
      {/* Aceternity grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        {/* Home */}
        <button
          onClick={() => navigate("/notebookview")}
          className="mb-8 px-5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold mb-2">
          YouTube Video Summarizer
        </h1>
        <p className="text-black/60 dark:text-white/60 mb-8">
          Paste a YouTube link and get an AI-generated summary
        </p>

        {/* Input */}
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-black/80 dark:text-white/80 mb-3">
            Enter YouTube URL
          </label>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSummarize()}
              disabled={loading}
              className="flex-1 rounded-xl px-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
            />

            <button
              onClick={handleSummarize}
              disabled={!url || loading}
              className="px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-400/50 hover:bg-black/10 dark:hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Summarizing..." : "Summarize"}
            </button>

            {(summary || error) && (
              <button
                onClick={handleClear}
                className="px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
            <p className="text-red-300 font-medium">❌ {error}</p>
            {details && (
              <p className="text-xs text-red-400 mt-1">{details}</p>
            )}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                📝 Summary
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile("pdf")}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-red-400/50 transition cursor-pointer"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => downloadFile("docx")}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-blue-400/50 transition cursor-pointer"
                >
                  📝 DOCX
                </button>
              </div>
            </div>

            <p className="text-black/80 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        )}

        {/* Empty */}
        {!summary && !loading && !error && (
          <div className="text-center py-16 text-black/40 dark:text-white/40">
            <p className="text-lg">
              Enter a YouTube URL to generate an AI summary
            </p>
            <p className="text-sm mt-2">
              Powered by Google Gemini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
