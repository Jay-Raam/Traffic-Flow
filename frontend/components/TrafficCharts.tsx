"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts";

import { HistoryPoint, TrafficDatum } from "@/types/traffic";

interface HistorySeriesPoint {
    timestamp: string;
    timestampLabel: string;
    vehicles: number;
}

function formatTimeLabel(timestamp: string) {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return timestamp;

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;
    return (
        <div className="panel px-3 py-2">
            <p className="text-[11px] subtle-text mb-1">{label}</p>
            {payload.map((entry) => (
                <p key={entry.name} className="text-sm font-semibold tabular-nums">
                    {entry.value?.toLocaleString()}
                    <span className="text-xs font-normal subtle-text ml-1">{entry.name}</span>
                </p>
            ))}
        </div>
    );
}

function HistoryTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;
    return (
        <div className="panel px-3 py-2">
            <p className="text-[11px] subtle-text mb-1">{String(label)}</p>
            <p className="text-sm font-semibold tabular-nums">
                {payload[0]?.value?.toLocaleString()}
                <span className="text-xs font-normal subtle-text ml-1">vehicles</span>
            </p>
        </div>
    );
}

export function TrafficCharts({
    latest,
    history,
    historyLoading = false,
}: {
    latest: TrafficDatum[];
    history: HistoryPoint[];
    historyLoading?: boolean;
}) {
    const [selectedCity, setSelectedCity] = useState<string>("");

    const cityOptions = useMemo(() => {
        const options = new Set<string>();
        for (const point of history) {
            options.add(point.area);
        }
        return [...options].sort((a, b) => a.localeCompare(b));
    }, [history]);

    useEffect(() => {
        if (!cityOptions.length) {
            setSelectedCity("");
            return;
        }

        if (!selectedCity || !cityOptions.includes(selectedCity)) {
            setSelectedCity(cityOptions[0]);
        }
    }, [cityOptions, selectedCity]);

    const filteredHistory = useMemo(
        () => history.filter((point) => point.area === selectedCity),
        [history, selectedCity]
    );

    const historySeries = useMemo<HistorySeriesPoint[]>(() => {
        return [...filteredHistory]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((point) => ({
                timestamp: point.timestamp,
                timestampLabel: formatTimeLabel(point.timestamp),
                vehicles: point.vehicles,
            }));
    }, [filteredHistory]);



    return (
        <section className="grid gap-4 lg:grid-cols-2">
            {/* Vehicle Count by Area */}
            <article className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-sm font-semibold">Vehicle Count by Area</h3>
                        <p className="text-[11px] subtle-text mt-0.5">Live snapshot</p>
                    </div>
                    <span className="text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-medium">
                        Live
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={latest} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="vehicleGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="area"
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="vehicles"
                            stroke="#f97316"
                            strokeWidth={2}
                            fill="url(#vehicleGrad)"
                            dot={{ fill: "#f97316", r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: "#f97316", strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </article>

            {/* Historical Trend */}
            <article className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Traffic History{selectedCity ? ` - ${selectedCity}` : ""}
                        </h3>
                        <p className="text-[11px] subtle-text mt-0.5">Last 40 records for selected city</p>
                    </div>
                    <select
                        value={selectedCity}
                        onChange={(event) => setSelectedCity(event.target.value)}
                        className="input-surface rounded-lg px-2.5 py-1.5 text-xs font-medium"
                        aria-label="Select city for history chart"
                    >
                        {cityOptions.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>
                {historyLoading ? (
                    <div className="h-[240px] flex items-center justify-center text-sm subtle-text">
                        Loading historical data...
                    </div>
                ) : !historySeries.length ? (
                    <div className="h-[240px] flex items-center justify-center text-sm subtle-text">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart
                            data={historySeries.slice(-40)}
                            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#38bdf8" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="timestampLabel"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={20}
                            />
                            <YAxis
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<HistoryTooltip />}
                                labelFormatter={(_, payload) => {
                                    const row = payload?.[0]?.payload as HistorySeriesPoint | undefined;
                                    return row?.timestamp || "";
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="vehicles"
                                stroke="url(#lineGlow)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 5, fill: "#38bdf8", strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </article>
        </section>
    );
}