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
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-2xl font-bold mb-6">
        📺 Recommended Study Videos
      </h1>

      {loading && <p>Loading videos...</p>}

      {selectedVideo && (
        <div className="mb-8">
          <iframe
            width="100%"
            height="450"
            src={`https://www.youtube.com/embed/${selectedVideo}`}
            title="YouTube player"
            frameBorder="0"
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div
            key={index}
            onClick={() => setSelectedVideo(video.videoId)}
            className="cursor-pointer p-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="rounded-lg mb-3"
            />
            <h4 className="text-sm font-medium">{video.title}</h4>
            <p className="text-xs text-black/60 dark:text-white/60">
              {video.channel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}