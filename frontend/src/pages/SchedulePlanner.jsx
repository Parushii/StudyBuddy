import { useState } from "react";
import axios from "axios";
import { Calendar } from "lucide-react";

export default function SchedulePlanner() {
  const [examDate, setExamDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📅 Calculate preparation days
  const calculateDays = () => {
    if (!startDate || !examDate) return null;
    const start = new Date(startDate);
    const exam = new Date(examDate);
    const diff = Math.ceil((exam - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // 📤 Upload + generate schedule
  const handleGenerateSchedule = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
    formData.append("startDate", startDate);
    formData.append("examDate", examDate);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/generate-schedule",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Full response from backend:", res.data); // ✅ Print raw response
      setScheduleData(res.data);
    } catch (err) {
      console.error("Schedule generation error:", err);
      alert("Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  // 💾 Save schedule locally
  const handleSave = () => {
    if (!scheduleData) return;
    localStorage.setItem("savedStudyPlan", JSON.stringify(scheduleData));
    alert("Study plan saved successfully!");
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-black text-black dark:text-white flex">
      {/* Left Pane */}
      <aside className="w-[28%] border-r border-black/20 dark:border-white/20 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-cyan-500">
          📅 Study Schedule
        </h2>

        {/* Date Inputs */}
        <div className="mb-4 space-y-3">
          <div>
            <label className="text-sm mb-1 flex items-center gap-2 text-black/70 dark:text-white/70">
              <Calendar size={14} className="text-purple-400" />
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-xl px-4 py-2 text-sm border border-black/20 dark:border-white/20 bg-white dark:bg-black"
            />
          </div>

          <div>
            <label className="text-sm mb-1 flex items-center gap-2 text-black/70 dark:text-white/70">
              <Calendar size={14} className="text-indigo-400" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl px-4 py-2 text-sm border border-black/20 dark:border-white/20 bg-white dark:bg-black"
            />
          </div>

          {/* Countdown */}
          <div className="text-center p-4 bg-black/5 dark:bg-white/5 rounded-xl">
            <p className="text-sm text-black/60 dark:text-white/60 mb-1">
              Days for Preparation
            </p>
            <h1 className="text-3xl font-semibold text-cyan-400">
              {calculateDays() !== null ? `${calculateDays()} Days` : "--"}
            </h1>
          </div>
        </div>

        {/* Upload Notes */}
        <div className="mb-4">
          <input type="file" multiple onChange={handleGenerateSchedule} className="text-sm" />
          {loading && <p className="text-sm text-black/60 dark:text-white/60 mt-2">Generating schedule...</p>}
        </div>
      </aside>


      {/* Center Pane */}
<main className="flex-1 p-8 flex flex-col">
  <h1 className="text-2xl font-bold mb-6 text-cyan-400">
    📖 Study Timeline
  </h1>

  {scheduleData ? (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-12 top-0 w-1 bg-cyan-300 h-full z-0"></div>

      {Object.entries(scheduleData).map(([date, topic], idx) => (
        <div key={date} className="relative flex items-start mb-10">
          {/* Date card */}
          <div className="bg-black text-white px-3 py-1 rounded-md z-10 shadow-md w-28 text-center">
            {date}
          </div>

          {/* Topic content */}
          <div className="ml-10 flex-1">
            <h2 className="text-md font-semibold text-black dark:text-white mb-1">
              {topic.split(":")[0]}
            </h2>
            <p className="text-sm text-black/70 dark:text-white/70">
              {topic.split(":").slice(1).join(":")}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-black/60 dark:text-white/60">
      Upload notes to generate your schedule...
    </p>
  )}

  <div className="mt-6 flex gap-4">
    <button
      onClick={handleSave}
      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition text-white"
    >
      💾 Save Schedule
    </button>
  </div>
</main>


    </div>
  );
}
