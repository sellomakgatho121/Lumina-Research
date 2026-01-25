import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto mt-12 space-y-6"
        >
            {/* Main Content Card Skeleton */}
            <div className="glass-panel p-8 md:p-12 rounded-3xl">
                {/* Title Skeleton */}
                <div className="flex justify-between items-center mb-8">
                    <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
                </div>

                {/* Content Lines */}
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded animate-pulse"
                            style={{
                                width: `${Math.random() * 30 + 70}%`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>

                {/* Image Placeholders */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="aspect-square rounded-xl bg-white/5 animate-pulse"
                        />
                    ))}
                </div>
            </div>

            {/* Sources Grid Skeleton */}
            <div className="mt-12">
                <div className="h-5 w-32 bg-white/10 rounded mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                        >
                            <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Breathing Animation Indicator */}
            <motion.div
                animate={{
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="text-center mt-8"
            >
                <p className="text-white/40 text-sm">
                    Researching...
                </p>
            </motion.div>
        </motion.div>
    );
};

export default LoadingSkeleton;
