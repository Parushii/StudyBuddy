import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

/* ===== Helper: Random Leather Colors ===== */
const bookColors = [
  "from-[#5a2e2e] to-[#2e1414]",
  "from-[#2e3f5a] to-[#141d2e]",
  "from-[#3f5a2e] to-[#1c2e14]",
  "from-[#5a4a2e] to-[#2e2414]",
  "from-[#4a2e5a] to-[#24142e]",
];

const getRandomColor = () =>
  bookColors[Math.floor(Math.random() * bookColors.length)];

/* ===== Book Spine ===== */
const BookSpine = ({ title }) => {
  const color = getRandomColor();

  return (
    <div
      className={`relative w-16 h-44 rounded-sm shadow-xl
      bg-gradient-to-b ${color}
      border border-black/40
      hover:scale-105 transition-transform duration-300
      flex items-center justify-center cursor-pointer group`}
      style={{ fontFamily: "Garamond, Georgia, serif" }}
    >
      <div className="absolute left-1 top-2 bottom-2 w-[3px] bg-gradient-to-b from-yellow-400 to-yellow-700 rounded" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-sm" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 rounded-b-sm" />

      {/* Slightly bigger text */}
      <span className="text-sm text-white-200 tracking-wide rotate-[-90deg] whitespace-nowrap group-hover:text-yellow-300 transition">
        {title.length > 20 ? title.slice(0, 18) + "…" : title}
      </span>
    </div>
  );
};

/* ===== Rack Door ===== */
const RackDoor = ({ onClick }) => {
  return (
    <div className="relative group ml-8">
      <div
        onClick={onClick}
        className="relative w-16 h-44 bg-gradient-to-b from-[#6b3e1d] to-[#3e2412]
        rounded-sm shadow-2xl border border-black/40 cursor-pointer
        transition-transform duration-500 origin-left
        group-hover:-rotate-6 group-hover:-translate-x-2"
      >
        <div className="absolute inset-2 border border-white-900/40 rounded-sm" />
        <div className="absolute top-6 bottom-6 left-1/2 w-[1px] bg-black/30" />
        <div className="absolute right-2 w-2 h-2 bg-yellow-500 rounded-full shadow" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-sm" />
      </div>

      <div className="absolute -top-14 left-1/2 -translate-x-1/2 
        bg-white-900/90 backdrop-blur-sm text-white-100 text-sm px-4 py-2 rounded-md
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300 shadow-lg whitespace-nowrap">
        ✨ Enter the IntelliRack
      </div>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const [racks, setRacks] = useState([]);
  const [driveSubjects, setDriveSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRackName, setNewRackName] = useState("");
  const [loadingArchive, setLoadingArchive] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const notebookRes = await axios.get(`${API}/api/notebooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRacks(notebookRes.data);

      // START loader
      setLoadingArchive(true);

      const driveRes = await axios.get(
        `${API}/api/drive/drive-structure`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDriveSubjects(driveRes.data || []);

    } catch (err) {
      console.error(err);
    } finally {
      // STOP loader
      setLoadingArchive(false);
    }
  };

  fetchData();
}, [navigate]);

  const createNewRack = async () => {
    if (!newRackName.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/api/notebooks`,
        { name: newRackName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRacks((prev) => [res.data, ...prev]);
      setNewRackName("");
      setShowModal(false);

      navigate(`/notebookview/${res.data._id}`, {
        state: { notebookId: res.data._id, notebookName: res.data.name },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="min-h-screen text-white text-xl flex relative overflow-hidden"
      style={{
        fontFamily: "Garamond, Georgia, serif",
        backgroundImage: "url('/library.jpg')",
        backgroundSize: "cover",        // keeps it elegant
  backgroundPosition: "center",
  backgroundAttachment: "fixed",  // THIS makes it not scroll
  backgroundRepeat: "no-repeat"
      }}
    >
      {/* ===== Dark Overlay ===== */}
<div className="absolute inset-0 bg-black/55 z-0 pointer-events-none"></div>
      {/* ===== Fireflies ===== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${4 + Math.random() * 4}px`,
              height: `${4 + Math.random() * 4}px`,
              backgroundColor: "#fde68a",
              boxShadow: "0 0 10px 4px rgba(255, 223, 100, 0.9)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatFirefly ${6 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* ===== Sidebar ===== */}
      <aside className="w-[220px] bg-[#3d2509]/70 backdrop-blur-md border-r border-white-900/30 p-6 flex flex-col justify-between relative z-10">
        <div className="space-y-10">
          <div className="h-16 border border-dashed border-white-400/40 rounded flex items-center justify-center text-white-500/60 text-base">
            Logo
          </div>

          <h1 className="text-3xl font-semibold tracking-wide text-white-800">
            Study Hall
          </h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-yellow-600 transition text-base text-white"
          >
            🏰 Dashboard
          </button>

          <button
            onClick={() => navigate("/textbook")}
            className="hover:text-yellow-600 transition text-base text-white"
          >
            🥽 TextbookDiver
          </button>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="text-red-500 hover:text-red-400 transition text-base"
        >
          🔥 Leave Hall
        </button>
      </aside>

      {/* ===== Main Library ===== */}
      <main className="flex-1 overflow-y-auto p-12 relative z-10">
        <h2 className="text-5xl text-center mb-10 text-white-800">
          The Grand Library
        </h2>

        <div className="flex justify-center mb-20">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 rounded-full shadow-lg transition backdrop-blur-md"
            style={{
              background: "rgba(139,94,60,0.75)",
              border: "2px solid #8B5E3C",
              color: "#fff3dc",
            }}
          >
            ➕ Create New IntelliRack
          </button>
        </div>

        {/* ===== IntelliRack Shelves ===== */}
        <div className="space-y-24">
          {racks.map((rack) => (
            <div key={rack._id}>
              <h3 className="text-3xl text-white-900 mb-6">{rack.name}</h3>

              <div className="relative">
                <div className="flex items-end ml-6">
                  <div className="flex items-end gap-4 flex-wrap">
                    {(rack.sourceFiles || []).length === 0 ? (
                      <div className="text-white-700/60 italic mb-4 text-lg">
                        This shelf awaits knowledge...
                      </div>
                    ) : (
                      rack.sourceFiles.map((file) => (
                        <BookSpine key={file._id} title={file.name} />
                      ))
                    )}
                  </div>

                  <div className="ml-auto">
                    <RackDoor
                      onClick={() =>
                        navigate(`/notebookview/${rack._id}`, {
                          state: { notebookName: rack.name },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="h-6 bg-gradient-to-r from-[#d2b48c] via-[#c19a6b] to-[#d2b48c] rounded shadow-md mt-[-6px]" />
              </div>
            </div>
          ))}
        </div>

        {/* ===== Magic Shunter ===== */}
        <div className="flex justify-center mt-28">
          <button
            onClick={() => navigate("/upload")}
            className="w-24 h-24 rounded-full backdrop-blur-md shadow-xl flex items-center justify-center text-4xl transition-transform hover:scale-110"
            style={{
              background: "rgba(34,197,94,0.75)",
            }}
            title="Magic Shunter — Just dump your material in there and it will be assigned to correct shelf."
          >
            🍃
          </button>
        </div>

        {/* ===== Ancient Archive ===== */}
        <div className="mt-32">
  <h3 className="text-4xl text-white-800 mb-10">
    The Ancient Archive
  </h3>

  {loadingArchive ? (
    <div className="text-center text-xl text-yellow-300 animate-pulse">
      📜 Summoning the Ancient Scrolls...
    </div>
  ) : (
    driveSubjects.map((sub) => (
      <div key={sub.subject} className="mb-16">
        <h4 className="text-2xl mb-4 text-white-900">
          {sub.subject}
        </h4>

        <div className="relative">
          <div className="flex items-end gap-4 flex-wrap ml-6">
            {(sub.children || []).map((unit) =>
              (unit.children || []).map((file) => (
                <BookSpine key={file.id} title={file.name} />
              ))
            )}
          </div>

          <div className="h-5 bg-gradient-to-r from-[#d2b48c] via-[#c19a6b] to-[#d2b48c] rounded shadow mt-[-6px]" />
        </div>
      </div>
    ))
  )}
</div>
        {/* // ===== CREATE RACK MODAL ===== */}
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div
      className="w-[460px] rounded-xl p-8 shadow-2xl relative"
      style={{
        background: "rgba(139,94,60,0.95)",
        border: "3px solid #8B5E3C",
        fontFamily: "Garamond, Georgia, serif",
      }}
    >
      <h2 className="text-2xl text-center mb-6 text-[#fff3dc]">
        ✨ Create a New IntelliRack
      </h2>

      <input
        autoFocus
        type="text"
        placeholder="e.g. DBMS Final Revision"
        value={newRackName}
        onChange={(e) => setNewRackName(e.target.value)}
        className="w-full px-5 py-3 rounded-md mb-6 outline-none text-black"
      />

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2 rounded-md bg-gray-400 hover:bg-gray-500 text-black"
        >
          Cancel
        </button>

        <button
          onClick={createNewRack}
          className="px-5 py-2 rounded-md bg-green-600 hover:bg-green-500 text-white"
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}
      </main>

      {/* Firefly Animation */}
      <style>
        {`
        @keyframes floatFirefly {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
          50% { transform: translateY(-40px) translateX(20px); opacity: 1; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
        }
        `}
      </style>
      
    </div>
  );
}