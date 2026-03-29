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
    <FaFilePdf className="text-red-500 text-lg" />
  ) : (
    <FaFileAlt className="text-[#5c4033] text-lg" />
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
        const res = await axios.get(
          "https://studybuddy-backend-7r0s.onrender.com/api/drive/drive-structure"
        );
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
      <div className="flex-1 flex items-center justify-center text-base text-[#5c4033]/60">
        Loading files…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-base text-red-500">
        {error}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-base text-[#5c4033]/60">
        No files found
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">

      {/* DROPDOWN HEADER */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between cursor-pointer
        text-lg font-semibold text-[#5c4033]"
      >
        <span>Select from Existing Files</span>
        <span className="text-xl">
          {collapsed ? "▼" : "▲"}
        </span>
      </div>

      {!collapsed && (
        <div className="mt-2 space-y-4">

          {subjects.map((sub) => (
            <div
              key={sub.subject}
              className="relative group rounded-2xl p-5
              bg-[#d2b48c]
              border border-[#c19a6b]
              shadow-sm hover:shadow-md
              transition-all duration-300 overflow-hidden"
            >
              {/* soft warm hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300
              bg-gradient-to-br from-[#fff8ee]/40 via-[#f5deb3]/30 to-[#ffe4c4]/40"
              />

              <div className="relative z-10">
                {/* SUBJECT */}
                <div
                  onClick={() =>
                    setOpenSubject(openSubject === sub.subject ? null : sub.subject)
                  }
                  className="flex items-center gap-3 cursor-pointer
                  font-semibold text-lg text-[#4b2e2e]
                  hover:text-[#3e2723] transition"
                >
                  {openSubject === sub.subject ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                  <FaFolder className="text-[#8b5e3c] text-xl" />
                  {sub.subject}
                </div>

                {/* UNITS */}
                {openSubject === sub.subject && (
                  <div className="ml-6 mt-3 space-y-3">
                    {(sub.children || []).map((unit) => (
                      <div key={unit.id}>
                        <div
                          onClick={() =>
                            setOpenUnit(openUnit === unit.id ? null : unit.id)
                          }
                          className="flex items-center gap-3 cursor-pointer
                          text-base font-medium text-[#5c4033]
                          hover:text-[#3e2723] transition"
                        >
                          {openUnit === unit.id ? (
                            <FaChevronDown />
                          ) : (
                            <FaChevronRight />
                          )}
                          <FaFolder className="text-[#a47148] text-lg" />
                          {unit.name}
                        </div>

                        {/* FILES */}
                        {openUnit === unit.id && (
                          <div className="ml-8 mt-2 space-y-2">
                            {(unit.children || []).map((file) => {
                              const selected = isSelected(file.id);

                              return (
                                <div
                                  key={file.id}
                                  onClick={() =>
                                    onFileClick({
                                      id: file.id,
                                      name: file.name,
                                    })
                                  }
                                  className={`flex items-center gap-3 p-3 rounded-xl
                                  cursor-pointer transition-all duration-200 text-base
                                  ${
                                    selected
                                      ? "bg-[#c19a6b] border border-[#8b5e3c]"
                                      : "hover:bg-[#f5deb3]/60"
                                  }`}
                                >
                                  <FileIcon name={file.name} />
                                  <span className="truncate flex-1">
                                    {file.name}
                                  </span>
                                  {selected && (
                                    <FaCheckCircle className="text-[#3e2723] text-lg" />
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