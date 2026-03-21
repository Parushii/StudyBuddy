import React, { useState } from "react";
import axios from "axios";
import { FloatingLeaves, Fireflies, CornerVine } from "./Flashcards";

export default function TextbookQA() {
    const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const [file, setFile] = useState(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) return alert("Select a file first!");
        setLoading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(`${API}/api/textbook/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert(res.data.message || "Upload successful!");
        } catch (err) {
            console.error(err);
            setError("Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleAsk = async () => {
        if (!question.trim()) return alert("Type your question!");
        setLoading(true);
        setError("");
        setAnswer("");
        setSources([]);
        try {
            const res = await axios.post(`${API}/api/textbook/ask`, { question });
            setAnswer(res.data.answer || "");
            setSources(res.data.sources || []);
        } catch (err) {
            console.error(err);
            setError("Query failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none"
                style={{
                    backgroundImage: 'url("/textbook.jpg")', backgroundSize: "cover",        // keeps it elegant
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",  // THIS makes it not scroll
                    backgroundRepeat: "no-repeat"
                }}
            />
            {/* Grid Overlay
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" /> */}

            {/* Floating effects */}
            <FloatingLeaves />
            <Fireflies />
            <CornerVine position="tl" color="#4a7c3f" />
            <CornerVine position="tr" color="#4a7c3f" />
            <CornerVine position="bl" color="#4a7c3f" />
            <CornerVine position="br" color="#4a7c3f" />

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-8">
                <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg">
                    Textbook GPT
                </h1>
                <p className="text-center text-white/60">
                    Upload a textbook and ask questions — AI-powered answers at your fingertips
                </p>

                {/* File Upload */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="flex-1 p-3 rounded-xl border border-white/20 bg-black/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition font-semibold text-white"
                    >
                        {loading ? "Uploading..." : "Upload Textbook"}
                    </button>
                </div>

                {/* Question Input */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
                    <textarea
                        rows={3}
                        placeholder="Type your question here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="p-3 rounded-xl border border-white/20 bg-black/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={handleAsk}
                            disabled={loading || !question.trim()}
                            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition font-semibold text-white"
                        >
                            {loading ? "Thinking..." : "Ask Gemini"}
                        </button>
                        {(answer || error) && (
                            <button
                                onClick={() => {
                                    setQuestion("");
                                    setAnswer("");
                                    setError("");
                                    setSources([]);
                                }}
                                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold text-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-100 font-semibold">
                        ❌ {error}
                    </div>
                )}

                {/* Answer */}
                {answer && (
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg text-white/90">
                        <h2 className="text-xl font-semibold mb-2">Answer:</h2>
                        <p className="whitespace-pre-line leading-relaxed">{answer}</p>

                        {sources.length > 0 && (
                            <div className="mt-4 text-sm">
                                <h3 className="font-semibold mb-1">Sources:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {sources.map((s, i) => (
                                        <li key={i}>
                                            File: {s.file}, Page: {s.page}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Placeholder */}
                {!answer && !loading && !error && (
                    <div className="text-center py-16 text-white/40">
                        <p className="text-lg">Upload a textbook and ask a question to get started</p>
                        <p className="text-sm mt-2">Powered by Google Gemini</p>
                    </div>
                )}
            </div>
        </div>
    );
}