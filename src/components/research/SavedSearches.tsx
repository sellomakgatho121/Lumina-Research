import React from 'react';
import { History, Trash2, ExternalLink, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedSearch } from '../../types';
import clsx from 'clsx';

interface SavedSearchesProps {
    searches: SavedSearch[];
    onLoad: (search: SavedSearch) => void;
    onDelete: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({
    searches, onLoad, onDelete, isOpen, onClose
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-4 z-50"
                >
                    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-[400px] flex flex-col">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2 text-white/60">
                                <History size={18} />
                                <span className="text-sm font-semibold uppercase tracking-wider">Research History</span>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-xs text-white/40 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {searches.length === 0 ? (
                                <div className="p-12 text-center text-white/20 italic">
                                    No saved searches yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {searches.map((search) => (
                                        <div 
                                            key={search.id}
                                            className="group flex items-center justify-between p-4 hover:bg-white/5 transition-all cursor-pointer"
                                            onClick={() => onLoad(search)}
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="text-white/80 font-medium truncate group-hover:text-white transition-colors">
                                                    {search.query}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-[10px] text-white/30">
                                                        <Clock size={10} />
                                                        {new Date(search.timestamp).toLocaleDateString()}
                                                    </span>
                                                    {search.options.pubType && search.options.pubType !== 'All' && (
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                                                            {search.options.pubType}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(search.id);
                                                    }}
                                                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="Delete history"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-white/20 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                                    title="Load research"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SavedSearches;
