import React, { useState } from "react";
import { Upload, Mic, Plus, Sparkles, Calendar, Clock, BookOpen } from "lucide-react";
import SubjectSidebar from "./SubjectSidebar";

// Feature card component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="relative group rounded-2xl p-6 bg-white dark:bg-black border border-black/10 dark:border-white/10 overflow-hidden">
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-indigo-500/10" />
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="text-cyan-500 dark:text-cyan-400" />
        <h3 className="text-lg font-medium text-black dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-black/70 dark:text-white/70">
        {description}
      </p>
    </div>
  </div>
);

export default function NotebookView() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white relative">
      {/* subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main container */}
      <div className="relative z-10 p-6 h-screen flex gap-6">

        {/* LEFT SIDEBAR */}
        <div className="w-[26%] min-w-[280px] flex flex-col gap-4 h-full">
          {/* Upload */}
          <div className="rounded-2xl p-5 bg-white dark:bg-black border border-black/10 dark:border-white/10">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Upload size={16} className="text-cyan-500 dark:text-cyan-400" />
              Upload Study Material
            </h2>
            <div className="rounded-xl border border-dashed border-black/20 dark:border-white/20 p-4 text-center text-xs text-black/60 dark:text-white/60 hover:border-cyan-400 transition cursor-pointer">
              Click or drag files here
            </div>
          </div>

          {/* SUBJECTSIDEBAR */}
          <div className="flex-1 overflow-y-auto">
            <SubjectSidebar
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>

          {/* Actions */}
          <button className="rounded-xl py-3 text-sm flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-400/50 transition">
            <Plus size={16} />
            Add More Material
          </button>

          <button className="rounded-xl py-3 text-sm flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-purple-400/50 transition">
            <Mic size={16} />
            Record Voice Note
          </button>
        </div>

        {/* RIGHT MAIN AREA */}
        <div className="flex-1 grid grid-cols-2 gap-6 overflow-y-auto">
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
  );
}
