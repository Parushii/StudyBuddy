import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useState, useContext, useEffect } from "react";
import { NotesContext } from "../context/NotesContext";

const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const { appendNotes } = useContext(NotesContext);

  const {
    transcript,
    finalTranscript,
    browserSupportsSpeechRecognition,
    resetTranscript
  } = useSpeechRecognition();

  useEffect(() => {
    if (finalTranscript !== '') {
      appendNotes(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, appendNotes, resetTranscript]);

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: true, 
        language: "en-IN" 
      });
      setIsListening(true);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  const currentTranscript = transcript;

  return (
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: "8px", 
      padding: "16px", 
      margin: "20px 0",
      backgroundColor: "#f9f9f9"
    }}>
      <h3 style={{ margin: "0 0 12px 0" }}>Voice to Text</h3>
      
      <div style={{
        minHeight: "60px",
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "white",
        marginBottom: "12px",
        fontSize: "14px",
        color: "#333"
      }}>
        {currentTranscript || (isListening ? "Listening... Speak now..." : "Click Start to begin speaking")}
      </div>

      <button
        onClick={toggleListening}
        style={{
          padding: "10px 20px",
          backgroundColor: isListening ? "#ff4444" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold"
        }}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>


    </div>
  );
};

export default VoiceToText;