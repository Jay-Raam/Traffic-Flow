export interface AlertItem {
    area: string;
    message: string;
    severity?: "critical" | "warning" | "info";
}

function AlertIcon({ severity }: { severity: AlertItem["severity"] }) {
    if (severity === "warning") {
        return (
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0 text-amber-400">
                <path d="M8 2L15 14H1L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <line x1="8" y1="7" x2="8" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="8" cy="12" r="0.6" fill="currentColor" />
            </svg>
        );
    }
    if (severity === "info") {
        return (
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0 text-sky-400">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <line x1="8" y1="7" x2="8" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="8" cy="5" r="0.6" fill="currentColor" />
            </svg>
        );
    }
    // critical (default)
    return (
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0 text-red-400">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="8" y1="5" x2="8" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.6" fill="currentColor" />
        </svg>
    );
}

const severityStyles = {
    critical: {
        row: "border-red-500/20 bg-red-500/8 hover:bg-red-500/12",
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Critical",
    },
    warning: {
        row: "border-amber-500/20 bg-amber-500/8 hover:bg-amber-500/12",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Warning",
    },
    info: {
        row: "border-sky-500/20 bg-sky-500/8 hover:bg-sky-500/12",
        badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        label: "Info",
    },
};

export function AlertPanel({ alerts }: { alerts: AlertItem[] }) {
    const criticalCount = alerts.filter((a) => !a.severity || a.severity === "critical").length;

    return (
        <article className="panel">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold">Congestion Alerts</h3>
                    {alerts.length > 0 && (
                        <span className="text-[11px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium tabular-nums">
                            {alerts.length} active
                        </span>
                    )}
                </div>
                {criticalCount > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-400">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                        </span>
                        {criticalCount} critical
                    </div>
                )}
            </div>

            {alerts.length === 0 ? (
                <div className="flex items-center gap-3 py-4 px-4 rounded-xl border border-[color:var(--panel-border)] input-surface">
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-emerald-400 shrink-0">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm subtle-text">All clear — no critical alerts right now.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {alerts.map((alert) => {
                        const sev = alert.severity ?? "critical";
                        const styles = severityStyles[sev];
                        return (
                            <li
                                key={`${alert.area}-${alert.message}`}
                                className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${styles.row}`}
                            >
                                <AlertIcon severity={sev} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <span className="text-xs font-semibold truncate">
                                            {alert.area}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${styles.badge}`}>
                                            {styles.label}
                                        </span>
                                    </div>
                                    <p className="text-xs subtle-text leading-relaxed">{alert.message}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </article>
    );
}