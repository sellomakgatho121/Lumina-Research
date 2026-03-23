import { useState, useRef, useEffect } from 'react';
import { ResearchResult, SearchOptions, SavedSearch, LLMProvider } from '../types';
import { generateSpeech, transcribeAudio } from '../services/geminiService';
import { getProvider } from '../services/providerFactory';
import { useAuth } from '../contexts/AuthContext';
import { saveSearchToDb, loadSearchesFromDb, deleteSearchFromDb } from '../services/dbService';

import { useAI } from '../contexts/AIContext';

export const useResearch = (onThemeChange?: (color: string) => void) => {
    const { getApiKey, user } = useAuth();
    const { setIsThinking, setStatusMessage } = useAI();
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'standard' | 'maps' | 'deep'>('standard');
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(LLMProvider.GEMINI);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [deepResult, setDeepResult] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

    // Saved Searches
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
        const saved = localStorage.getItem('lumina_saved_searches');
        return saved ? JSON.parse(saved) : [];
    });

    // Cloud Sync Effect
    useEffect(() => {
        const fetchCloudSearches = async () => {
            if (user) {
                const cloudSearches = await loadSearchesFromDb(user.uid);
                if (cloudSearches.length > 0) {
                    setSavedSearches(prev => {
                        // Merge local and cloud, cloud takes precedence for same IDs
                        const combined = [...cloudSearches];
                        prev.forEach(p => {
                            if (!combined.find(c => c.id === p.id)) {
                                combined.push(p);
                            }
                        });
                        return combined.sort((a, b) => b.timestamp - a.timestamp);
                    });
                }
            }
        };
        fetchCloudSearches();
    }, [user]);

    const handleSaveSearch = async () => {
        if (!query.trim()) return;
        const newSearch: SavedSearch = {
            id: Date.now().toString(),
            query,
            options: searchOptions,
            timestamp: Date.now()
        };
        const updated = [newSearch, ...savedSearches];
        setSavedSearches(updated);
        localStorage.setItem('lumina_saved_searches', JSON.stringify(updated));

        if (user) {
            await saveSearchToDb(user.uid, newSearch);
        }
    };

    const handleLoadSearch = (search: SavedSearch) => {
        setQuery(search.query);
        setSearchOptions(search.options);
        setIsHistoryOpen(false);
    };

    const handleDeleteSearch = async (id: string) => {
        const updated = savedSearches.filter(s => s.id !== id);
        setSavedSearches(updated);
        localStorage.setItem('lumina_saved_searches', JSON.stringify(updated));

        if (user) {
            await deleteSearchFromDb(user.uid, id);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setIsThinking(true);
        setStatusMessage(mode === 'deep' ? 'Thinking deeply...' : 'Searching the web...');
        setResult(null);
        setDeepResult(null);

        try {
            const apiKey = getApiKey(selectedProvider);
            const provider = getProvider(selectedProvider, apiKey);
            if (mode === 'deep') {
                const text = await provider.deepThink(query);
                setDeepResult(text);
            } else {
                const useMaps = mode === 'maps';
                const res = await provider.research(query, useMaps, searchOptions);
                setResult(res);
                if (res.themeColor && onThemeChange) onThemeChange(res.themeColor);
            }
        } catch (e) {
            console.error(e);
            setDeepResult("An error occurred. Please check your connection or API key.");
        } finally {
            setLoading(false);
            setIsThinking(false);
            setStatusMessage('');
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
            const apiKey = getApiKey(LLMProvider.GEMINI); // TTS always uses Gemini
            const audioBuffer = await generateSpeech(text.slice(0, 500), apiKey);
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

    const toggleDictation = async () => {
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
                            const apiKey = getApiKey(LLMProvider.GEMINI); // STT always uses Gemini
                            const text = await transcribeAudio(base64, apiKey);
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

    useEffect(() => {
        return () => {
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return {
        query, setQuery,
        mode, setMode,
        selectedProvider, setSelectedProvider,
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
    };
};
