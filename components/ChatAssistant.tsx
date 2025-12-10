import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/geminiService';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Convert internal message format to Gemini API format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await sendChatMessage(history, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className={`pointer-events-auto transition-all duration-300 origin-bottom-right transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none absolute'}`}>
        <div className="w-[350px] h-[500px] bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="text-blue-400" size={20} />
              <span className="font-semibold text-white">Gemini Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-white/30 text-sm mt-10">
                Ask me anything about your research...
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/90'}`}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl p-3">
                  <Loader2 className="animate-spin text-white/50" size={16} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 bg-white/5">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-white text-sm focus:outline-none focus:border-white/30"
              />
              <button 
                onClick={handleSend}
                disabled={!input || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-blue-400 disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`mt-4 pointer-events-auto p-4 rounded-full shadow-lg transition-all ${isOpen ? 'bg-red-500/20 text-red-300 rotate-45' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default ChatAssistant;
