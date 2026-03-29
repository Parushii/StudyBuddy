import React, { useState } from "react";

const SummarizeNotes = ({ notes }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const summarizeText = async () => {
    setIsLoading(true);
    setError("");
    setSummary("");

    const BACKEND_URL ="https://studybuddy-backend-7r0s.onrender.com";


    try {
      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
      } else {
        setError(data.error || "Something went wrong!");
      }
    } catch (error) {
      setError("Network error occurred. Please try again."+ error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
      <button
        onClick={summarizeText}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#9C27B0",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          fontSize: "16px",
          fontWeight: "500",
        }}
      >
        {isLoading ? (
          <span>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>
            Summarizing...
          </span>
        ) : (
          <span>
            <i className="fas fa-file-alt" style={{ marginRight: "8px" }}></i>
            Summarize Notes
          </span>
        )}
      </button>

      {error && (
        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px", border: "1px solid #f44336", color: "#c62828" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {summary && (
        <div style={{ marginTop: "20px" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#333", display: "flex", alignItems: "center" }}>
            <i className="fas fa-clipboard-list" style={{ marginRight: "8px", color: "#9C27B0" }}></i>
            Summary:
          </h4>
          <div style={{ padding: "15px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #e0e0e0", lineHeight: "1.6", fontSize: "16px" }}>
            {summary}
          </div>
        </div>
      )}

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
    </div>
  );
};

export default SummarizeNotes;
