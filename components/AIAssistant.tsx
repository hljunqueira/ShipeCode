import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Plus } from 'lucide-react';
import { Project } from '../types';
import { getPMAssistance } from '../services/geminiService';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface AIAssistantProps {
  currentProject?: Project;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentProject, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carrega ou cria sessão ao abrir
  useEffect(() => {
    if (isOpen && currentUser) {
      initializeSession();
    }
  }, [isOpen, currentProject?.id, currentUser]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeSession = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // 1. Tenta achar sessão existente recente para este projeto
      let query = supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (currentProject) {
        query = query.eq('project_id', currentProject.id);
      } else {
        query = query.is('project_id', null);
      }

      const { data: existingSessions } = await query;

      if (existingSessions && existingSessions.length > 0) {
        const sid = existingSessions[0].id;
        setSessionId(sid);
        await fetchMessages(sid);
      } else {
        await createNewSession();
      }
    } catch (error) {
      console.error("Erro ao iniciar sessão", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({
        user_id: currentUser.id,
        project_id: currentProject?.id || null,
        title: currentProject ? `Chat: ${currentProject.name}` : 'Novo Chat'
      })
      .select()
      .single();

    if (data) {
      setSessionId(data.id);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Olá. Sou seu Assistente de GP. Posso resumir riscos do projeto, sugerir tarefas ou rascunhar atualizações. Como posso ajudar?',
        created_at: new Date().toISOString()
      }]);
    }
  };

  const fetchMessages = async (sid: string) => {
    const { data } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sid)
      .order('created_at', { ascending: true });

    if (data) {
      // Map DB types to component types
      const mapped: ChatMessage[] = data.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        created_at: m.created_at
      }));
      setMessages(mapped);
    }
  };

  const saveMessage = async (sid: string, role: 'user' | 'assistant', content: string) => {
    await supabase.from('ai_chat_messages').insert({
      session_id: sid,
      role,
      content
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !sessionId) return;

    const userMsg = query;
    setQuery('');

    // UI Optimistic
    setMessages(prev => [...prev, {
      id: 'temp-user',
      role: 'user',
      content: userMsg,
      created_at: new Date().toISOString()
    }]);

    setLoading(true);

    try {
      // 1. Save User Message
      await saveMessage(sessionId, 'user', userMsg);

      // 2. Get AI Response
      const response = await getPMAssistance(userMsg, currentProject);

      // 3. Save AI Message
      await saveMessage(sessionId, 'assistant', response);

      // UI Update
      setMessages(prev => {
        const clean = prev.filter(m => m.id !== 'temp-user');
        return [...clean,
        { id: `real-user-${Date.now()}`, role: 'user', content: userMsg, created_at: new Date().toISOString() },
        { id: `real-ai-${Date.now()}`, role: 'assistant', content: response, created_at: new Date().toISOString() }
        ];
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        content: 'Desculpe, tive um erro ao processar sua mensagem.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewSession();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-red-600 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Bot size={20} />
          <div className="flex flex-col">
            <span className="font-semibold leading-none">Assistente GP</span>
            {currentProject && <span className="text-[10px] text-red-200 opacity-80">{currentProject.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button title="Novo Chat" onClick={handleNewChat} className="p-1.5 text-red-200 hover:text-white hover:bg-red-500 rounded-lg transition-colors">
            <Plus size={18} />
          </button>
          <button onClick={onClose} className="p-1.5 text-red-200 hover:text-white hover:bg-red-500 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 h-96 overflow-y-auto space-y-4 bg-zinc-950/50"
      >
        {messages.length === 0 && !loading && (
          <div className="text-center text-zinc-500 text-sm py-10">
            <Bot size={32} className="mx-auto mb-2 opacity-20" />
            <p>Inicie uma nova conversa</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
              }`}>
              {msg.content}
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