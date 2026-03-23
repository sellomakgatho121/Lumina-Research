import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextType {
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isThinking, setIsThinking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  return (
    <AIContext.Provider value={{ isThinking, setIsThinking, statusMessage, setStatusMessage }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
