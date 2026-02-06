import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useSelectedFiles } from "../context/SelectedFilesContext";

export default function HighlightedTopicsView() {
  const { selectedFiles } = useSelectedFiles();
  const [activeFile, setActiveFile] = useState(null);

  const getPreviewLink = (file) => {
    if (!file?.link) return "";

    const match =
      file.link.match(/\/d\/([^/]+)/) || file.link.match(/id=([^&]+)/);

    if (!match) return "";
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  };

  const getDriveLink = (file) => {
    if (!file?.link) return "#";

    const match =
      file.link.match(/\/d\/([^/]+)/) || file.link.match(/id=([^&]+)/);

    if (!match) return "#";
    return `https://drive.google.com/file/d/${match[1]}`;
  };

  return (
    <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* LEFT: SELECTED FILES ONLY */}
      <div className="w-[26%] min-w-[280px] flex flex-col gap-4 p-6
        overflow-y-auto border-r border-black/10 dark:border-white/10"
      >
        <h2 className="text-sm font-medium mb-2">
          Selected Files ({selectedFiles.length})
        </h2>

        {selectedFiles.length === 0 ? (
          <div className="text-sm text-black/50 dark:text-white/50">
            No files selected.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveFile(file)}
                className={`p-3 rounded-lg cursor-pointer text-sm transition
                  ${
                    activeFile?.id === file.id
                      ? "bg-cyan-500/20"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
              >
                <span className="truncate block">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: PREVIEW */}
      <main className="flex-1 flex flex-col p-6 gap-4">
        {!activeFile ? (
          <div className="h-full flex items-center justify-center
            text-black/50 dark:text-white/50"
          >
            Select a document 📄
          </div>
        ) : (
          <>
            {/* Google Drive link */}
            {activeFile.link && (
              <div className="flex justify-end">
                <a
                  href={getDriveLink(activeFile)}
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
            )}

            {/* Preview */}
            {activeFile.link ? (
              <iframe
                src={getPreviewLink(activeFile)}
                className="flex-1 w-full rounded-2xl
                  border border-black/10 dark:border-white/10
                  bg-white dark:bg-black"
                title={activeFile.name}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center
                text-black/50 dark:text-white/50"
              >
                Preview not available for uploaded files yet
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
