
import React from "react";
import { MoveRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

export function Button({
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    iconPosition = "right",
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 border border-transparent",
        secondary: "bg-slate-700 text-slate-100 border border-slate-600 hover:border-primary-500 hover:bg-slate-600 hover:text-primary-200",
        outline: "bg-transparent border-2 border-primary-500 text-primary-300 hover:bg-primary-500/20",
        ghost: "bg-transparent text-slate-300 hover:bg-slate-700/50 hover:text-slate-50",
        danger: "bg-red-900/50 text-red-300 border border-red-700 hover:bg-red-800/50 hover:border-red-600",
    };

    const sizes = {
        sm: "h-9 px-4 text-xs uppercase font-bold",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : icon && iconPosition === "left" ? (
                <span className="mr-2">{icon}</span>
            ) : null}

            {children}

            {!isLoading && icon && iconPosition === "right" && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
}
