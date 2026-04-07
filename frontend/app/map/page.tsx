"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { TrafficResponse } from "@/types/traffic";

const TrafficMap = dynamic(() => import("@/components/TrafficMap"), { ssr: false });

export default function MapPage() {
    const trafficQuery = useQuery({
        queryKey: ["map-traffic"],
        queryFn: async () => (await api.get<TrafficResponse>("/traffic")).data,
        refetchInterval: 8000,
    });

    if (trafficQuery.isLoading) {
        return <p className="panel subtle-text">Loading map...</p>;
    }

    if (trafficQuery.isError) {
        return <p className="panel text-red-700">{(trafficQuery.error as Error).message}</p>;
    }

    return (
        <section className="space-y-5">
            <div>
                <h1 className="text-3xl font-bold">Traffic Heatmap</h1>
                <p className="mt-1 subtle-text">Density overlays represent live congestion intensity.</p>
            </div>
            <TrafficMap data={trafficQuery.data?.data || []} />
        </section>
    );
}
