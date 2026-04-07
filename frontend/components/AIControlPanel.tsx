"use client";

import { AreaSuggestion } from "@/types/traffic";

export function AIControlPanel({
    summary,
    suggestions,
    onOptimize,
    loading,
}: {
    summary: string;
    suggestions: AreaSuggestion[];
    onOptimize: () => void;
    loading: boolean;
}) {
    return (
        <section className="space-y-4">
            <article className="panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold">AI Control Panel</h2>
                        <p className="mt-1 text-sm subtle-text">Run structured MCP tool-driven optimization.</p>
                    </div>
                    <button
                        onClick={onOptimize}
                        disabled={loading}
                        className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Optimizing..." : "Optimize Traffic"}
                    </button>
                </div>
            </article>

            <article className="panel">
                <h3 className="text-lg font-semibold">AI Summary</h3>
                <p className="mt-2 text-sm subtle-text">{summary || "Run optimization to generate AI recommendations."}</p>
            </article>

            <section className="grid gap-4 md:grid-cols-2">
                {suggestions.map((item) => (
                    <article key={item.area} className="panel">
                        <h4 className="text-lg font-semibold">{item.area}</h4>
                        <p className="mt-1 text-sm subtle-text">Prediction: {item.prediction}</p>
                        <p className="text-sm subtle-text">Current congestion: {item.congestion_level}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2">Green: {item.signal_timing.green}s</div>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">Yellow: {item.signal_timing.yellow}s</div>
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2">Red: {item.signal_timing.red}s</div>
                        </div>
                    </article>
                ))}
            </section>
        </section>
    );
}
