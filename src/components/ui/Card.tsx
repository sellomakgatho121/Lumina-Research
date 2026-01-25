import React from 'react';
import { cn } from "../../utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'glass' | 'ceramic';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'ceramic', ...props }, ref) => {

        const variants = {
            glass: "glass-panel rounded-3xl p-6",
            ceramic: "ceramic-panel p-6 hover:-translate-y-1 transition-transform duration-500 ease-out",
        };

        return (
            <div
                ref={ref}
                className={cn(variants[variant], className)}
                {...props}
            />
        );
    }
);

Card.displayName = "Card";
