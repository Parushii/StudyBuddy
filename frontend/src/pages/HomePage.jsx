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

      <span className="text-xs text-amber-200 tracking-wide rotate-[-90deg] whitespace-nowrap group-hover:text-yellow-300 transition">
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
        <div className="absolute inset-2 border border-amber-900/40 rounded-sm" />
        <div className="absolute top-6 bottom-6 left-1/2 w-[1px] bg-black/30" />
        <div className="absolute right-2 w-2 h-2 bg-yellow-500 rounded-full shadow" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-sm" />
      </div>

      {/* Popup */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 
        bg-amber-900 text-amber-100 text-xs px-4 py-2 rounded-md
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

  // ================= MODAL STATE =================
  const [showModal, setShowModal] = useState(false);
  const [newRackName, setNewRackName] = useState("");

  // ================= FETCH DATA =================
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

        const driveRes = await axios.get(
          `${API}/api/drive/drive-structure`,
          { headers: { Authorization: `Bearer ${token}` }
        });
        setDriveSubjects(driveRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [navigate]);

  // ================= CREATE NEW RACK =================
  const createNewRack = async () => {
    if (!newRackName.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/api/notebooks`,
        { name: newRackName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      className="min-h-screen text-amber-100 text-lg flex relative overflow-hidden"
      style={{
        fontFamily: "Garamond, Georgia, serif",
        backgroundColor: "#E8DCC8",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(210,180,140,0.25) 0px, rgba(210,180,140,0.25) 2px, transparent 2px, transparent 40px)",
      }}
    >
      {/* ===== Floating Glitter ===== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-amber-300 rounded-full opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ===== Sidebar ===== */}
      <aside className="w-[220px] bg-[#3d2509]/90 border-r border-amber-900/30 p-6 flex flex-col justify-between relative z-10">
        <div className="space-y-10">
          <div className="h-16 border border-dashed border-amber-400/40 rounded flex items-center justify-center text-amber-500/60 text-sm">
            Logo
          </div>

          <h1 className="text-2xl font-semibold tracking-wide text-amber-800">
            Study Hall
          </h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-yellow-600 transition text-sm text-white-900"
          >
            🏰 Dashboard
          </button>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="text-red-500 hover:text-red-400 transition text-sm"
        >
          🔥 Leave Hall
        </button>
      </aside>

      {/* ===== Main Library ===== */}
      <main className="flex-1 overflow-y-auto p-12 relative z-10">
        <h2 className="text-4xl text-center mb-10 text-amber-800">
          The Grand Library
        </h2>

        {/* Create Button */}
        <div className="flex justify-center mb-20">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-full shadow-lg transition"
          >
            ➕ Create New IntelliRack
          </button>
        </div>

        {/* ===== IntelliRack Shelves ===== */}
        <div className="space-y-24">
          {racks.map((rack) => (
            <div key={rack._id}>
              <h3 className="text-2xl text-amber-900 mb-6">{rack.name}</h3>

              <div className="relative">
                <div className="flex items-end ml-6">
                  <div className="flex items-end gap-4 flex-wrap">
                    {(rack.sourceFiles || []).length === 0 ? (
                      <div className="text-amber-700/60 italic mb-4">
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
            className="w-20 h-20 rounded-full bg-green-600 hover:bg-green-500 
            shadow-xl flex items-center justify-center text-3xl 
            transition-transform hover:scale-110"
            title="Magic Shunter — Just dump your material in there and it will be assigned to correct shelf."
          >
            🍃
          </button>
        </div>

        {/* ===== Ancient Archive ===== */}
        <div className="mt-32">
          <h3 className="text-3xl text-amber-800 mb-10">
            The Ancient Archive
          </h3>

          {driveSubjects.map((sub) => (
            <div key={sub.subject} className="mb-16">
              <h4 className="text-xl mb-4 text-amber-900">{sub.subject}</h4>

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
          ))}
        </div>
      </main>

      {/* ===== CREATE RACK MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

            <div
  className="w-[460px] rounded-xl p-8 shadow-2xl relative"
  style={{
    backgroundColor: "#E8DCC8",
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(210,180,140,0.25) 0px, rgba(210,180,140,0.25) 2px, transparent 2px, transparent 40px)",
    border: "3px solid #8B5E3C",
  }}
>
  {/* Wooden Frame Effect */}
  <div className="absolute inset-0 rounded-xl border-[6px] border-[#5a3a1a] pointer-events-none" />
  <div className="absolute inset-3 rounded-lg border border-amber-900/40 pointer-events-none" />

  {/* Title */}
  <h2
    className="text-2xl text-center mb-6 tracking-wide"
    style={{
      fontFamily: "Garamond, Georgia, serif",
      color: "#5a3a1a",
      textShadow: "1px 1px 0px #c19a6b",
    }}
  >
    ✨ Create a New IntelliRack
  </h2>

  {/* Engraved Input */}
  <input
    autoFocus
    type="text"
    placeholder="e.g. DBMS Final Revision"
    value={newRackName}
    onChange={(e) => setNewRackName(e.target.value)}
    className="w-full px-5 py-3 rounded-md mb-6 outline-none"
    style={{
      backgroundColor: "#d2b48c",
      border: "2px solid #8B5E3C",
      color: "#4b2e1e",
      fontFamily: "Garamond, Georgia, serif",
      boxShadow:
        "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.3)",
    }}
  />

  {/* Buttons */}
  <div className="flex justify-end gap-4">
    <button
      onClick={() => setShowModal(false)}
      className="px-5 py-2 rounded-md transition"
      style={{
        backgroundColor: "#c19a6b",
        border: "2px solid #8B5E3C",
        fontFamily: "Garamond, Georgia, serif",
        color: "#4b2e1e",
        boxShadow: "2px 2px 0px #5a3a1a",
      }}
    >
      Cancel
    </button>

    <button
      onClick={createNewRack}
      className="px-5 py-2 rounded-md transition hover:scale-105"
      style={{
        background: "linear-gradient(to bottom, #8B5E3C, #5a3a1a)",
        border: "2px solid #3e2412",
        fontFamily: "Garamond, Georgia, serif",
        color: "#f5e6cc",
        boxShadow: "2px 2px 0px #2e1a0d",
      }}
    >
      Create
    </button>
  </div>
</div>
          </div>
      )}
    </div>
  );
}