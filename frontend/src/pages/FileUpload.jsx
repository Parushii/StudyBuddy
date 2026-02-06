import { useState } from "react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-200 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-black/10">
        <h2 className="text-2xl font-bold text-center text-black mb-6">
          Upload Study Material
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Files:
            </label>
            <input
              type="file"
              multiple
              disabled={loading}
              onChange={handleFileChange}
              className="w-full text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}   
            className={`w-full py-2 rounded-md font-semibold transition-colors duration-300
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-neutral-400 hover:text-black"
              }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center font-medium text-yellow-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
