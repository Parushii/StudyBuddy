import React, { useEffect, useState } from "react";

export default function Mascot({ message, mood = "neutral" }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
    if (!message) return;

    const showTimer = setTimeout(() => {
        setVisible(true);
    }, 1200);

    return () => clearTimeout(showTimer);
}, [message]);

    if (!visible) return null;

    const moodEmoji = {
        happy: "😊",
        concerned: "😟",
        excited: "🤩",
        neutral: "🙂"
    };
const bubbleColors = {
    happy: "rgba(20,60,30,0.9)",
    concerned: "rgba(60,30,10,0.9)",
    excited: "rgba(40,20,60,0.9)",
    neutral: "rgba(10,5,1,0.9)"
};
    return (
        <div style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            gap: 10
        }}>

            {/* Thought Bubble */}
            <div style={{
                maxWidth: 220,
               background: bubbleColors[mood] || bubbleColors.neutral,
                border: "1px solid rgba(255,200,100,0.4)",
                borderRadius: 16,
                padding: "12px 14px",
                color: "#f5e4b0",
                fontSize: 13,
                fontFamily: "Georgia, serif",
                boxShadow: "0 0 20px rgba(255,180,50,0.25)",
                animation: "fadeIn 0.5s ease"
            }}>
                💭 {message}
            </div>

            {/* Mascot */}
            <div style={{
                fontSize: 38,
                animation: "floatMascot 3s ease-in-out infinite"
            }}>
                {moodEmoji[mood] || "🙂"}
            </div>

            <style>{`
                @keyframes floatMascot {
                    0%,100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}