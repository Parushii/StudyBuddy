import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";

const DriveDisplay = () => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/drive-structure");
        setFolders(res.data.folders);
      } catch (err) {
        console.error("Error fetching folders:", err);
      }
    };
    fetchData();
  }, []);

  const getFileIcon = (mime) => {
    if (mime.includes("pdf")) return <FaFilePdf className="text-red-600 text-xl" />;
    if (mime.includes("word")) return <FaFileWord className="text-blue-600 text-xl" />;
    return <FaFileAlt className="text-gray-600 text-xl" />;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Uploaded Files</h1>

      {folders.length === 0 ? (
        <p className="text-center text-gray-600">No files uploaded yet.</p>
      ) : (
        folders.map((folder) => (
          <div key={folder.subject} className="bg-gray-100 p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-amber-400 text-shadow-yellow-900 text-shadow-xs">{folder.subject}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {folder.files.map((file) => (
                <a
                  key={file.id}
                  href={file.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-3 bg-white rounded-lg shadow hover:shadow-lg transition"
                >
                  {getFileIcon(file.mimeType)}
                  <p className="mt-2 text-sm">{file.name}</p>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DriveDisplay;
