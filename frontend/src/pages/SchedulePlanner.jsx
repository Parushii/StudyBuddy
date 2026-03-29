import { useState } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import DownloadFile from "./DownloadFile";
import { useParams } from "react-router-dom";
const API = "https://studybuddy-backend-7r0s.onrender.com/api";

export default function SchedulePlanner() {
  // const navigate = useNavigate();
  const { notebookId } = useParams(); // 🔥 dynamic id
  const [examDate, setExamDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState("notebook");
  const [files, setFiles] = useState([]);

  const calculateDays = () => {
    if (!startDate || !examDate) return null;
    const start = new Date(startDate);
    const exam = new Date(examDate);
    const diff = Math.ceil((exam - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };


  const handleSave = () => {
    if (!scheduleData) return;
    localStorage.setItem("savedStudyPlan", JSON.stringify(scheduleData));
    alert("Study plan saved successfully!");
  };

  const getScheduleText = () => {
    if (!scheduleData) return "";

    let text = "";

    Object.entries(scheduleData)
      .filter(([key]) => key.includes("-")) // only dates like 2026-03-23
      .forEach(([date, topic]) => {
        const title = topic.split(":")[0];
        const body = topic.split(":").slice(1).join(":");

        text += `${date} - ${title}\n`;
        text += `${body}\n\n`;
      });

    return text;
  };

  const handleGenerateSchedule = async () => {
    try {
      setLoading(true);

      // 🔥 FILE MODE
      if (inputMode === "upload") {
        if (!files || files.length === 0) {
          alert("Please upload files");
          return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }

        formData.append("startDate", startDate);
        formData.append("examDate", examDate);

        const res = await axios.post(
          `${API}/generate-schedule`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setScheduleData(res.data);
        return;
      }

      // 🔥 NOTEBOOK MODE (existing)
      if (!notebookId) {
        alert("No notebook selected");
        return;
      }

      const textRes = await axios.get(
        `${API}/notebooks/${notebookId}/text`
      );

      const extractedText = textRes.data.text;

      const res = await axios.post(`${API}/generate-schedule`, {
        text: extractedText,
        startDate,
        examDate,
      });

      setScheduleData(res.data);

    } catch (err) {
      console.error("Schedule generation error:", err);
      alert("Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
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

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={inputMode === "notebook"}
                  onChange={() => setInputMode("notebook")}
                />
                Use existing notebook
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={inputMode === "upload"}
                  onChange={() => setInputMode("upload")}
                />
                Upload manually
              </label>

              {inputMode === "upload" && (
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
              )}

              <label
  htmlFor="fileUpload"
  className="cursor-pointer inline-block px-4 py-2 mt-2 
             rounded-lg border border-amber-300/30 
             bg-amber-500/20 text-amber-200 
             hover:bg-amber-400/30 
             transition"
>
  📂 Upload Files
</label>

{files && files.length > 0 && (
  <div className="mt-3 text-sm text-amber-200 space-y-1">
    {Array.from(files).map((file, index) => (
      <div
        key={index}
        className="px-2 py-1 bg-white/10 rounded-md backdrop-blur-sm"
      >
        📄 {file.name}
      </div>
    ))}
  </div>
)}

{files && files.length > 0 && (
  <button
    onClick={() => setFiles([])}
    className="mt-2 text-xs text-red-400 hover:text-red-300"
  >
    Clear files
  </button>
)}
            </div>

            <button
              onClick={handleGenerateSchedule}
              className="mt-4 px-4 py-2 bg-amber-500 rounded-lg"
            >
              Generate Schedule
            </button>


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

        {scheduleData && (
          <div className="flex justify-center mb-6">
            <DownloadFile
              content={getScheduleText()}
              title="Study Schedule"
            />
          </div>
        )}

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