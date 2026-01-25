import { useState } from 'react';
import { Button } from './src/components/ui/Button';
import { Card } from './src/components/ui/Card';
import { Search, Sparkles, Command, Zap } from 'lucide-react';

function App() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <main className="z-10 w-full max-w-4xl flex flex-col items-center gap-12 animate-pop">

        {/* Header / Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl shadow-xl shadow-blue-100 mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-eva-glow" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-eva-dark">
            Lumina <span className="text-eva-glow">Research</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Advanced intelligence for the modern era.
          </p>
        </div>

        {/* Search Interface */}
        <div className={`w-full max-w-xl transition-all duration-500 ease-out ${searchFocused ? 'scale-105' : 'scale-100'}`}>
          <Card variant="glass" className="p-2 flex items-center gap-2 rounded-full border-2 border-white/50 focus-within:border-eva-glow/50 focus-within:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all">
            <Search className={`w-6 h-6 ml-4 transition-colors ${searchFocused ? 'text-eva-glow' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none text-lg px-4 text-eva-dark placeholder:text-slate-400 h-10"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <Button size="sm" className="rounded-full px-6">
              Search
            </Button>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card variant="ceramic" className="group cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-eva-glow group-hover:text-white transition-colors duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fast Analysis</h3>
            <p className="text-slate-500">Instant insights generated from your data streams.</p>
          </Card>

          <Card variant="ceramic" className="group cursor-pointer" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-eva-glow group-hover:text-white transition-colors duration-300">
              <Command className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Deep Control</h3>
            <p className="text-slate-500">Precise command over your research parameters.</p>
          </Card>

          <Card variant="ceramic" className="group cursor-pointer" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-eva-glow group-hover:text-white transition-colors duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Enhanced</h3>
            <p className="text-slate-500">Powered by next-generation neural networks.</p>
          </Card>
        </div>

      </main>
    </div>
  );
}

export default App;
