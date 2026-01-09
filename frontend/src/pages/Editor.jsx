
import React, { useContext } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { NotesContext } from "./NotesContext";
import VoiceToText from "./VoiceToText";  
import DownloadFile from "./DownloadFile";
import SummarizeNotes from "./SummarizeNotes";

function TextEditor() {
  const { notes, setNotes, quillRef, clearNotes, lastSaved, saveNotes } = useContext(NotesContext);

  return (
    <div className="px-52 py-16 justify-center">
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3>Your Notes</h3>
        <div>
          {lastSaved && (
            <span style={{ fontSize: "12px", color: "#666", marginRight: "10px" }}>
              Saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={saveNotes} 
            style={{ marginRight: "10px", padding: "5px 10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "3px" }}
          >
            Save
          </button>
          <button 
            onClick={clearNotes} 
            style={{ padding: "5px 10px", backgroundColor: "#ff4444", color: "white", border: "none", borderRadius: "3px", marginRight: "10px" }}
          >
            Clear
          </button>

          <DownloadFile notes={notes} quillRef={quillRef} />
        </div>
      </div>


      <ReactQuill
        ref={quillRef}
        value={notes}
        onChange={setNotes}
        theme="snow"
        style={{ height: "300px", marginBottom: "50px" }}
      />

      <VoiceToText/>
      
      <SummarizeNotes notes={notes} />
    </div>
  );
}

export default TextEditor;



