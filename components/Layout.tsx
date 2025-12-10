import React, { ReactNode } from 'react';
import { Microscope, Layers, MessageCircle, Radio } from 'lucide-react';
import { AppMode } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  accentColor: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentMode, setMode, accentColor }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row transition-colors duration-1000" style={{ backgroundColor: accentColor ? `color-mix(in srgb, ${accentColor} 10%, #0f172a)` : '#0f172a' }}>
      {/* Sidebar */}
      <nav className="w-full md:w-20 lg:w-64 flex-shrink-0 bg-black/20 backdrop-blur-xl border-r border-white/5 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-serif font-bold text-white text-lg">L</span>
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight hidden lg:block text-white">Lumina</span>
        </div>

        <div className="flex-1 px-4 space-y-2 py-4">
          <button 
            onClick={() => setMode(AppMode.RESEARCH)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentMode === AppMode.RESEARCH ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Microscope size={20} />
            <span className="hidden lg:block">Research</span>
          </button>
          
          <button 
            onClick={() => setMode(AppMode.MEDIA)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentMode === AppMode.MEDIA ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Layers size={20} />
            <span className="hidden lg:block">Media Lab</span>
          </button>
          
          <button 
            onClick={() => setMode(AppMode.LIVE)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentMode === AppMode.LIVE ? 'bg-indigo-500/20 text-indigo-300 shadow-inner border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Radio size={20} />
            <span className="hidden lg:block">Lumina Live</span>
          </button>
        </div>
        
        <div className="p-6 border-t border-white/5 text-xs text-white/20 hidden lg:block">
          v1.0.0 • Gemini Powered
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        {children}
      </main>
    </div>
  );
};

export default Layout;
