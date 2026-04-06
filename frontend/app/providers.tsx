"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import { ThemeProvider } from "@/components/ThemeProvider";
import { queryClient } from "@/lib/query-client";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </ThemeProvider>
    );
}
