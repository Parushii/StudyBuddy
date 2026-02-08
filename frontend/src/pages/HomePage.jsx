import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newRackName, setNewRackName] = useState("");

  const [racks, setRacks] = useState([
    "DSA Sem 4",
    "Operating Systems",
    "ML Cheat Sheets",
    "Exam Prep – April",
    "Hackathon Notes",
  ]);

  const createNewRack = () => {
    if (!newRackName.trim()) return;

    setRacks((prev) => [newRackName, ...prev]);
    setNewRackName("");
    setShowModal(false);

    navigate("/notebookview", {
  state: { notebookName: newRackName }
});


  };

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-[24%] min-w-[280px] bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-6">

        <div className="h-12 w-full rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
          LOGO
        </div>

        <input
          type="text"
          placeholder="Search anything in IntelliRack..."
          className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition cursor-pointer"
          onClick={() => navigate("/upload")}
        >
          ✨ MagicShunter
        </button>

        {/* New IntelliRack */}
        <button
          className="cursor-pointer w-full py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition"
          onClick={() => setShowModal(true)}
        >
          + New IntelliRack
        </button>

        {/* IntelliRack List */}
        <div className="flex flex-col gap-2 mt-4 text-sm flex-1 overflow-y-auto">
          <p className="text-zinc-400 mb-1">Your IntelliRacks</p>

          {racks.map((rack, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer"
              onClick={() => navigate("/notebookview")}
            >
              📁 {rack}
            </div>
          ))}
        </div>

        <button
          className="mt-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto">
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 blur-3xl" />

          <div className="relative z-10 max-w-4xl">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              StudyBuddy
            </h1>

            <p className="mt-4 text-xl text-zinc-300">
              Your chaos, organized intelligently.
            </p>

            <div className="mt-10 h-64 w-full rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              3D Model Placeholder
            </div>

            <p className="mt-6 text-zinc-400">
              Upload anything. Find everything. Study smarter.
            </p>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="px-16 py-20 bg-zinc-950 border-t border-zinc-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold mb-6">
              Why StudyBuddy?
            </h2>

            <p className="text-zinc-300 leading-relaxed mb-4">
              Students today juggle handwritten notes, PDFs, screenshots, voice notes,
              and random files scattered across devices.
            </p>

            <p className="text-zinc-300 leading-relaxed mb-4">
              StudyBuddy organizes everything into{" "}
              <span className="text-purple-400">IntelliRacks</span>.
            </p>
          </div>
        </section>
      </main>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[420px] rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">

            <h2 className="text-xl font-semibold text-purple-400 mb-2">
              Create New IntelliRack
            </h2>

            <p className="text-sm text-zinc-400 mb-4">
              Give your study space a meaningful name
            </p>

            <input
              autoFocus
              type="text"
              placeholder="e.g. DBMS Final Revision"
              value={newRackName}
              onChange={(e) => setNewRackName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition"
                onClick={createNewRack}
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
