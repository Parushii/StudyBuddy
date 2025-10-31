import React, { useState } from "react";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export default function YoutubeLink() {
  const [topic, setTopic] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
          topic
        )}&maxResults=6&key=${API_KEY}`
      );
      const data = await response.json();
      const videoList = data.items.map((item) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.default.url,
      }));
      setVideos(videoList);
    } catch (error) {
      console.error(error);
      setVideos([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-2">YouTube Topic Search</h1>
      <input
        type="text"
        placeholder="Enter topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Search
      </button>

      {loading && <p>Loading...</p>}

      <ul>
        {videos.map((video) => (
          <li key={video.url} className="mb-4 flex items-center gap-2">
            <img src={video.thumbnail} alt={video.title} />
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {video.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
