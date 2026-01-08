import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Project } from '../types';
import { getPMAssistance } from '../services/geminiService';

interface AIAssistantProps {
  currentProject?: Project;
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentProject, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Olá. Sou seu Assistente de GP. Posso resumir riscos do projeto, sugerir tarefas ou rascunhar atualizações. Como posso ajudar?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await getPMAssistance(userMsg, currentProject);

    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-red-600 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Bot size={20} />
          <span className="font-semibold">Assistente GP</span>
        </div>
        <button onClick={onClose} className="text-red-200 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 h-96 overflow-y-auto space-y-4 bg-zinc-950/50"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-red-600 text-white' 
                : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-lg p-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-red-500" />
              <span className="text-xs text-zinc-400">Pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-900 border-t border-zinc-800">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pergunte sobre riscos, tarefas ou orçamento..."
            className="w-full bg-zinc-950 text-white text-sm rounded-lg pl-4 pr-10 py-3 border border-zinc-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600"
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 p-1 text-red-500 hover:text-red-400 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
        {currentProject && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500 px-1">
             <Sparkles size={10} className="text-red-400" />
             <span>Contexto: {currentProject.name}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default AIAssistant;