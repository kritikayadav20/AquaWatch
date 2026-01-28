
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "interactive";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
    const variants = {
        default: "bg-white border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] rounded-3xl",
        glass: "glass-card rounded-3xl",
        interactive: "bg-white border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:border-primary-200/50 transition-all duration-500 rounded-3xl cursor-pointer group",
    };

    return (
        <div className={cn(variants[variant], className)} {...props} />
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-xl font-bold italic leading-none tracking-tight text-slate-900 font-display", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6 pt-0", className)} {...props} />;
}
