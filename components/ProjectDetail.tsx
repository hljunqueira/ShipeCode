import React, { useState, useRef, useEffect } from 'react';
import { Project, ProjectStatus, TaskStatus, FinancialItem, Role } from '../types';
import { CONTRACT_TEMPLATE, MOCK_ORG } from '../constants';
import { CheckCircle, Clock, FileText, DollarSign, List, ShieldCheck, AlertCircle, ChevronRight, Layout, GripVertical, Plus, MoreHorizontal, User as UserIcon, Activity } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
}

// --- Helper for Draggable Scroll (Local Version) ---
const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      // Prevent drag scroll if clicking a button or a draggable task
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[draggable="true"]')) return;
      
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

    slider.addEventListener('mousedown', onMouseDown);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('mousemove', onMouseMove);

    slider.classList.add('cursor-grab');

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return ref;
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'finance' | 'contract'>('board'); // Default to Board for faster action
  const scrollRef = useDraggableScroll();

  // Order of Project Phases
  const phases = [
    ProjectStatus.LEAD,
    ProjectStatus.DISCOVERY,
    ProjectStatus.CONTRACTING,
    ProjectStatus.BUILD,
    ProjectStatus.QA,
    ProjectStatus.DEPLOYED
  ];

  const statusLabels: Record<string, string> = {
    [ProjectStatus.LEAD]: 'Lead',
    [ProjectStatus.DISCOVERY]: 'Discovery',
    [ProjectStatus.CONTRACTING]: 'Contrato',
    [ProjectStatus.BUILD]: 'Build',
    [ProjectStatus.QA]: 'QA',
    [ProjectStatus.DEPLOYED]: 'Entrega',
  };

  const taskStatusLabels: Record<string, string> = {
    [TaskStatus.TODO]: 'A Fazer',
    [TaskStatus.IN_PROGRESS]: 'Em Andamento',
    [TaskStatus.REVIEW]: 'Revisão',
    [TaskStatus.DONE]: 'Concluído',
  };

  const tabLabels = {
    board: 'Pipeline de Tarefas',
    overview: 'Visão Geral',
    finance: 'Financeiro',
    contract: 'Contrato',
  };

  const calculateMargin = () => {
    const revenue = project.financials.filter(f => f.type === 'REVENUE').reduce((sum, i) => sum + i.amount, 0);
    const cost = project.financials.filter(f => f.type === 'COST').reduce((sum, i) => sum + i.amount, 0);
    return { revenue, cost, profit: revenue - cost, margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0 };
  };

  const { revenue, cost, profit, margin } = calculateMargin();

  const handleSignContract = () => {
    if (!project.contract) return;
    const updated = {
      ...project,
      status: ProjectStatus.BUILD, // Auto move to build
      contract: {
        ...project.contract,
        status: 'SIGNED' as const,
        signedAt: new Date().toISOString()
      }
    };
    onUpdateProject(updated);
  };

  const handleGenerateContract = () => {
    const template = CONTRACT_TEMPLATE
      .replace(/{ORG_NAME}/g, MOCK_ORG.name)
      .replace(/{CLIENT_NAME}/g, project.clientName)
      .replace(/{PROJECT_NAME}/g, project.name)
      .replace(/{TOTAL_VALUE}/g, `R$ ${revenue.toLocaleString('pt-BR')}`);
    
    const updated: Project = {
      ...project,
      status: ProjectStatus.CONTRACTING,
      contract: {
        id: `c-${Date.now()}`,
        status: 'DRAFT',
        content: template,
        totalValue: revenue,
      }
    };
    onUpdateProject(updated);
  };

  // Drag and Drop Logic for Tasks
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    onUpdateProject({ ...project, tasks: updatedTasks });
  };

  // Helper to determine phase status color
  const getPhaseColor = (phase: ProjectStatus) => {
    const currentIndex = phases.indexOf(project.status);
    const phaseIndex = phases.indexOf(phase);

    if (phaseIndex < currentIndex) return 'text-zinc-500 border-zinc-800 bg-zinc-900/50'; // Past
    if (phaseIndex === currentIndex) return 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]'; // Current
    return 'text-zinc-700 border-zinc-900 bg-transparent'; // Future
  };

  return (
    <div className="space-y-6">
      
      {/* --- UNIFIED CONTROL BAR (Navigation + Status) --- */}
      <div className="flex flex-col sm:flex-row justify-between items-end border-b border-zinc-800 pb-1 gap-4">
        {/* Left: Functional Tabs */}
        <div className="flex gap-6 overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {(Object.keys(tabLabels) as Array<keyof typeof tabLabels>).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tabLabels[tab]}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Right: Compact Status Indicator */}
        <div className="flex items-center gap-3 mb-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
           <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Fase Atual</span>
           <div className="h-3 w-[1px] bg-zinc-800"></div>
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${project.status === 'BUILD' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-xs font-bold text-white uppercase tracking-wide">{statusLabels[project.status]}</span>
           </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[400px]">
        {/* Overview Tab (Where Timeline Lives Now) */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Timeline relocated here */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Ciclo de Vida do Projeto
               </h3>
               <div className="w-full overflow-x-auto hide-scrollbar py-2">
                <div className="flex items-center min-w-max">
                  {phases.map((phase, index) => {
                    const isLast = index === phases.length - 1;
                    const isActive = phase === project.status;
                    const isPast = phases.indexOf(project.status) > index;

                    return (
                      <div key={phase} className="flex items-center group">
                        <div className={`
                          relative flex items-center justify-center px-4 py-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300
                          ${getPhaseColor(phase)}
                        `}>
                          {isPast && <CheckCircle size={12} className="mr-2 text-zinc-500" />}
                          {isActive && <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />}
                          {statusLabels[phase]}
                        </div>
                        
                        {!isLast && (
                          <div className={`w-12 h-[1px] mx-2 ${isPast ? 'bg-red-900/30' : 'bg-zinc-800'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-zinc-900/30 p-1 rounded-2xl border border-zinc-800/50">
                   <div className="bg-zinc-950/50 p-6 rounded-xl">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layout size={14} /> Briefing Original
                      </h3>
                      <p className="text-zinc-300 leading-relaxed font-light text-lg">
                        {project.description}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Cliente</h3>
                      <p className="text-xl font-bold text-white">{project.clientName}</p>
                   </div>
                   <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">ID do Contrato</h3>
                      <p className="text-xl font-mono text-zinc-400">{project.contract?.id || 'N/A'}</p>
                   </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-6">Equipe Alocada</h3>
                  <div className="space-y-4">
                    {project.teamIds.map((uid) => (
                       <div key={uid} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-950 border border-zinc-900">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                            U
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white">Membro {uid}</p>
                             <p className="text-[10px] text-zinc-500 font-mono">ID: {uid}</p>
                          </div>
                       </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-zinc-800 text-zinc-600 text-xs rounded-lg hover:text-white hover:border-zinc-600 transition-colors">
                       + Gerenciar Squad
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Immersive Pipeline Board Tab (Clean View) */}
        {activeTab === 'board' && (
          <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Background Lines */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-1/2 w-full h-[1px] bg-zinc-800/30"></div>
            </div>

            <div ref={scrollRef} className="flex gap-8 overflow-x-auto overflow-y-hidden pb-12 pt-8 px-4 -mx-4 cursor-grab active:cursor-grabbing hide-scrollbar snap-x snap-mandatory">
              {Object.values(TaskStatus).map((status, index) => {
                 const tasks = project.tasks.filter(t => t.status === status);

                 return (
                    <div 
                      key={status}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status)}
                      className={`snap-center shrink-0 w-[320px] flex flex-col relative group transition-all duration-300`}
                    >
                       {/* Column Header Module */}
                       <div className="flex items-center justify-between mb-6 px-4 py-3 bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-xl relative z-10 group-hover:border-zinc-600 transition-colors shadow-lg">
                          <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${status === TaskStatus.IN_PROGRESS ? 'bg-red-500 animate-pulse' : status === TaskStatus.DONE ? 'bg-emerald-500' : 'bg-zinc-600'}`}></div>
                             <span className="text-sm font-bold text-zinc-200 tracking-wide uppercase">{taskStatusLabels[status]}</span>
                          </div>
                          <span className="px-2 py-1 rounded bg-zinc-900 text-xs font-mono text-zinc-500 border border-zinc-800">{tasks.length}</span>
                       </div>

                       {/* Task Stack */}
                       <div className={`flex flex-col gap-3 min-h-[400px] rounded-2xl p-2 border-2 border-dashed border-transparent transition-all ${tasks.length === 0 ? 'bg-zinc-900/20' : ''}`}>
                          
                          {tasks.map(task => (
                             <div 
                               key={task.id} 
                               draggable="true"
                               onDragStart={(e) => handleDragStart(e, task.id)}
                               className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-lg hover:border-zinc-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-move group/card relative overflow-hidden"
                             >
                                {/* Decoration */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover/card:bg-red-500 transition-colors"></div>

                                <div className="pl-2">
                                   <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-mono text-zinc-500">{task.id}</span>
                                      <GripVertical size={14} className="text-zinc-700 group-hover/card:text-zinc-400" />
                                   </div>
                                   
                                   <p className="text-sm font-medium text-zinc-200 leading-snug mb-3">{task.title}</p>
                                   
                                   <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                      <div className="flex items-center gap-2">
                                         {task.assigneeId ? (
                                           <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                                              <UserIcon size={10} className="text-zinc-400" />
                                              <span className="text-[10px] text-zinc-400 font-mono">U-{task.assigneeId}</span>
                                           </div>
                                         ) : (
                                            <span className="text-[10px] text-zinc-600 italic">Sem dono</span>
                                         )}
                                      </div>
                                      {task.dueDate && (
                                         <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <Clock size={10} />
                                            <span>2d</span>
                                         </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                          ))}

                          {/* Empty State / Drop Target Hint */}
                          {tasks.length === 0 && (
                             <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 border-2 border-dashed border-zinc-800/50 rounded-xl m-1">
                                <List size={24} className="mb-2 opacity-50" />
                                <span className="text-xs uppercase tracking-widest opacity-50">Vazio</span>
                             </div>
                          )}

                          <button className="w-full py-3 mt-2 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-zinc-600 hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 opacity-60 hover:opacity-100">
                             <Plus size={14} /> Nova Tarefa
                          </button>
                       </div>
                    </div>
                 );
              })}
              
              {/* Spacer for scroll feeling */}
              <div className="w-12 shrink-0"></div>
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Receita Total</p>
                  <p className="text-3xl font-mono text-white tracking-tight">R$ {revenue.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Custo Total</p>
                  <p className="text-3xl font-mono text-red-400 tracking-tight">R$ {cost.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Lucro Líquido</p>
                  <p className={`text-3xl font-mono tracking-tight ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {profit.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="bg-zinc-900/30 rounded-2xl overflow-hidden border border-zinc-800/50">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950/50 text-zinc-500">
                  <tr>
                    <th className="p-4 font-medium text-xs uppercase tracking-wider">Descrição</th>
                    <th className="p-4 font-medium text-xs uppercase tracking-wider">Categoria</th>
                    <th className="p-4 font-medium text-xs uppercase tracking-wider">Tipo</th>
                    <th className="p-4 font-medium text-xs uppercase tracking-wider text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {project.financials.map(item => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 text-zinc-300">{item.description}</td>
                      <td className="p-4 text-zinc-500 text-xs uppercase tracking-wider">{item.category}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'REVENUE' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                          {item.type === 'REVENUE' ? 'RECEITA' : 'CUSTO'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-zinc-300">
                        {item.type === 'COST' ? '-' : ''}R$ {item.amount.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === 'contract' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!project.contract ? (
              <div className="bg-zinc-900/30 p-12 rounded-2xl border border-zinc-800/50 text-center space-y-4">
                  <ShieldCheck className="mx-auto h-12 w-12 text-zinc-700" />
                  <h3 className="text-xl font-bold text-white">Contrato não Gerado</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">Este contrato formaliza o que foi combinado e protege ambas as partes. Você deve gerar e assinar um contrato antes de mover para a fase de Build.</p>
                  <button 
                    onClick={handleGenerateContract}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-red-900/20"
                  >
                    Gerar Contrato Padrão
                  </button>
              </div>
            ) : (
              <div className="bg-zinc-50 text-zinc-900 rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-zinc-200 p-4 border-b border-zinc-300 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="text-zinc-600" size={18} />
                      <span className="font-semibold text-zinc-700">Contrato_{project.id}.pdf</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide ${project.contract.status === 'SIGNED' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                          {project.contract.status === 'SIGNED' ? 'ASSINADO' : project.contract.status}
                      </span>
                    </div>
                    {project.contract.status !== 'SIGNED' && (
                      <button 
                        onClick={handleSignContract}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-bold tracking-wide"
                      >
                        ASSINAR
                      </button>
                    )}
                </div>
                <div className="p-10 font-serif whitespace-pre-wrap leading-relaxed text-sm">
                  {project.contract.content}
                </div>
                {project.contract.signedAt && (
                  <div className="bg-green-50 p-4 border-t border-green-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle size={16} />
                        <span className="text-sm font-bold">Assinado Digitalmente em {new Date(project.contract.signedAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="text-xs text-green-700 font-mono uppercase">
                        {project.id}-SIG-VALID
                      </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;