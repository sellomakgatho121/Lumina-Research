import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

type Theme = 'digital' | 'scholar' | 'creative';

interface ThemeSwitcherProps {
  setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ setTheme }) => {
  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="flex items-center gap-2 p-1 rounded-full bg-bg-secondary border border-border-primary">
        <button
          onClick={() => setTheme('digital')}
          className="p-2 rounded-full hover:bg-bg-tertiary"
          title="Digital Brain Theme"
        >
          <Moon size={18} />
        </button>
        <button
          onClick={() => setTheme('scholar')}
          className="p-2 rounded-full hover:bg-bg-tertiary"
          title="Scholar's Desk Theme"
        >
          <Sun size={18} />
        </button>
        <button
          onClick={() => setTheme('creative')}
          className="p-2 rounded-full hover:bg-bg-tertiary"
          title="Creative Spark Theme"
        >
          <Sparkles size={18} />
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
