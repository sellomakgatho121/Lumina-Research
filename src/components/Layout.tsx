import React, { ReactNode } from 'react';
import { Microscope, Layers, Radio, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMode } from '../types';
import clsx from 'clsx';
import AnimatedBackground from './ui/AnimatedBackground';

interface LayoutProps {
  children: ReactNode;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  accentColor: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentMode, setMode }) => {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[var(--lumina-bg)] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Animated Particle Background */}
      <AnimatedBackground />

      {/* Global Noise Texture */}
      <div className="noise-bg" />

      {/* Ambient Background Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Main Content - Properly Centered */}
      <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 md:p-12">
        {children}
      </main>

      {/* Floating Dock Navigation - Simplified for Mobile */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-1 md:gap-2 p-2 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50"
        >
          <NavButton
            active={currentMode === AppMode.RESEARCH}
            onClick={() => setMode(AppMode.RESEARCH)}
            icon={<Microscope size={20} />}
            label="Research"
          />
          <NavButton
            active={currentMode === AppMode.MEDIA}
            onClick={() => setMode(AppMode.MEDIA)}
            icon={<Layers size={20} />}
            label="Media"
          />
          <NavButton
            active={currentMode === AppMode.LIVE}
            onClick={() => setMode(AppMode.LIVE)}
            icon={<Radio size={20} />}
            label="Live"
          />

          <div className="w-px h-6 bg-white/10 mx-1 hidden md:block" />

          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
        </motion.div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-300 group min-w-[48px] min-h-[48px] justify-center",
        active ? "text-white" : "text-slate-400 hover:text-white"
      )}
      aria-label={label}
    >
      <div className="relative z-10 flex items-center gap-2">
        {icon}
        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden whitespace-nowrap text-sm font-medium hidden md:block"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 bg-white/10 rounded-xl border border-white/5"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
};

export default Layout;
