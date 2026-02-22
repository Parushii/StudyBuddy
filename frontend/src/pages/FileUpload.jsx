import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage("Please select some files to upload.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("http://localhost:5000/api/drive/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const successFiles = data.results.filter(f => f.status === "success");
        const failedFiles = data.results.filter(f => f.status !== "success");

        let msg = "";
        if (successFiles.length > 0) {
          msg += `✅ Uploaded: ${successFiles.map(f => f.file).join(", ")}\n`;
        }
        if (failedFiles.length > 0) {
          msg += `⚠️ Failed: ${failedFiles.map(f => `${f.file} (${f.reason})`).join(", ")}`;
        }
        setMessage(msg);
      } else {
        setMessage(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-6"
      style={{
        fontFamily: "Garamond, Georgia, serif",
        backgroundColor: "#E8DCC8",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(210,180,140,0.25) 0px, rgba(210,180,140,0.25) 2px, transparent 2px, transparent 40px)",
      }}
    >
      {/* Moving Glitter */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-300 rounded-full opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white/80 backdrop-blur-xl border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.18)] p-10 z-10"
      >
        {/* Back button */}
        <button
          onClick={() => window.location.href = "/homepage"}
          className="absolute left-6 top-6 flex items-center gap-2 text-sm text-amber-900 hover:text-yellow-700 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Library
        </button>

        {/* Title */}
        <h2 className="mt-6 text-4xl font-bold text-center text-amber-800 tracking-tight">
          Magic Shunter
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-center text-sm max-w-md mx-auto text-amber-900/70">
          Drop your study files here. They will automatically be organized into
          <span className="font-semibold text-amber-600"> subjects & units</span>
          — ready for quizzes, flashcards, and summaries.
        </p>

        {/* Feature Row */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
          <div className="rounded-xl p-4 bg-amber-200/20 text-amber-900">⚡ Auto categorization</div>
          <div className="rounded-xl p-4 bg-amber-200/20 text-amber-900">🧠 AI-ready content</div>
          <div className="rounded-xl p-4 bg-amber-200/20 text-amber-900">⏱️ Saves hours</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-amber-900/80">
              Select files
            </label>

            <input
              type="file"
              multiple
              disabled={loading}
              onChange={handleFileChange}
              className="
                w-full text-sm
                text-amber-900/80
                file:mr-3 file:py-3 file:px-5
                file:rounded-xl
                file:border-0
                file:font-medium
                file:bg-amber-600 file:text-white
                hover:file:bg-amber-500
                transition cursor-pointer
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300
              ${loading
                ? "bg-amber-300 cursor-not-allowed text-white"
                : "bg-amber-700 hover:bg-amber-600 text-white hover:scale-[1.02] hover:shadow-xl"
              }`}
          >
            {loading ? "Uploading & organizing…" : "Upload & Auto-Organize"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <pre className="mt-8 text-center text-sm whitespace-pre-wrap text-amber-900/80">
            {message}
          </pre>
        )}
      </div>
    </div>
  );
};

export default FileUpload;