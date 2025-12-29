import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShimmerTextProps {
    text: string;
    className?: string;
    delay?: number;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({
    text,
    className = '',
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
            className={`relative inline-block ${className}`}
        >
            <span className="relative z-10 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                {text}
            </span>
        </motion.div>
    );
};

interface TypewriterTextProps {
    text: string;
    className?: string;
    speed?: number;
    delay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    className = '',
    speed = 50,
    delay = 0
}) => {
    const [displayedText, setDisplayedText] = React.useState('');
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (currentIndex < text.length) {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }
        }, currentIndex === 0 ? delay : speed);

        return () => clearTimeout(timeout);
    }, [currentIndex, text, speed, delay]);

    return (
        <span className={className}>
            {displayedText}
            {currentIndex < text.length && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block ml-1"
                >
                    |
                </motion.span>
            )}
        </span>
    );
};

interface GlitchTextProps {
    text: string;
    className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
    text,
    className = ''
}) => {
    return (
        <div className={`relative ${className}`}>
            <span className="relative z-10">{text}</span>
            <span
                className="absolute inset-0 text-cyan-400 animate-glitch-1"
                aria-hidden="true"
            >
                {text}
            </span>
            <span
                className="absolute inset-0 text-pink-400 animate-glitch-2"
                aria-hidden="true"
            >
                {text}
            </span>
        </div>
    );
};

interface WordRotateProps {
    words: string[];
    className?: string;
    duration?: number;
}

export const WordRotate: React.FC<WordRotateProps> = ({
    words,
    className = '',
    duration = 3000
}) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % words.length);
        }, duration);

        return () => clearInterval(interval);
    }, [words.length, duration]);

    return (
        <div className={`relative inline-block overflow-hidden ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                >
                    {words[currentIndex]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default { ShimmerText, TypewriterText, GlitchText, WordRotate };
