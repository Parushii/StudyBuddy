import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFolder,
  FaFilePdf,
  FaFileAlt,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";

const FileIcon = ({ name }) =>
  name?.endsWith(".pdf") ? (
    <FaFilePdf className="text-red-500" />
  ) : (
    <FaFileAlt className="text-black/60 dark:text-white/60" />
  );

export default function SubjectSidebar({ onFileSelect, selectedFile }) {
  const [subjects, setSubjects] = useState([]);
  const [openSubject, setOpenSubject] = useState(null);
  const [openUnit, setOpenUnit] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/drive-structure")
      .then((res) => setSubjects(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
      <h2 className="text-sm font-medium mb-3 flex items-center gap-2 text-black dark:text-white">
        Notes
      </h2>

      {subjects.map((sub) => (
        <div
          key={sub.subject}
          className="relative group rounded-2xl p-4 bg-white dark:bg-black border border-black/10 dark:border-white/10 overflow-hidden"
        >
          {/* glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-indigo-500/10" />

          <div className="relative z-10">
            {/* SUBJECT */}
            <div
              onClick={() =>
                setOpenSubject(openSubject === sub.subject ? null : sub.subject)
              }
              className="flex items-center gap-2 cursor-pointer font-medium text-black dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition"
            >
              {openSubject === sub.subject ? <FaChevronDown /> : <FaChevronRight />}
              <FaFolder className="text-cyan-500 dark:text-cyan-400" />
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
                      className="flex items-center gap-2 cursor-pointer text-black/80 dark:text-white/80 hover:text-purple-500 dark:hover:text-purple-400 transition"
                    >
                      {openUnit === unit.id ? <FaChevronDown /> : <FaChevronRight />}
                      <FaFolder className="text-purple-500 dark:text-purple-400" />
                      {unit.name}
                    </div>

                    {/* FILES */}
                    {openUnit === unit.id && (
                      <div className="ml-6 mt-2 space-y-1">
                        {(unit.children || []).map((file) => (
                          <div
                            key={file.id}
                            onClick={() => onFileSelect?.(file)}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition
                              ${
                                selectedFile?.id === file.id
                                  ? "bg-cyan-500/20"
                                  : "hover:bg-black/5 dark:hover:bg-white/10"
                              }`}
                          >
                            <FileIcon name={file.name} />
                            <span className="truncate text-sm text-black/70 dark:text-white/70">
                              {file.name}
                            </span>
                          </div>
                        ))}
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
  );
}
