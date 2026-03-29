import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LearningPath() {
    const [path, setPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [noPath, setNoPath] = useState(false);
    const [fetched, setFetched] = useState(false);

    const navigate = useNavigate();

    const API = "https://studybuddy-backend-7r0s.onrender.com";
    const userId = localStorage.getItem("userId");

    // ================= FETCH =================
    useEffect(() => {
        if (fetched) return;

        const fetchPath = async () => {
            try {
                const res = await fetch(`${API}/api/learning/path/${userId}`);

                if (res.status === 404) {
                    setNoPath(true);
                    return;
                }

                const data = await res.json();
                console.log("PATH:", data);
                setPath(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
                setFetched(true);
            }
        };

        fetchPath();
    }, [fetched]);

    // ================= GENERATE =================
    const generatePath = async () => {
        const confirmRegen = window.confirm(
            "This will replace your current learning path. Continue?"
        );

        if (!confirmRegen) return;

        setLoading(true);

        try {
            await fetch(`${API}/api/learning/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            const res = await fetch(`${API}/api/learning/path/${userId}`);
            const data = await res.json();

            setPath(data);
            setNoPath(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ================= NAVIGATION FIX =================
    const handleStart = (step) => {
        console.log("START STEP:", step);

        const topicId = step.topicId || step.topic || "general";

        if (step.type === "quiz") {
            navigate(`/quiz/${topicId}`);
        }
        else if (step.type === "flashcard") {
            navigate(`/flashcards/${topicId}`);
        }
        else if (step.type === "highlight") {
            navigate(`/highlighttopics/${topicId}`);
        }
        else {
            navigate(`/quiz/${topicId}`);
        }
    };

    // ================= COMPLETE =================
    const handleComplete = async (index) => {
        try {
            await fetch(`${API}/api/learning/path/complete-step`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pathId: path._id,
                    stepIndex: index
                })
            });

            const updated = await fetch(`${API}/api/learning/path/${userId}`);
            const data = await updated.json();
            setPath(data);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= STATES =================
    if (loading) {
        return <p className="p-6">Summoning your path...</p>;
    }

    if (noPath) {
        return (
            <div className="p-6 text-center">
                <h2>Your journey has not begun yet... ✨</h2>
                <button onClick={generatePath}>
                    Generate My Path 🚀
                </button>
            </div>
        );
    }

    if (!path || !path.steps) {
        return <p className="p-6">Preparing your journey...</p>;
    }

    const completedCount = path.steps.filter(s => s.completed).length;

    // ================= UI =================
    return (
        <div style={{
            minHeight: "100vh",
            background: "#050a04",
            padding: "40px"
        }}>
            <h1 style={{ color: "#f5e4b0", textAlign: "center" }}>
                ✦ Your Learning Journey ✦
            </h1>
            <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                    onClick={generatePath}
                    style={{
                        background: "#f5e4b0",
                        color: "#111",
                        padding: "10px 16px",
                        borderRadius: 8,
                        fontWeight: "bold",
                        cursor: "pointer",
                        border: "none"
                    }}
                >
                    🔄 Regenerate Path
                </button>
            </div>
            <p style={{ textAlign: "center", color: "#aaa" }}>
                {completedCount} / {path.steps.length} completed
            </p>

            <div style={{
                maxWidth: 700,
                margin: "30px auto",
                display: "flex",
                flexDirection: "column",
                gap: 20
            }}>
                {path.steps.map((step, index) => {

                    const isLocked = index > completedCount;
                    const isActive = index === completedCount;

                    return (
                        <div key={index} style={{
                            padding: 20,
                            borderRadius: 12,
                            background: isActive ? "#1a1a1a" : "#111",
                            opacity: isLocked ? 0.5 : 1
                        }}>

                            <h3>
                                Step {index + 1}: {step.title}
                            </h3>

                            <p>
                                ⏱ {step.duration || 10} mins • {step.type}
                            </p>

                            <div style={{ marginTop: 10 ,display: "flex", gap: 10, alignItems: "center"}}>
                                {!isLocked && !step.completed && (
                                    <>
                                        <button
                                            onClick={() => handleStart(step)}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: "10px",
                                                border: "1.5px solid rgba(34,201,117,0.4)",
                                                background: "rgba(34,201,117,0.08)",
                                                color: "#22c975",
                                                fontWeight: "600",
                                                fontSize: "13px",
                                                cursor: "pointer",
                                                transition: "all 0.25s ease",
                                                boxShadow: "0 0 8px rgba(34,201,117,0.15)"
                                            }}
                                            onMouseEnter={e => {
                                                e.target.style.background = "rgba(34,201,117,0.15)";
                                                e.target.style.boxShadow = "0 0 14px rgba(34,201,117,0.35)";
                                            }}
                                            onMouseLeave={e => {
                                                e.target.style.background = "rgba(34,201,117,0.08)";
                                                e.target.style.boxShadow = "0 0 8px rgba(34,201,117,0.15)";
                                            }}
                                        >
                                            ▶ Start
                                        </button>

                                        <button
                                            onClick={() => handleComplete(index)}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: "10px",
                                                border: "1.5px solid rgba(245,184,46,0.5)",
                                                background: "rgba(245,184,46,0.08)",
                                                color: "#f5b82e",
                                                fontWeight: "600",
                                                fontSize: "13px",
                                                cursor: "pointer",
                                                transition: "all 0.25s ease",
                                                boxShadow: "0 0 8px rgba(245,184,46,0.2)"
                                            }}
                                            onMouseEnter={e => {
                                                e.target.style.background = "rgba(245,184,46,0.18)";
                                                e.target.style.boxShadow = "0 0 16px rgba(245,184,46,0.4)";
                                            }}
                                            onMouseLeave={e => {
                                                e.target.style.background = "rgba(245,184,46,0.08)";
                                                e.target.style.boxShadow = "0 0 8px rgba(245,184,46,0.2)";
                                            }}
                                        >
                                            ✓ Complete
                                        </button>
                                    </>
                                )}

                                {step.completed && <span>✅ Done</span>}
                                {isLocked && <span>🔒 Locked</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}