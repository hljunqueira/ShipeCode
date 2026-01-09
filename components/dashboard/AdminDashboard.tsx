import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FolderKanban, Users, Settings, Zap,
    ArrowUpRight, BarChart3, TrendingUp,
    ListTodo, Calendar, DollarSign, PieChart,
    ChevronRight, ExternalLink, Plus, FileText, UserPlus
} from 'lucide-react';
import { ProjectStatus, Project, Lead, User } from '../../types';
import { LEAD_STATUS_LABELS } from '../../constants';
// Importação do Supabase
import { supabase } from '../../lib/supabaseClient';

interface AdminDashboardProps {
    projects: Project[];
    leads: Lead[];
    users: User[];
}

/**
 * Dashboard para Admin - Layout Focado em Dados e Resultados
 */
const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects, leads, users }) => {
    const [showAllFeatures, setShowAllFeatures] = useState(false);

    // State for Dynamic Data
    const [kpiTargets, setKpiTargets] = useState<any>({});
    const [insights, setInsights] = useState('');
    const [isLoadingKpi, setIsLoadingKpi] = useState(true);

    // Métricas de Projetos
    const activeProjects = projects.filter(p => p.status !== ProjectStatus.DEPLOYED);
    const completedProjects = projects.filter(p => p.status === ProjectStatus.DEPLOYED);

    // Métricas Financeiras
    const totalRevenue = projects.reduce((sum, p) =>
        sum + p.financials.filter(f => f.type === 'REVENUE').reduce((s, i) => s + i.amount, 0), 0
    );
    const pipelineValue = leads.reduce((s, l) => s + l.budget, 0);

    // Métricas do Funil de Leads
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'NEW').length;
    const contactedLeads = leads.filter(l => l.status === 'CONTACTED').length;
    const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED').length;
    const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;

    // Taxa de Conversão (Convertidos / Total)
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Fetch KPIs and Generate Insights
    React.useEffect(() => {
        const fetchKpiAndExpenses = async () => {
            try {
                // Fetch Targets
                const { data: targets } = await supabase.from('kpi_targets').select('*');
                if (targets && targets.length > 0) {
                    const targetMap = targets.reduce((acc: any, t) => {
                        acc[t.metric_name] = t.target_value;
                        return acc;
                    }, {});
                    setKpiTargets(targetMap);

                    // Generate Dynamic Insight
                    const targetConv = targetMap.conversion_rate || 15;
                    if (conversionRate > targetConv) {
                        setInsights(`Conversão de leads está acima da meta (${conversionRate}% vs ${targetConv}%). Foque em reter os novos clientes.`);
                    } else {
                        setInsights(`Atenção: Conversão abaixo da meta (${conversionRate}% vs ${targetConv}%). Verifique a qualidade dos leads.`);
                    }
                } else {
                    // Default Insight if no DB data
                    setInsights(`Taxa de conversão atual é ${conversionRate}%. Configure metas no banco de dados para mais insights.`);
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setIsLoadingKpi(false);
            }
        };

        fetchKpiAndExpenses();
    }, [conversionRate, projects]);

    // Métricas da Equipe (Dados Reais)
    const teamMetrics = users.map(user => {
        let totalTasks = 0;
        let completedTasks = 0;

        projects.forEach(project => {
            if (project.tasks) {
                project.tasks.forEach(task => {
                    if (task.assigneeId === user.id) {
                        totalTasks++;
                        if (task.status === 'DONE') {
                            completedTasks++;
                        }
                    }
                });
            }
        });

        return {
            name: user.name,
            role: user.role,
            tasks: totalTasks,
            completed: completedTasks,
            avatar: user.avatarUrl
        };
    })
        .filter(m => m.tasks > 0) // Mostra apenas quem tem tarefas
        .sort((a, b) => b.tasks - a.tasks) // Ordena por volume de tarefas
        .slice(0, 5); // Top 5

    // Use fetched targets or defaults
    const revenueGrowth = kpiTargets.revenue_growth || 12;
    const conversionTarget = kpiTargets.conversion_rate || 15;

    return (
        <div className="space-y-6">

            {/* 0. Navigation Badges (Quick Links) */}
            <div className="flex flex-wrap gap-3">
                <Link to="/projects" className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-red-500/50 transition-all group">
                    <Calendar size={14} className="text-red-500 group-hover:scale-110 transition-transform" />
                    Cronogramas
                </Link>

                <Link to="/leads" className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-amber-500/50 transition-all group">
                    <ListTodo size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    Kanban Leads
                </Link>

                <Link to="/settings" className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all group">
                    <Settings size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    Configurações
                </Link>

                <button
                    onClick={() => setShowAllFeatures(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all group"
                >
                    <ExternalLink size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    Ver Mais
                </button>
            </div>

            {/* 1. KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Receita Total */}
                <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1">
                            <TrendingUp size={12} /> +{revenueGrowth}%
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Receita Total</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        R$ {totalRevenue.toLocaleString('pt-BR', { notation: 'compact' })}
                    </p>
                </div>

                {/* Pipeline Value */}
                <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                            {totalLeads} leads
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Em Negociação</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        R$ {pipelineValue.toLocaleString('pt-BR', { notation: 'compact' })}
                    </p>
                </div>

                {/* Projetos Ativos */}
                <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 hover:border-red-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <FolderKanban size={20} />
                        </div>
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                            {completedProjects.length} entregues
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Projetos Ativos</p>
                    <p className="text-2xl font-bold text-white mt-1">{activeProjects.length}</p>
                </div>

                {/* Taxa de Conversão */}
                <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                            <PieChart size={20} />
                        </div>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                            Meta: {conversionTarget}%
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-white mt-1">{conversionRate}%</p>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Funil de Vendas (2 cols) */}
                <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <BarChart3 size={20} className="text-zinc-500" />
                            Funil de Vendas
                        </h3>
                        <Link to="/leads" className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                            Ver leads <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {/* New */}
                        <div className="relative group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-zinc-300">Novos Leads</span>
                                <span className="text-zinc-500">{newLeads}</span>
                            </div>
                            <div className="w-full bg-zinc-800/50 h-10 rounded-lg overflow-hidden relative border border-zinc-800 hover:border-zinc-600 transition-colors">
                                <div className="absolute inset-y-0 left-0 bg-zinc-700/50 flex items-center px-3 text-xs font-bold text-white" style={{ width: `${(newLeads / Math.max(totalLeads, 1)) * 100}%` }}>
                                </div>
                            </div>
                        </div>

                        {/* Contacted */}
                        <div className="relative group pl-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-blue-400">Contatados</span>
                                <span className="text-zinc-500">{contactedLeads}</span>
                            </div>
                            <div className="w-full bg-zinc-800/50 h-10 rounded-lg overflow-hidden relative border border-zinc-800 hover:border-blue-500/30 transition-colors">
                                <div className="absolute inset-y-0 left-0 bg-blue-600/20 flex items-center px-3 text-xs font-bold text-blue-200" style={{ width: `${(contactedLeads / Math.max(totalLeads, 1)) * 100}%` }}>
                                </div>
                            </div>
                        </div>

                        {/* Qualified */}
                        <div className="relative group pl-8">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-amber-400">Qualificados</span>
                                <span className="text-zinc-500">{qualifiedLeads}</span>
                            </div>
                            <div className="w-full bg-zinc-800/50 h-10 rounded-lg overflow-hidden relative border border-zinc-800 hover:border-amber-500/30 transition-colors">
                                <div className="absolute inset-y-0 left-0 bg-amber-600/20 flex items-center px-3 text-xs font-bold text-amber-200" style={{ width: `${(qualifiedLeads / Math.max(totalLeads, 1)) * 100}%` }}>
                                </div>
                            </div>
                        </div>

                        {/* Converted */}
                        <div className="relative group pl-12">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-emerald-400">Convertidos</span>
                                <span className="text-zinc-500">{convertedLeads}</span>
                            </div>
                            <div className="w-full bg-zinc-800/50 h-10 rounded-lg overflow-hidden relative border border-zinc-800 hover:border-emerald-500/30 transition-colors">
                                <div className="absolute inset-y-0 left-0 bg-emerald-600/20 flex items-center px-3 text-xs font-bold text-emerald-200" style={{ width: `${(convertedLeads / Math.max(totalLeads, 1)) * 100}%` }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Performance (1 col) */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-zinc-500" />
                            Equipe
                        </h3>
                        <Link to="/settings" className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                            Gerenciar <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {teamMetrics.map((member, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold shrink-0 overflow-hidden">
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        member.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                                    <p className="text-xs text-zinc-500">{member.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">{member.completed}/{member.tasks}</p>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Tarefas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Quick Links Row - REMOVED (Moved to top badges) */}

            {/* Modal Todas as Funções */}
            {showAllFeatures && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAllFeatures(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Todas as Ferramentas</h2>
                            <button onClick={() => setShowAllFeatures(false)} className="text-zinc-500 hover:text-white">
                                <ExternalLink size={20} className="rotate-180" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Link to="/projects/new" className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-red-500/50 flex flex-col items-center text-center gap-3">
                                <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                                    <Plus size={20} />
                                </div>
                                <span className="text-sm font-medium text-zinc-300">Novo Projeto</span>
                            </Link>

                            <Link to="/leads" className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-amber-500/50 flex flex-col items-center text-center gap-3">
                                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
                                    <UserPlus size={20} />
                                </div>
                                <span className="text-sm font-medium text-zinc-300">Novo Lead</span>
                            </Link>

                            <Link to="/settings" className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-cyan-500/50 flex flex-col items-center text-center gap-3">
                                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-500">
                                    <Users size={20} />
                                </div>
                                <span className="text-sm font-medium text-zinc-300">Gerenciar Equipe</span>
                            </Link>

                            <Link to="/reports" className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-emerald-500/50 flex flex-col items-center text-center gap-3 group">
                                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                                    <FileText size={20} />
                                </div>
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">Relatórios Gerenciais</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Insights Box (if any calculated) */}
            {insights && (
                <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Insight Automático</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                        {insights}
                    </p>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
