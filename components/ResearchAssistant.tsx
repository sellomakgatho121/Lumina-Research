import React, { useState } from 'react';
import { ThemePreset, CustomTheme } from '../types';
import { useResearch } from '../hooks/useResearch';

// Sub Components
import ResearchHeader from './research/ResearchHeader';
import SearchInput from './research/SearchInput';
import ResearchResults from './research/ResearchResults';
import SavedSearches from './research/SavedSearches';
import HolographicBorder from './ui/HolographicBorder';
import LoadingSkeleton from './research/LoadingSkeleton';
import { History } from 'lucide-react';

interface ResearchAssistantProps {
  onThemeChange: (color: string) => void;
}

const ResearchAssistant: React.FC<ResearchAssistantProps> = ({ onThemeChange }) => {
  const {
    query, setQuery,
    mode, setMode,
    loading,
    result,
    deepResult,
    isPlaying,
    isListening,
    isHistoryOpen, setIsHistoryOpen,
    searchOptions, setSearchOptions,
    savedSearches,
    handleSaveSearch,
    handleLoadSearch,
    handleDeleteSearch,
    handleSearch,
    handleTTS,
    toggleDictation
  } = useResearch(onThemeChange);

  // UI Theme State (separate from core research logic)
  const [selectedTheme] = useState<ThemePreset>('default');
  const [customTheme] = useState<CustomTheme>({
    primaryColor: '#e2e8f0',
    backgroundColor: '#0f172a',
    fontFamily: 'Inter',
    accentColor: '#60a5fa',
    linkColor: '#3b82f6',
    borderRadius: '1.5rem'
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      <ResearchHeader />

      <div className="max-w-4xl mx-auto relative">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <History size={16} />
            <span>History</span>
          </button>
        </div>

        <HolographicBorder>
          <SearchInput
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            loading={loading}
            isListening={isListening}
            toggleDictation={toggleDictation}
            options={searchOptions}
            setOptions={setSearchOptions}
            mode={mode}
            setMode={setMode}
            onSave={handleSaveSearch}
          />
        </HolographicBorder>

        <SavedSearches
          searches={savedSearches}
          onLoad={handleLoadSearch}
          onDelete={handleDeleteSearch}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && (result || deepResult) && (
        <ResearchResults
          result={result}
          deepResult={deepResult}
          theme={selectedTheme}
          customTheme={customTheme}
          onTTS={handleTTS}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
};

export default ResearchAssistant;
