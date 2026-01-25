import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

interface BentoCardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    span?: 'sm' | 'md' | 'lg' | 'full';
    gradient?: boolean;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className }) => {
    return (
        <div className={clsx(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto",
            className
        )}>
            {children}
        </div>
    );
};

export const BentoCard: React.FC<BentoCardProps> = ({
    title,
    description,
    children,
    className,
    span = 'sm',
    gradient = false
}) => {
    const spanClasses = {
        'sm': '',
        'md': 'md:col-span-2',
        'lg': 'lg:col-span-2',
        'full': 'md:col-span-2 lg:col-span-3'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className={clsx(
                "relative overflow-hidden rounded-2xl border border-white/10 p-6",
                "bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl",
                "hover:border-blue-500/30 transition-all duration-300",
                spanClasses[span],
                className
            )}
        >
            {gradient && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            {title && (
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />
                    {title}
                </h3>
            )}

            {description && (
                <p className="text-sm text-white/60 mb-4">{description}</p>
            )}

            <div className="relative z-10">
                {children}
            </div>

            {/* Decorative element */}
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-2xl" />
        </motion.div>
    );
};

export default BentoGrid;
