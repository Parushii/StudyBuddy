  import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white flex">

      <aside className="w-[24%] min-w-[280px] bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-6">

  {/* Logo Placeholder */}
  <div className="h-12 w-full rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
    LOGO
  </div>

  {/* Search */}
  <input
    type="text"
    placeholder="Search anything in IntelliRack..."
    className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-purple-500"
  />

  {/* MagicShunter Button */}
  <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition cursor-pointer" onClick={()=> navigate("/upload")}>
    ✨ MagicShunter
  </button>

  {/* New IntelliRack */}
  <button className="cursor-pointer w-full py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition" onClick={() => navigate("/notebookview")}>
    + New IntelliRack
  </button>

  {/* IntelliRack List */}
  <div className="flex flex-col gap-2 mt-4 text-sm flex-1 overflow-y-auto">
    <p className="text-zinc-400 mb-1">Your IntelliRacks</p>
    {[
      "DSA Sem 4",
      "Operating Systems",
      "ML Cheat Sheets",
      "Exam Prep – April",
      "Hackathon Notes",
    ].map((rack, i) => (
      <div
        key={i}
        className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer"
      >
        📁 {rack}
      </div>
    ))}
  </div>

  {/* Logout Button at bottom */}
  <button
    className="mt-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
    onClick={() => {
      localStorage.removeItem("token");
      window.location.href = "/login"; // simple redirect
    }}
  >
    Logout
  </button>
</aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto">

        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-12 relative">

          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 max-w-4xl">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              StudyBuddy
            </h1>

            <p className="mt-4 text-xl text-zinc-300">
              Your chaos, organized intelligently.
            </p>

            {/* 3D Model Placeholder */}
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
              and random files scattered across devices. Finding the right material
              at the right time becomes harder than studying itself.
            </p>

            <p className="text-zinc-300 leading-relaxed mb-4">
              StudyBuddy solves this by intelligently organizing all your study
              materials into <span className="text-purple-400">IntelliRacks</span> —
              subject-wise, exam-wise, and context-aware.
            </p>

            <p className="text-zinc-300 leading-relaxed">
              Whether it’s last-minute revision or long-term preparation,
              StudyBuddy becomes your single, trusted study space.
            </p>

          </div>
        </section>

      </main>
    </div>
  );
}
