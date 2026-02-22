import React from "react";
import {
    Flame,
    Star,
    Clock,
    BookOpen,
    Calendar,
    AlertTriangle,
    Zap,
    Target,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useState, useEffect } from "react";

/* ---------- Glass Card ---------- */
const GlassCard = ({ children, className = "" }) => (
    <div
        className={`relative rounded-2xl border border-black/10
    bg-white shadow-sm overflow-hidden ${className}`}
    >
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition
      bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-indigo-500/5" />
        <div className="relative z-10 p-5">{children}</div>
    </div>
);

/* ---------- DATA ---------- */

const timeData = [
    { subject: "DSA", hours: 4 },
    { subject: "OS", hours: 2 },
    { subject: "CN", hours: 0.75 },
];

const weeklyScores = [
    { week: "W1", score: 45 },
    { week: "W2", score: 58 },
    { week: "W3", score: 68 },
    { week: "W4", score: 82 },
];

const PIE_COLORS = ["#22c55e", "#ef4444", "#facc15"];

/* ---------- DASHBOARD ---------- */

export default function Dashboard() {
    const [quizResults, setQuizResults] = useState([]);

    const totalCorrect = quizResults.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = quizResults.reduce((sum, r) => sum + r.total, 0);
    const totalIncorrect = totalQuestions - totalCorrect;

    const quizPie = totalQuestions > 0 ? [
        { name: "Correct", value: Math.round((totalCorrect / totalQuestions) * 100) },
        { name: "Incorrect", value: Math.round((totalIncorrect / totalQuestions) * 100) },
    ] : [
        { name: "No data", value: 100 }
    ];

    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const username= localStorage.getItem("userName") || "Student";
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    
    useEffect(() => {
        const fetchResults = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) return;
            const res = await fetch(`${API}/api/quiz/results/${userId}`);
            const data = await res.json();
            setQuizResults(data);
        };
        fetchResults();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-black relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)]
        bg-[size:40px_40px] pointer-events-none" />

            <div className="relative z-10 p-8 space-y-8">

                {/* ================= HERO ================= */}
                <GlassCard>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                        {/* LEFT */}
                        <div className="md:col-span-2">
                            <h1 className="text-3xl font-semibold text-black">
                                Welcome back, <span className="text-cyan-500">{displayName} 👋</span>
                            </h1>
                            <p className="text-sm text-black/50 mt-1">
                                Consistency beats intensity.
                            </p>
                        </div>

                        {/* RIGHT */}
                        <div className="flex flex-col gap-4 md:items-end">

                            {/* Motivation */}
                            <div className="max-w-xs px-4 py-3 rounded-xl
                                bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm">
                                <p className="text-xs uppercase tracking-wide text-cyan-500 mb-1">
                                    Today's Motivation
                                </p>
                                Just 1 focused session can change your day
                            </div>

                            {/* Stats */}
                            <div className="flex gap-5 text-black">
                                <div className="flex items-center gap-2">
                                    <Flame className="text-orange-500" size={18} />
                                    <span>6 Day Streak</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="text-yellow-500" size={18} />
                                    <span>124 Stars</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </GlassCard>

                {/* ================= MINI STATS ================= */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <GlassCard><Clock className="text-cyan-500 mb-1" /><p className="text-xs text-black/50">Study Time</p><p className="font-semibold text-black">6h 20m</p></GlassCard>
                    <GlassCard><BookOpen className="text-purple-500 mb-1" /><p className="text-xs text-black/50">Most Studied</p><p className="font-semibold text-black">DSA</p></GlassCard>
                    <GlassCard><AlertTriangle className="text-yellow-500 mb-1" /><p className="text-xs text-black/50">Least Studied</p><p className="font-semibold text-black">CN</p></GlassCard>
                    <GlassCard><Zap className="text-green-500 mb-1" /><p className="text-xs text-black/50">Reading Speed</p><p className="font-semibold text-black">1.6 pages/min</p></GlassCard>
                    <GlassCard><Star className="text-pink-500 mb-1" /><p className="text-xs text-black/50">Stars Today</p><p className="font-semibold text-black">+14</p></GlassCard>
                    <GlassCard><Calendar className="text-indigo-500 mb-1" /><p className="text-xs text-black/50">Next Exam</p><p className="font-semibold text-black">OS · 9d</p></GlassCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Time Chart */}
                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-3 text-black font-medium">⏱ Time per Subject (hrs)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={timeData}>
                                <XAxis dataKey="subject" stroke="#00000060" />
                                <YAxis stroke="#00000060" label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#00000060" }} />
                                <Tooltip formatter={(v) => `${v} hrs`} />
                                <Bar dataKey="hours" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Quiz Pie */}
                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-3 text-black font-medium">🧠 Quiz Accuracy</h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={quizPie} innerRadius={50} outerRadius={75} dataKey="value">
                                    {quizPie.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => `${v}%`} />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Quiz Scores by Notebook */}
                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-3 text-black font-medium">📝 Quiz Scores by Notebook</h3>
                        {quizResults.length === 0 ? (
                            <p className="text-sm text-black/40">No quiz results yet</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {quizResults.map((r, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-2 rounded-xl bg-black/5">
                                        <span className="truncate text-black/70">{r.notebookId?.name || "Notebook"}</span>
                                        <span className={`font-semibold ${r.percentage >= 70 ? "text-green-600" : "text-red-500"}`}>
                                            {r.score}/{r.total} ({r.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    {/*  Focus Score */}
                    <GlassCard className="flex flex-col justify-between md:col-span-2">
                        <div>
                            <Target className="text-cyan-400 mb-2" />
                            <p className="text-xs text-black/60">Focus Score</p>
                            <p className="text-3xl font-bold text-cyan-400">82</p>
                        </div>
                        <p className="text-xs text-black/50 mt-2">
                            Based on study time & breaks
                        </p>
                    </GlassCard>

                    {/* Weekly Trend */}
                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-2 text-black font-medium">📈 Weekly Progress</h3>
                        <ResponsiveContainer width="100%" height={140}>
                            <LineChart
                                data={weeklyScores}
                                margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                            >
                                <XAxis
                                    dataKey="week"
                                    tickMargin={8}
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="#00000060"
                                />
                                <YAxis hide />
                                <Tooltip formatter={(v) => `Score: ${v}`} />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Areas for Improvement */}
                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-3 text-black font-medium">🛠 Areas for Improvement</h3>

                        <ul className="space-y-3 text-sm text-black/60">
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="text-yellow-500 mt-0.5" size={16} />
                                Increase focus on <span className="text-yellow-600 font-medium">Computer Networks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="text-cyan-500 mt-0.5" size={16} />
                                Try longer uninterrupted study sessions (Pomodoro × 2)
                            </li>
                            <li className="flex items-start gap-2">
                                <BookOpen className="text-purple-500 mt-0.5" size={16} />
                                Revise incorrect quiz questions from yesterday
                            </li>
                        </ul>

                        <div className="mt-4 text-xs text-black/30">
                            Suggestions are based on your recent activity
                        </div>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
}