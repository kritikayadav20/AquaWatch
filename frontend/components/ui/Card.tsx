
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "interactive";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
    const variants = {
        default: "bg-white border border-slate-100 shadow-sm rounded-2xl",
        glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl",
        interactive: "bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-300 rounded-2xl cursor-pointer group",
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
