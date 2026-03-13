import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

/* ===== Same colorful palettes as Flashcards ===== */
const CARD_PALETTES = [
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

/* ===== Corner Vine — identical to Flashcards ===== */
const CornerVine = ({ position, color }) => {
  const isRight  = position === "tr" || position === "br";
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

export default function Quiz() {
  const navigate  = useNavigate();
  const { notebookId } = useParams();
  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [quizData,   setQuizData]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [started,    setStarted]    = useState(false);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [revealed,   setRevealed]   = useState({});
  const [submitted,  setSubmitted]  = useState(false);

  const score             = quizData.filter((q, i) => answers[i] === q.answer).length;
  const isCurrentRevealed = revealed[current] === true;
  const selectedAnswer    = answers[current];
  const correctIndex      = quizData[current]?.answer;
  const progress          = quizData.length > 0 ? ((current + 1) / quizData.length) * 100 : 0;

  /* Current question's palette */
  const palette = useMemo(() => CARD_PALETTES[current % CARD_PALETTES.length], [current]);

  /* Inject glow animation keyed to current palette */
  const glowStyle = `
    @keyframes cardGlow {
      0%,100% { box-shadow: 0 0 20px ${palette.q.glow}, 0 0 55px ${palette.q.glow.replace("0.55","0.2")}, 5px 5px 0px ${palette.q.border}88; }
      50%      { box-shadow: 0 0 36px ${palette.q.glow}, 0 0 80px ${palette.q.glow.replace("0.55","0.3")}, 5px 5px 0px ${palette.q.border}88; }
    }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  `;

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const existing     = await fetch(`${API}/api/quiz/${notebookId}`);
        const existingData = await existing.json();
        if (existingData?.questions?.length > 0) {
          setQuizData(existingData.questions); setLoading(false); return;
        }
        const textRes  = await fetch(`${API}/api/notebooks/${notebookId}/text`);
        const textData = await textRes.json();
        const genRes   = await fetch(`${API}/api/quiz/generate/${notebookId}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textData.text, userId: localStorage.getItem("userId") }),
        });
        const genData = await genRes.json();
        console.log("Generated quiz response:", genData);
        setQuizData(genData.questions);
      } catch (err) { setError("Failed to load quiz"); }
      finally { setLoading(false); }
    };
    if (notebookId) loadQuiz();
  }, [notebookId]);

  const regenerateQuiz = async () => {
    try {
      setLoading(true); setError("");
      const textRes  = await fetch(`${API}/api/notebooks/${notebookId}/text`);
      const textData = await textRes.json();
      if (!textData.text) throw new Error("No study material found.");
      const genRes = await fetch(`${API}/api/quiz/generate/${notebookId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textData.text, userId: localStorage.getItem("userId") }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Quiz regeneration failed");
      setQuizData(genData.questions); setCurrent(0); setAnswers({});
      setRevealed({}); setSubmitted(false); setStarted(false);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      const finalScore = quizData.filter((q, i) => answers[i] === q.answer).length;
      await fetch(`${API}/api/quiz/save-result`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"), notebookId,
          score: finalScore, total: quizData.length,
          percentage: Math.round((finalScore / quizData.length) * 100),
        }),
      });
    } catch (err) { console.error("Failed to save result:", err); }
    finally { setSubmitted(true); }
  };

  /* ── shared page shell ── */
  const PageWrap = ({ children }) => (
    <div style={{
      minHeight: "100vh", fontFamily: "Georgia, serif", backgroundColor: "#E8DCC8",
      backgroundImage: "repeating-linear-gradient(90deg,rgba(210,180,140,0.25) 0px,rgba(210,180,140,0.25) 2px,transparent 2px,transparent 40px)",
    }}>
      <style>{glowStyle}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* top nav */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/notebookview/" + notebookId)}
            style={{ padding: "8px 18px", borderRadius: 12, fontFamily: "Georgia, serif", fontSize: 14,
              background: "rgba(210,180,140,0.5)", border: "1.5px solid #8B5E3C", color: "#5a3a1a", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(210,180,140,0.8)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(210,180,140,0.5)"}
          >← Back</button>
          <button onClick={regenerateQuiz}
            style={{ padding: "8px 18px", borderRadius: 12, fontFamily: "Georgia, serif", fontSize: 14,
              background: "rgba(210,180,140,0.3)", border: "1.5px solid #8B5E3C", color: "#5a3a1a", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(210,180,140,0.6)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(210,180,140,0.3)"}
          >🔄 Regenerate Quiz</button>
        </div>
        {children}
      </div>
    </div>
  );

  /* ── loading ── */
  if (loading && !error) return (
    <PageWrap>
      <div style={{
        position: "relative", borderRadius: 20, overflow: "visible",
        border: "2.5px solid #c4956a",
        boxShadow: "5px 5px 0px rgba(196,149,106,0.45), 0 10px 32px rgba(139,94,60,0.12)",
        background: "linear-gradient(135deg,#fdf6ec,#f5e8d0)",
      }}>
        <div style={{ padding: "52px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#4a2e10", marginBottom: 8 }}>Generating Quiz</h2>
          <p style={{ color: "#9a6840", fontSize: 14 }}>Analyzing your study material…</p>
          <div style={{ marginTop: 20, display: "flex", gap: 6, justifyContent: "center" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:8,height:8,borderRadius:"50%",backgroundColor:"#c4956a",
                animation:"bounce 1s ease-in-out infinite",animationDelay:`${i*0.15}s` }}/>
            ))}
          </div>
        </div>
      </div>
    </PageWrap>
  );

  /* ── error ── */
  if (error) return (
    <PageWrap>
      <div style={{ position:"relative",borderRadius:20,border:"2.5px solid #c94040",
        background:"linear-gradient(135deg,#fff5f5,#ffe8e8)",
        boxShadow:"5px 5px 0px rgba(201,64,64,0.3)",padding:0,overflow:"visible" }}>
        <div style={{ padding:"48px 40px",textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🍂</div>
          <h2 style={{ fontSize:22,fontWeight:"bold",color:"#8b0000",marginBottom:8 }}>Quiz Generation Failed</h2>
          <p style={{ color:"#a04040",fontSize:14,marginBottom:24 }}>{error}</p>
          <button onClick={() => navigate("/notebookview/"+notebookId)}
            style={{ padding:"10px 24px",borderRadius:12,fontFamily:"Georgia, serif",
              background:"linear-gradient(135deg,#8B5E3C,#6b3f1f)",border:"2px solid #5a3a1a",
              color:"#fff8f0",cursor:"pointer",boxShadow:"3px 3px 0px rgba(90,58,26,0.5)" }}>
            ← Go Back
          </button>
        </div>
      </div>
    </PageWrap>
  );

  /* ── start screen ── */
  if (!started) {
    const p0 = CARD_PALETTES[0];
    return (
      <PageWrap>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <h1 style={{ fontSize:38,fontWeight:"bold",color:"#3b2010",textShadow:"1px 2px 8px rgba(196,149,106,0.4)" }}>
            📜 Quiz
          </h1>
        </div>
        <div style={{ position:"relative",borderRadius:24,overflow:"visible",
          background: p0.q.bg, border:`2.5px solid ${p0.q.border}`,
          boxShadow:`5px 5px 0px ${p0.q.border}88, 0 10px 32px ${p0.q.glow.replace("0.55","0.15")}`,
        }}>
          <CornerVine position="tl" color={p0.q.vine}/>
          <CornerVine position="tr" color={p0.q.vine}/>
          <CornerVine position="bl" color={p0.q.vine}/>
          <CornerVine position="br" color={p0.q.vine}/>
          <div style={{ padding:"60px 48px",textAlign:"center" }}>
            <div style={{ fontSize:52,marginBottom:20 }}>🎯</div>
            <h2 style={{ fontSize:26,fontWeight:"bold",color:p0.q.text,marginBottom:10 }}>Quiz Ready</h2>
            <p style={{ color:p0.q.label,fontSize:15,marginBottom:36 }}>
              {quizData.length} questions generated from your notes
            </p>
            <button onClick={() => setStarted(true)}
              style={{
                padding:"14px 48px",borderRadius:14,fontFamily:"Georgia, serif",fontSize:16,fontWeight:"bold",
                background:`linear-gradient(135deg,${p0.q.border},${p0.q.vine})`,
                border:`2px solid ${p0.q.vine}`,color:"#fff",
                boxShadow:`4px 4px 0px ${p0.q.vine}88`,cursor:"pointer",
                transition:"transform 0.18s,box-shadow 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`5px 8px 16px ${p0.q.vine}88`; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow=`4px 4px 0px ${p0.q.vine}88`; }}
            >Start Quiz →</button>
          </div>
        </div>
      </PageWrap>
    );
  }

  /* ── results ── */
  if (submitted) {
    const pct   = Math.round((score / quizData.length) * 100);
    const medal = pct >= 80 ? "🏆" : pct >= 50 ? "🌿" : "🍂";
    const rp    = CARD_PALETTES[0];
    return (
      <PageWrap>
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <h1 style={{ fontSize:34,fontWeight:"bold",color:"#3b2010" }}>📜 Quiz Results</h1>
        </div>

        {/* Score card */}
        <div style={{ position:"relative",borderRadius:24,overflow:"visible",
          background:rp.q.bg, border:`2.5px solid ${rp.q.border}`,
          boxShadow:`5px 5px 0px ${rp.q.border}88, 0 10px 32px ${rp.q.glow.replace("0.55","0.15")}`,
          marginBottom:20 }}>
          <CornerVine position="tl" color={rp.q.vine}/>
          <CornerVine position="tr" color={rp.q.vine}/>
          <CornerVine position="bl" color={rp.q.vine}/>
          <CornerVine position="br" color={rp.q.vine}/>
          <div style={{ padding:"36px 40px",textAlign:"center" }}>
            <div style={{ fontSize:56,marginBottom:10 }}>{medal}</div>
            <div style={{ fontSize:42,fontWeight:"bold",color:rp.q.text,marginBottom:4 }}>
              {score}/{quizData.length}
            </div>
            <div style={{ fontSize:18,color:rp.q.label }}>{pct}% correct</div>
          </div>
        </div>

        {/* Review list — each row uses that question's palette */}
        <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:20,maxHeight:380,overflowY:"auto" }}>
          {quizData.map((q, i) => {
            const correct = answers[i] === q.answer;
            const qp = CARD_PALETTES[i % CARD_PALETTES.length];
            return (
              <div key={i} style={{
                padding:"14px 18px",borderRadius:14,
                background: correct ? qp.q.bg : qp.a.bg,
                border:`1.5px solid ${correct ? qp.q.border : qp.a.border}`,
                boxShadow:`2px 2px 0px ${correct ? qp.q.border : qp.a.border}55`,
              }}>
                <p style={{ fontWeight:"600",color:correct ? qp.q.text : qp.a.text,marginBottom:4,fontSize:14 }}>{q.question}</p>
                <p style={{ fontSize:13,color:correct ? qp.q.label : qp.a.label }}>
                  {correct ? "✓" : "✗"} {q.options[q.answer]}
                </p>
                {!correct && answers[i] !== undefined && (
                  <p style={{ fontSize:12,color:qp.a.label,marginTop:2 }}>
                    Your answer: {q.options[answers[i]]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate("/notebookview/"+notebookId)}
          style={{
            width:"100%",padding:"14px",borderRadius:14,fontFamily:"Georgia, serif",fontSize:15,fontWeight:"bold",
            background:"linear-gradient(135deg,#8B5E3C,#6b3f1f)",border:"2px solid #5a3a1a",
            color:"#fff8f0",boxShadow:"4px 4px 0px rgba(90,58,26,0.5)",cursor:"pointer",
            transition:"transform 0.18s,box-shadow 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="5px 8px 16px rgba(90,58,26,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="4px 4px 0px rgba(90,58,26,0.5)"; }}
        >← Back to Notebook</button>
      </PageWrap>
    );
  }

  /* ── active quiz ── */
  return (
    <PageWrap>
      <div style={{ textAlign:"center",marginBottom:24 }}>
        <h1 style={{ fontSize:34,fontWeight:"bold",color:"#3b2010",textShadow:"1px 2px 8px rgba(196,149,106,0.4)" }}>
          📜 Quiz
        </h1>
        <p style={{ color:"#9a6840",fontSize:14,marginTop:4 }}>
          Question {current + 1} of {quizData.length}
        </p>
      </div>

      {/* Progress bar — matches current palette */}
      <div style={{ height:6,borderRadius:999,backgroundColor:"rgba(196,149,106,0.2)",marginBottom:28,overflow:"hidden" }}>
        <div style={{
          height:"100%",width:`${progress}%`,borderRadius:999,
          background:`linear-gradient(to right,${palette.q.border},${palette.a.border})`,
          transition:"width 0.4s ease,background 0.5s ease",
          boxShadow:`0 0 8px ${palette.q.glow}`,
        }}/>
      </div>

      {/* Question card — palette-colored with corner vines + glow */}
      <div style={{
        position:"relative",borderRadius:24,overflow:"visible",
        background:palette.q.bg, border:`2.5px solid ${palette.q.border}`,
        animation:"cardGlow 2.8s ease-in-out infinite",
        marginBottom:24,
      }}>
        <CornerVine position="tl" color={palette.q.vine}/>
        <CornerVine position="tr" color={palette.q.vine}/>
        <CornerVine position="bl" color={palette.q.vine}/>
        <CornerVine position="br" color={palette.q.vine}/>

        <div style={{ padding:"36px 40px" }}>
          {/* Label */}
          <p style={{ fontSize:11,fontWeight:"bold",letterSpacing:"0.15em",textTransform:"uppercase",
            color:palette.q.label,marginBottom:14 }}>🌿 Question</p>

          {/* Question text */}
          <p style={{ fontSize:19,fontWeight:"600",color:palette.q.text,lineHeight:1.65,marginBottom:28 }}>
            {quizData[current].question}
          </p>

          {/* Options */}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {quizData[current].options.map((opt, i) => {
              let bg, border, color, shadow;
              if (!isCurrentRevealed) {
                bg = "rgba(255,255,255,0.55)"; border = `1.5px solid ${palette.q.border}88`;
                color = palette.q.text; shadow = "none";
              } else if (i === correctIndex) {
                bg = "linear-gradient(to right,#e8f8e8,#d0f0d0)"; border = "2px solid #4a9e4a";
                color = "#1a4a1a"; shadow = "2px 2px 0px rgba(74,158,74,0.3)";
              } else if (i === selectedAnswer) {
                bg = "linear-gradient(to right,#ffeaea,#fdd0d0)"; border = "2px solid #c94040";
                color = "#4a0808"; shadow = "2px 2px 0px rgba(201,64,64,0.3)";
              } else {
                bg = "rgba(255,255,255,0.2)"; border = `1.5px solid ${palette.q.border}44`;
                color = palette.q.label; shadow = "none";
              }
              return (
                <button key={i}
                  disabled={isCurrentRevealed}
                  onClick={() => {
                    setAnswers(a => ({ ...a, [current]: i }));
                    setRevealed(r => ({ ...r, [current]: true }));
                  }}
                  style={{
                    width:"100%",textAlign:"left",padding:"12px 18px",borderRadius:12,
                    fontFamily:"Georgia, serif",fontSize:15,cursor:isCurrentRevealed?"default":"pointer",
                    background:bg,border,color,boxShadow:shadow,
                    transition:"all 0.15s ease",
                  }}
                  onMouseEnter={e => { if (!isCurrentRevealed) e.currentTarget.style.background = "rgba(255,255,255,0.8)"; }}
                  onMouseLeave={e => { if (!isCurrentRevealed) e.currentTarget.style.background = "rgba(255,255,255,0.55)"; }}
                >
                  <span style={{ fontWeight:"700",marginRight:10,color:palette.q.border }}>
                    {String.fromCharCode(65+i)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <button disabled={current===0}
          onClick={() => setCurrent(c => c-1)}
          style={{
            padding:"10px 22px",borderRadius:12,fontFamily:"Georgia, serif",fontSize:14,
            background:current===0?"rgba(210,180,140,0.2)":"linear-gradient(to bottom,#d2b48c,#c4a078)",
            border:"2px solid #8B5E3C",color:current===0?"#b09070":"#3b2010",
            boxShadow:current===0?"none":"3px 3px 0px rgba(90,58,26,0.35)",
            opacity:current===0?0.5:1,cursor:current===0?"default":"pointer",transition:"all 0.15s",
          }}
        >← Prev</button>

        {/* Dot indicators — each colored with its own palette */}
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          {quizData.map((_, i) => {
            const dp = CARD_PALETTES[i % CARD_PALETTES.length];
            return (
              <div key={i} onClick={() => setCurrent(i)} style={{
                width:i===current?20:8,height:8,borderRadius:999,
                backgroundColor:i===current?dp.q.border:`${dp.q.border}55`,
                boxShadow:i===current?`0 0 8px ${dp.q.glow}`:"none",
                cursor:"pointer",transition:"all 0.25s ease",
              }}/>
            );
          })}
        </div>

        {current===quizData.length-1 ? (
          <button disabled={!isCurrentRevealed} onClick={handleSubmit}
            style={{
              padding:"10px 22px",borderRadius:12,fontFamily:"Georgia, serif",fontSize:14,fontWeight:"bold",
              background:!isCurrentRevealed?"rgba(210,180,140,0.2)":`linear-gradient(135deg,${palette.q.border},${palette.q.vine})`,
              border:`2px solid ${palette.q.vine}`,color:!isCurrentRevealed?"#b09070":"#fff",
              boxShadow:!isCurrentRevealed?"none":`3px 3px 0px ${palette.q.vine}88`,
              opacity:!isCurrentRevealed?0.5:1,cursor:!isCurrentRevealed?"default":"pointer",transition:"all 0.15s",
            }}
          >Submit ✓</button>
        ) : (
          <button disabled={!isCurrentRevealed} onClick={() => setCurrent(c => c+1)}
            style={{
              padding:"10px 22px",borderRadius:12,fontFamily:"Georgia, serif",fontSize:14,
              background:!isCurrentRevealed?"rgba(210,180,140,0.2)":"linear-gradient(to bottom,#d2b48c,#c4a078)",
              border:"2px solid #8B5E3C",color:!isCurrentRevealed?"#b09070":"#3b2010",
              boxShadow:!isCurrentRevealed?"none":"3px 3px 0px rgba(90,58,26,0.35)",
              opacity:!isCurrentRevealed?0.5:1,cursor:!isCurrentRevealed?"default":"pointer",transition:"all 0.15s",
            }}
          >Next →</button>
        )}
      </div>
    </PageWrap>
  );
}