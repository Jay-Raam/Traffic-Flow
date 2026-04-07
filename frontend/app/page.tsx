"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AlertPanel, AlertItem } from "@/components/AlertPanel";
import { StatCards } from "@/components/StatCards";
import { TrafficCharts } from "@/components/TrafficCharts";
import { useSocket } from "@/hooks/useSocket";
import { api } from "@/lib/api";
import { HistoryResponse, TrafficDatum, TrafficResponse } from "@/types/traffic";

export default function DashboardPage() {
    const [liveTraffic, setLiveTraffic] = useState<TrafficDatum[] | null>(null);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    const trafficQuery = useQuery({
        queryKey: ["traffic"],
        queryFn: async () => (await api.get<TrafficResponse>("/traffic")).data,
        refetchInterval: 10000,
    });

    const historyQuery = useQuery({
        queryKey: ["history"],
        queryFn: async () => (await api.get<HistoryResponse>("/history")).data,
        refetchInterval: 20000,
    });

    useSocket({
        onTrafficUpdate: (payload) => {
            const update = payload as TrafficResponse;
            setLiveTraffic(update.data);
        },
        onAlerts: (payload) => {
            const incoming = payload as { alerts: AlertItem[] };
            setAlerts(incoming.alerts || []);
        },
    });

    const trafficData = useMemo(
        () => liveTraffic || trafficQuery.data?.data || [],
        [liveTraffic, trafficQuery.data?.data]
    );

    if (trafficQuery.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm subtle-text tracking-widest uppercase">Initializing feed...</p>
                </div>
            </div>
        );
    }

    if (trafficQuery.isError) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="border border-red-800/50 bg-red-950/30 rounded-2xl px-8 py-6 text-red-400 text-sm">
                    {(trafficQuery.error as Error).message}
                </div>
            </div>
        );
    }

    return (
        <section className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-orange-500 font-semibold mb-1">
                        Live Intelligence
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Traffic Command
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-xs subtle-text">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Live · updates every 10s
                </div>
            </div>

            <StatCards data={trafficData} />
            <TrafficCharts
                latest={trafficData}
                history={historyQuery.data?.points || []}
                historyLoading={historyQuery.isLoading}
            />
            <AlertPanel alerts={alerts} />
        </section>
    );
}