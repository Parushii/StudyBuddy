import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFolder,
  FaFilePdf,
  FaFileAlt,
  FaChevronDown,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";

const FileIcon = ({ name }) =>
  name?.endsWith(".pdf") ? (
    <FaFilePdf className="text-red-500" />
  ) : (
    <FaFileAlt className="text-black/60 dark:text-white/60" />
  );

export default function SubjectSidebar({ selectedFiles, onFileClick }) {
  const [subjects, setSubjects] = useState([]);
  const [openSubject, setOpenSubject] = useState(null);
  const [openUnit, setOpenUnit] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/drive/drive-structure");
        setSubjects(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isSelected = (fileId) =>
  selectedFiles.some((f) => f.driveFileId === fileId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-black/50 dark:text-white/50">
        Loading files…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-black/50 dark:text-white/50">
        No files found
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between cursor-pointer text-xs font-medium text-black/70 dark:text-white/70"
      >
        <span>Select from Existing Files</span>
        <span>{collapsed ? "▼" : "▲"}</span>
      </div>
      {!collapsed && (
        <div className="mt-2 space-y-3">

          {subjects.map((sub) => (
            <div
              key={sub.subject}
              className="relative group rounded-2xl p-4
          bg-white dark:bg-black
          border border-black/10 dark:border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100
            transition duration-300
            bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-indigo-500/10"
              />

              <div className="relative z-10">
                {/* SUBJECT */}
                <div
                  onClick={() =>
                    setOpenSubject(openSubject === sub.subject ? null : sub.subject)
                  }
                  className="flex items-center gap-2 cursor-pointer font-medium
              hover:text-cyan-500 dark:hover:text-cyan-400 transition"
                >
                  {openSubject === sub.subject ? <FaChevronDown /> : <FaChevronRight />}
                  <FaFolder className="text-cyan-500" />
                  {sub.subject}
                </div>

                {/* UNITS */}
                {openSubject === sub.subject && (
                  <div className="ml-4 mt-2 space-y-2">
                    {(sub.children || []).map((unit) => (
                      <div key={unit.id}>
                        <div
                          onClick={() =>
                            setOpenUnit(openUnit === unit.id ? null : unit.id)
                          }
                          className="flex items-center gap-2 cursor-pointer
                      hover:text-purple-500 transition"
                        >
                          {openUnit === unit.id ? <FaChevronDown /> : <FaChevronRight />}
                          <FaFolder className="text-purple-500" />
                          {unit.name}
                        </div>

                        {/* FILES */}
                        {openUnit === unit.id && (
                          <div className="ml-6 mt-2 space-y-1">
                            {(unit.children || []).map((file) => {
                              const selected = isSelected(file.id);

                              return (
                                <div
                                  key={file.id}
                                  onClick={() => onFileClick({ id: file.id, name: file.name })}

                                  className={`flex items-center gap-2 p-2 rounded
                              cursor-pointer transition
                              ${selected
                                      ? "bg-cyan-500/20 border border-cyan-400/30"
                                      : "hover:bg-black/5 dark:hover:bg-white/10"
                                    }`}
                                >
                                  <FileIcon name={file.name} />
                                  <span className="truncate text-sm flex-1">
                                    {file.name}
                                  </span>
                                  {selected && (
                                    <FaCheckCircle className="text-cyan-500" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
