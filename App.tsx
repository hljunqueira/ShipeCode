
import React, { useState, useRef, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, Users, Settings, Zap, Menu, Plus, Bot, Bell, 
  Activity, TrendingUp, Calendar, ArrowUpRight, DollarSign, ArrowLeft, ChevronRight, Layers, LogOut,
  Target, Briefcase, Mail, Phone, MapPin, Github, Linkedin, Award, Shield, Save, RefreshCw, Smartphone, Monitor,
  FilePlus, CheckCircle2, X, Sparkles, Cpu, Clock, Calculator, Globe, Filter, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { MOCK_LEADS, MOCK_ORG, MOCK_PROJECTS, MOCK_USERS } from './constants';
import { Project, ProjectStatus, Lead, User, Organization, TaskStatus } from './types';
import ProjectDetail from './components/ProjectDetail';
import AIAssistant from './components/AIAssistant';
import { getProjectSuggestions } from './services/geminiService';

// --- Components Helpers ---

const SimpleBarChart = () => {
  const data = [40, 65, 45, 80, 55, 90, 75];
  return (
    <div className="flex items-end gap-1 h-12 mt-4 opacity-80">
      {data.map((h, i) => (
        <div key={i} className="flex-1 bg-red-900/30 rounded-sm relative group">
           <div 
             className="absolute bottom-0 w-full bg-red-600 rounded-sm transition-all duration-500 group-hover:bg-red-500"
             style={{ height: `${h}%` }}
           ></div>
        </div>
      ))}
    </div>
  )
}

// --- Modals ---

const AddLeadModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (lead: Lead) => void }) => {
  const [form, setForm] = useState({ clientName: '', projectName: '', budget: '', probability: '50' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: `l-${Date.now()}`,
      clientName: form.clientName,
      projectName: form.projectName,
      budget: parseFloat(form.budget) || 0,
      probability: parseInt(form.probability),
      status: 'CONTACTED',
      source: 'MANUAL',
      createdAt: new Date().toISOString()
    };
    onAdd(newLead);
    onClose();
    setForm({ clientName: '', projectName: '', budget: '', probability: '50' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
         <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
         
         <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
               <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Novo Lead Manual</h2>
              <p className="text-xs text-zinc-500">Inserção direta no pipeline.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase">Cliente</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none" 
                placeholder="Ex: Tech Solutions"
                value={form.clientName}
                onChange={e => setForm({...form, clientName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase">Projeto</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none" 
                placeholder="Ex: App Delivery"
                value={form.projectName}
                onChange={e => setForm({...form, projectName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase">Orçamento (Est.)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-500 text-sm">R$</span>
                <input 
                  type="number"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white focus:border-amber-500 outline-none" 
                  placeholder="0.00"
                  value={form.budget}
                  onChange={e => setForm({...form, budget: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between">
                 <label className="text-xs font-mono text-zinc-500 uppercase">Probabilidade Inicial</label>
                 <span className="text-xs font-bold text-amber-500">{form.probability}%</span>
               </div>
               <input 
                 type="range" min="0" max="100" step="5"
                 className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                 value={form.probability}
                 onChange={e => setForm({...form, probability: e.target.value})}
               />
            </div>

            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-lg mt-2 transition-colors">
               Cadastrar Lead
            </button>
         </form>
      </div>
    </div>
  );
};

const IncomingLeadsModal = ({ isOpen, onClose, leads, onAction }: { isOpen: boolean, onClose: () => void, leads: Lead[], onAction: (lead: Lead, approved: boolean) => void }) => {
  if (!isOpen) return null;

  const pendingLeads = leads.filter(l => l.status === 'NEW');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
       <div className="w-full max-w-2xl h-[600px] flex flex-col relative">
          <button onClick={onClose} className="absolute -top-12 right-0 text-zinc-400 hover:text-white flex items-center gap-2">
             <span className="text-sm">FECHAR</span> <X size={24} />
          </button>

          <div className="flex-1 flex gap-6 overflow-x-auto snap-x snap-mandatory px-20 items-center hide-scrollbar pb-8">
             {pendingLeads.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                   <CheckCircle2 size={48} className="text-zinc-700" />
                   <p>Nenhum lead pendente de campanhas.</p>
                </div>
             ) : (
               pendingLeads.map((lead) => (
                 <div key={lead.id} className="snap-center shrink-0 w-[320px] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between h-[450px]">
                    
                    <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                       {lead.source?.replace('CAMPAIGN_', '') || 'AUTO'}
                    </div>

                    <div className="mt-4">
                       <h3 className="text-2xl font-bold text-white leading-tight mb-2">{lead.clientName}</h3>
                       <p className="text-zinc-400 text-sm mb-6">{lead.projectName}</p>
                       
                       <div className="space-y-4">
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                             <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Orçamento Declarado</p>
                             <p className="text-xl font-mono text-white">R$ {lead.budget.toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                             <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Origem</p>
                             <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                <Globe size={14} />
                                {lead.source}
                             </div>
                          </div>
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                             <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Data de Entrada</p>
                             <p className="text-zinc-300 text-sm">{new Date(lead.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                       <button 
                         onClick={() => onAction(lead, false)}
                         className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-red-900/20 text-zinc-500 hover:text-red-500 border border-zinc-800 hover:border-red-500/50 py-3 rounded-xl transition-all font-bold text-sm"
                       >
                          <ThumbsDown size={16} /> REJEITAR
                       </button>
                       <button 
                         onClick={() => onAction(lead, true)}
                         className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl transition-all font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                       >
                          <ThumbsUp size={16} /> APROVAR
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>

          <div className="text-center">
             <h2 className="text-2xl font-bold text-white">Fila de Aprovação</h2>
             <p className="text-zinc-500">Analise leads automáticos vindos de campanhas e integrações.</p>
          </div>
       </div>
    </div>
  )
}

// --- Dashboard Component (Immersive Hub) ---
const Dashboard = ({ projects, leads }: { projects: Project[], leads: Lead[] }) => {
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.DEPLOYED);
  const totalRevenue = projects.reduce((sum, p) => sum + p.financials.filter(f => f.type === 'REVENUE').reduce((s, i) => s + i.amount, 0), 0);
  
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-red-500/30 flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>

      {/* Immersive Header (Minimalist) */}
      <div className="w-full p-8 z-20 flex justify-between items-start">
        {/* Brand */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                S
             </div>
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{MOCK_ORG.name} OS</h1>
                <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">v2.4.0 • Stable</p>
             </div>
          </div>
        </div>

        {/* User / Notifications */}
        <div className="flex items-center gap-6">
           <button className="relative group">
              <div className="p-3 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-all">
                <Bell size={20} />
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050505]"></span>
           </button>
           
           <div className="flex items-center gap-4 pl-6 border-l border-zinc-900">
              <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-white">{MOCK_USERS[0].name}</p>
                 <p className="text-xs text-zinc-500 font-mono">{MOCK_USERS[0].role}</p>
              </div>
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-zinc-700 to-zinc-900 cursor-pointer hover:from-red-600 hover:to-red-900 transition-all duration-500">
                <img src={MOCK_USERS[0].avatarUrl} alt="User" className="w-full h-full object-cover rounded-full border-2 border-[#050505]" />
              </div>
           </div>
        </div>
      </div>
      
      {/* Central Control Grid */}
      <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 pb-20 z-10">
        
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">Bem-vindo à Sala de Controle.</h2>
          <p className="text-zinc-500 text-lg">Selecione um módulo operacional para iniciar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          
          {/* Leads Card (Now First) */}
          <Link to="/leads" className="group relative bg-zinc-900/40 backdrop-blur-sm p-8 rounded-3xl border border-zinc-800 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col justify-between h-80 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             
             <div className="relative z-10 flex justify-between items-start">
               <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 ring-1 ring-inset ring-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                 <Zap size={28} />
               </div>
               <ArrowUpRight className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
             </div>

             <div className="relative z-10 mt-auto">
                <p className="text-3xl font-mono text-white font-bold mb-1">
                  <span className="text-lg text-zinc-500 mr-1 font-normal">R$</span>
                  {leads.reduce((s, l) => s + l.budget, 0).toLocaleString('pt-BR', { notation: 'compact' })}
                </p>
                <p className="text-zinc-400 font-medium">Pipeline de Vendas</p>
                <SimpleBarChart />
             </div>
          </Link>

          {/* Projects Card (Now Second) */}
          <Link to="/projects" className="group relative bg-zinc-900/40 backdrop-blur-sm p-8 rounded-3xl border border-zinc-800 hover:border-red-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] flex flex-col justify-between h-80 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             
             <div className="relative z-10 flex justify-between items-start">
               <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 ring-1 ring-inset ring-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                 <FolderKanban size={28} />
               </div>
               <ArrowUpRight className="text-zinc-600 group-hover:text-red-500 transition-colors" />
             </div>

             <div className="relative z-10 mt-auto">
                <p className="text-3xl font-mono text-white font-bold mb-1">{activeProjects.length}</p>
                <p className="text-zinc-400 font-medium">Projetos Ativos</p>
                <div className="w-full bg-zinc-800 h-1 mt-4 rounded-full overflow-hidden">
                   <div className="bg-red-600 h-full w-2/3"></div>
                </div>
             </div>
          </Link>

          {/* Team Card */}
          <Link to="/team" className="group relative bg-zinc-900/40 backdrop-blur-sm p-8 rounded-3xl border border-zinc-800 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(8,145,178,0.15)] flex flex-col justify-between h-80 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             
             <div className="relative z-10 flex justify-between items-start">
               <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500 ring-1 ring-inset ring-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                 <Users size={28} />
               </div>
               <ArrowUpRight className="text-zinc-600 group-hover:text-cyan-500 transition-colors" />
             </div>

             <div className="relative z-10 mt-auto">
                <div className="flex -space-x-3 mb-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center text-xs text-zinc-400">
                        <Users size={16} />
                     </div>
                   ))}
                </div>
                <p className="text-zinc-400 font-medium">Gestão de Equipe</p>
             </div>
          </Link>

          {/* Finance/Settings Card */}
          <Link to="/settings" className="group relative bg-zinc-900/40 backdrop-blur-sm p-8 rounded-3xl border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col justify-between h-80 overflow-hidden cursor-pointer">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             
             <div className="relative z-10 flex justify-between items-start">
               <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 ring-1 ring-inset ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                 <Shield size={28} />
               </div>
               <div className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">ADMIN</div>
             </div>

             <div className="relative z-10 mt-auto">
                <p className="text-3xl font-mono text-white font-bold mb-1">
                   <span className="text-lg text-zinc-500 mr-1 font-normal">R$</span>
                   {totalRevenue.toLocaleString('pt-BR', { notation: 'compact' })}
                </p>
                <p className="text-zinc-400 font-medium">Financeiro & Config</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                   <Settings size={12} /> Configurações da Org
                </div>
             </div>
          </Link>

        </div>
      </div>
      
      {/* Footer Status */}
      <div className="w-full p-6 flex justify-between items-center text-xs text-zinc-600 font-mono border-t border-zinc-900/50">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            SYSTEM OPERATIONAL
         </div>
         <div>
            LATENCY: 12ms
         </div>
      </div>

    </div>
  );
};

// --- Helper for Draggable Scroll ---
const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add('cursor-grabbing');
      slider.classList.remove('cursor-grab');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    };

    const onMouseUp = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast speed multiplier
      slider.scrollLeft = scrollLeft - walk;
    };

    const onWheel = (e: WheelEvent) => {
      // Optional: keep wheel horizontal scrolling
      if (e.deltaY === 0) return;
      slider.scrollLeft += e.deltaY;
    }

    slider.addEventListener('mousedown', onMouseDown);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('mousemove', onMouseMove);
    slider.addEventListener('wheel', onWheel);

    // Initial cursor style
    slider.classList.add('cursor-grab');

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('mousemove', onMouseMove);
      slider.removeEventListener('wheel', onWheel);
    };
  }, []);

  return ref;
};

// --- Project Timeline View (Immersive) ---
const ProjectTimeline = ({ projects, onSelect }: { projects: Project[], onSelect: (id: string) => void }) => {
  const scrollRef = useDraggableScroll();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Immersive Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-600 transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Timeline de Projetos <span className="text-zinc-600 text-lg font-normal">/ 2023-2024</span>
          </h1>
        </div>
        <button 
          onClick={() => navigate('/projects/new')}
          className="pointer-events-auto bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:scale-105"
        >
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {/* Timeline Stream - COMPACT CARDS */}
      <div ref={scrollRef} className="flex-1 flex items-center overflow-x-auto px-20 gap-8 hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing">
        <div className="fixed top-1/2 left-0 w-full h-[1px] bg-zinc-800 z-0 pointer-events-none"></div>
        {projects.map((project, index) => {
           const isEven = index % 2 === 0;
           return (
             <div key={project.id} onClick={() => onSelect(project.id)} className={`snap-center shrink-0 relative w-[240px] group cursor-pointer perspective-1000 ${isEven ? '-translate-y-14' : 'translate-y-14'}`}>
               
               {/* Connector Line (Closer to center) */}
               <div className={`absolute left-1/2 w-[1px] h-14 bg-zinc-800 group-hover:bg-red-600/50 transition-colors z-0 ${isEven ? 'top-full' : 'bottom-full'}`}></div>
               
               {/* Node on Line */}
               <div className={`fixed top-1/2 ml-[119px] w-2.5 h-2.5 rounded-full z-0 transition-all duration-500 border-2 border-[#050505] ${project.status === 'BUILD' ? 'bg-red-500 shadow-[0_0_10px_rgba(220,38,38,1)]' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}></div>

               {/* Compact Card */}
               <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-4 transition-all duration-500 transform group-hover:scale-105 group-hover:border-red-500/30 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">
                 
                 {/* Top Meta */}
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                       15 DEZ
                    </span>
                    <span className={`w-2 h-2 rounded-full ${project.status === 'BUILD' ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                 </div>

                 {/* Main Content */}
                 <h3 className="text-base font-bold text-white leading-tight mb-1 group-hover:text-red-500 transition-colors">{project.name}</h3>
                 <p className="text-[11px] text-zinc-400 mb-3">{project.clientName}</p>
                 
                 {/* Footer Status */}
                 <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${project.status === 'BUILD' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                      {project.status}
                    </span>
                    <ArrowUpRight size={12} className="text-zinc-600 group-hover:text-white transition-colors" />
                 </div>
               </div>
             </div>
           )
        })}
        <div className="w-20 shrink-0"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/5 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}

// --- New Project View (Form) ---
const NewProjectView = ({ leads, users, onCreate }: { leads: Lead[], users: User[], onCreate: (p: Project) => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    description: '',
    leadId: '',
    budget: '',
    teamIds: [] as string[]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    architecture?: string;
    estimatedBudget?: number;
    estimatedTimeline?: string;
    reasoning?: string;
  } | null>(null);

  const handleLeadSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    const lead = leads.find(l => l.id === leadId);
    
    if (lead) {
      setFormData(prev => ({
        ...prev,
        leadId,
        name: lead.projectName,
        clientName: lead.clientName,
        budget: lead.budget.toString(),
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '' }));
    }
  };

  const toggleTeamMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(userId)
        ? prev.teamIds.filter(id => id !== userId)
        : [...prev.teamIds, userId]
    }));
  };

  const handleAiAnalysis = async () => {
    if (!formData.description && !formData.name) return;
    setIsGenerating(true);
    const suggestions = await getProjectSuggestions(
      formData.name || 'Projeto sem nome', 
      formData.clientName || 'Cliente Indefinido',
      formData.description || 'Sem descrição'
    );
    if (suggestions) {
      setAiSuggestions(suggestions);
    }
    setIsGenerating(false);
  };

  const applySuggestions = () => {
    if (!aiSuggestions) return;
    
    setFormData(prev => ({
      ...prev,
      budget: aiSuggestions.estimatedBudget ? aiSuggestions.estimatedBudget.toString() : prev.budget,
      description: prev.description + 
        `\n\n## 🏗️ Arquitetura Sugerida (IA)\n${aiSuggestions.architecture}\n\n## ⏱️ Estimativa\n${aiSuggestions.estimatedTimeline}\n\n## 💡 Racional\n${aiSuggestions.reasoning}`
    }));
    setAiSuggestions(null); // Clear after applying to avoid clutter
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: formData.name,
      clientName: formData.clientName,
      status: ProjectStatus.DISCOVERY,
      description: formData.description || 'Novo projeto inicializado.',
      leadId: formData.leadId || undefined,
      teamIds: formData.teamIds,
      financials: formData.budget ? [{
        id: `f-${Date.now()}`,
        description: 'Orçamento Inicial / Depósito',
        amount: parseFloat(formData.budget),
        type: 'REVENUE',
        category: 'FIXED_FEE'
      }] : [],
      tasks: [
        { id: `t-${Date.now()}-1`, title: 'Kickoff Meeting', status: TaskStatus.TODO },
        { id: `t-${Date.now()}-2`, title: 'Configuração do Ambiente', status: TaskStatus.TODO }
      ]
    };

    onCreate(newProject);
    navigate(`/projects/${newProject.id}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <button onClick={() => navigate('/projects')} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:border-red-600">
                 <X size={18} />
              </button>
              <div>
                 <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                   <FilePlus className="text-red-500" /> Inicializar Projeto
                 </h1>
                 <p className="text-zinc-500 text-sm font-mono mt-1">PROTOCOL: NEW_PROJECT_CREATION</p>
              </div>
           </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
           {/* Decorative Top Line */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-zinc-900"></div>

           {/* Section 1: Source */}
           <div className="space-y-4">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                 1. Origem & Identificação
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500">Importar do Lead (Opcional)</label>
                    <div className="relative">
                      <select 
                        value={formData.leadId} 
                        onChange={handleLeadSelect}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white appearance-none focus:ring-1 focus:ring-red-500 outline-none"
                      >
                         <option value="">-- Selecione um Lead --</option>
                         {leads.filter(l => l.status === 'CONVERTED' || l.status === 'QUALIFIED').map(lead => (
                           <option key={lead.id} value={lead.id}>{lead.clientName} - {lead.projectName}</option>
                         ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-3.5 text-zinc-600 pointer-events-none" size={16} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500">Nome do Cliente *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.clientName}
                      onChange={(e) => setFormData(p => ({...p, clientName: e.target.value}))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-500 outline-none"
                      placeholder="Ex: ACME Corp"
                    />
                 </div>
                 <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-mono text-zinc-500">Nome do Projeto *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-500 outline-none font-bold text-lg"
                      placeholder="Ex: Plataforma SaaS v1.0"
                    />
                 </div>
                 <div className="col-span-1 md:col-span-2 space-y-2">
                    <div className="flex justify-between items-end">
                       <label className="text-xs font-mono text-zinc-500">Briefing / Descrição</label>
                       <button
                         type="button"
                         onClick={handleAiAnalysis}
                         disabled={isGenerating || (!formData.description && !formData.name)}
                         className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold transition-colors disabled:opacity-50"
                       >
                         {isGenerating ? <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={12} />}
                         {isGenerating ? 'ANALISANDO...' : 'SUGERIR ARQUITETURA'}
                       </button>
                    </div>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({...p, description: e.target.value}))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-500 outline-none min-h-[100px]"
                      placeholder="Descreva o escopo inicial..."
                    />
                 </div>

                 {/* AI Suggestions Card */}
                 {aiSuggestions && (
                   <div className="col-span-1 md:col-span-2 bg-zinc-900 border border-red-900/50 rounded-xl p-4 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-red-500">
                           <Cpu size={18} />
                           <h3 className="font-bold text-sm uppercase">Análise Tática IA</h3>
                        </div>
                        <button type="button" onClick={() => setAiSuggestions(null)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                         <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><Clock size={10} /> Prazo</p>
                            <p className="text-white font-mono text-sm">{aiSuggestions.estimatedTimeline}</p>
                         </div>
                         <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><DollarSign size={10} /> Orçamento</p>
                            <p className="text-white font-mono text-sm">R$ {aiSuggestions.estimatedBudget?.toLocaleString('pt-BR')}</p>
                         </div>
                      </div>

                      <div className="space-y-2 mb-4">
                         <p className="text-[10px] text-zinc-500 uppercase font-bold">Stack Recomendada</p>
                         <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{aiSuggestions.architecture}</p>
                      </div>

                      <button 
                        type="button" 
                        onClick={applySuggestions}
                        className="w-full py-2 bg-red-900/20 border border-red-900/50 text-red-200 text-xs font-bold rounded hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
                      >
                         <Save size={14} /> APLICAR SUGESTÕES AO PROJETO
                      </button>
                   </div>
                 )}
              </div>
           </div>

           {/* Section 2: Team */}
           <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                 2. Squad Inicial
              </h2>
              <div className="flex flex-wrap gap-3">
                 {users.map(user => (
                   <button
                     type="button"
                     key={user.id}
                     onClick={() => toggleTeamMember(user.id)}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                       formData.teamIds.includes(user.id) 
                         ? 'bg-red-900/30 border-red-500 text-white' 
                         : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                     }`}
                   >
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium">{user.name}</span>
                      {formData.teamIds.includes(user.id) && <CheckCircle2 size={12} className="text-red-500" />}
                   </button>
                 ))}
              </div>
           </div>

           {/* Section 3: Finance */}
           <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                 3. Financeiro
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500">Orçamento Estimado (R$)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-3.5 text-zinc-500" size={16} />
                       <input 
                         type="number" 
                         value={formData.budget}
                         onChange={(e) => setFormData(p => ({...p, budget: e.target.value}))}
                         className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-red-500 outline-none"
                         placeholder="0,00"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Submit */}
           <div className="pt-6 border-t border-zinc-800 flex justify-end">
              <button 
                type="submit"
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all flex items-center gap-2"
              >
                 <Activity size={18} /> INICIAR PROJETO
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

// --- Leads Immersive View ---
const LeadsView = ({ leads, onAdd, onUpdate }: { leads: Lead[], onAdd: (l: Lead) => void, onUpdate: (l: Lead) => void }) => {
  const scrollRef = useDraggableScroll();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIncomingModal, setShowIncomingModal] = useState(false);

  const pendingCount = leads.filter(l => l.status === 'NEW').length;

  const handleIncomingAction = (lead: Lead, approved: boolean) => {
    const updatedLead: Lead = {
       ...lead,
       status: approved ? 'QUALIFIED' : 'LOST'
    };
    onUpdate(updatedLead);
  };

  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">
      
      {/* Modals */}
      <AddLeadModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={onAdd} />
      <IncomingLeadsModal 
        isOpen={showIncomingModal} 
        onClose={() => setShowIncomingModal(false)} 
        leads={leads} 
        onAction={handleIncomingAction} 
      />

      {/* Immersive Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-amber-500 transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Radar de Leads <span className="text-zinc-600 text-lg font-normal">/ Pipeline</span>
          </h1>
        </div>
        <div className="flex gap-4 pointer-events-auto">
           {pendingCount > 0 && (
             <button 
               onClick={() => setShowIncomingModal(true)}
               className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all animate-pulse"
             >
                <Filter size={16} /> Revisar Pendentes ({pendingCount})
             </button>
           )}
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105"
           >
             <Plus size={16} /> Adicionar Lead
           </button>
        </div>
      </div>

      {/* Leads Stream - Compact Timeline-style cards */}
      <div ref={scrollRef} className="flex-1 flex items-center overflow-x-auto px-20 gap-8 hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing">
        <div className="fixed top-1/2 left-0 w-full h-[1px] bg-zinc-800 z-0 pointer-events-none"></div>
        {leads.filter(l => l.status !== 'NEW' && l.status !== 'LOST').map((lead, index) => {
           const isEven = index % 2 === 0;
           const isHot = lead.probability >= 70;
           const isConverted = lead.status === 'CONVERTED';

           return (
             <div key={lead.id} className={`snap-center shrink-0 relative w-[240px] group cursor-pointer perspective-1000 ${isEven ? '-translate-y-14' : 'translate-y-14'}`}>
               
               {/* Connector Line */}
               <div className={`absolute left-1/2 w-[1px] h-14 bg-zinc-800 group-hover:bg-amber-500/50 transition-colors z-0 ${isEven ? 'top-full' : 'bottom-full'}`}></div>
               
               {/* Node on Line */}
               <div className={`fixed top-1/2 ml-[119px] w-2.5 h-2.5 rounded-full z-0 transition-all duration-500 border-2 border-[#050505] 
                 ${isConverted ? 'bg-emerald-500' : isHot ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]' : 'bg-zinc-700 group-hover:bg-amber-500'}`}>
               </div>

               {/* Compact Card */}
               <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-4 transition-all duration-500 transform group-hover:scale-105 group-hover:border-amber-500/30 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">
                 
                 {/* Top Meta */}
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                       {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}).toUpperCase() : 'N/A'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isConverted ? 'bg-emerald-500' : isHot ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                 </div>

                 {/* Main Content */}
                 <h3 className="text-base font-bold text-white leading-tight mb-1 group-hover:text-amber-500 transition-colors">{lead.clientName}</h3>
                 <p className="text-[11px] text-zinc-400 mb-3 truncate">{lead.projectName}</p>
                 
                 {/* Footer Status */}
                 <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1.5">
                       <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border 
                         ${isConverted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                           isHot ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                           'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                         {lead.status}
                       </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-zinc-500 font-mono">
                          {lead.probability}%
                       </p>
                    </div>
                 </div>
               </div>
             </div>
           )
        })}
        <div className="w-20 shrink-0"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/5 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

// --- Team Immersive View ---
const TeamView = ({ users }: { users: User[] }) => {
  const scrollRef = useDraggableScroll();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Immersive Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-cyan-500 transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Rede da Equipe <span className="text-zinc-600 text-lg font-normal">/ Talents</span>
          </h1>
        </div>
        <button className="pointer-events-auto bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all hover:scale-105">
          <Plus size={16} /> Convidar Membro
        </button>
      </div>

      {/* Team Stream - Compact Tag Cards to match Projects */}
      <div ref={scrollRef} className="flex-1 flex items-center overflow-x-auto px-40 gap-8 hide-scrollbar cursor-grab active:cursor-grabbing">
        <div className="fixed top-1/2 left-0 w-full h-[1px] bg-zinc-800 z-0 pointer-events-none"></div>
        {users.map((user, index) => {
           // Team nodes are centered on the line
           const isEven = index % 2 === 0;
           return (
             <div key={user.id} className={`snap-center shrink-0 relative w-[240px] group cursor-pointer perspective-1000 ${isEven ? '-translate-y-14' : 'translate-y-14'}`}>
               
               {/* Connector Line (Closer to center) */}
               <div className={`absolute left-1/2 w-[1px] h-14 bg-zinc-800 group-hover:bg-cyan-500/50 transition-colors z-0 ${isEven ? 'top-full' : 'bottom-full'}`}></div>
               
               {/* Node on Line */}
               <div className="fixed top-1/2 ml-[119px] w-2.5 h-2.5 rounded-full z-0 transition-all duration-500 border-2 border-[#050505] bg-zinc-700 group-hover:bg-cyan-500 shadow-sm"></div>
               
               {/* Card Container - Compact */}
               <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-4 transition-all duration-500 transform group-hover:scale-105 group-hover:border-cyan-500/30 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">
                  
                  <div className="flex items-center gap-4 mb-3">
                     <div className="w-10 h-10 rounded-full border-2 border-zinc-800 overflow-hidden group-hover:border-cyan-500 transition-colors">
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <h3 className="text-sm font-bold text-white mb-0.5 leading-none">{user.name}</h3>
                       <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Online</span>
                       </div>
                     </div>
                  </div>

                  <div className="mb-4">
                     <span className="inline-block px-2 py-0.5 rounded bg-cyan-950/30 border border-cyan-900 text-cyan-400 text-[10px] font-bold tracking-wide">
                        {user.role}
                     </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                     <div className="flex gap-2">
                        <Github size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                        <Linkedin size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                        <Mail size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                     </div>
                     <div className="text-[10px] font-mono text-zinc-600">
                        ID: {user.id}
                     </div>
                  </div>
               </div>
             </div>
           )
        })}
        <div className="w-40 shrink-0"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/5 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

// --- Settings View ---
const SettingsView = ({ org }: { org: Organization }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [orgName, setOrgName] = useState(org.name);

  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Monitor size={18} /> Identidade da Organização
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Nome da Empresa</label>
                      <input 
                        type="text" 
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Logo URL</label>
                      <input 
                        type="text" 
                        disabled
                        value="https://cdn.brand/logo.png"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-500 cursor-not-allowed"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Cor Primária</label>
                      <div className="flex gap-3">
                         {['#dc2626', '#2563eb', '#16a34a', '#d97706'].map(color => (
                            <div key={color} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-transparent hover:border-white transition-all" style={{ backgroundColor: color }}></div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'finance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <DollarSign size={18} /> Configurações Financeiras
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Moeda Padrão</label>
                      <select className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none">
                         <option>BRL (R$)</option>
                         <option>USD ($)</option>
                         <option>EUR (€)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Imposto Padrão (%)</label>
                      <input 
                        type="number" 
                        defaultValue={org.settings.taxRate * 100}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                   </div>
                </div>
             </div>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Activity size={18} /> Integridade do Sistema
                </h2>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                      <div>
                        <p className="text-sm font-bold text-white">Cache do Sistema</p>
                        <p className="text-xs text-zinc-500">Limpar cache pode resolver problemas de interface.</p>
                      </div>
                      <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                        <RefreshCw size={14} /> Limpar
                      </button>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                      <div>
                        <p className="text-sm font-bold text-white">Versão da API</p>
                        <p className="text-xs text-zinc-500">v2.4.0 (Stable Channel)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-emerald-500">ONLINE</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
       <div className="w-full p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur sticky top-0 z-30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500 transition-all group">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <h1 className="text-xl font-bold text-white">Configurações <span className="text-zinc-600 font-normal">/ {org.name}</span></h1>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
             <Save size={16} /> Salvar Alterações
          </button>
       </div>

       <div className="max-w-6xl mx-auto p-8 flex flex-col md:flex-row gap-12">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
             <button 
               onClick={() => setActiveTab('general')}
               className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
             >
                <Monitor size={16} /> Geral
             </button>
             <button 
               onClick={() => setActiveTab('finance')}
               className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'finance' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
             >
                <DollarSign size={16} /> Financeiro
             </button>
             <button 
               onClick={() => setActiveTab('system')}
               className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'system' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
             >
                <Activity size={16} /> Sistema
             </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-[500px]">
             {renderContent()}
          </div>
       </div>
    </div>
  );
};

const ProjectDetailRoute = ({ projects, onUpdateProject }: { projects: Project[], onUpdateProject: (p: Project) => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);

  if (!project) return <Navigate to="/projects" />;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 p-6 md:p-12 overflow-y-auto">
       <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate('/projects')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-8 group transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Voltar para Timeline
          </button>
          
          <div className="mb-10">
             <div className="flex items-center gap-4 mb-2">
               <h1 className="text-4xl font-bold text-white tracking-tight">{project.name}</h1>
               <span className={`px-3 py-1 rounded-full text-xs font-bold border ${project.status === 'BUILD' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                  {project.status}
               </span>
             </div>
             <p className="text-zinc-500 text-lg max-w-2xl">{project.clientName} • {project.description}</p>
          </div>

          <ProjectDetail project={project} onUpdateProject={onUpdateProject} />
       </div>
    </div>
  );
};

const CurrentProjectAIAssistantWrapper = ({ isOpen, onClose, projects }: { isOpen: boolean, onClose: () => void, projects: Project[] }) => {
  const location = useLocation();
  const match = location.pathname.match(/\/projects\/([^/]+)/);
  const projectId = match ? match[1] : null;
  const currentProject = projectId ? projects.find(p => p.id === projectId) : undefined;

  return (
    <AIAssistant 
      currentProject={currentProject} 
      isOpen={isOpen} 
      onClose={onClose} 
    />
  );
};

const App = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads(prev => [...prev, newLead]);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  return (
    <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} leads={leads} />} />
          <Route path="/projects" element={<ProjectTimeline projects={projects} onSelect={(id) => window.location.hash = `#/projects/${id}`} />} />
          <Route path="/projects/new" element={<NewProjectView leads={leads} users={MOCK_USERS} onCreate={handleCreateProject} />} />
          <Route path="/projects/:id" element={<ProjectDetailRoute projects={projects} onUpdateProject={handleUpdateProject} />} />
          <Route path="/leads" element={<LeadsView leads={leads} onAdd={handleAddLead} onUpdate={handleUpdateLead} />} />
          <Route path="/team" element={<TeamView users={MOCK_USERS} />} />
          <Route path="/settings" element={<SettingsView org={MOCK_ORG} />} />
        </Routes>
        
        <div className="fixed bottom-6 right-6 z-50">
           {!isAIOpen && (
             <button 
               onClick={() => setIsAIOpen(true)}
               className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-110"
             >
               <Bot size={24} />
             </button>
           )}
           <CurrentProjectAIAssistantWrapper 
             isOpen={isAIOpen} 
             onClose={() => setIsAIOpen(false)} 
             projects={projects}
           />
        </div>
    </HashRouter>
  );
};

export default App;