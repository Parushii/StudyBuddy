import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to StudyBuddyAI</h1>
      <p className="text-lg mb-12 text-center max-w-md">
        Upload your study materials and automatically organize them by subject using AI.  
        Then view and access everything easily.
      </p>

      <div className="flex space-x-6">
        <Link
          to="/upload"
          className="bg-white text-yellow-600 px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-yellow-100 transition"
        >
          Upload Files
        </Link>

        <Link
          to="/files"
          className="bg-yellow-700 px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-yellow-800 transition"
        >
          View Files
        </Link>

        <Link
          to="/editor"
          className="bg-green-700 px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-yellow-800 transition"
        >
          Editor
        </Link>

        <Link
          to="/youtubelink"
          className="bg-red-700 px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-yellow-800 transition"
        >
          YouTube search
        </Link>
      </div>
    </div>
  );
}

export default Home;
