import { useState } from "react";
import SubjectSidebar from "./SubjectSidebar";
import { ExternalLink } from "lucide-react";

export default function HighlightedTopicsView() {
  const [selectedFile, setSelectedFile] = useState(null);

  const getPreviewLink = (link) => {
    if (!link) return "";
    const match = link.match(/\/d\/([^/]+)/) || link.match(/id=([^&]+)/);
    if (!match) return "";
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  };

  const getDriveLink = (link) => {
    if (!link) return "#";
    const match = link.match(/\/d\/([^/]+)/) || link.match(/id=([^&]+)/);
    if (!match) return "#";
    return `https://drive.google.com/file/d/${match[1]}`;
  };

  return (
    <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* LEFT SIDEBAR */}
      <div className="w-[26%] min-w-[280px] flex flex-col gap-4 p-6 overflow-y-auto border-r border-black/10 dark:border-white/10">
        <SubjectSidebar
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>

      {/* RIGHT MAIN AREA */}
      <main className="flex-1 flex flex-col p-6 gap-4">
        {!selectedFile ? (
          <div className="h-full flex items-center justify-center text-black/50 dark:text-white/50">
            Select a document 📄
          </div>
        ) : (
          <>
            {/* Open in Google Drive */}
            <div className="flex justify-end">
              <a
                href={getDriveLink(selectedFile.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2
                  bg-black/5 dark:bg-white/5
                  border border-black/20 dark:border-white/20
                  rounded-xl
                  hover:bg-black/10 dark:hover:bg-white/10
                  transition"
              >
                <ExternalLink size={16} />
                Open in Google Drive
              </a>
            </div>

            {/* File Preview */}
            <iframe
              src={getPreviewLink(selectedFile.link)}
              className="flex-1 w-full rounded-2xl
                border border-black/10 dark:border-white/10
                bg-white dark:bg-black"
              title={selectedFile.name}
            />
          </>
        )}
      </main>
    </div>
  );
}
