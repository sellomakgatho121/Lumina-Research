import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Download, Volume2, Copy, Check, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { ResearchResult, ThemePreset, CustomTheme } from '../../types';
import clsx from 'clsx';
import { BentoGrid, BentoCard } from '../ui/BentoGrid';
import { TypewriterText } from '../ui/TextEffects';

interface ResearchResultsProps {
    result: ResearchResult | null;
    deepResult: string | null;
    theme: ThemePreset;
    customTheme: CustomTheme;
    onTTS: (text: string) => void;
    isPlaying: boolean;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({
    result, deepResult, theme, customTheme, onTTS, isPlaying
}) => {
    const displayContent = deepResult || result?.markdown;

    // Derived Data
    const sources = result?.groundingChunks || [];
    const images = useMemo(() => {
        return sources.filter(chunk => {
            const uri = chunk.web?.uri || "";
            return uri.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i);
        });
    }, [sources]);

    if (!displayContent) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto mt-12 pb-32"
        >
            {/* Toolbar Actions (TTS, Copy, etc) */}
            <div className="flex justify-end gap-2 mb-4">
                <ActionButton icon={<Volume2 size={18} />} onClick={() => onTTS(displayContent)} active={isPlaying} label="Read Aloud" />
            </div>

            {/* Main Content Card */}
            <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
                {/* Images Gallery Grid - Only if images exist */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {images.slice(0, 4).map((img, i) => (
                            <motion.a
                                key={i}
                                href={img.web?.uri}
                                target="_blank"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i }}
                                className="aspect-square rounded-xl overflow-hidden border border-white/10 relative group"
                            >
                                <img src={img.web?.uri} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Reference" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <LinkIcon className="text-white" size={20} />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}

                {/* Markdown Content */}
                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:text-slate-300 prose-p:leading-8 prose-a:text-blue-400 prose-li:text-slate-300">
                    <ReactMarkdown>{displayContent}</ReactMarkdown>
                </div>
            </div>

            {/* Sources Bento Grid */}
            {sources.length > 0 && (
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <Sparkles className="text-blue-400" size={20} />
                        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest">References & Sources</h3>
                    </div>
                    <BentoGrid>
                        {sources.map((source, i) => {
                            const data = source.web || source.maps;
                            if (!data) return null;

                            // Vary card sizes for visual interest
                            const span = i % 5 === 0 ? 'md' : 'sm';

                            return (
                                <BentoCard
                                    key={i}
                                    span={span}
                                    gradient={i % 3 === 0}
                                    className="group cursor-pointer"
                                >
                                    <a
                                        href={data.uri}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-start gap-4"
                                    >
                                        <motion.div
                                            className={clsx(
                                                "p-3 rounded-lg flex-shrink-0",
                                                source.maps ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                                            )}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            {source.maps ? <MapPin size={22} /> : <LinkIcon size={22} />}
                                        </motion.div>
                                        <div className="overflow-hidden flex-1">
                                            <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors mb-1 line-clamp-2">
                                                {data.title || "Untitled Source"}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate">{data.uri}</p>
                                        </div>
                                    </a>
                                </BentoCard>
                            );
                        })}
                    </BentoGrid>
                </div>
            )}
        </motion.div>
    );
};

const ActionButton: React.FC<{ icon: React.ReactNode; onClick: () => void; active?: boolean; label: string }> = ({ icon, onClick, active, label }) => (
    <button
        onClick={onClick}
        title={label}
        className={clsx(
            "p-2 rounded-full transition-all border",
            active ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white"
        )}
    >
        {icon}
    </button>
);

const SourceCard: React.FC<{ title?: string; url?: string; index: number; isMap: boolean }> = ({ title, url, index, isMap }) => (
    <motion.a
        href={url}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * index }}
        viewport={{ once: true }}
        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
    >
        <div className={clsx("p-3 rounded-lg", isMap ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400")}>
            {isMap ? <MapPin size={20} /> : <LinkIcon size={20} />}
        </div>
        <div className="overflow-hidden">
            <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{title || "Untitled Source"}</h4>
            <p className="text-xs text-slate-500 truncate">{url}</p>
        </div>
    </motion.a>
);

export default ResearchResults;
