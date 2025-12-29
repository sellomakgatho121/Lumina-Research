import React from 'react';
import { motion } from 'framer-motion';

interface HolographicBorderProps {
    children: React.ReactNode;
    className?: string;
    animate?: boolean;
}

const HolographicBorder: React.FC<HolographicBorderProps> = ({
    children,
    className = '',
    animate = true
}) => {
    return (
        <div className={`relative ${className}`}>
            {/* Animated corner accents */}
            {animate && (
                <>
                    {/* Top-left corner */}
                    <motion.div
                        className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-blue-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Top-right corner */}
                    <motion.div
                        className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-cyan-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />

                    {/* Bottom-left corner */}
                    <motion.div
                        className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-purple-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />

                    {/* Bottom-right corner */}
                    <motion.div
                        className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-indigo-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.5
                        }}
                    />

                    {/* Scanning line effect */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            style={{ filter: 'blur(2px)' }}
                            animate={{
                                top: ['0%', '100%'],
                                opacity: [0, 0.5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    </motion.div>
                </>
            )}

            {children}
        </div>
    );
};

export default HolographicBorder;
