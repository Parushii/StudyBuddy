import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const API = "http://localhost:5000";

export default function SchedulePlanner() {
  const navigate = useNavigate();

  const [examDate, setExamDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateDays = () => {
    if (!startDate || !examDate) return null;
    const start = new Date(startDate);
    const exam = new Date(examDate);
    const diff = Math.ceil((exam - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

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
        `${API}/generate-schedule`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setScheduleData(res.data);
    } catch (err) {
      console.error("Schedule generation error:", err);
      alert("Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!scheduleData) return;
    localStorage.setItem("savedStudyPlan", JSON.stringify(scheduleData));
    alert("Study plan saved successfully!");
  };

  return (
    <div
      className="min-h-screen text-white flex relative overflow-hidden"
      style={{
        backgroundImage: "url('/target.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Fireflies */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-yellow-300"
            style={{
              width: `${3 + Math.random() * 4}px`,
              height: `${3 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: "0 0 10px 4px rgba(255, 223, 100, 0.9)",
              animation: `floatFirefly ${6 + Math.random() * 6}s ease-in-out infinite`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <aside className="w-[260px] bg-black/70 border-r border-white/10 p-6 flex flex-col justify-between relative z-10">
        <div>
          {/* Back Button */}
                  <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-4 py-2 mb-4 
                       rounded-xl backdrop-blur-md 
                       bg-[rgba(80,50,20,0.55)] 
                       border border-amber-200/20 
                       text-amber-200 
                       hover:bg-amber-200/10 
                       hover:shadow-[0_0_10px_rgba(251,191,36,0.4)] 
                       hover:scale-105 
                       transition"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
          <h2 className="text-xl mb-6 tracking-wide">
            📜 Arcane Study Planner
          </h2>

          <div className="space-y-5">
            <div>
              <label className="text-lg mb-1 flex items-center gap-2 text-white/70">
                <Calendar size={14} />
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-md px-4 py-2 bg-black/50 border border-white/20 text-white [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="text-lg mb-1 flex items-center gap-2 text-white/70">
                <Calendar size={14} />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md px-4 py-2 bg-black/50 border border-white/20 text-white [color-scheme:dark]"
              />
            </div>

            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-lg text-white/60 mb-1">
                Preparation Window
              </p>
              <h1 className="text-3xl font-semibold text-amber-300 drop-shadow-lg">
                {calculateDays() !== null
                  ? `${calculateDays()} Days`
                  : "--"}
              </h1>
            </div>

            <input
              type="file"
              multiple
              onChange={handleGenerateSchedule}
              className="text-lg"
            />

            {loading && (
              <p className="text-lg text-white/60">
                Summoning schedule...
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Timeline */}
      <main className="flex-1 p-12 relative z-10 overflow-y-auto">
        <h1 className="text-4xl text-center mb-14 tracking-widest">
          ✨ The Prophecy Timeline ✨
        </h1>

        {scheduleData ? (
          <div className="relative">
            {/* Glowing Energy Line */}
            <div className="absolute left-12 top-0 w-[3px] bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-300 h-full shadow-[0_0_20px_5px_rgba(255,200,0,0.6)]"></div>

            {Object.entries(scheduleData).map(([date, topic]) => (
              <div key={date} className="relative flex items-start mb-14">
                {/* Glowing Date Orb */}
                <div className="relative z-10">
                  <div className="w-28 text-center py-3 rounded-full bg-gradient-to-br from-amber-600 to-yellow-400 text-black font-semibold shadow-[0_0_25px_rgba(255,200,0,0.8)]">
                    {date}
                  </div>
                </div>

                {/* Mystical Card */}
                <div className="ml-12 flex-1 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-xl hover:scale-[1.02] transition-transform">
                  <h2 className="font-semibold text-lg mb-2 text-amber-300">
                    {topic.split(":")[0]}
                  </h2>
                  <p className="text-white/80 text-lg">
                    {topic.split(":").slice(1).join(":")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/60">
            Upload scrolls to reveal your destiny...
          </p>
        )}

        <div className="mt-14 flex justify-center">
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-semibold shadow-lg hover:scale-105 transition"
          >
            💾 Preserve the Prophecy
          </button>
        </div>
      </main>

      {/* Firefly Animation */}
      <style>
        {`
          @keyframes floatFirefly {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-25px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
}