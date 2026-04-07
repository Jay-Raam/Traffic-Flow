"use client";

import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { RouteResult } from "@/types/traffic";

const RoutePlannerMap = dynamic(
    () => import("@/components/RoutePlannerMap").then((mod) => mod.RoutePlannerMap),
    { ssr: false }
);

export default function RoutePlannerPage() {
    const [source, setSource] = useState("Anna Salai, Chennai");
    const [destination, setDestination] = useState("Tambaram, Chennai");

    const routeMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post<RouteResult>("/route", { source, destination });
            return response.data;
        },
    });

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        routeMutation.mutate();
    };

    const route = routeMutation.data;

    return (
        <section className="space-y-5">
            <div>
                <h1 className="text-3xl font-bold">Route Planner</h1>
                <p className="mt-1 subtle-text">Enter any from/to locations and get best route, ETA, traffic level, and live alerts.</p>
            </div>

            <form onSubmit={onSubmit} className="panel grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">From</span>
                    <input
                        value={source}
                        onChange={(event) => setSource(event.target.value)}
                        className="input-surface rounded-lg px-3 py-2 outline-none ring-amber-200 focus:ring"
                        placeholder="Enter source"
                        required
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">To</span>
                    <input
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        className="input-surface rounded-lg px-3 py-2 outline-none ring-amber-200 focus:ring"
                        placeholder="Enter destination"
                        required
                    />
                </label>

                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={routeMutation.isPending}
                        className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {routeMutation.isPending ? "Finding Route..." : "Find Best Route"}
                    </button>
                </div>
            </form>

            {routeMutation.isError && (
                <p className="panel text-red-700">{(routeMutation.error as Error).message}</p>
            )}

            {route && (
                <>
                    <section className="grid gap-4 md:grid-cols-4">
                        <article className="panel">
                            <p className="text-sm subtle-text">Traffic Level</p>
                            <p className="mt-1 text-2xl font-bold capitalize">{route.traffic_level}</p>
                        </article>
                        <article className="panel">
                            <p className="text-sm subtle-text">Estimated Time</p>
                            <p className="mt-1 text-2xl font-bold">{route.estimated_time_minutes} min</p>
                        </article>
                        <article className="panel">
                            <p className="text-sm subtle-text">Distance</p>
                            <p className="mt-1 text-2xl font-bold">{route.distance_km} km</p>
                        </article>
                        <article className="panel">
                            <p className="text-sm subtle-text">Best Route</p>
                            <p className="mt-1 text-sm font-semibold">{route.best_route.summary}</p>
                        </article>
                    </section>

                    <RoutePlannerMap route={route} />

                    <article className="panel">
                        <h3 className="text-lg font-semibold">Alerts</h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            {route.alerts.map((alert) => (
                                <li key={alert} className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                                    {alert}
                                </li>
                            ))}
                        </ul>
                    </article>
                </>
            )}
        </section>
    );
}
