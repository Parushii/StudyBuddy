import { createContext, useContext, useState } from "react";

const SelectedFilesContext = createContext();

export function SelectedFilesProvider({ children }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const toggleFile = (file) => {
    setSelectedFiles((prev) =>
      prev.some((f) => f.id === file.id)
        ? prev.filter((f) => f.id !== file.id)
        : [...prev, file]
    );
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setSelectedFiles([]);
  };

  const addLocalFiles = (files) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  return (
    <SelectedFilesContext.Provider
      value={{
        selectedFiles,
        toggleFile,
        removeFile,
        clearAll,
        addLocalFiles,
      }}
    >
      {children}
    </SelectedFilesContext.Provider>
  );
}

export const useSelectedFiles = () => {
  const ctx = useContext(SelectedFilesContext);
  if (!ctx) {
    throw new Error("useSelectedFiles must be used inside SelectedFilesProvider");
  }
  return ctx;
};
