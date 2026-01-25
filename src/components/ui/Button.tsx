import React from 'react';
import { cn } from "../../utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {

        // Base styles: Pill shape, transition, font
        const baseStyles = "rounded-full font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";

        // Variant styles
        const variants = {
            primary: "bg-eva-dark text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] hover:border-eva-glow border border-transparent shadow-lg",
            secondary: "bg-white text-eva-dark border border-slate-200 hover:border-eva-glow hover:shadow-md",
            ghost: "text-eva-dark hover:bg-slate-100/50",
        };

        // Size styles
        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
