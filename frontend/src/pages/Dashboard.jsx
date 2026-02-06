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

/* ---------- Glass Card ---------- */
const GlassCard = ({ children, className = "" }) => (
    <div
        className={`relative rounded-2xl border border-white/10 
    bg-black/60 backdrop-blur-xl overflow-hidden ${className}`}
    >
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition 
      bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-indigo-500/10" />
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

const quizPie = [
    { name: "Correct", value: 72 },
    { name: "Incorrect", value: 18 },
    { name: "Skipped", value: 10 },
];

const PIE_COLORS = ["#22c55e", "#ef4444", "#facc15"];

/* ---------- DASHBOARD ---------- */

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-black text-white relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)]
        bg-[size:40px_40px] pointer-events-none" />

            <div className="relative z-10 p-8 space-y-8">

                {/* ================= HERO ================= */}
                <GlassCard>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                        {/* LEFT */}
                        <div className="md:col-span-2">
                            <h1 className="text-3xl font-semibold">
                                Welcome back, <span className="text-cyan-400">Name 👋</span>
                            </h1>
                            <p className="text-sm text-white/60 mt-1">
                                Consistency beats intensity.
                            </p>
                        </div>

                        {/* RIGHT */}
                        <div className="flex flex-col gap-4 md:items-end">

                            {/* Motivation */}
                            <div className="max-w-xs px-4 py-3 rounded-xl 
        bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-sm">
                                <p className="text-xs uppercase tracking-wide text-cyan-400/70 mb-1">
                                    Today’s Motivation
                                </p>
                                Just 1 focused session can change your day
                            </div>

                            {/* Stats */}
                            <div className="flex gap-5">
                                <div className="flex items-center gap-2">
                                    <Flame className="text-orange-500" size={18} />
                                    <span>6 Day Streak</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="text-yellow-400" size={18} />
                                    <span>124 Stars</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </GlassCard>



                {/* ================= MINI STATS ================= */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <GlassCard><Clock className="text-cyan-400 mb-1" /><p className="text-xs text-white/60">Study Time</p><p className="font-semibold">6h 20m</p></GlassCard>
                    <GlassCard><BookOpen className="text-purple-400 mb-1" /><p className="text-xs text-white/60">Most Studied</p><p className="font-semibold">DSA</p></GlassCard>
                    <GlassCard><AlertTriangle className="text-yellow-400 mb-1" /><p className="text-xs text-white/60">Least Studied</p><p className="font-semibold">CN</p></GlassCard>
                    <GlassCard><Zap className="text-green-400 mb-1" /><p className="text-xs text-white/60">Reading Speed</p><p className="font-semibold">1.6 pages/min</p></GlassCard>
                    <GlassCard><Star className="text-pink-400 mb-1" /><p className="text-xs text-white/60">Stars Today</p><p className="font-semibold">+14</p></GlassCard>
                    <GlassCard><Calendar className="text-indigo-400 mb-1" /><p className="text-xs text-white/60">Next Exam</p><p className="font-semibold">OS · 9d</p></GlassCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Time Chart */}
                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-3">⏱ Time per Subject (hrs)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={timeData}>
                                <XAxis dataKey="subject" />
                                <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                                <Tooltip formatter={(v) => `${v} hrs`} />
                                <Bar dataKey="hours" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Quiz Pie */}
                    <GlassCard>
                        <h3 className="mb-3">🧠 Quiz Accuracy</h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={quizPie}
                                    innerRadius={50}
                                    outerRadius={75}
                                    dataKey="value"
                                >
                                    {quizPie.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i]} />
                                    ))}
                                </Pie>

                                <Tooltip formatter={(v) => `${v}%`} />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>

                    </GlassCard>

                    {/* Focus Score (NEW SUGGESTION) */}
                    <GlassCard className="flex flex-col justify-between">
                        <div>
                            <Target className="text-cyan-400 mb-2" />
                            <p className="text-xs text-white/60">Focus Score</p>
                            <p className="text-3xl font-bold text-cyan-400">82</p>
                        </div>
                        <p className="text-xs text-white/50 mt-2">
                            Based on study time & breaks
                        </p>
                    </GlassCard>

                    {/* Small Weekly Trend */}
                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-2">📈 Weekly Progress</h3>
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

                    <GlassCard className="md:col-span-2">
                        <h3 className="mb-3">🛠 Areas for Improvement</h3>

                        <ul className="space-y-3 text-sm text-white/70">
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="text-yellow-400 mt-0.5" size={16} />
                                Increase focus on <span className="text-yellow-400">Computer Networks</span>
                            </li>

                            <li className="flex items-start gap-2">
                                <Clock className="text-cyan-400 mt-0.5" size={16} />
                                Try longer uninterrupted study sessions (Pomodoro × 2)
                            </li>

                            <li className="flex items-start gap-2">
                                <BookOpen className="text-purple-400 mt-0.5" size={16} />
                                Revise incorrect quiz questions from yesterday
                            </li>
                        </ul>

                        <div className="mt-4 text-xs text-white/40">
                            Suggestions are based on your recent activity
                        </div>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
}
