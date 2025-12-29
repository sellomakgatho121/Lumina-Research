import React, { useState, useRef } from 'react';
import { ResearchResult, SearchOptions, ThemePreset, SavedSearch, CustomTheme } from '../types';
import { searchResearch, deepThinkResearch, fastCategorize, generateSpeech, transcribeAudio } from '../services/geminiService';

// Sub Components
import ResearchHeader from './research/ResearchHeader';
import SearchInput from './research/SearchInput';
import ResearchResults from './research/ResearchResults';
import HolographicBorder from './ui/HolographicBorder';
import LoadingSkeleton from './research/LoadingSkeleton';

interface ResearchAssistantProps {
  onThemeChange: (color: string) => void;
}

const ResearchAssistant: React.FC<ResearchAssistantProps> = ({ onThemeChange }) => {
  // -- State --
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'standard' | 'maps' | 'deep'>('standard');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [deepResult, setDeepResult] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Options
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    pubType: 'All',
    sortBy: 'relevance'
  });

  // Theme (Legacy support)
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>('default');
  const [customTheme, setCustomTheme] = useState<CustomTheme>({
    primaryColor: '#e2e8f0',
    backgroundColor: '#0f172a',
    fontFamily: 'Inter',
    accentColor: '#60a5fa',
    linkColor: '#3b82f6',
    borderRadius: '1.5rem'
  });

  // Saved Searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('lumina_saved_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveSearch = () => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      query,
      options: searchOptions,
      timestamp: Date.now()
    };
    const updated = [newSearch, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('lumina_saved_searches', JSON.stringify(updated));
  };

  // -- Handlers --

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setDeepResult(null);

    try {
      if (mode === 'deep') {
        const text = await deepThinkResearch(query);
        setDeepResult(text);
      } else {
        const useMaps = mode === 'maps';
        const res = await searchResearch(query, useMaps, searchOptions);
        setResult(res);
        if (res.themeColor) onThemeChange(res.themeColor);
      }
    } catch (e) {
      console.error(e);
      setDeepResult("An error occurred. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async (text: string) => {
    if (isPlaying) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      const audioBuffer = await generateSpeech(text.slice(0, 500));
      if (audioBuffer) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        const context = audioContextRef.current;
        const buffer = await context.decodeAudioData(audioBuffer);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = () => {
          setIsPlaying(false);
          audioSourceRef.current = null;
        };

        audioSourceRef.current = source;
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  // Cleanup audio resources on unmount
  React.useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Dictation
  const toggleQueryDictation = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      return;
    }

    if (isListening) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            try {
              const text = await transcribeAudio(base64);
              setQuery(prev => prev + ' ' + text);
            } catch (e) {
              console.error("Transcription failed", e);
            }
          };
          stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        setIsListening(true);
      } catch (e) {
        console.error("Mic access denied", e);
        setIsListening(false);
      }
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      <ResearchHeader />

      <div className="max-w-4xl mx-auto">
        <HolographicBorder>
          <SearchInput
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            loading={loading}
            isListening={isListening}
            toggleDictation={toggleQueryDictation}
            options={searchOptions}
            setOptions={setSearchOptions}
            mode={mode}
            setMode={setMode}
            onSave={handleSaveSearch}
          />
        </HolographicBorder>
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