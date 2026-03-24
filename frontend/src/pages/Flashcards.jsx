import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { MdFlip } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import DownloadFile from "./DownloadFile";
/* ===== Floating Leaves ===== */
const LEAF_DEFS = [
  { viewBox: "0 0 20 60", path: "M10 0 C16 10, 20 25, 16 40 C13 52, 10 60, 10 60 C10 60, 7 52, 4 40 C0 25, 4 10, 10 0Z", vein: "M10 0 L10 60" },
  { viewBox: "0 0 40 55", path: "M20 2 C32 2, 40 14, 38 28 C36 42, 28 54, 20 54 C12 54, 4 42, 2 28 C0 14, 8 2, 20 2Z", vein: "M20 2 L20 54" },
  { viewBox: "0 0 35 55", path: "M12 2 C22 0, 34 10, 32 26 C30 40, 20 54, 12 54 C5 54, 0 42, 2 28 C4 12, 8 3, 12 2Z", vein: "M12 2 L14 54" },
  { viewBox: "0 0 16 70", path: "M8 0 C13 12, 16 30, 12 50 C10 62, 8 70, 8 70 C8 70, 6 62, 4 50 C0 30, 3 12, 8 0Z", vein: "M8 0 L8 70" },
  { viewBox: "0 0 50 55", path: "M25 4 C28 0, 36 2, 40 8 C44 14, 44 22, 40 28 C46 26, 50 30, 48 36 C46 42, 38 44, 32 40 C30 48, 26 54, 25 54 C24 54, 20 48, 18 40 C12 44, 4 42, 2 36 C0 30, 4 26, 10 28 C6 22, 6 14, 10 8 C14 2, 22 0, 25 4Z", vein: "M25 4 L25 54" },
];
const LEAF_COLORS = ["#4a7c3f","#5a8f4e","#3d6b35","#6aaa5a","#2d5a27","#7ab86a","#3e7234"];
const LEAVES = Array.from({ length: 16 }, (_, i) => {
  const def = LEAF_DEFS[i % LEAF_DEFS.length];
  return {
    def, color: LEAF_COLORS[i % LEAF_COLORS.length],
    width: 12 + (i % 5) * 6, startX: ((i * 137.5) % 96) + 2,
    rotate: (i * 53) % 360, duration: 14 + (i % 7) * 2,
    delay: -((i * 2.1) % 18),
    driftX: ((i % 2 === 0) ? 1 : -1) * (15 + (i % 5) * 12),
    opacity: 0.22 + (i % 4) * 0.07,
  };
});

const FloatingLeaves = () => (
  <>
    <style>{`
      ${LEAVES.map((l, i) => `
        @keyframes leafFall${i} {
          0%   { transform: translateY(-80px) translateX(0px) rotate(${l.rotate}deg); opacity: 0; }
          8%   { opacity: ${l.opacity}; }
          50%  { transform: translateY(48vh) translateX(${l.driftX}px) rotate(${l.rotate + 140}deg); opacity: ${l.opacity}; }
          92%  { opacity: ${l.opacity * 0.5}; }
          100% { transform: translateY(102vh) translateX(${l.driftX * 0.6}px) rotate(${l.rotate + 240}deg); opacity: 0; }
        }
      `).join("")}
    `}</style>
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {LEAVES.map((l, i) => (
        <svg key={i} viewBox={l.def.viewBox} fill="none" style={{
          position: "absolute", left: `${l.startX}%`, top: 0,
          width: `${l.width}px`, height: "auto",
          animation: `leafFall${i} ${l.duration}s ease-in-out infinite`,
          animationDelay: `${l.delay}s`,
          filter: "drop-shadow(0px 2px 3px rgba(45,90,39,0.25))",
        }}>
          <path d={l.def.path} fill={l.color} />
          <path d={l.def.vein} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" />
        </svg>
      ))}
    </div>
  </>
);

/* ===== Fireflies ===== */
const FIREFLIES = Array.from({ length: 14 }, (_, i) => ({
  left: ((i * 143.7) % 90) + 5, top: ((i * 97.3) % 80) + 10,
  size: 3 + (i % 3), duration: 4 + (i % 5), delay: (i * 0.7) % 6,
  fx: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 15)}px`,
  fy: `${(i % 2 === 0 ? -1 : 1) * (15 + (i % 3) * 12)}px`,
  color: i % 3 === 0 ? "#d4f08a" : i % 3 === 1 ? "#a8e063" : "#f0e68c",
}));

const Fireflies = () => (
  <>
    <style>{`
      @keyframes firefly {
        0%   { transform: translate(0,0) scale(1); opacity: 0; }
        20%  { opacity: 1; }
        50%  { transform: translate(var(--fx), var(--fy)) scale(1.3); opacity: 0.8; }
        80%  { opacity: 0.4; }
        100% { transform: translate(0,0) scale(0.8); opacity: 0; }
      }
    `}</style>
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 2 }}>
      {FIREFLIES.map((f, i) => (
        <div key={i} style={{
          position: "absolute", left: `${f.left}%`, top: `${f.top}%`,
          width: `${f.size}px`, height: `${f.size}px`, borderRadius: "50%",
          backgroundColor: f.color,
          boxShadow: `0 0 ${f.size * 3}px ${f.color}, 0 0 ${f.size * 6}px ${f.color}80`,
          animation: `firefly ${f.duration}s ease-in-out infinite`,
          animationDelay: `${f.delay}s`,
          "--fx": f.fx, "--fy": f.fy,
        }} />
      ))}
    </div>
  </>
);

/* ===== Corner vine ===== */
const CornerVine = ({ position, color }) => {
  const isRight = position === "tr" || position === "br";
  const isBottom = position === "bl" || position === "br";
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
      style={{
        position: "absolute",
        top: isBottom ? "auto" : -8, bottom: isBottom ? -8 : "auto",
        left: isRight ? "auto" : -8, right: isRight ? -8 : "auto",
        transform: `scale(${isRight ? -1 : 1}, ${isBottom ? -1 : 1})`,
        pointerEvents: "none", opacity: 0.65,
      }}>
      <path d="M4 76 Q4 40 40 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M20 60 C10 50, 4 40, 4 30 C12 38, 18 50, 20 60Z" fill={color} opacity="0.8"/>
      <path d="M36 28 C26 22, 18 18, 12 10 C20 16, 30 22, 36 28Z" fill={color} opacity="0.7"/>
      <path d="M12 44 C6 36, 4 28, 8 18 C10 28, 10 36, 12 44Z" fill={color} opacity="0.65"/>
      <circle cx="40" cy="4" r="3" fill={color} opacity="0.9"/>
      <circle cx="36" cy="8" r="2" fill={color} opacity="0.75"/>
    </svg>
  );
};

/* ===== Enchanted color palettes — each card gets one ===== */
const CARD_PALETTES = [
  // question bg/border/text/glow  |  answer bg/border/text/glow
  { q: { bg: "linear-gradient(135deg,#f0f9ea,#e0f0d8)", border: "#6aaa5a", text: "#1e4020", glow: "rgba(106,170,90,0.55)", label: "#5a8f4e", vine: "#4a7c3f" },
    a: { bg: "linear-gradient(135deg,#fdf6ec,#f5e8d0)", border: "#c4956a", text: "#4a2e10", glow: "rgba(196,149,106,0.55)", label: "#9a6840", vine: "#8B5E3C" } },

  { q: { bg: "linear-gradient(135deg,#f0eaff,#e4d8f8)", border: "#9b6ddb", text: "#2e1460", glow: "rgba(155,109,219,0.55)", label: "#7a4ec0", vine: "#6a3db0" },
    a: { bg: "linear-gradient(135deg,#fff0fa,#f8d8ee)", border: "#db6da8", text: "#4a1030", glow: "rgba(219,109,168,0.55)", label: "#b84e88", vine: "#a03878" } },

  { q: { bg: "linear-gradient(135deg,#eaf4ff,#d8ebf8)", border: "#5b9bd5", text: "#0e2c50", glow: "rgba(91,155,213,0.55)", label: "#3a78b0", vine: "#2a68a0" },
    a: { bg: "linear-gradient(135deg,#eafff5,#d0f5e8)", border: "#3dbb85", text: "#0e3828", glow: "rgba(61,187,133,0.55)", label: "#2a9868", vine: "#1a8858" } },

  { q: { bg: "linear-gradient(135deg,#fff8e8,#ffedc8)", border: "#e8a020", text: "#4a2e00", glow: "rgba(232,160,32,0.55)", label: "#b07810", vine: "#906000" },
    a: { bg: "linear-gradient(135deg,#fff0e8,#ffd8c0)", border: "#e87040", text: "#4a1800", glow: "rgba(232,112,64,0.55)", label: "#c05020", vine: "#a04010" } },

  { q: { bg: "linear-gradient(135deg,#f5eaff,#e8d0ff)", border: "#b060e8", text: "#2a0858", glow: "rgba(176,96,232,0.55)", label: "#8838c0", vine: "#7028b0" },
    a: { bg: "linear-gradient(135deg,#eafffc,#c8f5f0)", border: "#30c0b0", text: "#082828", glow: "rgba(48,192,176,0.55)", label: "#189888", vine: "#087878" } },

  { q: { bg: "linear-gradient(135deg,#ffebeb,#ffd0d0)", border: "#e85050", text: "#4a0808", glow: "rgba(232,80,80,0.55)", label: "#c02828", vine: "#a01818" },
    a: { bg: "linear-gradient(135deg,#fff9eb,#ffefc8)", border: "#e8c030", text: "#3a2800", glow: "rgba(232,192,48,0.55)", label: "#b09010", vine: "#907000" } },

  { q: { bg: "linear-gradient(135deg,#ebffeb,#c8f0c8)", border: "#40b840", text: "#082808", glow: "rgba(64,184,64,0.55)", label: "#208020", vine: "#107010" },
    a: { bg: "linear-gradient(135deg,#ebf0ff,#c8d8ff)", border: "#4868e8", text: "#08102a", glow: "rgba(72,104,232,0.55)", label: "#2848c0", vine: "#1838a0" } },
];

export default function Flashcards() {
  const navigate = useNavigate();
  const { notebookId } = useParams();
  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [extractedText, setExtractedText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [topicTitle, setTopicTitle] = useState("Flashcards");
  const [notebook, setNotebook] = useState(null);

useEffect(() => {
  const fetchNotebook = async () => {
    const res = await fetch(`${API}/api/notebooks/${notebookId}`);
    const data = await res.json();
    setNotebook(data);
  };

  fetchNotebook();
}, [notebookId]);
const subject = notebook?.name || "Unknown";

  /* Assign a palette to each card index deterministically */
  const palette = useMemo(
    () => CARD_PALETTES[currentIndex % CARD_PALETTES.length],
    [currentIndex]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!notebookId) { setError("Notebook not found."); return; }
        const flashRes = await axios.get(`${API}/api/flashcards/${notebookId}`);
        if (flashRes.data?.cards) {
          setFlashcards(flashRes.data.cards.map(c => ({ question: c.front, answer: c.back })));
        }
        const textRes = await axios.get(`${API}/api/notebooks/${notebookId}/text`);
        setExtractedText(textRes.data.text);
      } catch { setError("Failed to load data."); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [notebookId]);

  const generateFlashcards = async () => {
    if (!extractedText) return;
    try {
      setGenerating(true); setError("");
      const res = await axios.post(`${API}/api/flashcards/generate-flashcards`, { paragraph: extractedText });
      const generated = res.data.flashcards || [];
      setFlashcards(generated); setCurrentIndex(0); setFlipped({});
      await axios.post(`${API}/api/flashcards`, {
        userId: localStorage.getItem("userId"), notebookId,
        cards: generated.map(c => ({ front: c.question, back: c.answer })),
      });
    } catch { setError("Failed to generate flashcards."); }
    finally { setGenerating(false); }
  };
  const trackFlashcard = async (correct) => {
    if (!notebook) return;
  try {
    await axios.post(`${API}/api/progress/flashcard`, {
      userId: localStorage.getItem("userId"),
      notebookId,
      topicTitle,
      subject,
      correct
    });
  } catch (err) {
    console.error("Flashcard tracking failed", err);
  }
};

const getFlashcardsText = () => {
  return flashcards.map((card, i) => {
    return `Card ${i + 1}: ${card.question}\n${card.answer}`;
  }).join("\n\n");
};

  const isFlipped = !!flipped[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
  const activeFace = isFlipped ? palette.a : palette.q;

  /* Inject per-card glow keyframes */
  const glowStyle = `
    @keyframes cardGlow {
      0%,100% { box-shadow: 0 0 20px ${activeFace.glow}, 0 0 55px ${activeFace.glow.replace("0.55","0.2")}, 5px 5px 0px ${activeFace.border}88; }
      50%      { box-shadow: 0 0 36px ${activeFace.glow}, 0 0 80px ${activeFace.glow.replace("0.55","0.3")}, 5px 5px 0px ${activeFace.border}88; }
    }
    .card-scene { perspective: 1000px; }
    .card-inner {
      position: relative; width: 100%; height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.7s cubic-bezier(0.4,0.2,0.2,1);
    }
    .card-inner.flipped { transform: rotateY(180deg); }
    .card-face {
      position: absolute; inset: 0; backface-visibility: hidden;
      -webkit-backface-visibility: hidden; border-radius: 24px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 48px;
    }
    .card-back { transform: rotateY(180deg); }
    .card-active-glow { animation: cardGlow 2.8s ease-in-out infinite; }
    @keyframes firefly {
      0%   { transform: translate(0,0) scale(1); opacity: 0; }
      20%  { opacity: 1; }
      50%  { transform: translate(var(--fx), var(--fy)) scale(1.3); opacity: 0.8; }
      80%  { opacity: 0.4; }
      100% { transform: translate(0,0) scale(0.8); opacity: 0; }
    }
  `;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8DCC8", fontFamily: "Georgia, serif" }}>
      <div className="text-center">
        <div className="text-5xl mb-4">🌿</div>
        <p className="text-xl" style={{ color: "#5a3a1a" }}>Gathering your cards…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8DCC8" }}>
      <p className="text-xl" style={{ color: "#8b0000" }}>{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        fontFamily: "Georgia, serif", backgroundColor: "#E8DCC8",
        backgroundImage: "repeating-linear-gradient(90deg, rgba(210,180,140,0.25) 0px, rgba(210,180,140,0.25) 2px, transparent 2px, transparent 40px)",
      }}
    >
      <style>{glowStyle}</style>
      <FloatingLeaves />
      <Fireflies />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">

        {/* Back */}
        <button onClick={() => navigate("/notebookview/" + notebookId)}
          className="mb-6 px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: "rgba(210,180,140,0.5)", border: "1.5px solid #8B5E3C", color: "#5a3a1a", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(210,180,140,0.8)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(210,180,140,0.5)"}
        >← Back</button>

        {/* Title */}
        <div className="text-center mb-8">
          {flashcards.length > 0 && (
  <div className="flex justify-center mb-4">
    <DownloadFile
      content={getFlashcardsText()}
      title="Flashcards"
    />
  </div>
)}
          <h1 className="text-4xl font-bold mb-1" style={{ color: "#3b2010", textShadow: "1px 2px 8px rgba(196,149,106,0.4)" }}>
            🌿 Flashcards
          </h1>
          {flashcards.length > 0 && (
            <p className="text-sm" style={{ color: "#9a6840" }}>Card {currentIndex + 1} of {flashcards.length}</p>
          )}
        </div>

        {/* Progress bar — color matches current card */}
        {flashcards.length > 0 && (
          <div className="mb-8 rounded-full overflow-hidden" style={{ height: "6px", backgroundColor: "rgba(196,149,106,0.2)" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: `linear-gradient(to right, ${palette.q.border}, ${palette.a.border})`,
              borderRadius: "999px", transition: "width 0.4s ease, background 0.5s ease",
              boxShadow: `0 0 8px ${palette.q.glow}`,
            }} />
          </div>
        )}

        {/* Empty state */}
        {flashcards.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-lg mb-6" style={{ color: "#7a5030" }}>No flashcards yet — let the garden grow.</p>
            {extractedText && (
              <button onClick={generateFlashcards} disabled={generating}
                className="px-8 py-3 rounded-xl text-base font-semibold"
                style={{
                  background: "linear-gradient(135deg, #5a8f4e, #3d6b35)",
                  border: "2px solid #2d5a27", color: "#f5f9f0",
                  boxShadow: "4px 4px 0px rgba(45,90,39,0.5), 0 0 20px rgba(90,143,78,0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "5px 8px 20px rgba(45,90,39,0.5), 0 0 30px rgba(90,143,78,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "4px 4px 0px rgba(45,90,39,0.5), 0 0 20px rgba(90,143,78,0.3)"; }}
              >{generating ? "✨ Growing cards…" : "✨ Generate Flashcards"}</button>
            )}
          </div>
        )}

        {/* ===== CARD ===== */}
        {flashcards.length > 0 && (
          <>
            <div className="card-scene mb-8 cursor-pointer" style={{ height: "340px" }}
              onClick={() => setFlipped(prev => ({ ...prev, [currentIndex]: !prev[currentIndex] }))}>
              <div className={`card-inner ${isFlipped ? "flipped" : ""}`}>

                {/* QUESTION face */}
                <div className={`card-face card-front ${!isFlipped ? "card-active-glow" : ""}`}
                  style={{ background: palette.q.bg, border: `2.5px solid ${palette.q.border}` }}>
                  <CornerVine position="tl" color={palette.q.vine} />
                  <CornerVine position="tr" color={palette.q.vine} />
                  <CornerVine position="bl" color={palette.q.vine} />
                  <CornerVine position="br" color={palette.q.vine} />
                  <p className="text-xs uppercase tracking-widest mb-5 font-bold" style={{ color: palette.q.label, letterSpacing: "0.15em" }}>
                    🌿 Question
                  </p>
                  <p className="text-xl text-center leading-relaxed font-medium" style={{ color: palette.q.text }}>
                    {flashcards[currentIndex]?.question}
                  </p>
                  <div className="absolute bottom-5 right-5 flex items-center gap-1.5 text-xs" style={{ color: palette.q.label }}>
                    <MdFlip size={14} /> tap to reveal
                  </div>
                </div>

                {/* ANSWER face */}
                <div className={`card-face card-back ${isFlipped ? "card-active-glow" : ""}`}
                  style={{ background: palette.a.bg, border: `2.5px solid ${palette.a.border}` }}>
                  <CornerVine position="tl" color={palette.a.vine} />
                  <CornerVine position="tr" color={palette.a.vine} />
                  <CornerVine position="bl" color={palette.a.vine} />
                  <CornerVine position="br" color={palette.a.vine} />
                  <p className="text-xs uppercase tracking-widest mb-5 font-bold" style={{ color: palette.a.label, letterSpacing: "0.15em" }}>
                    🌸 Answer
                  </p>
                  <p className="text-xl text-center leading-relaxed font-medium" style={{ color: palette.a.text }}>
                    {flashcards[currentIndex]?.answer}
                  </p>
                  <div className="absolute bottom-5 right-5 flex items-center gap-1.5 text-xs" style={{ color: palette.a.label }}>
                    <MdFlip size={14} /> tap to flip back
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mb-8">
              <button disabled={currentIndex === 0}
                onClick={() => { setCurrentIndex(i => i - 1); setFlipped({}); }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: currentIndex === 0 ? "rgba(210,180,140,0.2)" : "linear-gradient(to bottom, #d2b48c, #c4a078)",
                  border: "2px solid #8B5E3C", color: currentIndex === 0 ? "#b09070" : "#3b2010",
                  boxShadow: currentIndex === 0 ? "none" : "3px 3px 0px rgba(90,58,26,0.35)",
                  opacity: currentIndex === 0 ? 0.5 : 1, transition: "all 0.15s",
                }}
              >← Previous</button>

              {/* Dot indicators — color matches each card's palette */}
              <div className="flex gap-1.5 items-center">
                {flashcards.map((_, i) => {
                  const p = CARD_PALETTES[i % CARD_PALETTES.length];
                  return (
                    <div key={i} onClick={() => { setCurrentIndex(i); setFlipped({}); }}
                      className="cursor-pointer rounded-full"
                      style={{
                        width: i === currentIndex ? "20px" : "8px", height: "8px",
                        backgroundColor: i === currentIndex ? p.q.border : `${p.q.border}55`,
                        boxShadow: i === currentIndex ? `0 0 8px ${p.q.glow}` : "none",
                        transition: "all 0.25s ease",
                      }}
                    />
                  );
                })}
              </div>

              <button disabled={currentIndex === flashcards.length - 1}
                onClick={() => { setCurrentIndex(i => i + 1); setFlipped({}); }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: currentIndex === flashcards.length - 1 ? "rgba(210,180,140,0.2)" : "linear-gradient(to bottom, #d2b48c, #c4a078)",
                  border: "2px solid #8B5E3C", color: currentIndex === flashcards.length - 1 ? "#b09070" : "#3b2010",
                  boxShadow: currentIndex === flashcards.length - 1 ? "none" : "3px 3px 0px rgba(90,58,26,0.35)",
                  opacity: currentIndex === flashcards.length - 1 ? 0.5 : 1, transition: "all 0.15s",
                }}
              >Next →</button>
            </div>
                <div className="flex justify-center gap-4 mb-6">

  <button
    onClick={() => {
      trackFlashcard(true);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(i => i + 1);
        setFlipped({});
      }
    }}
    className="px-5 py-2 rounded-xl text-sm font-medium"
    style={{
      background: "linear-gradient(135deg,#6aaa5a,#4a7c3f)",
      border: "2px solid #2d5a27",
      color: "#fff"
    }}
  >
    ✅ I knew this
  </button>

  <button
    onClick={() => {
      trackFlashcard(false);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(i => i + 1);
        setFlipped({});
      }
    }}
    className="px-5 py-2 rounded-xl text-sm font-medium"
    style={{
      background: "linear-gradient(135deg,#e87040,#c05020)",
      border: "2px solid #a04010",
      color: "#fff"
    }}
  >
    ❌ I didn’t know this
  </button>

</div>
            {/* Regenerate */}
            {extractedText && (
              <div className="text-center">
                <button onClick={generateFlashcards} disabled={generating}
                  className="px-6 py-2.5 rounded-xl text-sm"
                  style={{
                    backgroundColor: "rgba(210,180,140,0.3)", border: "1.5px solid #8B5E3C",
                    color: "#5a3a1a", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(210,180,140,0.55)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(210,180,140,0.3)"}
                >{generating ? "✨ Growing new cards…" : "🔄 Regenerate Flashcards"}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { FloatingLeaves, Fireflies, CornerVine };