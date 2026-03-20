import React, { useState, useEffect, useMemo } from "react";
import {
    Flame, Star, Clock, BookOpen, Calendar, AlertTriangle, Zap, Target,
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line,
    PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from "recharts";

/* ── Design tokens ── */
const C = {
    bg:            "#f0f7f2",          // light sage background
    bgInner:       "#e8f4ec",          // slightly deeper sage for depth
    card:          "#ffffff",          // pure white cards
    cardHoverGreen:"rgba(26,158,92,0.08)",
    cardHoverGold: "rgba(212,146,10,0.08)",
    emerald:       "#1a9e5c",
    emeraldBright: "#22c975",
    emeraldGlow:   "rgba(34,201,117,0.3)",
    emeraldBorder: "rgba(26,158,92,0.2)",
    gold:          "#c4870a",
    goldBright:    "#f5b82e",
    goldGlow:      "rgba(245,184,46,0.35)",
    goldBorder:    "rgba(196,135,10,0.22)",
    textDark:      "#0e2a18",
    textMid:       "#2d5a3a",
    textSub:       "#6b9478",
    gridLine:      "rgba(26,158,92,0.07)",
};

const PIE_COLORS = [C.emeraldBright, C.goldBright, "rgba(34,201,117,0.25)"];

/* ── Glowing light card ── */
const GlassCard = ({ children, className = "", accent = "green" }) => {
    const [hovered, setHovered] = React.useState(false);
    const isGold   = accent === "gold";
    const glowColor = isGold ? C.goldGlow    : C.emeraldGlow;
    const glowRgb   = isGold ? "212,146,10"  : "26,158,92";
    const animName  = isGold ? "borderPulseGold" : "borderPulseGreen";

    return (
        <div
            className={`relative rounded-2xl overflow-visible ${className}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: C.card,
                /* animated glow border via box-shadow */
                boxShadow: hovered
                    ? `0 0 0 1.5px rgba(${glowRgb},0.6),
                       0 0 12px 2px  rgba(${glowRgb},0.35),
                       0 0 28px 6px  rgba(${glowRgb},0.18),
                       0 4px 20px    rgba(0,0,0,0.07)`
                    : `0 0 0 1.5px rgba(${glowRgb},0.22),
                       0 0 8px  2px  rgba(${glowRgb},0.10),
                       0 2px 10px    rgba(0,0,0,0.05)`,
                animation: `${animName} 3s ease-in-out infinite`,
                transition: "box-shadow 0.35s ease",
            }}
        >
            {/* inner glow wash on hover */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                style={{
                    background: `radial-gradient(ellipse at 20% 20%, ${glowColor} 0%, transparent 60%)`,
                    opacity: hovered ? 1 : 0,
                    borderRadius: "inherit",
                }} />
            <div className="relative z-10 p-5">{children}</div>
        </div>
    );
};

/* ── Inject keyframes once ── */
const GlowStyles = () => (
    <style>{`
        @keyframes borderPulseGreen {
            0%,100% {
                box-shadow: 0 0 0 1.5px rgba(26,158,92,0.25),
                            0 0 8px  3px  rgba(26,158,92,0.10),
                            0 2px 10px    rgba(0,0,0,0.05);
            }
            50% {
                box-shadow: 0 0 0 1.5px rgba(26,158,92,0.55),
                            0 0 16px 5px  rgba(26,158,92,0.22),
                            0 0 32px 8px  rgba(26,158,92,0.10),
                            0 4px 16px    rgba(0,0,0,0.07);
            }
        }
        @keyframes borderPulseGold {
            0%,100% {
                box-shadow: 0 0 0 1.5px rgba(212,146,10,0.25),
                            0 0 8px  3px  rgba(212,146,10,0.10),
                            0 2px 10px    rgba(0,0,0,0.05);
            }
            50% {
                box-shadow: 0 0 0 1.5px rgba(212,146,10,0.55),
                            0 0 16px 5px  rgba(212,146,10,0.22),
                            0 0 32px 8px  rgba(212,146,10,0.10),
                            0 4px 16px    rgba(0,0,0,0.07);
            }
        }
    `}</style>
);

/* ── Custom Tooltip ── */
const MysticTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: `1.5px solid ${C.emeraldBorder}`,
            borderRadius: 12, padding: "10px 16px",
            fontFamily: "Georgia, serif", fontSize: 13, color: C.textDark,
            boxShadow: `0 8px 24px rgba(26,158,92,0.12)`,
        }}>
            <p style={{ color: C.emerald, fontWeight: "bold", marginBottom: 4 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: C.gold }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    );
};

/* ── Mini stat card ── */
const StatBadge = ({ icon, label, value, accent = "green" }) => (
    <GlassCard accent={accent}>
        <div className="mb-2">{icon}</div>
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSub, marginBottom: 4 }}>{label}</p>
        <p style={{ fontWeight: "600", fontSize: 15, color: C.textDark }}>{value}</p>
    </GlassCard>
);

/* ════════════════════ DASHBOARD ════════════════════ */
export default function Dashboard() {
    const [quizResults,  setQuizResults]  = useState([]);
    const [progressData, setProgressData] = useState([]);

    const API         = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const username    = localStorage.getItem("userName") || "Student";
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const fetchData = async () => {
            try {
                const quizRes  = await fetch(`${API}/api/quiz/results/${userId}`);
                const quizData = await quizRes.json();
                console.log("Quiz results:", quizData);
                setQuizResults(quizData);
                const progressRes = await fetch(`${API}/api/progress/${userId}`);
                setProgressData(await progressRes.json());
            } catch (err) { console.error("Dashboard fetch error", err); }
        };
        fetchData();
    }, []);

    const weeklyProgress = useMemo(() => {
        const weeks = [0,0,0,0], counts = [0,0,0,0];
        const now = new Date();
        quizResults.forEach((quiz) => {
            const diffDays  = Math.floor((now - new Date(quiz.createdAt)) / (1000*60*60*24));
            const weekIndex = Math.floor(diffDays / 7);
            if (weekIndex < 4) { const i = 3 - weekIndex; weeks[i] += quiz.percentage; counts[i]++; }
        });
        return weeks.map((sum, i) => ({ week: `W${i+1}`, score: counts[i] ? Math.round(sum/counts[i]) : 0 }));
    }, [quizResults]);

    const totalCorrect   = quizResults.reduce((s, r) => s + r.score, 0);
    const totalQuestions = quizResults.reduce((s, r) => s + r.total, 0);
    const totalIncorrect = totalQuestions - totalCorrect;

    const quizPie = totalQuestions > 0
        ? [
            { name: "Correct",   value: Math.round((totalCorrect   / totalQuestions) * 100) },
            { name: "Incorrect", value: Math.round((totalIncorrect / totalQuestions) * 100) },
          ]
        : [{ name: "No Data", value: 100 }];

    const timeData = Object.values(
        progressData.reduce((acc, p) => {
            if (!acc[p.subject]) acc[p.subject] = { subject: p.subject, hours: 0 };
            acc[p.subject].hours += p.timeSpent / 3600;
            return acc;
        }, {})
    );

    const totalTime  = progressData.reduce((s, p) => s + p.timeSpent, 0);
    const hours      = Math.floor(totalTime / 3600);
    const minutes    = Math.floor((totalTime % 3600) / 60);
    const studyTime  = `${hours}h ${minutes}m`;

    const mostStudied  = timeData.length > 0 ? timeData.reduce((a,b) => a.hours > b.hours ? a : b).subject : "-";
    const leastStudied = timeData.length > 0 ? timeData.reduce((a,b) => a.hours < b.hours ? a : b).subject : "-";

    const flashCorrect  = progressData.reduce((s, p) => s + p.flashcardCorrect, 0);
    const flashWrong    = progressData.reduce((s, p) => s + p.flashcardWrong,   0);
    const flashAccuracy = flashCorrect + flashWrong > 0
        ? Math.round((flashCorrect / (flashCorrect + flashWrong)) * 100) : 0;

    const avgQuiz    = quizResults.length > 0
        ? quizResults.reduce((s, r) => s + r.percentage, 0) / quizResults.length : 0;
    const focusScore = Math.round(avgQuiz * 0.5 + flashAccuracy * 0.3 + Math.min(hours * 5, 20));
    const weeklyScores = weeklyProgress;
    const weakSubject  = leastStudied;

    return (
        <div className="min-h-screen relative" style={{
            backgroundColor: C.bg,
            fontFamily: "Georgia, serif",
        }}>
            <GlowStyles />
            {/* ── Layered light bg ── */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: `
                    radial-gradient(ellipse at 0% 0%,   rgba(34,201,117,0.10) 0%, transparent 45%),
                    radial-gradient(ellipse at 100% 100%, rgba(245,184,46,0.10) 0%, transparent 45%),
                    radial-gradient(ellipse at 55% 45%,  rgba(34,201,117,0.05) 0%, transparent 60%)
                `,
            }} />

            {/* ── Grid ── */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${C.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine} 1px, transparent 1px)`,
                backgroundSize: "44px 44px",
            }} />

            <div className="relative z-10 p-8 space-y-8">

                {/* ══ HERO ══ */}
                <GlassCard accent="green">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2">
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                                <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${C.emeraldBorder})` }}/>
                                <span style={{ color:C.emeraldBorder, fontSize:10, letterSpacing:6 }}>✦ ✦ ✦</span>
                                <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${C.emeraldBorder})` }}/>
                            </div>
                            <h1 style={{ fontSize:30, fontWeight:"normal", color:C.textDark, margin:0 }}>
                                Welcome back,{" "}
                                <span style={{ color:C.emerald, fontWeight:"600" }}>{displayName} 👋</span>
                            </h1>
                            <p style={{ fontSize:13, color:C.textSub, marginTop:6, letterSpacing:"0.03em" }}>
                                Consistency beats intensity.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 md:items-end">
                            <div className="max-w-xs px-4 py-3 rounded-xl text-sm" style={{
                                background: "rgba(26,158,92,0.06)",
                                border: `1.5px solid ${C.emeraldBorder}`,
                                color: C.emerald,
                            }}>
                                <p style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:C.textSub, marginBottom:4 }}>
                                    Today's Motivation
                                </p>
                                Just 1 focused session can change your day
                            </div>

                            <div style={{ display:"flex", gap:20, color:C.textDark }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <Flame size={16} style={{ color:C.gold }} />
                                    <span style={{ fontSize:14 }}>6 Day Streak</span>
                                </div>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <Star size={16} style={{ color:C.gold }} />
                                    <span style={{ fontSize:14 }}>124 Stars</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* ══ MINI STATS ══ */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <StatBadge accent="green" icon={<Clock        size={18} style={{ color:C.emerald }} />} label="Study Time"         value={studyTime} />
                    <StatBadge accent="green" icon={<BookOpen     size={18} style={{ color:C.emerald }} />} label="Most Studied"       value={mostStudied} />
                    <StatBadge accent="gold"  icon={<AlertTriangle size={18} style={{ color:C.gold   }}/>} label="Least Studied"      value={leastStudied} />
                    <StatBadge accent="green" icon={<Zap          size={18} style={{ color:C.emerald }} />} label="Flashcard Accuracy" value={`${flashAccuracy}%`} />
                    <StatBadge accent="gold"  icon={<Star         size={18} style={{ color:C.gold    }} />} label="Avg Quiz Score"     value={`${avgQuiz.toFixed(1)}%`} />
                    <StatBadge accent="gold"  icon={<Calendar     size={18} style={{ color:C.gold    }} />} label="Next Exam"          value={`${weakSubject || "-"} · Revise`} />
                </div>

                {/* ══ CHARTS ══ */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Time per Subject */}
                    <GlassCard className="md:col-span-2" accent="green">
                        <h3 style={{ color:C.textDark, marginBottom:14, fontSize:15, fontWeight:"600" }}>
                            ⏱ Time per Subject (hrs)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={timeData}>
                                <XAxis dataKey="subject" tick={{ fill:C.textSub, fontFamily:"Georgia, serif", fontSize:11 }} axisLine={{ stroke:C.emeraldBorder }} tickLine={false} />
                                <YAxis tick={{ fill:C.textSub, fontFamily:"Georgia, serif", fontSize:11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<MysticTooltip />} cursor={{ fill:"rgba(26,158,92,0.04)" }} />
                                <Bar dataKey="hours" radius={[8,8,0,0]}>
                                    {timeData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? C.emerald : C.emeraldBright} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Quiz Accuracy */}
                    <GlassCard className="md:col-span-2" accent="gold">
                        <h3 style={{ color:C.textDark, marginBottom:14, fontSize:15, fontWeight:"600" }}>🧠 Quiz Accuracy</h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={quizPie} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                                    {quizPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                </Pie>
                                <Tooltip content={<MysticTooltip />} />
                                <Legend verticalAlign="bottom"
                                    formatter={(v) => <span style={{ color:C.textSub, fontFamily:"Georgia, serif", fontSize:12 }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Quiz Scores by Notebook */}
                    <GlassCard className="md:col-span-2" accent="green">
                        <h3 style={{ color:C.textDark, marginBottom:14, fontSize:15, fontWeight:"600" }}>📝 Quiz Scores by Notebook</h3>
                        {quizResults.length === 0 ? (
                            <p style={{ fontSize:13, color:C.textSub }}>No quiz results yet</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {quizResults.map((r, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-2 rounded-xl" style={{
                                        background: "rgba(26,158,92,0.04)",
                                        border: `1px solid ${C.emeraldBorder}`,
                                    }}>
                                        <span className="truncate" style={{ color:C.textMid }}>{r.notebookId.name || "Notebook"}</span>
                                        <span style={{ fontWeight:"700", fontSize:13, color: r.percentage >= 70 ? C.emerald : C.gold }}>
                                            {r.score}/{r.total} ({r.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    {/* Focus Score */}
                    <GlassCard className="flex flex-col justify-between md:col-span-2" accent="gold">
                        <div>
                            <Target size={22} className="mb-2" style={{ color:C.gold }} />
                            <p style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", color:C.textSub }}>Focus Score</p>
                            <p style={{
                                fontSize:56, fontWeight:"bold", lineHeight:1, margin:"8px 0 0",
                                background:`linear-gradient(135deg, ${C.gold}, ${C.emerald})`,
                                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                            }}>{focusScore}</p>
                        </div>
                        <p style={{ fontSize:12, color:C.textSub, marginTop:12 }}>
                            Based on quiz + flashcards + study time
                        </p>
                    </GlassCard>

                    {/* Weekly Progress */}
                    <GlassCard className="md:col-span-2" accent="green">
                        <h3 style={{ color:C.textDark, marginBottom:10, fontSize:15, fontWeight:"600" }}>📈 Weekly Progress</h3>
                        <ResponsiveContainer width="100%" height={140}>
                            <LineChart data={weeklyScores}>
                                <XAxis dataKey="week" tick={{ fill:C.textSub, fontFamily:"Georgia, serif", fontSize:11 }} axisLine={{ stroke:C.emeraldBorder }} tickLine={false} />
                                <YAxis hide />
                                <Tooltip content={<MysticTooltip />} />
                                <Line type="monotone" dataKey="score" stroke={C.emerald} strokeWidth={2.5}
                                    dot={{ r:4, fill:C.emerald, stroke:"#fff", strokeWidth:2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Areas for Improvement */}
                    <GlassCard className="md:col-span-2" accent="gold">
                        <h3 style={{ color:C.textDark, marginBottom:14, fontSize:15, fontWeight:"600" }}>🛠 Areas for Improvement</h3>
                        <ul className="space-y-4" style={{ fontSize:13, color:C.textMid }}>
                            <li style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                                <AlertTriangle size={15} style={{ color:C.gold, marginTop:2, flexShrink:0 }} />
                                <span>Increase focus on{" "}
                                    <span style={{ color:C.gold, fontWeight:"700" }}>{weakSubject}</span>
                                </span>
                            </li>
                            <li style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                                <Clock size={15} style={{ color:C.emerald, marginTop:2, flexShrink:0 }} />
                                Try longer uninterrupted study sessions
                            </li>
                            <li style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                                <BookOpen size={15} style={{ color:C.emerald, marginTop:2, flexShrink:0 }} />
                                Revise incorrect quiz questions
                            </li>
                        </ul>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
}