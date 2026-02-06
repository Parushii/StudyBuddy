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
      setMessage("Please fill all fields and select files.");
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
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100
      dark:from-black dark:via-neutral-900 dark:to-black
      flex items-center justify-center px-6
    ">
      {/* grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-xl rounded-3xl
        bg-white/80 dark:bg-white/5
        backdrop-blur-xl
        border border-black/10 dark:border-white/10
        shadow-[0_30px_80px_rgba(0,0,0,0.18)]
        p-10
      ">
        {/* Back button */}
        <button
          onClick={() => window.location.href = "/homepage"}
          className="absolute left-6 top-6 flex items-center gap-2
            text-sm text-black/60 dark:text-white/60
            hover:text-black dark:hover:text-white transition cursor-pointer
          "
        >
          <ArrowLeft size={16} />
          Back to home
        </button>

        {/* Title */}
        <h2 className="mt-6 text-4xl font-bold text-center tracking-tight">
          Upload Study Files
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-center text-sm max-w-md mx-auto
          text-black/60 dark:text-white/60
        ">
          Upload once. We’ll automatically organize files into
          <span className="font-semibold text-cyan-500"> subjects & units</span>
          — ready for quizzes, flashcards, and summaries.
        </p>

        {/* Feature row */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
          <div className="rounded-xl p-4 bg-black/5 dark:bg-white/5">
            ⚡ Auto categorization
          </div>
          <div className="rounded-xl p-4 bg-black/5 dark:bg-white/5">
            🧠 AI-ready content
          </div>
          <div className="rounded-xl p-4 bg-black/5 dark:bg-white/5">
            ⏱️ Saves hours
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium
              text-black/70 dark:text-white/70
            ">
              Select files
            </label>

            <input
              type="file"
              multiple
              disabled={loading}
              onChange={handleFileChange}
              className="
                w-full text-sm
                text-black/70 dark:text-white/70
                file:mr-3 file:py-3 file:px-5
                file:rounded-xl
                file:border-0
                file:font-medium
                file:bg-cyan-500 file:text-black
                hover:file:bg-cyan-400
                transition cursor-pointer
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-4 rounded-2xl font-semibold
              transition-all duration-300
              ${loading
                ? "bg-black/30 dark:bg-white/30 cursor-not-allowed"
                : "bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] hover:shadow-xl"
              }
            `}
          >
            {loading ? "Uploading & organizing…" : "Upload & Auto-Organize"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <pre className="mt-8 text-center text-sm whitespace-pre-wrap
            text-black/70 dark:text-white/70
          ">
            {message}
          </pre>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
