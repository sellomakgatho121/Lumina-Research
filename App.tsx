import React, { useState } from 'react';
import Layout from './components/Layout';
import ResearchAssistant from './components/ResearchAssistant';
import MediaAnalyzer from './components/MediaAnalyzer';
import LuminaLive from './components/LuminaLive';
import ChatAssistant from './components/ChatAssistant';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RESEARCH);
  const [accentColor, setAccentColor] = useState<string>('');

  const renderContent = () => {
    switch (mode) {
      case AppMode.RESEARCH:
        return <ResearchAssistant onThemeChange={setAccentColor} />;
      case AppMode.MEDIA:
        return <MediaAnalyzer />;
      case AppMode.LIVE:
        return <LuminaLive />;
      default:
        return <ResearchAssistant onThemeChange={setAccentColor} />;
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode} accentColor={accentColor}>
      <div className="relative z-10 pt-10">
        {renderContent()}
      </div>
      {/* Hide Chat Assistant when in Live mode to avoid clutter/audio conflict */}
      {mode !== AppMode.LIVE && <ChatAssistant />}
    </Layout>
  );
};

export default App;
