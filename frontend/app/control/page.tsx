"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { AIControlPanel } from "@/components/AIControlPanel";
import { AlertPanel, AlertItem } from "@/components/AlertPanel";
import { useSocket } from "@/hooks/useSocket";
import { api } from "@/lib/api";
import { OptimizeResponse, TrafficResponse } from "@/types/traffic";

export default function ControlPage() {
    const queryClient = useQueryClient();
    const [suggestions, setSuggestions] = useState<OptimizeResponse["suggestions"]>([]);
    const [summary, setSummary] = useState("");
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    const trafficQuery = useQuery({
        queryKey: ["control-traffic"],
        queryFn: async () => (await api.get<TrafficResponse>("/traffic")).data,
        refetchInterval: 10000,
    });

    const optimizeMutation = useMutation({
        mutationFn: async () => (await api.post<OptimizeResponse>("/optimize", { force_refresh: true })).data,
        onSuccess: (data) => {
            setSuggestions(data.suggestions);
            setSummary(data.ai_summary);
            queryClient.invalidateQueries({ queryKey: ["traffic"] });
            queryClient.invalidateQueries({ queryKey: ["history"] });
        },
    });

    useEffect(() => {
        const timer = setInterval(() => {
            optimizeMutation.mutate();
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    useSocket({
        onAlerts: (payload) => {
            const incoming = payload as { alerts: AlertItem[] };
            setAlerts(incoming.alerts || []);
        },
    });

    const quickAlerts: AlertItem[] = (trafficQuery.data?.data || [])
        .filter((row) => row.congestion_level === "high")
        .map((row) => ({ area: row.area, message: `Heavy congestion expected in ${row.area}` }));

    return (
        <section className="space-y-5">
            <div>
                <h1 className="text-3xl font-bold">AI Signal Optimization</h1>
                <p className="mt-1 subtle-text">Manual and automatic optimization runs every 30 seconds.</p>
            </div>

            {optimizeMutation.isError && (
                <p className="panel text-red-700">{(optimizeMutation.error as Error).message}</p>
            )}

            <AIControlPanel
                summary={summary}
                suggestions={suggestions}
                loading={optimizeMutation.isPending}
                onOptimize={() => optimizeMutation.mutate()}
            />

            <AlertPanel alerts={[...alerts, ...quickAlerts]} />
        </section>
    );
}
