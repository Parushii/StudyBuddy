import React from "react";
import { Upload, Mic, Plus, Sparkles, Calendar, Clock, BookOpen } from "lucide-react";

export default function NotebookView() {
  const uploadedItems = [
    "Maths - Unit 3 Notes.pdf",
    "OS Deadlock.docx",
    "DSA Cheatsheet.png",
  ];

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="
      relative group rounded-2xl p-6
      bg-white dark:bg-black
      border border-black/10 dark:border-white/10
      overflow-hidden
    ">
      {/* glow */}
      <div className="
        absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300
        bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-indigo-500/10
      " />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="text-cyan-500" />
          <h3 className="text-lg font-medium text-black dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-black/70 dark:text-white/70">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white">
      {/* subtle grid like aceternity */}
      <div className="
        absolute inset-0 pointer-events-none
        bg-[linear-gradient(to_right,#00000014_1px,transparent_1px),linear-gradient(to_bottom,#00000014_1px,transparent_1px)]
        dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)]
        bg-[size:40px_40px]
      " />

      <div className="relative z-10 p-6 h-screen">
        <div className="flex gap-6 h-full">

          {/* LEFT SIDEBAR */}
          <div className="w-[26%] min-w-[280px] flex flex-col gap-4">

            {/* Upload */}
            <div className="rounded-2xl p-5 bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <h2 className="text-sm font-medium mb-3 flex items-center gap-2 text-black dark:text-white">
                <Upload size={16} className="text-cyan-500" />
                Upload Study Material
              </h2>

              <div className="rounded-xl border border-dashed border-black/20 dark:border-white/20 p-4 text-center text-xs text-black/50 dark:text-white/50 hover:border-cyan-400 transition cursor-pointer">
                Click or drag files here
              </div>
            </div>

            {/* Uploaded list */}
            <div className="flex-1 rounded-2xl p-5 bg-white/90 dark:bg-black border border-black/10 dark:border-white/10 overflow-y-auto">
              <h3 className="text-sm font-medium mb-3 text-black/80 dark:text-white/80">
                Uploaded Materials
              </h3>

              <ul className="space-y-2 text-xs">
                {uploadedItems.map((item, i) => (
                  <li key={i} className="rounded-lg px-3 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Add more */}
            <button className="rounded-xl py-3 text-sm flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-400/50 transition">
              <Plus size={16} />
              Add More Material
            </button>

            {/* Voice */}
            <button className="rounded-xl py-3 text-sm flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition">
              <Mic size={16} />
              Record Voice Note
            </button>
          </div>

          {/* RIGHT MAIN AREA */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            <FeatureCard
              icon={Sparkles}
              title="Highlight Key Topics"
              description="Identify important concepts automatically from your notes."
            />
            <FeatureCard
              icon={BookOpen}
              title="Summaries & Flashcards"
              description="Create concise summaries and quick revision flashcards."
            />
            <FeatureCard
              icon={Clock}
              title="Daily Study Reminders"
              description="Smart reminders to keep your study routine consistent."
            />
            <FeatureCard
              icon={Calendar}
              title="Personalized Study Schedule"
              description="Auto-generated schedules based on exams and syllabus."
            />
          </div>

        </div>
      </div>
    </div>
  );
}
