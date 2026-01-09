import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, DollarSign, TrendingUp, Users,
    Briefcase, FileText, Download, PieChart,
    BarChart3, Activity
} from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { ProjectStatus } from '../types';

import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

// Interface para logs de trabalho
interface WorkLog {
    id: string;
    profile_id: string;
    hours: number;
    tasks_completed: number;
    efficiency_score: number;
    profile?: {
        name: string;
        role: string;
    }
}

const ReportsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { projects, leads } = useAppData();

    // State
    const [teamStats, setTeamStats] = useState<any[]>([]);
    const [realExpenses, setRealExpenses] = useState(0);
    const [dbDeliveryRate, setDbDeliveryRate] = useState(92); // Default fallback
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    // --- FINANCIAL METRICS ---
    const totalRevenue = projects.reduce((sum, p) =>
        sum + p.financials.filter(f => f.type === 'REVENUE').reduce((s, i) => s + i.amount, 0), 0
    );

    // Dynamic Expense Calculation
    const totalExpenses = realExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    // --- PROJECT HEALTH ---
    const activeProjects = projects.filter(p => p.status !== ProjectStatus.DEPLOYED).length;
    const totalProjects = projects.length;

    // --- SALES PERFORMANCE ---
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';
    const pipelineValue = leads.reduce((s, l) => s + l.budget, 0);

    // Fetch Work Logs & Expenses
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Work Logs
                const { data: logsData, error: logsError } = await supabase
                    .from('work_logs')
                    .select('*, profile:profiles(name, role)')
                    .limit(100);

                // Ignore logs error if table doesn't exist yet to prevent crash (graceful degradation)
                if (!logsError && logsData) {
                    const statsByMember: Record<string, any> = {};
                    logsData.forEach((log: any) => {
                        const name = log.profile?.name || 'Desconhecido';
                        if (!statsByMember[name]) {
                            statsByMember[name] = {
                                name,
                                role: log.profile?.role || 'Membro',
                                hours: 0,
                                tasks: 0,
                                efficiencySum: 0,
                                count: 0
                            };
                        }
                        statsByMember[name].hours += Number(log.hours_worked || 0);
                        statsByMember[name].tasks += 1;
                        statsByMember[name].efficiencySum += Number(log.efficiency_score || 0);
                        statsByMember[name].count += 1;
                    });

                    const formattedStats = Object.values(statsByMember).map((s: any) => ({
                        name: s.name,
                        role: s.role,
                        hours: s.hours,
                        tasks: s.tasks,
                        efficiency: Math.round(s.efficiencySum / s.count)
                    }));
                    setTeamStats(formattedStats);
                }

                // 2. Fetch Expenses
                const { data: expensesData, error: expenseError } = await supabase
                    .from('expenses')
                    .select('amount');

                if (!expenseError && expensesData) {
                    const sumExpenses = expensesData.reduce((acc, curr) => acc + Number(curr.amount), 0);
                    setRealExpenses(sumExpenses);
                }

                // 3. delivery rate (mock logic: projects deployed / all projects)
                if (totalProjects > 0) {
                    const deployed = projects.filter(p => p.status === ProjectStatus.DEPLOYED).length;
                    setDbDeliveryRate(Math.round((deployed / totalProjects) * 100));
                }

            } catch (error) {
                console.error("Erro ao buscar dados do relatório:", error);
            } finally {
                setIsLoadingLogs(false);
            }
        };

        fetchDashboardData();
    }, [projects, totalProjects]);

    return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl"></div>
                <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-20 flex justify-between items-center p-6 bg-zinc-950/50 backdrop-blur-sm border-b border-zinc-900">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            Relatórios Gerenciais
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">ADMINISTRATION ANALYTICS & INSIGHTS</p>
                    </div>
                </div>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-zinc-700 transition-all">
                    <Download size={16} /> Exportar PDF
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 custom-scrollbar">

                {/* 1. Executive Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {/* Revenue */}
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign size={64} />
                        </div>
                        <p className="text-zinc-400 text-sm font-medium mb-1">Receita Líquida (Real)</p>
                        <h3 className="text-3xl font-bold text-white">R$ {netProfit.toLocaleString('pt-BR', { notation: 'compact' })}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">Real</span>
                            <span className="text-zinc-500">vs despesas</span>
                        </div>
                    </div>

                    {/* Profit Margin */}
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={64} />
                        </div>
                        <p className="text-zinc-400 text-sm font-medium mb-1">Margem de Lucro</p>
                        <h3 className="text-3xl font-bold text-white">{profitMargin}%</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-zinc-500">Baseado em custos reais</span>
                        </div>
                    </div>

                    {/* Active Projects */}
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Briefcase size={64} />
                        </div>
                        <p className="text-zinc-400 text-sm font-medium mb-1">Projetos Ativos</p>
                        <h3 className="text-3xl font-bold text-white">{activeProjects}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-zinc-500">{totalProjects} total no ano</span>
                        </div>
                    </div>

                    {/* Team Usage */}
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={64} />
                        </div>
                        <p className="text-zinc-400 text-sm font-medium mb-1">Eficiência Média</p>
                        <h3 className="text-3xl font-bold text-white">
                            {teamStats.length > 0
                                ? Math.round(teamStats.reduce((acc, curr) => acc + curr.efficiency, 0) / teamStats.length) + '%'
                                : 'N/A'
                            }
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">Calculado</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* 2. Team Performance Table */}
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users size={18} className="text-zinc-500" />
                                Performance da Equipe
                            </h3>
                            <button className="text-xs text-red-400 hover:text-red-300">Ver detalhes</button>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-950/50 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Membro</th>
                                        <th className="px-6 py-3 font-medium text-right">Horas</th>
                                        <th className="px-6 py-3 font-medium text-right">Tarefas</th>
                                        <th className="px-6 py-3 font-medium text-right">Eficiência</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {teamStats.length > 0 ? (
                                        teamStats.map((member, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{member.name}</p>
                                                        <p className="text-xs text-zinc-500">{member.role}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-zinc-300 font-mono">{member.hours}h</td>
                                                <td className="px-6 py-4 text-right text-sm text-zinc-300 font-mono">{member.tasks}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${member.efficiency >= 95 ? 'bg-emerald-500/10 text-emerald-400' :
                                                        member.efficiency >= 90 ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-amber-500/10 text-amber-400'
                                                        }`}>
                                                        {member.efficiency}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                                <div className="flex flex-col items-center">
                                                    <Briefcase size={24} className="mb-2 opacity-50" />
                                                    <p className="text-sm">Nenhum registro de atividade encontrado.</p>
                                                    <p className="text-xs">Os logs de trabalho aparecerão aqui.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Sales Pipeline Stats */}
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <BarChart3 size={18} className="text-zinc-500" />
                            Métricas de Vendas
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">Taxa de Conversão</p>
                                    <p className="text-2xl font-bold text-white">{conversionRate}%</p>
                                </div>
                                <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-emerald-500 flex items-center justify-center">
                                    <PieChart size={24} className="text-emerald-500" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Total Pipeline</span>
                                    <span className="text-white font-mono">R$ {pipelineValue.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                                </div>
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[65%]"></div>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Entrega no Prazo</span>
                                    <span className="text-white font-mono">{dbDeliveryRate}%</span>
                                </div>
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: `${dbDeliveryRate}%` }}></div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Resumo Financeiro</p>
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    Despesas totais registradas: <span className="text-white font-bold">R$ {realExpenses.toLocaleString('pt-BR')}</span>.
                                    {realExpenses === 0 && " (Nenhuma despesa lançada ainda)"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pb-8 opacity-40">
                    <FileText size={32} className="mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm text-zinc-500">Fim dos relatórios</p>
                </div>

            </div>
        </div>
    );
};

export default ReportsScreen;
