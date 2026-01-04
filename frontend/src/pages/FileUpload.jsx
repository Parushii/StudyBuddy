import { useState } from "react";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please fill all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok)
        setMessage(`File uploaded successfully! Link: ${data.link}`);
      else setMessage(`Upload failed: ${data.error}`);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Check console.");
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
              Select File:
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-neutral-400 cursor-pointer hover:text-black transition-colors duration-300"
          >
            Upload
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("success")
                ? "text-green-600"
                : message.includes("failed")
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
