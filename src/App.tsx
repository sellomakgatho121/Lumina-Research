import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ResearchAssistant from './components/ResearchAssistant';
import MediaAnalyzer from './components/MediaAnalyzer';
import LuminaLive from './components/LuminaLive';
import ChatAssistant from './components/ChatAssistant';
import LandingPage from './components/landing/LandingPage';
import { AppMode } from './types';

function AppContent() {
  const [mode, setMode] = useState<AppMode>(AppMode.RESEARCH);
  const [accentColor, setAccentColor] = useState('#38bdf8');

  const handleThemeChange = (color: string) => {
    if (color) {
      setAccentColor(color);
      document.documentElement.style.setProperty('--eva-glow', color);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/app/*" 
        element={
          <Layout currentMode={mode} setMode={setMode} accentColor={accentColor}>
            <Routes>
              <Route path="research" element={<ResearchAssistant onThemeChange={handleThemeChange} />} />
              <Route path="media" element={<MediaAnalyzer />} />
              <Route path="live" element={<LuminaLive />} />
              <Route path="*" element={<Navigate to="research" replace />} />
            </Routes>
            <ChatAssistant />
          </Layout>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

