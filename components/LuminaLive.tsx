import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Radio, Activity, Sparkles, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LuminaSession } from '../services/luminaLive';

const LuminaLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [screenData, setScreenData] = useState<{title: string, content: string} | null>(null);
  const sessionRef = useRef<LuminaSession | null>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
    };
  }, []);

  const toggleSession = async () => {
    if (isActive) {
      if (sessionRef.current) {
        await sessionRef.current.disconnect();
        sessionRef.current = null;
      }
      setIsActive(false);
      setStatus('Ready');
    } else {
      setIsActive(true);
      setStatus('Connecting...');
      
      const session = new LuminaSession(
        (data) => setScreenData(data),
        (s) => setStatus(s)
      );
      
      sessionRef.current = session;
      try {
        await session.connect();
      } catch (e) {
        console.error("Failed to connect", e);
        setStatus("Connection Failed");
        setIsActive(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-6 space-y-8 relative">
       {/* Ambient Background */}
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] transition-all duration-1000 -z-10 ${isActive ? 'bg-indigo-500/20' : 'bg-transparent'}`} />

       {/* Header */}
       <div className="text-center space-y-4 pt-10">
         <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-xs font-medium tracking-widest uppercase text-white/70">Lumina Live AI</span>
         </div>
         <h2 className="text-5xl font-serif text-white/90 tracking-tight">
           Speak with Lumina
         </h2>
         <p className="text-lg text-white/50 max-w-xl mx-auto">
           A conversational research companion. Ask her to find papers, explain concepts, or summarize topics.
         </p>
       </div>

       {/* Main Control Area */}
       <div className="flex flex-col items-center justify-center py-10">
          <div className="relative group">
             {/* Ring Animation */}
             {isActive && (
               <>
                <div className="absolute inset-0 rounded-full border border-indigo-500/50 animate-ping opacity-20" />
                <div className="absolute -inset-4 rounded-full border border-indigo-400/30 animate-pulse opacity-20" />
               </>
             )}
             
             <button
               onClick={toggleSession}
               className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                 isActive 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-500/50 scale-105' 
                  : 'bg-white/10 hover:bg-white/20 border border-white/10'
               }`}
             >
                {isActive ? <Mic size={48} className="text-white" /> : <MicOff size={48} className="text-white/40" />}
             </button>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-white/60 font-mono text-sm">
             <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
             {status}
          </div>
       </div>

       {/* Live Research Display */}
       {screenData && (
         <div className="flex-1 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                   <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                     <Activity size={20} />
                   </div>
                   <h3 className="text-xl font-serif text-white">{screenData.title}</h3>
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none">
                   <ReactMarkdown>{screenData.content}</ReactMarkdown>
                </div>
            </div>
         </div>
       )}

       {!screenData && isActive && (
         <div className="text-center text-white/20 italic mt-10">
            "I'm listening. Ask me to research something..."
         </div>
       )}
    </div>
  );
};

export default LuminaLive;
