import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, MapPin, Zap, Brain, Volume2, Loader2, Link as LinkIcon, Tag, 
  Settings, SlidersHorizontal, Download, Copy, ThumbsUp, ThumbsDown, Check,
  Mic, MicOff, Bookmark, BookmarkPlus, Trash2, FileText, Palette, Image as ImageIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { searchResearch, deepThinkResearch, fastCategorize, generateSpeech, transcribeAudio } from '../services/geminiService';
import { ResearchResult, SearchOptions, ThemePreset, SavedSearch, CustomTheme, GroundingChunk } from '../types';

const ResearchAssistant: React.FC = () => {
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

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 space-y-8 pb-32">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="text-center w-full space-y-2">
          <h2 className="text-4xl font-serif italic text-text-primary opacity-90">What will you discover today?</h2>
          <p className="text-text-secondary text-sm">Powered by Gemini 1.5 Pro</p>
        </div>
        
        {/* Saved Searches Toggle */}
        <div className="relative">
          <button 
             onClick={() => setShowSavedList(!showSavedList)}
             className="p-3 bg-bg-secondary hover:bg-bg-tertiary rounded-full text-text-secondary transition-colors"
             title="Saved Searches"
          >
             <Bookmark size={20} />
          </button>
          
          {showSavedList && (
             <div className="absolute right-0 top-12 w-80 bg-bg-secondary border border-border-primary rounded-xl shadow-high z-50 p-2 max-h-96 overflow-y-auto">
               <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">Saved Queries</h4>
               {savedSearches.length === 0 ? (
                 <p className="text-text-muted text-sm px-2">No saved searches yet.</p>
               ) : (
                 savedSearches.map(s => (
                   <div key={s.id} className="group flex items-center justify-between p-2 hover:bg-bg-tertiary rounded-lg cursor-pointer" onClick={() => loadSearch(s)}>
                      <div className="overflow-hidden">
                        <p className="text-text-primary text-sm truncate">{s.query}</p>
                        <p className="text-text-muted text-xs">{new Date(s.timestamp).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={(e) => deleteSearch(s.id, e)}
                        className="p-1 text-text-muted group-hover:text-red-400 hover:bg-bg-tertiary rounded"
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
      <div className="bg-bg-secondary backdrop-blur-xl border border-border-primary p-6 rounded-large shadow-high">
        <div className="flex flex-col space-y-4">
          <div className="relative">
             <textarea
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Describe your research needs (e.g., 'I need a model for protein folding', 'Impact of Jazz on 1920s culture', 'Sustainable concrete materials'...)"
               className="w-full bg-transparent text-lg text-text-primary placeholder-text-muted outline-none resize-none h-24 pr-12"
             />
             <button
               onClick={toggleQueryDictation}
               className={`absolute right-0 top-0 p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'}`}
               title="Dictate Query"
             >
                {isListening ? <Mic size={20} /> : <MicOff size={20} />}
             </button>
          </div>
          
          {/* Advanced Search Panel */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border-primary animate-in slide-in-from-top-2">
               <div>
                  <label className="text-xs text-text-muted block mb-1">Start Year</label>
                  <input 
                    type="number" 
                    placeholder="2020" 
                    className="w-full bg-bg-tertiary border-border-secondary rounded-lg px-3 py-2 text-sm"
                    onChange={(e) => setSearchOptions({...searchOptions, dateRange: {...searchOptions.dateRange, start: e.target.value}})}
                  />
               </div>
               <div>
                  <label className="text-xs text-text-muted block mb-1">End Year</label>
                  <input 
                    type="number" 
                    placeholder="2024" 
                    className="w-full bg-bg-tertiary border-border-secondary rounded-lg px-3 py-2 text-sm"
                    onChange={(e) => setSearchOptions({...searchOptions, dateRange: {...searchOptions.dateRange, end: e.target.value}})}
                  />
               </div>
               <div>
                  <label className="text-xs text-text-muted block mb-1">Type</label>
                  <select 
                    className="w-full bg-bg-tertiary border-border-secondary rounded-lg px-3 py-2 text-sm"
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
                  <label className="text-xs text-text-muted block mb-1">Sort Preference</label>
                  <select 
                    className="w-full bg-bg-tertiary border-border-secondary rounded-lg px-3 py-2 text-sm"
                    value={searchOptions.sortBy}
                    onChange={(e) => setSearchOptions({...searchOptions, sortBy: e.target.value as 'relevance' | 'date'})}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date (Newest)</option>
                  </select>
               </div>
               <div className="md:col-span-2 lg:col-span-4">
                  <label className="text-xs text-text-muted block mb-1">Exclude Keywords</label>
                  <input 
                    type="text" 
                    placeholder="e.g. deprecated, paid, commercial" 
                    className="w-full bg-bg-tertiary border-border-secondary rounded-lg px-3 py-2 text-sm"
                    onChange={(e) => setSearchOptions({...searchOptions, excludeKeywords: e.target.value})}
                  />
               </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border-primary pt-4 flex-wrap gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setMode('standard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${mode === 'standard' ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'}`}
              >
                <Search size={16} /> Standard
              </button>
              <button 
                onClick={() => setMode('maps')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${mode === 'maps' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'}`}
              >
                <MapPin size={16} /> Locate
              </button>
              <button 
                onClick={() => setMode('deep')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${mode === 'deep' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'}`}
              >
                <Brain size={16} /> Deep Think
              </button>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${showAdvanced ? 'text-text-primary bg-bg-tertiary' : 'text-text-muted hover:text-text-primary'}`}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>

            <div className="flex gap-2">
                <button 
                   onClick={saveSearch}
                   disabled={!query}
                   className="p-2 rounded-full text-text-muted hover:text-yellow-400 hover:bg-bg-tertiary disabled:opacity-30"
                   title="Save this search"
                >
                   <BookmarkPlus size={20} />
                </button>
                <button 
                  onClick={handleSearch}
                  disabled={loading || !query}
                  className="bg-accent-primary text-white px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <span key={i} className="px-3 py-1 bg-bg-secondary rounded-full text-xs text-text-secondary flex items-center gap-1 border border-border-primary">
              <Tag size={12} /> {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Results Area */}
      {(result || deepResult) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Result Toolbar */}
           <div className="flex flex-col md:flex-row gap-4 justify-end items-start md:items-center mb-4 px-2">
              <div className="flex gap-2 self-end md:self-auto">
                 <div className="flex items-center gap-1 bg-bg-secondary rounded-lg px-2">
                     <span className="text-xs text-text-muted hidden sm:inline">Citations:</span>
                     <button onClick={() => generateCitations('bibtex')} className="text-xs text-text-accent hover:text-text-primary px-2 py-1">BibTeX</button>
                     <span className="text-border-secondary">|</span>
                     <button onClick={() => generateCitations('ris')} className="text-xs text-text-accent hover:text-text-primary px-2 py-1">RIS</button>
                 </div>
                 <button onClick={handleCopy} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors" title="Copy to Clipboard">
                    {copied ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                 </button>
                 <button onClick={handleDownload} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors" title="Download Markdown">
                    <Download size={18} />
                 </button>
              </div>
           </div>

          <div 
            className="card p-8 relative overflow-hidden transition-all duration-500"
          >
             <div className="flex justify-between items-start mb-6 border-b border-border-primary pb-4">
               <h3 className="text-2xl font-serif opacity-90">Research Findings</h3>
               <button 
                 onClick={() => handleTTS(displayResult)}
                 disabled={isPlaying}
                 className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-accent-primary text-white animate-pulse' : 'bg-bg-tertiary opacity-70 hover:opacity-100'}`}
               >
                 <Volume2 size={20} />
               </button>
             </div>

             {/* Found Images Gallery */}
             {imageChunks.length > 0 && (
                 <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-bg-tertiary rounded-xl">
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

             <div className="prose prose-lg max-w-none prose-p:text-text-secondary prose-li:text-text-secondary">
               <ReactMarkdown
                 components={{
                   img: ({node, ...props}) => (
                     <div className="my-6">
                        <img {...props} className="rounded-xl shadow-lg border border-border-primary max-h-[400px] object-cover mx-auto" alt={props.alt || 'Research Visual'} />
                        {props.alt && <p className="text-center text-sm text-text-muted mt-2 italic">{props.alt}</p>}
                     </div>
                   ),
                   a: ({node, ...props}) => <a {...props} className="text-text-accent hover:underline" />,
                 }}
               >
                 {displayResult}
               </ReactMarkdown>
             </div>

             {/* Feedback Section */}
             <div className="flex justify-end items-center mt-8 pt-4 border-t border-border-primary">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted mr-2">Was this helpful?</span>
                    
                    {/* Voice Feedback Button */}
                    <button 
                        onClick={toggleFeedbackDictation}
                        className={`p-2 rounded-full transition-all relative ${isFeedbackListening ? 'bg-red-500 text-white animate-pulse' : 'bg-bg-tertiary hover:bg-opacity-80'}`}
                        title="Say 'Good' or 'Bad' to rate"
                    >
                        {isFeedbackListening ? <Mic size={16} /> : <MicOff size={16} />}
                        {isFeedbackListening && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Listening...</span>}
                    </button>

                    <button 
                    onClick={() => setFeedback('up')}
                    className={`p-2 rounded-full transition-colors ${feedback === 'up' ? 'bg-green-500 text-white' : 'bg-bg-tertiary hover:bg-opacity-80'}`}
                    >
                    <ThumbsUp size={16} />
                    </button>
                    <button 
                    onClick={() => setFeedback('down')}
                    className={`p-2 rounded-full transition-colors ${feedback === 'down' ? 'bg-red-500 text-white' : 'bg-bg-tertiary hover:bg-opacity-80'}`}
                    >
                    <ThumbsDown size={16} />
                    </button>
                </div>
             </div>

             {/* Grounding Sources */}
             {sortedChunks.length > 0 && (
               <div className="mt-8 pt-6 border-t border-border-primary">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">References & Sources</h4>
                    <select 
                      value={refSort}
                      onChange={(e) => setRefSort(e.target.value as 'default' | 'title')}
                      className="bg-transparent text-xs text-text-muted border border-border-secondary rounded px-2 py-1"
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
                         className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-opacity-80 transition-colors border border-border-secondary group"
                       >
                         <div className="p-2 rounded-md bg-bg-primary opacity-70">
                           {chunk.maps ? <MapPin size={16} /> : <LinkIcon size={16} />}
                         </div>
                         <div className="overflow-hidden">
                           <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                           <p className="text-xs text-text-muted truncate">{item.uri}</p>
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