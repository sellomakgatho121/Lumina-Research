import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, MapPin, Zap, Brain, Volume2, Loader2, Link as LinkIcon, Tag, 
  Settings, SlidersHorizontal, Download, Copy, ThumbsUp, ThumbsDown, Check,
  Mic, MicOff, Bookmark, BookmarkPlus, Trash2, FileText, Palette, Image as ImageIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { searchResearch, deepThinkResearch, fastCategorize, generateSpeech, transcribeAudio } from '../services/geminiService';
import { ResearchResult, SearchOptions, ThemePreset, SavedSearch, CustomTheme, GroundingChunk } from '../types';

interface ResearchAssistantProps {
  onThemeChange: (color: string) => void;
}

const ResearchAssistant: React.FC<ResearchAssistantProps> = ({ onThemeChange }) => {
  // Main State
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'standard' | 'maps' | 'deep'>('standard');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [deepResult, setDeepResult] = useState<string | null>(null);
  const [tags, setTags] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Feature State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    pubType: 'All',
    sortBy: 'relevance'
  });
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>('default');
  const [customTheme, setCustomTheme] = useState<CustomTheme>({
    primaryColor: '#e2e8f0',
    backgroundColor: '#0f172a',
    fontFamily: 'Inter',
    accentColor: '#60a5fa',
    linkColor: '#3b82f6',
    borderRadius: '1.5rem'
  });
  const [refSort, setRefSort] = useState<'default' | 'title'>('default');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);

  // Dictation State (Query)
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Voice Feedback State
  const [isFeedbackListening, setIsFeedbackListening] = useState(false);
  const feedbackRecorderRef = useRef<MediaRecorder | null>(null);
  const feedbackChunksRef = useRef<Blob[]>([]);

  // Saved Search State
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('lumina_saved_searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSavedList, setShowSavedList] = useState(false);

  // Derived
  const displayResult = deepResult || result?.markdown || "";

  // -- Handlers --

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setDeepResult(null);
    setTags('');
    setFeedback(null);
    setCopied(false);

    try {
      // 1. Fast categorization (Parallel)
      fastCategorize(query).then(t => setTags(t));

      if (mode === 'deep') {
        const text = await deepThinkResearch(query);
        setDeepResult(text);
      } else {
        const useMaps = mode === 'maps';
        const res = await searchResearch(query, useMaps, searchOptions);
        setResult(res);
        if (res.themeColor) {
          onThemeChange(res.themeColor);
        }
      }
    } catch (e) {
      console.error(e);
      setDeepResult("An error occurred while researching. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioBuffer = await generateSpeech(text.slice(0, 1000));
      if (audioBuffer) {
        const context = new AudioContext();
        const buffer = await context.decodeAudioData(audioBuffer);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  // -- Voice Dictation (Generic) --
  const startRecording = async (
    recorderRef: React.MutableRefObject<MediaRecorder | null>,
    chunksRef: React.MutableRefObject<Blob[]>,
    setIsActive: (val: boolean) => void,
    onTranscription: (text: string) => void
  ) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
           const base64 = (reader.result as string).split(',')[1];
           try {
             const text = await transcribeAudio(base64);
             onTranscription(text);
           } catch (e) {
             console.error("Transcription failed", e);
           }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsActive(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = (
    recorderRef: React.MutableRefObject<MediaRecorder | null>,
    setIsActive: (val: boolean) => void
  ) => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsActive(false);
    }
  };

  // -- Specific Dictation Handlers --
  const toggleQueryDictation = () => {
    if (isListening) {
      stopRecording(mediaRecorderRef, setIsListening);
    } else {
      startRecording(mediaRecorderRef, audioChunksRef, setIsListening, (text) => {
        setQuery(prev => prev ? prev + ' ' + text : text);
      });
    }
  };

  const toggleFeedbackDictation = () => {
    if (isFeedbackListening) {
      stopRecording(feedbackRecorderRef, setIsFeedbackListening);
    } else {
      startRecording(feedbackRecorderRef, feedbackChunksRef, setIsFeedbackListening, (text) => {
        // Simple sentiment analysis based on keywords
        const lower = text.toLowerCase();
        if (lower.includes('good') || lower.includes('great') || lower.includes('awesome') || lower.includes('helpful') || lower.includes('like')) {
          setFeedback('up');
        } else if (lower.includes('bad') || lower.includes('poor') || lower.includes('wrong') || lower.includes('useless')) {
          setFeedback('down');
        }
      });
    }
  };

  // -- Saving Searches --
  const saveSearch = () => {
    if (!query) return;
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      query,
      options: searchOptions,
      timestamp: Date.now()
    };
    const updated = [newSearch, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('lumina_saved_searches', JSON.stringify(updated));
    setShowSavedList(true);
  };

  const loadSearch = (item: SavedSearch) => {
    setQuery(item.query);
    setSearchOptions(item.options);
    setShowSavedList(false);
  };

  const deleteSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('lumina_saved_searches', JSON.stringify(updated));
  };

  // -- Citations Export --
  const generateCitations = (format: 'bibtex' | 'ris') => {
    if (!result?.groundingChunks) return;
    
    let content = "";
    if (format === 'bibtex') {
      content = result.groundingChunks.map((chunk, i) => {
        const item = chunk.web || chunk.maps;
        if (!item) return "";
        const id = `citation_${i}_${(item.title || 'unknown').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
        return `@misc{${id},\n  title = {${item.title || 'Untitled'}},\n  howpublished = {\\url{${item.uri}}},\n  note = {Accessed: ${new Date().toISOString().split('T')[0]}}\n}`;
      }).join('\n\n');
    } else {
      // RIS
      content = result.groundingChunks.map(chunk => {
        const item = chunk.web || chunk.maps;
        if (!item) return "";
        return `TY  - ELEC\nTI  - ${item.title || 'Untitled'}\nUR  - ${item.uri}\nER  -`;
      }).join('\n\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citations.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([displayResult], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "research_findings.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Sort chunks locally
  const sortedChunks = useMemo(() => {
    if (!result?.groundingChunks) return [];
    const chunks = [...result.groundingChunks];
    if (refSort === 'title') {
      chunks.sort((a, b) => {
        const tA = a.web?.title || a.maps?.title || "";
        const tB = b.web?.title || b.maps?.title || "";
        return tA.localeCompare(tB);
      });
    }
    return chunks;
  }, [result, refSort]);

  // Image Discovery from Grounding
  const imageChunks = useMemo(() => {
    if (!result?.groundingChunks) return [];
    return result.groundingChunks.filter(chunk => {
        const uri = chunk.web?.uri || "";
        return uri.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i);
    });
  }, [result]);

  // Theme Classes & Styles
  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'minimalist':
        return "bg-white text-gray-900 border border-gray-200 shadow-sm font-sans";
      case 'futuristic':
        return "bg-black/90 text-cyan-50 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-['Orbitron'] tracking-wide";
      case 'classic':
        return "bg-[#fdfbf7] text-[#4a4a4a] border border-[#e8e4dc] shadow-md font-['Lora']";
      case 'custom':
        return ""; // applied via style prop
      default:
        return "bg-white/5 backdrop-blur-md border border-white/10 text-white font-sans";
    }
  };

  const customStyle = selectedTheme === 'custom' ? {
    backgroundColor: customTheme.backgroundColor,
    color: customTheme.primaryColor,
    fontFamily: customTheme.fontFamily,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: customTheme.borderRadius
  } : {};

  // CSS variables for custom theme dynamic styling (links, buttons)
  const customCssVars = selectedTheme === 'custom' ? {
    '--theme-accent': customTheme.accentColor,
    '--theme-link': customTheme.linkColor,
    '--theme-radius': customTheme.borderRadius,
  } as React.CSSProperties : {};

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 space-y-8 pb-32" style={customCssVars}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="text-center w-full space-y-2">
          <h2 className="text-4xl font-serif italic text-white/90">What will you discover today?</h2>
          <p className="text-white/50 text-sm">Powered by Gemini 2.5 & 3 Pro</p>
        </div>
        
        {/* Saved Searches Toggle */}
        <div className="relative">
          <button 
             onClick={() => setShowSavedList(!showSavedList)}
             className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 transition-colors"
             title="Saved Searches"
          >
             <Bookmark size={20} />
          </button>
          
          {showSavedList && (
             <div className="absolute right-0 top-12 w-80 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 p-2 max-h-96 overflow-y-auto">
               <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Saved Queries</h4>
               {savedSearches.length === 0 ? (
                 <p className="text-white/30 text-sm px-2">No saved searches yet.</p>
               ) : (
                 savedSearches.map(s => (
                   <div key={s.id} className="group flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer" onClick={() => loadSearch(s)}>
                      <div className="overflow-hidden">
                        <p className="text-white text-sm truncate">{s.query}</p>
                        <p className="text-white/30 text-xs">{new Date(s.timestamp).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={(e) => deleteSearch(s.id, e)}
                        className="p-1 text-white/20 group-hover:text-red-400 hover:bg-white/10 rounded"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                 ))
               )}
             </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
        <div className="flex flex-col space-y-4">
          <div className="relative">
             <textarea
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Describe your research needs (e.g., 'I need a model for protein folding', 'Impact of Jazz on 1920s culture', 'Sustainable concrete materials'...)"
               className="w-full bg-transparent text-lg text-white placeholder-white/30 outline-none resize-none h-24 pr-12"
             />
             <button
               onClick={toggleQueryDictation}
               className={`absolute right-0 top-0 p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
               title="Dictate Query"
             >
                {isListening ? <Mic size={20} /> : <MicOff size={20} />}
             </button>
          </div>
          
          {/* Advanced Search Panel */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
               <div>
                  <label className="text-xs text-white/40 block mb-1">Start Year</label>
                  <input 
                    type="number" 
                    placeholder="2020" 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    onChange={(e) => setSearchOptions({...searchOptions, dateRange: {...searchOptions.dateRange, start: e.target.value}})}
                  />
               </div>
               <div>
                  <label className="text-xs text-white/40 block mb-1">End Year</label>
                  <input 
                    type="number" 
                    placeholder="2024" 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    onChange={(e) => setSearchOptions({...searchOptions, dateRange: {...searchOptions.dateRange, end: e.target.value}})}
                  />
               </div>
               <div>
                  <label className="text-xs text-white/40 block mb-1">Type</label>
                  <select 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    value={searchOptions.pubType}
                    onChange={(e) => setSearchOptions({...searchOptions, pubType: e.target.value})}
                  >
                    <option value="All">All Sources</option>
                    <option value="Academic Journals">Academic Journals</option>
                    <option value="Conference Papers">Conference Papers</option>
                    <option value="Tools & Software">Tools & Software</option>
                    <option value="News & Media">News & Media</option>
                    <option value="Reports & Whitepapers">Reports & Whitepapers</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs text-white/40 block mb-1">Sort Preference</label>
                  <select 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    value={searchOptions.sortBy}
                    onChange={(e) => setSearchOptions({...searchOptions, sortBy: e.target.value as 'relevance' | 'date'})}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date (Newest)</option>
                  </select>
               </div>
               <div className="md:col-span-2 lg:col-span-4">
                  <label className="text-xs text-white/40 block mb-1">Exclude Keywords</label>
                  <input 
                    type="text" 
                    placeholder="e.g. deprecated, paid, commercial" 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    onChange={(e) => setSearchOptions({...searchOptions, excludeKeywords: e.target.value})}
                  />
               </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-4 flex-wrap gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setMode('standard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${mode === 'standard' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <Search size={16} /> Standard
              </button>
              <button 
                onClick={() => setMode('maps')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${mode === 'maps' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <MapPin size={16} /> Locate
              </button>
              <button 
                onClick={() => setMode('deep')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${mode === 'deep' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <Brain size={16} /> Deep Think
              </button>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${showAdvanced ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>

            <div className="flex gap-2">
                <button 
                   onClick={saveSearch}
                   disabled={!query}
                   className="p-2 rounded-full text-white/40 hover:text-yellow-400 hover:bg-white/5 disabled:opacity-30"
                   title="Save this search"
                >
                   <BookmarkPlus size={20} />
                </button>
                <button 
                  onClick={handleSearch}
                  disabled={loading || !query}
                  className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  <span>Research</span>
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags (Lite Model) */}
      {tags && (
        <div className="flex gap-2 justify-center fade-in">
          {tags.split(',').map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/60 flex items-center gap-1 border border-white/5">
              <Tag size={12} /> {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Results Area */}
      {(result || deepResult) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Result Toolbar */}
           <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4 px-2">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                 <div className="flex items-center gap-3">
                   <span className="text-sm text-white/40">Theme:</span>
                   <select 
                     value={selectedTheme} 
                     onChange={(e) => setSelectedTheme(e.target.value as ThemePreset)}
                     className="bg-black/20 text-white text-sm border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-white/30"
                   >
                      <option value="default">Default</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="futuristic">Futuristic</option>
                      <option value="classic">Classic</option>
                      <option value="custom">Custom</option>
                   </select>
                 </div>
                 
                 {selectedTheme === 'custom' && (
                   <div className="flex flex-wrap gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                     <div className="flex flex-col">
                        <label className="text-[10px] text-white/40">Text</label>
                        <input type="color" value={customTheme.primaryColor} onChange={(e) => setCustomTheme({...customTheme, primaryColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer bg-transparent"/>
                     </div>
                     <div className="flex flex-col">
                        <label className="text-[10px] text-white/40">Bg</label>
                        <input type="color" value={customTheme.backgroundColor} onChange={(e) => setCustomTheme({...customTheme, backgroundColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer bg-transparent"/>
                     </div>
                     <div className="flex flex-col">
                        <label className="text-[10px] text-white/40">Accent</label>
                        <input type="color" value={customTheme.accentColor} onChange={(e) => setCustomTheme({...customTheme, accentColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer bg-transparent"/>
                     </div>
                     <div className="flex flex-col">
                        <label className="text-[10px] text-white/40">Link</label>
                        <input type="color" value={customTheme.linkColor} onChange={(e) => setCustomTheme({...customTheme, linkColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer bg-transparent"/>
                     </div>
                     <div className="flex flex-col">
                        <label className="text-[10px] text-white/40">Font</label>
                        <select value={customTheme.fontFamily} onChange={(e) => setCustomTheme({...customTheme, fontFamily: e.target.value})} className="bg-white/10 text-white text-xs rounded px-1 py-1 w-20">
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Lato">Lato</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Playfair Display">Playfair</option>
                            <option value="Orbitron">Orbitron</option>
                            <option value="Lora">Lora</option>
                        </select>
                     </div>
                     <div className="flex flex-col">
                        <label className="text-[10px] text-white/40">Radius</label>
                         <select value={customTheme.borderRadius} onChange={(e) => setCustomTheme({...customTheme, borderRadius: e.target.value})} className="bg-white/10 text-white text-xs rounded px-1 py-1">
                            <option value="0px">Sharp</option>
                            <option value="8px">Soft</option>
                            <option value="24px">Round</option>
                        </select>
                     </div>
                   </div>
                 )}
              </div>
              
              <div className="flex gap-2 self-end md:self-auto">
                 <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2">
                     <span className="text-xs text-white/40 hidden sm:inline">Citations:</span>
                     <button onClick={() => generateCitations('bibtex')} className="text-xs text-blue-300 hover:text-white px-2 py-1">BibTeX</button>
                     <span className="text-white/20">|</span>
                     <button onClick={() => generateCitations('ris')} className="text-xs text-blue-300 hover:text-white px-2 py-1">RIS</button>
                 </div>
                 <button onClick={handleCopy} className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Copy to Clipboard">
                    {copied ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                 </button>
                 <button onClick={handleDownload} className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Download Markdown">
                    <Download size={18} />
                 </button>
              </div>
           </div>

          <div 
            className={`rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 ${getThemeClasses()}`}
            style={customStyle}
          >
             {/* Decorative background element for default theme */}
             {selectedTheme === 'default' && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -z-10" />
             )}

             <div className="flex justify-between items-start mb-6 border-b border-current border-opacity-10 pb-4">
               <h3 className="text-2xl font-serif opacity-90">Research Findings</h3>
               <button 
                 onClick={() => handleTTS(displayResult)}
                 disabled={isPlaying}
                 className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-blue-500 text-white animate-pulse' : 'bg-current bg-opacity-10 opacity-70 hover:opacity-100'}`}
               >
                 <Volume2 size={20} />
               </button>
             </div>

             {/* Found Images Gallery */}
             {imageChunks.length > 0 && (
                 <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-current bg-opacity-5 rounded-xl">
                    {imageChunks.map((chunk, idx) => (
                        <a key={idx} href={chunk.web?.uri} target="_blank" rel="noreferrer" className="block group relative overflow-hidden rounded-lg aspect-square">
                            <img 
                                src={chunk.web?.uri} 
                                alt={chunk.web?.title} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs px-2 text-center">{chunk.web?.title}</span>
                            </div>
                        </a>
                    ))}
                 </div>
             )}

             <div className="prose prose-lg max-w-none prose-headings:font-serif prose-p:opacity-80 prose-li:opacity-80 prose-strong:opacity-100 prose-img:rounded-xl prose-img:shadow-lg" style={{
                 '--tw-prose-body': 'currentColor',
                 '--tw-prose-headings': 'currentColor',
                 '--tw-prose-links': selectedTheme === 'custom' ? 'var(--theme-link)' : 'currentColor',
                 '--tw-prose-bold': 'currentColor',
                 '--tw-prose-counters': 'currentColor',
                 '--tw-prose-bullets': 'currentColor',
                 '--tw-prose-hr': 'currentColor',
                 '--tw-prose-quotes': 'currentColor',
                 '--tw-prose-quote-borders': 'currentColor',
                 '--tw-prose-captions': 'currentColor',
                 '--tw-prose-code': 'currentColor',
                 '--tw-prose-pre-code': 'currentColor',
                 '--tw-prose-pre-bg': 'rgba(0,0,0,0.2)',
                 '--tw-prose-th-borders': 'currentColor',
                 '--tw-prose-td-borders': 'currentColor',
             } as React.CSSProperties}>
               <ReactMarkdown
                 components={{
                   img: ({node, ...props}) => (
                     <div className="my-6">
                        <img {...props} className="rounded-xl shadow-lg border border-white/10 max-h-[400px] object-cover mx-auto" alt={props.alt || 'Research Visual'} />
                        {props.alt && <p className="text-center text-sm opacity-60 mt-2 italic">{props.alt}</p>}
                     </div>
                   )
                 }}
               >
                 {displayResult}
               </ReactMarkdown>
             </div>

             {/* Feedback Section */}
             <div className="flex justify-between items-center mt-8 pt-4 border-t border-current border-opacity-10">
                <div className="flex gap-2">
                   {selectedTheme === 'custom' && <span className="text-xs opacity-50">Custom Theme Active</span>}
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-xs opacity-50 mr-2">Was this helpful?</span>
                    
                    {/* Voice Feedback Button */}
                    <button 
                        onClick={toggleFeedbackDictation}
                        className={`p-2 rounded-full transition-all relative ${isFeedbackListening ? 'bg-red-500 text-white animate-pulse' : 'bg-current bg-opacity-5 hover:bg-opacity-10'}`}
                        title="Say 'Good' or 'Bad' to rate"
                    >
                        {isFeedbackListening ? <Mic size={16} /> : <MicOff size={16} />}
                        {isFeedbackListening && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Listening...</span>}
                    </button>

                    <button 
                    onClick={() => setFeedback('up')}
                    className={`p-2 rounded-full transition-colors ${feedback === 'up' ? 'bg-green-500 text-white' : 'bg-current bg-opacity-5 hover:bg-opacity-10'}`}
                    >
                    <ThumbsUp size={16} />
                    </button>
                    <button 
                    onClick={() => setFeedback('down')}
                    className={`p-2 rounded-full transition-colors ${feedback === 'down' ? 'bg-red-500 text-white' : 'bg-current bg-opacity-5 hover:bg-opacity-10'}`}
                    >
                    <ThumbsDown size={16} />
                    </button>
                </div>
             </div>

             {/* Grounding Sources */}
             {sortedChunks.length > 0 && (
               <div className="mt-8 pt-6 border-t border-current border-opacity-10">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold opacity-50 uppercase tracking-wider">References & Sources</h4>
                    <select 
                      value={refSort}
                      onChange={(e) => setRefSort(e.target.value as 'default' | 'title')}
                      className="bg-transparent text-xs opacity-50 border border-current border-opacity-20 rounded px-2 py-1"
                    >
                       <option value="default">Sort by Relevance</option>
                       <option value="title">Sort by Title</option>
                    </select>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {sortedChunks.map((chunk, idx) => {
                     const item = chunk.web || chunk.maps;
                     if (!item) return null;
                     return (
                       <a 
                         key={idx} 
                         href={item.uri} 
                         target="_blank" 
                         rel="noreferrer"
                         className="flex items-center gap-3 p-3 rounded-lg bg-current bg-opacity-5 hover:bg-opacity-10 transition-colors border border-current border-opacity-5 group"
                       >
                         <div className="p-2 rounded-md bg-current bg-opacity-5 opacity-70">
                           {chunk.maps ? <MapPin size={16} /> : <LinkIcon size={16} />}
                         </div>
                         <div className="overflow-hidden">
                           <p className="text-sm font-medium opacity-90 truncate">{item.title}</p>
                           <p className="text-xs opacity-40 truncate">{item.uri}</p>
                         </div>
                       </a>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchAssistant;