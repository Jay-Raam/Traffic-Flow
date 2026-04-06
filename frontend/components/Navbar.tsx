"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ThemeProvider";

const links = [
    { href: "/", label: "Dashboard" },
    { href: "/route", label: "Route Planner" },
    { href: "/map", label: "Map View" },
    { href: "/control", label: "AI Control" },
];

function SunIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.5" />
            <path d="M12 19v2.5" />
            <path d="m4.93 4.93 1.77 1.77" />
            <path d="m17.3 17.3 1.77 1.77" />
            <path d="M2.5 12H5" />
            <path d="M19 12h2.5" />
            <path d="m4.93 19.07 1.77-1.77" />
            <path d="m17.3 6.7 1.77-1.77" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path d="M20.35 14.84A9 9 0 1 1 9.16 3.65a7 7 0 1 0 11.19 11.19z" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
        </svg>
    );
}

export function Navbar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-[1200] border-b border-[color:var(--panel-border)] nav-shell shadow-sm backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-bold tracking-tight">CityPulse Traffic AI</p>

                    <div className="hidden md:flex items-center gap-2">
                        <nav className="flex gap-2">
                            {links.map((link) => {
                                const active = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active
                                            ? "bg-slate-900 text-white"
                                            : "input-surface subtle-text hover:brightness-95"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                            className="rounded-full p-2.5 input-surface subtle-text"
                        >
                            {theme === "light" ? <MoonIcon /> : <SunIcon />}
                            <span className="sr-only">
                                Switch to {theme === "light" ? "dark" : "light"} mode
                            </span>
                        </button>
                    </div>

                    <div className="flex md:hidden items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                            className="rounded-full p-2.5 input-surface subtle-text"
                        >
                            {theme === "light" ? <MoonIcon /> : <SunIcon />}
                            <span className="sr-only">
                                Switch to {theme === "light" ? "dark" : "light"} mode
                            </span>
                        </button>
                        <button
                            type="button"
                            aria-label="Toggle navigation menu"
                            title="Toggle navigation menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="rounded-full p-2.5 input-surface subtle-text"
                        >
                            {menuOpen ? <CloseIcon /> : <MenuIcon />}
                            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <nav className="mt-3 grid gap-2 md:hidden">
                        {links.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active
                                        ? "bg-slate-900 text-white"
                                        : "input-surface subtle-text hover:brightness-95"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </div>
        </header>
    );
}
