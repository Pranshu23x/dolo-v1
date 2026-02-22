"use client";

import {
    useState,
    useRef,
    useCallback,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Bot,
    Check,
    ChevronDown,
    Paperclip,
    RotateCcw,
    User,
    X,
    AlertTriangle,
    Activity,
    FlaskConical,
    Leaf,
    Zap,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TextShimmer } from "@/components/ui/text-shimmer";

const BASE_URL = "https://dolo-hsil-1.onrender.com";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

export interface ChatHandle {
    analyzeReport: (file: File, message: string) => void;
}

interface StructuredReport {
    summary?: string;
    abnormal_findings?: string | string[];
    recommended_tests?: string | string[];
    lifestyle_suggestions?: string | string[];
    urgency?: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string | StructuredReport;
    fileName?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

function isStructuredReport(data: unknown): data is StructuredReport {
    if (typeof data !== "object" || data === null) return false;
    const d = data as Record<string, unknown>;
    return "summary" in d || "abnormal_findings" in d || "urgency" in d;
}

function toList(val: string | string[] | undefined): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return val
        .split(/[\n;]/)
        .map((s) => s.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean);
}

function extractContent(data: unknown): string | StructuredReport {
    if (typeof data === "string") return data;
    if (data === null || data === undefined) return "";
    if (typeof data === "object") {
        const d = data as Record<string, unknown>;
        // plain text fields
        const top = d.response ?? d.message ?? d.reply ?? d.text ?? d.content;
        if (typeof top === "string") return top;
        // structured report
        if (isStructuredReport(d)) return d as StructuredReport;
        // nested under a key
        for (const v of Object.values(d)) {
            if (isStructuredReport(v)) return v as StructuredReport;
        }
        return JSON.stringify(d, null, 2);
    }
    return String(data);
}

function Logo({ className }: { className?: string }) {
    return <img src="/logo.png" alt="logo" className={className} />;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const el = textareaRef.current;
            if (!el) return;
            if (reset) { el.style.height = `${minHeight}px`; return; }
            el.style.height = `${minHeight}px`;
            el.style.height = `${Math.min(el.scrollHeight, maxHeight ?? 9999)}px`;
        },
        [minHeight, maxHeight]
    );
    useEffect(() => {
        if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
    }, [minHeight]);
    return { textareaRef, adjustHeight };
}

/* ------------------------------------------------------------------ */
/* Structured report card                                                */
/* ------------------------------------------------------------------ */

const URGENCY_COLOR: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-red-100 text-red-700 border-red-200",
};

function ReportCard({ report }: { report: StructuredReport }) {
    const urgency = (report.urgency ?? "low").toLowerCase();
    const urgencyClass = URGENCY_COLOR[urgency] ?? URGENCY_COLOR.low;
    const abnormal = toList(report.abnormal_findings);
    const tests = toList(report.recommended_tests);
    const lifestyle = toList(report.lifestyle_suggestions);

    return (
        <div className="space-y-3 text-sm">
            {/* Urgency badge */}
            <span
                className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
                    urgencyClass
                )}
            >
                <Zap className="w-3 h-3" />
                Urgency: {report.urgency ?? "low"}
            </span>

            {/* Summary */}
            {report.summary && (
                <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Summary
                    </p>
                    <p className="text-neutral-700 leading-relaxed">{report.summary}</p>
                </div>
            )}

            {/* Abnormal findings */}
            {abnormal.length > 0 && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Abnormal Findings
                    </p>
                    <ul className="space-y-1">
                        {abnormal.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-red-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommended tests */}
            {tests.length > 0 && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5" /> Recommended Tests
                    </p>
                    <ul className="space-y-1">
                        {tests.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-blue-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Lifestyle suggestions */}
            {lifestyle.length > 0 && (
                <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5" /> Lifestyle Suggestions
                    </p>
                    <ul className="space-y-1">
                        {lifestyle.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-green-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Message bubble                                                        */
/* ------------------------------------------------------------------ */

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === "user";
    const isStructured = typeof msg.content === "object";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
        >
            {!isUser && <Logo className="w-7 h-7 flex-shrink-0 mt-0.5 rounded-full" />}

            <div
                className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    isUser
                        ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white rounded-tr-sm max-w-[78%]"
                        : isStructured
                        ? "bg-white rounded-tl-sm shadow-sm w-full max-w-[90%]"
                        : "bg-white text-neutral-700 rounded-tl-sm shadow-sm max-w-[78%]"
                )}
            >
                {msg.fileName && (
                    <p className="text-xs opacity-70 mb-1 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {msg.fileName}
                    </p>
                )}
                {isStructured ? (
                    <ReportCard report={msg.content as StructuredReport} />
                ) : (
                    <span className="whitespace-pre-wrap">{msg.content as string}</span>
                )}
            </div>

            {isUser && (
                <div className="w-7 h-7 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                </div>
            )}
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Main component                                                        */
/* ------------------------------------------------------------------ */

const AI_MODELS = ["GPT-4-1 Mini", "GPT-4-1", "o3-mini", "Gemini 2.5 Flash", "Claude 3.5 Sonnet"];

export const ExpandableAIChat = forwardRef<ChatHandle>(function ExpandableAIChat(_, ref) {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 52, maxHeight: 200 });

    async function createConversation() {
        const res = await fetch(`${BASE_URL}/conversation/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Health Chat" }),
        });
        const data = await res.json();
        const id = data.conversation_id ?? data.id ?? data._id ?? Object.values(data)[0];
        return String(id);
    }

    useEffect(() => {
        createConversation()
            .then(setConversationId)
            .catch((e) => console.error("Failed to create conversation", e));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const clearChat = useCallback(async () => {
        setMessages([]);
        setConversationId(null);
        setPendingFile(null);
        try {
            const id = await createConversation();
            setConversationId(id);
        } catch (e) {
            console.error("Failed to create conversation", e);
        }
    }, []);

    const runAnalysis = useCallback(
        async (file: File, prompt: string) => {
            if (!conversationId) return;

            const userMsg: Message = {
                id: Date.now().toString(),
                role: "user",
                content: prompt || "Analyze this report",
                fileName: file.name,
            };
            setMessages((prev) => [...prev, userMsg]);
            setIsTyping(true);

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("message", prompt || "Please analyze this medical report.");
                const res = await fetch(`${BASE_URL}/analyze-report/${conversationId}`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                const content = extractContent(data);
                setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 1).toString(), role: "assistant", content },
                ]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, couldn't reach the server." },
                ]);
            } finally {
                setIsTyping(false);
            }
        },
        [conversationId]
    );

    // Expose analyzeReport to parent
    useImperativeHandle(ref, () => ({
        analyzeReport: (file: File, message: string) => runAnalysis(file, message),
    }));

    const sendMessage = useCallback(async () => {
        const text = value.trim();
        if (!text && !pendingFile) return;
        if (!conversationId) return;

        if (pendingFile) {
            const file = pendingFile;
            setPendingFile(null);
            setValue("");
            adjustHeight(true);
            await runAnalysis(file, text);
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
        };
        setMessages((prev) => [...prev, userMsg]);
        setValue("");
        adjustHeight(true);
        setIsTyping(true);

        try {
            const res = await fetch(`${BASE_URL}/chat/${conversationId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            const content = extractContent(data);
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, couldn't reach the server." },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [value, pendingFile, conversationId, adjustHeight, runAnalysis]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPendingFile(file);
        e.target.value = "";
    };

    const canSend = (value.trim() || pendingFile) && !!conversationId;

    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(180,190,220,0.35)" }}
            >
                <div className="flex items-center gap-3">
                    <Logo className="w-9 h-9" />
                    <div>
                        <p className="text-sm font-semibold text-neutral-800">Health AI</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                            <span
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full inline-block",
                                    conversationId ? "bg-emerald-400" : "bg-amber-400"
                                )}
                            />
                            {conversationId ? "Online" : "Connecting…"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-black/5 transition-colors"
                    title="New chat"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center gap-4 text-center px-6"
                    >
                        <Logo className="w-14 h-14" />
                        <div>
                            <p className="text-sm font-medium text-neutral-700">Your Health AI Assistant</p>
                            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                                Upload a medical report on the left, or ask a health question below.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-1">
                            {["How's my heart health?", "Analyze my blood test", "Check stress levels", "Explain my results"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setValue(s)}
                                    className="text-xs px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/5 text-neutral-600 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2.5"
                    >
                        <Logo className="w-7 h-7 flex-shrink-0 mt-0.5 rounded-full" />
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <TextShimmer duration={1.2} className="text-sm font-medium">
                                Analyzing your health data...
                            </TextShimmer>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
                className="px-4 pb-4 pt-2 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(180,190,220,0.35)" }}
            >
                <AnimatePresence>
                    {pendingFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-700"
                        >
                            <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate flex-1">{pendingFile.name}</span>
                            <button onClick={() => setPendingFile(null)} className="hover:text-violet-900">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white rounded-2xl p-1" style={{ boxShadow: "0 1px 8px 0 rgba(160,170,210,0.10)" }}>
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        placeholder="Ask about your health…"
                        className="w-full rounded-xl rounded-b-none px-3 py-2.5 bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-black/40 min-h-[52px]"
                        onKeyDown={handleKeyDown}
                        onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                    />
                    <div className="flex items-center justify-between px-2 pb-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-1 h-7 pl-1 pr-2 text-xs rounded-md hover:bg-black/10 focus-visible:ring-0"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedModel}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.12 }}
                                            className="flex items-center gap-1 text-neutral-500"
                                        >
                                            {selectedModel}
                                            <ChevronDown className="w-3 h-3 opacity-50" />
                                        </motion.div>
                                    </AnimatePresence>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[10rem] border-black/10">
                                {AI_MODELS.map((model) => (
                                    <DropdownMenuItem
                                        key={model}
                                        onSelect={() => setSelectedModel(model)}
                                        className="flex items-center justify-between gap-2 text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Bot className="w-3.5 h-3.5 opacity-50" />
                                            <span>{model}</span>
                                        </div>
                                        {selectedModel === model && <Check className="w-3.5 h-3.5 text-blue-500" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex items-center gap-1.5">
                            <label className="rounded-lg p-1.5 cursor-pointer text-black/30 hover:text-black/60 hover:bg-black/5 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Paperclip className="w-3.5 h-3.5" />
                            </label>
                            <button
                                type="button"
                                disabled={!canSend}
                                onClick={sendMessage}
                                className={cn(
                                    "rounded-xl p-1.5 transition-all duration-200",
                                    canSend
                                        ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-105"
                                        : "bg-black/5 text-black/20"
                                )}
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
