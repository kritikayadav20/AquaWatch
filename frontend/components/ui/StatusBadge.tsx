
import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string; // broadened to string to handle 'accepted' coming from DB without type errors
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status ? status.toLowerCase() : 'unknown';

    const styles: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        accepted: "bg-blue-50 text-blue-700 border-blue-200",
        approved: "bg-blue-50 text-blue-700 border-blue-200", // Legacy support
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        unknown: "bg-slate-50 text-slate-700 border-slate-200"
    };

    const labels: Record<string, string> = {
        pending: "Pending Review",
        accepted: "Accepted",
        approved: "Accepted",
        completed: "Marked Complete",
        rejected: "Rejected",
        unknown: status || "Unknown"
    };

    const statusStyle = styles[normalizedStatus] || styles.unknown;
    const statusLabel = labels[normalizedStatus] || status;

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                statusStyle,
                className
            )}
        >
            {statusLabel}
        </span>
    );
}
