import { useState } from 'react';
import Layout from './components/Layout';
import ResearchAssistant from './components/ResearchAssistant';
import MediaAnalyzer from './components/MediaAnalyzer';
import LuminaLive from './components/LuminaLive';
import ChatAssistant from './components/ChatAssistant';
import { AppMode } from './types';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.RESEARCH);
  const [accentColor, setAccentColor] = useState('#38bdf8'); // Default eva-glow blue

  const handleThemeChange = (color: string) => {
    if (color) {
      setAccentColor(color);
      document.documentElement.style.setProperty('--eva-glow', color);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.RESEARCH:
        return <ResearchAssistant onThemeChange={handleThemeChange} />;
      case AppMode.MEDIA:
        return <MediaAnalyzer />;
      case AppMode.LIVE:
        return <LuminaLive />;
      default:
        return <ResearchAssistant onThemeChange={handleThemeChange} />;
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode} accentColor={accentColor}>
      {renderContent()}
      <ChatAssistant />
    </Layout>
  );
}

export default App;
