"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const heartRateData = [
    { day: "Mon", bpm: 68 },
    { day: "Tue", bpm: 72 },
    { day: "Wed", bpm: 65 },
    { day: "Thu", bpm: 70 },
    { day: "Fri", bpm: 63 },
    { day: "Sat", bpm: 60 },
    { day: "Sun", bpm: 62 },
];

export function HealthAnalytics() {
    return (
        <div className="rounded-2xl bg-white dark:bg-neutral-800/60 shadow-sm p-6 w-full">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Heart Rate — 7 days</p>
                <span className="text-xs text-neutral-400">bpm</span>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartRateData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                            domain={[55, 80]}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "rgba(0,0,0,0.8)",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "6px 10px",
                            }}
                            formatter={(v: number) => [`${v} bpm`, "Heart Rate"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="bpm"
                            stroke="#f43f5e"
                            strokeWidth={2.5}
                            dot={{ fill: "#f43f5e", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
