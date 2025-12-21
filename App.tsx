import React, { useState } from 'react';
import Layout from './components/Layout';
import ResearchAssistant from './components/ResearchAssistant';
import MediaAnalyzer from './components/MediaAnalyzer';
import LuminaLive from './components/LuminaLive';
import ChatAssistant from './components/ChatAssistant';
import { AppMode } from './types';

import { useEffect } from 'react';
import ThemeSwitcher from './components/ThemeSwitcher';

type Theme = 'digital' | 'scholar' | 'creative';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RESEARCH);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('lumina-theme') as Theme;
    return savedTheme || 'digital';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('lumina-theme', theme);
  }, [theme]);

  const renderContent = () => {
    switch (mode) {
      case AppMode.RESEARCH:
        return <ResearchAssistant />;
      case AppMode.MEDIA:
        return <MediaAnalyzer />;
      case AppMode.LIVE:
        return <LuminaLive />;
      default:
        return <ResearchAssistant />;
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode}>
      <ThemeSwitcher setTheme={setTheme} />
      <div className="relative z-10 pt-10">
        {renderContent()}
      </div>
      {/* Hide Chat Assistant when in Live mode to avoid clutter/audio conflict */}
      {mode !== AppMode.LIVE && <ChatAssistant />}
    </Layout>
  );
};

export default App;
