const axios = require("axios");

const searchYouTube = async (query) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          key: process.env.YOUTUBE_API_KEY,
          maxResults: 5,
          type: "video",
        },
      }
    );

    return response.data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    return [];
  }
};

module.exports = { searchYouTube };