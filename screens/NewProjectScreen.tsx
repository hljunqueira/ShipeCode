import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, FilePlus, ChevronRight, DollarSign,
    Activity, CheckCircle2, Rocket, Users, Loader2
} from 'lucide-react';
import { Project, ProjectStatus, TaskStatus, Lead, User } from '../types';
// getProjectSuggestions removido

interface NewProjectScreenProps {
    leads: Lead[];
    users: User[];
    onCreate: (project: Project) => void;
}

/**
 * Tela de criação de novo projeto
 */
const NewProjectScreen: React.FC<NewProjectScreenProps> = ({ leads, users, onCreate }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        clientName: '',
        description: '',
        leadId: '',
        budget: '',
        teamIds: [] as string[]
    });

    // State de IA removido

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

    // handleAiAnalysis removido

    // applySuggestions removido

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
        <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl"></div>
            </div>

            {/* Immersive Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => navigate('/projects')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-600 transition-all group">
                        <X size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            Novo Projeto
                        </h1>
                        <p className="text-xs text-zinc-500">Defina o escopo e inicie o trabalho</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 flex items-start justify-center relative z-10 custom-scrollbar">
                <div className="w-full max-w-[1200px] pt-32 pb-12 animate-in fade-in zoom-in-95 duration-500">
                    {/* Form Container */}
                    <form onSubmit={handleSubmit} className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                            {/* LEFT COLUMN: Main Inputs */}
                            <div className="xl:col-span-8 space-y-6">
                                {/* Section: General Info */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 mb-4 text-white pb-3 border-b border-zinc-800/50">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20">
                                            <FilePlus size={18} />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-lg tracking-tight">Informações do Projeto</h2>
                                            <p className="text-zinc-500 text-xs">Dados essenciais para kickoff</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Cliente</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.clientName}
                                                onChange={(e) => setFormData(p => ({ ...p, clientName: e.target.value }))}
                                                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all placeholder:text-zinc-700 hover:border-zinc-700 text-sm"
                                                placeholder="Ex: ACME Corp"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Nome do Projeto</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none font-bold text-sm transition-all placeholder:text-zinc-700 hover:border-zinc-700"
                                                placeholder="Ex: Plataforma SaaS v1.0"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <div className="flex justify-between items-end mb-1">
                                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold ml-1">Escopo & Objetivos</label>
                                            </div>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none min-h-[100px] transition-all placeholder:text-zinc-700 resize-y leading-relaxed text-sm"
                                                placeholder="Descreva o escopo, funcionalidades principais e objetivos do projeto..."
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800 shrink-0">
                                                    <FilePlus size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-0.5">Vincular Lead (CRM)</label>
                                                    <div className="relative">
                                                        <select
                                                            value={formData.leadId}
                                                            onChange={handleLeadSelect}
                                                            className="w-full bg-transparent border-none p-0 text-white font-medium focus:ring-0 cursor-pointer text-xs"
                                                        >
                                                            <option value="">Não vincular a nenhum lead</option>
                                                            {leads.filter(l => l.status === 'CONVERTED' || l.status === 'QUALIFIED').map(lead => (
                                                                <option key={lead.id} value={lead.id}>{lead.clientName} - {lead.projectName}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronRight className="absolute right-0 top-0.5 text-zinc-600 pointer-events-none rotate-90" size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Team */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-3 mb-4 text-white pb-3 border-b border-zinc-800/50">
                                        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-lg tracking-tight">Squad Inicial</h2>
                                            <p className="text-zinc-500 text-xs">Quem fará parte do time</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {users.length === 0 && <p className="text-xs text-zinc-500 italic col-span-full">Nenhum membro disponível.</p>}
                                        {users.map(user => (
                                            <button
                                                type="button"
                                                key={user.id}
                                                onClick={() => toggleTeamMember(user.id)}
                                                className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-300 group text-left ${formData.teamIds.includes(user.id)
                                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20'
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                                                    }`}
                                            >
                                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Users size={10} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate">{user.name}</p>
                                                    <p className={`text-[9px] truncate ${formData.teamIds.includes(user.id) ? 'text-red-200' : 'text-zinc-600'}`}>{user.role}</p>
                                                </div>
                                                {formData.teamIds.includes(user.id) && <CheckCircle2 size={14} className="text-white animate-in zoom-in ml-auto shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: AI & Finance & Action */}
                            <div className="xl:col-span-4 space-y-6 flex flex-col h-full">

                                {/* AI Panel (Sticky-ish behavior on large screens) */}
                                {/* AI Panel Removed */}

                                {/* Financial Panel */}
                                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-white mb-1">
                                        <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500">
                                            <DollarSign size={14} />
                                        </div>
                                        <h2 className="font-bold text-sm">Financeiro Inicial</h2>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors font-bold text-sm">R$</div>
                                        <input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData(p => ({ ...p, budget: e.target.value }))}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-colors group-hover:border-zinc-700 font-mono text-base font-bold"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                {/* Submit Action */}
                                <div className="mt-auto pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-4 rounded-xl font-bold text-base shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 hover:scale-[1.01]"
                                    >
                                        <Rocket size={20} /> LANÇAR PROJETO
                                    </button>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewProjectScreen;
