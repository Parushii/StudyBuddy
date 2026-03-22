import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LearningPath() {
    const [path, setPath] = useState(null);
    const navigate = useNavigate();

    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetch(`${API}/api/learning/path/${userId}`)
            .then(res => res.json())
            .then(data => setPath(data))
            .catch(err => console.error(err));
    }, []);

    const handleStart = (step) => {
        if (step.type === "quiz") navigate(`/quiz/${step.topic}`);
        else if (step.type === "flashcard") navigate(`/flashcards/${step.topic}`);
        else navigate(`/notes/${step.topic}`);
    };

    const handleComplete = async (index) => {
        await fetch(`${API}/api/learning/path/complete-step`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pathId: path._id,
                stepIndex: index
            })
        });

        const updated = await fetch(`${API}/api/learning/path/${userId}`);
        setPath(await updated.json());
    };

    if (!path) return <p className="p-6">Summoning your path...</p>;

    const completedCount = path.steps.filter(s => s.completed).length;

    return (
        <div style={{
            minHeight: "100vh",
            background: "#050a04",
            fontFamily: "Garamond, Georgia, serif",
            position: "relative",
            overflow: "hidden",
            padding: "40px"
        }}>

            {/* PARTICLES */}
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{
                    position: "absolute",
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "#ffd870",
                    boxShadow: "0 0 10px #ffd870",
                    animation: `float ${4 + i}s infinite`,
                }} />
            ))}

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-100px); opacity: 0; }
                }

                @keyframes glow {
                    0%,100% { box-shadow: 0 0 10px rgba(255,200,100,0.3); }
                    50% { box-shadow: 0 0 30px rgba(255,200,100,0.6); }
                }
            `}</style>

            {/* TITLE */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
                <h1 style={{
                    fontSize: 32,
                    color: "#f5e4b0",
                    letterSpacing: "0.1em",
                    textShadow: "0 0 20px rgba(255,180,50,0.6)"
                }}>
                    ✦ Your Learning Journey ✦
                </h1>

                <p style={{ color: "rgba(200,165,90,0.6)" }}>
                    Each step brings you closer to mastery
                </p>
            </div>

            {/* PROGRESS BAR */}
            <div style={{
                marginBottom: 30,
                maxWidth: 500,
                marginInline: "auto"
            }}>
                <div style={{
                    height: 10,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 20
                }}>
                    <div style={{
                        height: 10,
                        width: `${(completedCount / path.steps.length) * 100}%`,
                        background: "linear-gradient(90deg,#ffd870,#22c975)",
                        borderRadius: 20,
                        boxShadow: "0 0 15px rgba(255,200,100,0.6)"
                    }} />
                </div>

                <p style={{
                    textAlign: "center",
                    color: "#d4a94a",
                    marginTop: 8
                }}>
                    {completedCount} / {path.steps.length} completed
                </p>
            </div>

            {/* STEPS */}
            <div style={{
                maxWidth: 700,
                margin: "0 auto",
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
                            borderRadius: 16,
                            background: isActive
                                ? "rgba(20,10,2,0.9)"
                                : "rgba(10,5,1,0.8)",
                            border: "1px solid rgba(200,155,60,0.3)",
                            opacity: isLocked ? 0.4 : 1,
                            animation: isActive ? "glow 2s infinite" : "none",
                            transition: "all 0.3s"
                        }}>

                            <h3 style={{
                                color: "#f5e4b0",
                                marginBottom: 6
                            }}>
                                ✦ Step {index + 1}: {step.title}
                            </h3>

                            <p style={{
                                color: "rgba(200,165,90,0.6)",
                                fontSize: 13
                            }}>
                                ⏱ {step.duration} mins • {step.type}
                            </p>

                            {step.reason && (
                                <p style={{
                                    color: "#ffb347",
                                    fontSize: 12,
                                    marginTop: 4
                                }}>
                                    ⚠ {step.reason}
                                </p>
                            )}

                            <div style={{
                                marginTop: 12,
                                display: "flex",
                                gap: 10
                            }}>

                                {!isLocked && !step.completed && (
                                    <>
                                        <button
                                            onClick={() => handleStart(step)}
                                            style={{
                                                padding: "8px 14px",
                                                background: "linear-gradient(135deg,#1a9e5c,#22c975)",
                                                border: "none",
                                                borderRadius: 8,
                                                color: "#fff",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Start
                                        </button>

                                        <button
                                            onClick={() => handleComplete(index)}
                                            style={{
                                                padding: "8px 14px",
                                                background: "linear-gradient(135deg,#c4870a,#f5b82e)",
                                                border: "none",
                                                borderRadius: 8,
                                                color: "#fff",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Complete
                                        </button>
                                    </>
                                )}

                                {step.completed && (
                                    <span style={{
                                        color: "#22c975",
                                        fontWeight: "bold"
                                    }}>
                                        ✓ Completed
                                    </span>
                                )}

                                {isLocked && (
                                    <span style={{ color: "#999" }}>
                                        🔒 Locked
                                    </span>
                                )}

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}