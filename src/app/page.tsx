"use client";

import { useRef, useState, useCallback } from "react";
import { ExpandableAIChat, type ChatHandle } from "@/components/ui/expandable-ai-chat";
import { HealthAnalytics } from "@/components/ui/health-analytics";
import { Upload, FileImage, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
    const chatRef = useRef<ChatHandle>(null);
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        setFile(f);
        const url = URL.createObjectURL(f);
        setPreview(url);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith("image/")) handleFile(f);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
        e.target.value = "";
    };

    const clearFile = () => {
        setFile(null);
        if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    };

    const handleAnalyze = () => {
        if (!file) return;
        chatRef.current?.analyzeReport(file, prompt || "Please analyze this medical report.");
        clearFile();
        setPrompt("");
    };

    return (
        <div
            className="h-screen w-screen flex overflow-hidden"
            style={{
                background: "#f4f6fb",
                backgroundImage: `
                    repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 79px,
                        rgba(180,190,220,0.18) 79px,
                        rgba(180,190,220,0.18) 80px
                    )
                `,
            }}
        >
            {/* Left panel */}
            <div className="flex-1 flex flex-col gap-6 p-8 overflow-y-auto">
                {/* Graph */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.55)",
                        backdropFilter: "blur(18px)",
                        WebkitBackdropFilter: "blur(18px)",
                        border: "1px solid rgba(200,210,230,0.5)",
                        boxShadow: "0 4px 24px 0 rgba(160,170,210,0.10)",
                    }}
                >
                    <HealthAnalytics />
                </div>

                {/* Upload report */}
                <div
                    className="rounded-2xl p-6"
                    style={{
                        background: "rgba(255,255,255,0.55)",
                        backdropFilter: "blur(18px)",
                        WebkitBackdropFilter: "blur(18px)",
                        border: "1px solid rgba(200,210,230,0.5)",
                        boxShadow: "0 4px 24px 0 rgba(160,170,210,0.10)",
                    }}
                >
                    <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-violet-500" />
                        Upload Medical Report
                    </h2>

                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="dropzone"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                                    dragOver
                                        ? "border-violet-400 bg-violet-50"
                                        : "border-neutral-200 hover:border-violet-300 hover:bg-violet-50/40"
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-violet-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-neutral-700">
                                        Drop your report here
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        PNG, JPG, WEBP — blood test, scan, lab report
                                    </p>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-600 font-medium">
                                    Browse files
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={handleInputChange}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {/* Preview */}
                                <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
                                    <img
                                        src={preview!}
                                        alt="Report preview"
                                        className="w-full max-h-52 object-contain"
                                    />
                                    <button
                                        onClick={clearFile}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-neutral-500 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* File name */}
                                <p className="text-xs text-neutral-500 truncate px-1 flex items-center gap-1.5">
                                    <FileImage className="w-3.5 h-3.5 flex-shrink-0" />
                                    {file.name}
                                </p>

                                {/* Optional prompt */}
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Add a note (optional) — e.g. focus on cholesterol"
                                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                />

                                {/* Analyze button */}
                                <button
                                    onClick={handleAnalyze}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Analyze Report
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right panel — chat, fixed height */}
            <div
                className="w-[420px] flex-shrink-0 m-4 rounded-2xl overflow-hidden flex flex-col"
                style={{
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    border: "1px solid rgba(200,210,230,0.5)",
                    boxShadow: "0 4px 32px 0 rgba(160,170,210,0.13)",
                    height: "calc(100vh - 2rem)",
                }}
            >
                <ExpandableAIChat ref={chatRef} />
            </div>
        </div>
    );
}
