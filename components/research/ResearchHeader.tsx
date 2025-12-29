import React from 'react';
import { motion } from 'framer-motion';
import { ShimmerText, WordRotate } from '../ui/TextEffects';

const ResearchHeader: React.FC = () => {
    const poweredByWords = ['Gemini 2.0 Flash', 'Advanced AI', 'Deep Learning', 'Neural Networks'];

    return (
        <div className="text-center w-full space-y-6 mb-16">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic tracking-tight leading-tight"
            >
                <ShimmerText
                    text="What will you discover today?"
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic"
                />
            </motion.h1>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-white/50 text-base md:text-lg font-medium tracking-wider uppercase flex items-center justify-center gap-2 flex-wrap"
            >
                <span>Powered by</span> <WordRotate words={poweredByWords} className="text-blue-400 font-bold" duration={2500} />
            </motion.div>
        </div>
    );
};

export default ResearchHeader;
