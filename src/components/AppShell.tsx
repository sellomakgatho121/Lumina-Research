import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import ResearchAssistant from './ResearchAssistant';
import MediaAnalyzer from './MediaAnalyzer';
import LuminaLive from './LuminaLive';
import ChatAssistant from './ChatAssistant';
import { AppMode } from '../types';

const AppShell = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RESEARCH);
  const [accentColor, setAccentColor] = useState('#38bdf8');

  const handleThemeChange = (color: string) => {
    if (color) {
      setAccentColor(color);
      document.documentElement.style.setProperty('--eva-glow', color);
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode} accentColor={accentColor}>
      <Routes>
        <Route path="research" element={<ResearchAssistant onThemeChange={handleThemeChange} />} />
        <Route path="media" element={<MediaAnalyzer />} />
        <Route path="live" element={<LuminaLive />} />
        <Route path="*" element={<Navigate to="research" replace />} />
      </Routes>
      <ChatAssistant />
    </Layout>
  );
};

export default AppShell;
