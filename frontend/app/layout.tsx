import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Navbar } from "@/components/Navbar";
import "./globals.css";
import Providers from "./providers";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
    title: "Traffic Flow Optimization System",
    description: "AI-powered smart city traffic control dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${bodyFont.variable} ${headingFont.variable}`}>
                <Providers>
                    <div className="app-shell min-h-screen">
                        <Navbar />
                        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
