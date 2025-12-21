import React, { ReactNode } from 'react';
import { Microscope, Layers, MessageCircle, Radio } from 'lucide-react';
import { AppMode } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentMode, setMode }) => {
  const getButtonClass = (mode: AppMode) => {
    const baseClasses = 'w-full flex items-center gap-4 px-4 py-3 transition-all rounded-medium';
    if (currentMode === mode) {
      return `${baseClasses} bg-bg-tertiary text-text-primary shadow-inner`;
    }
    return `${baseClasses} text-text-secondary hover:text-text-primary hover:bg-bg-tertiary`;
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <nav className="w-full md:w-20 lg:w-64 flex-shrink-0 bg-bg-secondary backdrop-blur-xl border-r border-border-primary flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-medium bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-medium">
            <span className="font-serif font-bold text-white text-lg">L</span>
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight hidden lg:block text-text-primary">Lumina</span>
        </div>

        <div className="flex-1 px-4 space-y-2 py-4">
          <button 
            onClick={() => setMode(AppMode.RESEARCH)}
            className={getButtonClass(AppMode.RESEARCH)}
          >
            <Microscope size={20} />
            <span className="hidden lg:block">Research</span>
          </button>
          
          <button 
            onClick={() => setMode(AppMode.MEDIA)}
            className={getButtonClass(AppMode.MEDIA)}
          >
            <Layers size={20} />
            <span className="hidden lg:block">Media Lab</span>
          </button>
          
          <button 
            onClick={() => setMode(AppMode.LIVE)}
            className={getButtonClass(AppMode.LIVE)}
          >
            <Radio size={20} />
            <span className="hidden lg:block">Lumina Live</span>
          </button>
        </div>
        
        <div className="p-6 border-t border-border-primary text-xs text-text-muted hidden lg:block">
          v1.0.0 • Gemini Powered
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-tertiary/50 to-transparent pointer-events-none" />
        {children}
      </main>
    </div>
  );
};

export default Layout;
