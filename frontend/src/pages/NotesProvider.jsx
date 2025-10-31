import React, { useState, useRef, useEffect } from "react";
import { NotesContext } from "./NotesContext";

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("editorNotes");
    return savedNotes ? savedNotes : "";
  });

  const [lastSaved, setLastSaved] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("editorNotes", notes);
    setLastSaved(new Date());
  }, [notes]);

  const appendNotes = (newText) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();

      quill.insertText(position, "\n" + newText, "user");
      quill.setSelection(position + newText.length + 1, 0);
      setNotes(quill.root.innerHTML);
    } else {
      setNotes((prev) => prev + "\n" + newText);
    }
  };

  const clearNotes = () => {
    setNotes("");
    localStorage.removeItem("editorNotes");
    setLastSaved(null);
  };

  const saveNotes = () => {
    localStorage.setItem("editorNotes", notes);
    setLastSaved(new Date());
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        setNotes,
        appendNotes,
        quillRef,
        clearNotes,
        lastSaved,
        saveNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
