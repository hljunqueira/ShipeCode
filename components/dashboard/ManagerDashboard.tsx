import React from 'react';
import { Link } from 'react-router-dom';
import {
    FolderKanban, Users, Zap, ChevronRight,
    Clock, CheckCircle, DollarSign
} from 'lucide-react';
import { ProjectStatus, Project, Lead } from '../../types';
import { PROJECT_STATUS_LABELS, LEAD_STATUS_LABELS } from '../../constants';

interface ManagerDashboardProps {
    projects: Project[];
    leads: Lead[];
}

/**
 * Dashboard para Manager - Seções verticais
 * Ordem: Leads -> Projetos -> Equipe
 */
const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ projects, leads }) => {
    const activeProjects = projects.filter(p => p.status !== ProjectStatus.DEPLOYED);

    return (
        <div className="space-y-6">

            {/* Pipeline de Leads - PRIMEIRO */}
            <section className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Pipeline de Leads</h3>
                            <p className="text-xs text-zinc-500">R$ {leads.reduce((s, l) => s + l.budget, 0).toLocaleString('pt-BR')} em pipeline</p>
                        </div>
                    </div>
                    <Link to="/leads" className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 font-medium">
                        Ver todos <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.filter(l => l.status !== 'LOST').slice(0, 6).map(lead => (
                            <div
                                key={lead.id}
                                className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 hover:border-amber-500/30 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${lead.status === 'CONVERTED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            lead.probability >= 70 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                'bg-zinc-800 border-zinc-700 text-zinc-400'
                                        }`}>
                                        {LEAD_STATUS_LABELS[lead.status]}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">{lead.probability}%</span>
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1">{lead.clientName}</h4>
                                <p className="text-xs text-zinc-500 mb-2">{lead.projectName}</p>
                                <div className="flex items-center gap-1 text-amber-400 font-mono text-sm">
                                    <DollarSign size={12} />
                                    R$ {lead.budget.toLocaleString('pt-BR')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meus Projetos - SEGUNDO */}
            <section className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                            <FolderKanban size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Projetos</h3>
                            <p className="text-xs text-zinc-500">{activeProjects.length} ativos</p>
                        </div>
                    </div>
                    <Link to="/projects" className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium">
                        Ver todos <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="p-4 md:p-6">
                    {activeProjects.length === 0 ? (
                        <p className="text-zinc-600 text-center py-8">Nenhum projeto ativo.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeProjects.slice(0, 6).map(project => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 hover:border-red-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${project.status === ProjectStatus.BUILD ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                project.status === ProjectStatus.DEPLOYED ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                                            }`}>
                                            {PROJECT_STATUS_LABELS[project.status]}
                                        </span>
                                        <ChevronRight size={14} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1 group-hover:text-red-400 transition-colors">{project.name}</h4>
                                    <p className="text-xs text-zinc-500">{project.clientName}</p>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] text-zinc-600">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle size={10} /> {project.tasks.filter(t => t.status === 'DONE').length}/{project.tasks.length}
                                        </span>
                                        {project.targetDate && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} /> {new Date(project.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Equipe - TERCEIRO */}
            <section className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-500">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Equipe</h3>
                            <p className="text-xs text-zinc-500">Membros do time</p>
                        </div>
                    </div>
                    <Link to="/team" className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                        Ver todos <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                    <Users size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Membro {i}</p>
                                    <p className="text-[10px] text-zinc-500">Colaborador</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default ManagerDashboard;
