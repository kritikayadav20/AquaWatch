
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
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 focus:ring-primary-500",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-primary-200 focus:ring-primary-100",
        outline: "bg-transparent border-2 border-primary-600 text-primary-700 hover:bg-primary-50 focus:ring-primary-100",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 focus:ring-red-500",
    };

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
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
