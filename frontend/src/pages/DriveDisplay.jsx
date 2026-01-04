import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFolder,
  FaFilePdf,
  FaFileAlt,
} from "react-icons/fa";

const FileIcon = ({ name }) => {
  if (name?.endsWith(".pdf"))
    return <FaFilePdf className="text-red-500 text-xl" />;
  return <FaFileAlt className="text-gray-600 text-xl" />;
};

export default function DriveDisplay() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/drive-structure")
      .then((res) => setSubjects(res.data || []))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center text-yellow-600">
          Uploaded Study Materials
        </h1>

        {/* SUBJECTS */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Subjects
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((sub, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedSubject(sub);
                  setSelectedUnit(null);
                }}
                className={`cursor-pointer p-6 rounded-2xl shadow-sm transition-all duration-300
                  ${
                    selectedSubject?.subject === sub.subject
                      ? "bg-yellow-400 text-white shadow-lg scale-[1.02]"
                      : "bg-white hover:bg-yellow-100 hover:shadow-md"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">
                    <div className="flex items-center gap-3">
                    <FaFolder className="text-amber-500 text-xl" />
                    <span className="font-medium truncate">
                      {sub.subject}
                    </span>
                  </div> 
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* UNITS */}
        {selectedSubject && (
          <section className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Units —{" "}
              <span className="text-yellow-600">
                {selectedSubject.subject}
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {(selectedSubject.children || []).map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`cursor-pointer p-5 rounded-2xl transition-all duration-300
                    ${
                      selectedUnit?.id === unit.id
                        ? "bg-yellow-500 text-white shadow-lg scale-[1.02]"
                        : "bg-white hover:bg-yellow-100 shadow-sm hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <FaFolder className="text-amber-500 text-xl" />
                    <span className="font-medium truncate">
                      {unit.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FILES */}
        {selectedUnit && (
          <section className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Files —{" "}
              <span className="text-yellow-600">
                {selectedUnit.name}
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {(selectedUnit.children || []).map((file) => (
                <a
                  key={file.id}
                  href={file.link}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer p-5 rounded-2xl bg-white shadow-sm
                             hover:bg-yellow-100 hover:shadow-md transition-all duration-300
                             flex items-center gap-4"
                >
                  <FileIcon name={file.name} />
                  <span className="font-medium text-gray-700 truncate">
                    {file.name}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
