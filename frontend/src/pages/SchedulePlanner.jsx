import React, { useState } from "react";
import { Calendar, BookOpen, Sparkles } from "lucide-react";

export default function SchedulePlanner() {
  const [examDate, setExamDate] = useState("");
  const [startDate, setStartDate] = useState("");

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Aceternity grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 p-8 h-screen">
        <div className="flex h-full gap-8">

          {/* LEFT HALF */}
          <div className="w-1/2 flex flex-col gap-6">

            {/* Subject */}
            <div className="rounded-2xl p-5 bg-black border border-white/10">
              <label className="text-sm text-white/70 mb-2 flex items-center gap-2">
                <BookOpen size={14} className="text-cyan-400" />
                Select Notebook / Subject
              </label>
              <select className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400">
                <option>Select subject</option>
                <option>Operating Systems</option>
                <option>DSA</option>
                <option>Maths</option>
              </select>
            </div>

            {/* Exam date */}
            <div className="rounded-2xl p-5 bg-black border border-white/10">
              <label className="text-sm text-white/70 mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-purple-400" />
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Start date */}
            <div className="rounded-2xl p-5 bg-black border border-white/10">
              <label className="text-sm text-white/70 mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-indigo-400" />
                Study Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Countdown */}
            <div className="rounded-2xl p-8 bg-black border border-white/10 text-center">
              <p className="text-sm text-white/60 mb-2">Countdown to Exam</p>
              <h1 className="text-5xl font-semibold tracking-tight text-cyan-400">
                5 Days
              </h1>
              <p className="text-xs text-white/40 mt-2">(auto-calculated)</p>
            </div>

            {/* Generate */}
            <button className="mt-auto rounded-2xl py-4 flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-cyan-400/50 transition">
              <Sparkles size={18} className="text-cyan-400" />
              Generate Day-wise Schedule
            </button>
          </div>

          {/* RIGHT HALF – SAMPLE OUTPUT */}
          <div className="w-1/2 rounded-2xl bg-black border border-white/10 p-6 overflow-y-auto">
            <h2 className="text-sm text-white/70 mb-4">
              AI Generated Study Plan
            </h2>

            <div className="space-y-4 text-sm">
              {[
                {
                  day: "Day 1",
                  content: "Introduction, OS Structure, Types of OS",
                },
                {
                  day: "Day 2",
                  content: "Process Concept, Process Scheduling",
                },
                {
                  day: "Day 3",
                  content: "Threads, CPU Scheduling Algorithms",
                },
                {
                  day: "Day 4",
                  content: "Deadlocks – Detection & Prevention",
                },
                {
                  day: "Day 5",
                  content: "Memory Management & Page Replacement",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 bg-white/5 border border-white/10 hover:border-cyan-400/40 transition"
                >
                  <p className="text-cyan-400 font-medium mb-1">
                    {item.day}
                  </p>
                  <p className="text-white/80">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
