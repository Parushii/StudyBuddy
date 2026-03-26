import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function VideoRecommendationsPage() {
  const { notebookId } = useParams();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [summarizingVideoId, setSummarizingVideoId] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

        const res = await axios.post(
          `${API}/api/videos/recommend/${notebookId}`
        );

        setVideos(res.data.videos);

        if (res.data.videos.length > 0) {
          setSelectedVideo(res.data.videos[0].videoId);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [notebookId]);
  const handleSummarize = async (video) => {
    try {
      setSummarizingVideoId(video.videoId);
      setError("");
      setSummary("");

      const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const url = `https://www.youtube.com/watch?v=${video.videoId}`;

      const res = await fetch(`${API}/summarize-youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (res.ok) {
        setSummary(data.summary);
        setVideoTitle(video.title);
        setShowModal(true);
      } else {
        setError(data.error || "Failed to summarize");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setSummarizingVideoId(null);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        backgroundImage: "url('/stream.png')",
        backgroundSize: "cover",        // keeps it elegant
        backgroundPosition: "center",
        backgroundAttachment: "fixed",  // THIS makes it not scroll
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Translucent Rainbow Aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-blue-400/20 blur-3xl rounded-full animate-pulse z-0" />

      {/* Ocean Blue Fireflies */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(25)].map((_, i) => (
          <span
            key={i}
            className="absolute w-4 h-4 bg-blue-300 rounded-full opacity-70"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `fireflyFloat ${6 + Math.random() * 6
                }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: "0 0 12px rgba(147,197,253,0.8)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-10">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
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
          Back
        </button>
        <h1 className="text-4xl font-bold mb-8 tracking-wide drop-shadow-lg">
          🌊 The Stream of Study
        </h1>

        {loading && (
          <p className="text-lg animate-pulse text-white/70">
            The current is gathering knowledge...
          </p>
        )}

        {selectedVideo && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md bg-blue-900/20 border border-blue-200/20">
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube player"
              frameBorder="0"
              allowFullScreen
              className="rounded-3xl"
            ></iframe>
          </div>
        )}

        {/* Flowing Stream Layout */}
        <div className="flex flex-wrap gap-10 justify-center">
          {videos.map((video, index) => (
            <div
              key={index}
              className="cursor-pointer w-64 backdrop-blur-xl bg-blue-900/25 border border-blue-200/20 rounded-3xl shadow-2xl p-4 transition-all duration-500 hover:scale-110 hover:bg-blue-800/30"
              style={{
                animation: `cardFloat 8s ease-in-out infinite`,
                animationDelay: `${index * 0.4}s`,
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                onClick={() => setSelectedVideo(video.videoId)}
                className="rounded-xl mb-3 shadow-lg cursor-pointer"
              />
              <h4 className="text-sm font-semibold">{video.title}</h4>
              <button
                onClick={() => handleSummarize(video)}
                className="mt-3 w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                {summarizingVideoId === video.videoId ? "Summarizing..." : "✨ Summarize"}
              </button>
              <p className="text-xs text-blue-100/70 mt-1">
                {video.channel}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes cardFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-18px); }
            100% { transform: translateY(0px); }
          }

          @keyframes fireflyFloat {
            0% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
            50% { transform: translateY(-25px) translateX(10px); opacity: 1; }
            100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          }
        `}
      </style>
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 text-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl relative border border-white/20">

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="sticky top-0 float-right text-xl hover:text-red-400 bg-gray-900 z-10"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">
              📝 {videoTitle}
            </h2>

            {error && (
              <p className="text-red-400 mb-3">{error}</p>
            )}

            {!summary ? (
              <p className="animate-pulse text-white/60">
                Generating summary...
              </p>
            ) : (
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                {summary}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}