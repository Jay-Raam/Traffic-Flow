import { TrafficDatum } from "@/types/traffic";

interface CardDef {
    label: string;
    value: string;
    delta?: string;
    deltaPositive?: boolean;
    icon: React.ReactNode;
    accent: string;
}

function TrendArrow({ up }: { up: boolean }) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={up ? "text-emerald-400" : "text-red-400"}
        >
            <path
                d={up ? "M6 2L10 7H2L6 2Z" : "M6 10L10 5H2L6 10Z"}
                fill="currentColor"
            />
        </svg>
    );
}

export function StatCards({ data }: { data: TrafficDatum[] }) {
    const totalVehicles = data.reduce((sum, row) => sum + row.vehicles, 0);
    const highRisk = data.filter((row) => row.congestion_level === "high").length;
    const avgSpeed =
        data.length > 0
            ? Math.round(data.reduce((sum, row) => sum + row.avg_speed_kmph, 0) / data.length)
            : 0;
    const freeFlow = data.filter((row) => row.congestion_level === "low").length;

    const cards: CardDef[] = [
        {
            label: "Total Vehicles",
            value: totalVehicles.toLocaleString(),
            delta: "+4.2%",
            deltaPositive: true,
            accent: "border-orange-500/30",
            icon: (
                <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-orange-400">
                    <rect x="2" y="11" width="16" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 11V8.5C5 7.4 5.9 6.5 7 6.5H13C14.1 6.5 15 7.4 15 8.5V11" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="6" cy="16" r="1.5" fill="currentColor" />
                    <circle cx="14" cy="16" r="1.5" fill="currentColor" />
                </svg>
            ),
        },
        {
            label: "High Congestion",
            value: String(highRisk),
            delta: "-2 zones",
            deltaPositive: false,
            accent: "border-red-500/30",
            icon: (
                <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-red-400">
                    <path d="M10 3L18 17H2L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="10" y1="9" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="15" r="0.75" fill="currentColor" />
                </svg>
            ),
        },
        {
            label: "Average Speed",
            value: `${avgSpeed} km/h`,
            delta: "+3 km/h",
            deltaPositive: true,
            accent: "border-emerald-500/30",
            icon: (
                <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-emerald-400">
                    <circle cx="10" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 11L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="11" r="1.25" fill="currentColor" />
                    <path d="M5 4L7 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M15 4L13 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            label: "Free-Flow Zones",
            value: String(freeFlow),
            delta: "+1 zone",
            deltaPositive: true,
            accent: "border-sky-500/30",
            icon: (
                <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-sky-400">
                    <path d="M3 10H17M3 6H14M3 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
        },
    ];

    return (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((card, idx) => (
                <article
                    key={card.label}
                    className={`
                        panel relative overflow-hidden border ${card.accent}
                        p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5
                        animate-rise
                    `}
                    style={{ animationDelay: `${idx * 80}ms` }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-xl input-surface">{card.icon}</div>
                        {card.delta && (
                            <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full
                                ${card.deltaPositive
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                            >
                                <TrendArrow up={!!card.deltaPositive} />
                                {card.delta}
                            </div>
                        )}
                    </div>
                    <p className="text-xs subtle-text mb-1 truncate">{card.label}</p>
                    <p className="text-xl sm:text-2xl font-bold tabular-nums">{card.value}</p>
                </article>
            ))}
        </section>
    );
}