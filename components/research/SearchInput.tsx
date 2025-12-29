import React, { useState } from 'react';
import { Search, MapPin, Zap, Brain, Mic, MicOff, SlidersHorizontal, Loader2, BookmarkPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchOptions } from '../../types';
import clsx from 'clsx';

interface SearchInputProps {
    query: string;
    setQuery: (q: string) => void;
    onSearch: () => void;
    loading: boolean;
    isListening: boolean;
    toggleDictation: () => void;
    options: SearchOptions;
    setOptions: (o: SearchOptions) => void;
    mode: 'standard' | 'maps' | 'deep';
    setMode: (m: 'standard' | 'maps' | 'deep') => void;
    onSave: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
    query, setQuery, onSearch, loading, isListening, toggleDictation,
    options, setOptions, mode, setMode, onSave
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSearch();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto relative z-20">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={clsx(
                    "relative bg-white/[0.03] backdrop-blur-2xl border transition-all duration-500 rounded-3xl overflow-hidden",
                    isFocused ? "border-white/20 shadow-[0_0_50px_rgba(59,130,246,0.15)] ring-1 ring-white/10" : "border-white/5 shadow-2xl"
                )}
            >
                <div className="p-4 md:p-6">
                    <div className="relative">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Ask anything..."
                            className="w-full bg-transparent text-xl md:text-2xl text-white placeholder-white/20 outline-none resize-none h-20 md:h-24 pr-12 font-light leading-relaxed"
                        />
                        <button
                            onClick={toggleDictation}
                            className={clsx(
                                "absolute right-0 top-0 p-3 rounded-xl transition-all duration-300",
                                isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "text-white/20 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {isListening ? <Mic size={22} /> : <MicOff size={22} />}
                        </button>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-4 border-t border-white/5 mt-2">
                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                            {(['standard', 'maps', 'deep'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                        mode === m ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {m === 'standard' && <Search size={14} />}
                                    {m === 'maps' && <MapPin size={14} />}
                                    {m === 'deep' && <Brain size={14} />}
                                    <span className="capitalize">{m === 'deep' ? 'Deep Think' : m}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className={clsx(
                                    "p-3 rounded-xl transition-colors border border-transparent",
                                    showAdvanced ? "bg-white/10 text-white border-white/10" : "text-white/30 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <SlidersHorizontal size={20} />
                            </button>

                            <button
                                onClick={onSave}
                                disabled={!query}
                                className="p-3 rounded-xl text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors disabled:opacity-30 border border-transparent"
                            >
                                <BookmarkPlus size={20} />
                            </button>

                            <button
                                onClick={onSearch}
                                disabled={loading || !query}
                                className={clsx(
                                    "flex-1 md:flex-none flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                    loading ? "bg-white/5 text-white/50 cursor-wait" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
                                )}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                <span>{loading ? 'Thinking...' : 'Research'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Options Panel */}
                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-black/20 border-t border-white/5"
                        >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <OptionGroup label="Timeframe">
                                    <div className="flex gap-2">
                                        <Input placeholder="Start (YYYY)" onChange={(v) => setOptions({ ...options, dateRange: { ...options.dateRange, start: v } })} />
                                        <Input placeholder="End (YYYY)" onChange={(v) => setOptions({ ...options, dateRange: { ...options.dateRange, end: v } })} />
                                    </div>
                                </OptionGroup>

                                <OptionGroup label="Source Type">
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
                                        value={options.pubType}
                                        onChange={(e) => setOptions({ ...options, pubType: e.target.value })}
                                    >
                                        {['All', 'Academic Journals', 'Conference Papers', 'Tools & Software', 'News & Media', 'Reports & Whitepapers'].map(o => (
                                            <option key={o} value={o} className="bg-slate-900">{o}</option>
                                        ))}
                                    </select>
                                </OptionGroup>

                                <OptionGroup label="Sort By">
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
                                        value={options.sortBy}
                                        onChange={(e) => setOptions({ ...options, sortBy: e.target.value as any })}
                                    >
                                        <option value="relevance" className="bg-slate-900">Relevance</option>
                                        <option value="date" className="bg-slate-900">Date (Newest)</option>
                                    </select>
                                </OptionGroup>

                                <OptionGroup label="Exclude Keywords">
                                    <Input placeholder="e.g. paid, opinion..." onChange={(v) => setOptions({ ...options, excludeKeywords: v })} />
                                </OptionGroup>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

// -- Mini Components --
const OptionGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-white/40 font-semibold">{label}</label>
        {children}
    </div>
);

const Input: React.FC<{ placeholder: string; onChange: (v: string) => void }> = ({ placeholder, onChange }) => (
    <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder-white/20"
        onChange={(e) => onChange(e.target.value)}
    />
);

export default SearchInput;
