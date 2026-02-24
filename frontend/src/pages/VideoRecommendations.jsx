import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function VideoRecommendationsPage() {
  const { notebookId } = useParams();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

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
              animation: `fireflyFloat ${
                6 + Math.random() * 6
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: "0 0 12px rgba(147,197,253,0.8)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-10">
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
              onClick={() => setSelectedVideo(video.videoId)}
              className="cursor-pointer w-64 backdrop-blur-xl bg-blue-900/25 border border-blue-200/20 rounded-3xl shadow-2xl p-4 transition-all duration-500 hover:scale-110 hover:bg-blue-800/30"
              style={{
                animation: `cardFloat 8s ease-in-out infinite`,
                animationDelay: `${index * 0.4}s`,
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="rounded-xl mb-3 shadow-lg"
              />
              <h4 className="text-sm font-semibold">{video.title}</h4>
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
    </div>
  );
}