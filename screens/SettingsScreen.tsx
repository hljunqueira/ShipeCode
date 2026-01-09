import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { supabase } from '../lib/supabaseClient';
import {
    Users, Plus, Loader2, Monitor, DollarSign,
    Activity, RefreshCw, ArrowLeft, Save
} from 'lucide-react';

// ... interface SettingsScreenProps remains

import { Organization } from '../types';

interface SettingsScreenProps {
    org: Organization;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ org }) => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { updateOrganization } = useAppData();
    const [activeTab, setActiveTab] = useState('general');

    // Organization State
    // "Identidade" removed. Keeping settings related state.
    const [currency, setCurrency] = useState(org.settings?.currency || 'BRL');
    const [taxRate, setTaxRate] = useState(org.settings?.taxRate || 0.15);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrganization({
                name: org.name, // Keep existing name
                settings: {
                    ...org.settings,
                    currency,
                    taxRate: Number(taxRate)
                }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erro ao salvar configurações.');
        } finally {
            setIsSaving(false);
        }
    };

    // System Actions
    const handleClearCache = () => {
        if (confirm('Isso irá limpar os dados locais e recarregar a página. Deseja continuar?')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    // Team Management State
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [isLoadingTeam, setIsLoadingTeam] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CONTRIBUTOR' });
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // Fetch Team
    React.useEffect(() => {
        if (activeTab === 'team') {
            fetchTeam();
        }
    }, [activeTab]);

    const fetchTeam = async () => {
        setIsLoadingTeam(true);
        try {
            console.log('Fetching team members...');
            const { data, error } = await supabase.from('profiles').select('*');

            if (error) {
                console.error('Error fetching team:', error);
                alert('Erro ao carregar equipe: ' + error.message);
                return;
            }

            console.log('Team data fetched:', data);
            if (data) setTeamMembers(data);
        } catch (err) {
            console.error('Unexpected error fetching team:', err);
        } finally {
            setIsLoadingTeam(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingUser(true);

        try {
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            );

            const { data, error } = await tempClient.auth.signUp({
                email: newUser.email,
                password: tempPassword,
                options: {
                    data: {
                        name: newUser.name,
                        role: newUser.role
                    }
                }
            });

            if (error) throw error;

            console.log('User created:', data);

            const { error: resetError } = await tempClient.auth.resetPasswordForEmail(newUser.email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (resetError) {
                console.warn('Error sending reset email (Invite):', resetError);
            }

            await new Promise(r => setTimeout(r, 1000));

            fetchTeam();
            setShowAddUser(false);
            setNewUser({ name: '', email: '', password: '', role: 'CONTRIBUTOR' });
            alert(`Convite enviado para ${newUser.email}!`);

        } catch (error: any) {
            console.error('Error creating user:', error);
            alert('Erro ao convidar: ' + error.message);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. Configurações Financeiras (Merged into General) */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <DollarSign size={18} /> Configurações Financeiras
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Moeda Padrão</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="BRL">BRL (R$)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Imposto Padrão (%)</label>
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(e.target.value)}
                                        step="0.01"
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Integridade do Sistema (Merged into General) */}
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
                                    <button
                                        onClick={handleClearCache}
                                        className="px-4 py-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-300 hover:text-red-400 hover:border-red-500/30 border border-transparent text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                                    >
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
            case 'team':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Users size={18} /> Gestão da Equipe
                                </h2>
                                <button
                                    onClick={() => setShowAddUser(!showAddUser)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Plus size={14} /> Novo Usuário
                                </button>
                            </div>

                            {/* Invite Modal */}
                            {showAddUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                                    <div className="bg-zinc-950 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => setShowAddUser(false)}
                                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <Plus size={24} className="rotate-45" />
                                        </button>

                                        <div className="mb-6">
                                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500 border border-emerald-500/20">
                                                <Users size={24} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Convidar Membro</h3>
                                            <p className="text-sm text-zinc-400">Adicione novos membros à equipe por e-mail.</p>
                                        </div>

                                        <form onSubmit={handleCreateUser} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Nome</label>
                                                <input
                                                    required
                                                    placeholder="Nome do membro"
                                                    value={newUser.name}
                                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">E-mail</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="email@exemplo.com"
                                                    value={newUser.email}
                                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Função</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'ADMIN', label: 'Administrador', desc: 'Acesso total ao sistema' },
                                                        { id: 'MANAGER', label: 'Gerente', desc: 'Gerencia projetos e equipe' },
                                                        { id: 'CONTRIBUTOR', label: 'Colaborador', desc: 'Trabalha em tarefas' },
                                                        { id: 'CLIENT', label: 'Cliente', desc: 'Visualiza seus projetos' }
                                                    ].map((role) => (
                                                        <div
                                                            key={role.id}
                                                            onClick={() => setNewUser({ ...newUser, role: role.id })}
                                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${newUser.role === role.id
                                                                ? 'bg-emerald-500/10 border-emerald-500/50'
                                                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                                                                }`}
                                                        >
                                                            <div className={`text-xs font-bold mb-0.5 ${newUser.role === role.id ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                                                {role.label}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-500 leading-tight">
                                                                {role.desc}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 space-y-4">
                                                <button
                                                    type="submit"
                                                    disabled={isCreatingUser}
                                                    className="w-full bg-white hover:bg-zinc-200 text-black px-4 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isCreatingUser ? (
                                                        <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                                                    ) : (
                                                        <><Monitor size={16} /> Enviar Convite</>
                                                    )}
                                                </button>

                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-950 px-2 text-zinc-600">ou compartilhe o link</span></div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <input
                                                        readOnly
                                                        value="https://shipecode.app/invite/MTc2Nzk" // Mock for UI
                                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-500 font-mono"
                                                    />
                                                    <button type="button" className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-xs font-bold flex items-center gap-2 transition-colors">
                                                        <Save size={14} /> Copiar
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Team List */}
                            <div className="space-y-4">
                                {isLoadingTeam ? (
                                    <div className="text-center py-8 text-zinc-500"><Loader2 className="animate-spin mx-auto mb-2" />Carregando equipe...</div>
                                ) : (
                                    teamMembers.map((member) => (
                                        <div key={member.id} className="flex justify-between items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-800">
                                                    {member.avatar_url ? (
                                                        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-zinc-500 font-bold">{member.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{member.name}</p>
                                                    <p className="text-xs text-zinc-500 uppercase font-mono">{member.role}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 font-mono select-all">
                                                {member.id.substring(0, 8)}...
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl"></div>
            </div>

            {/* Immersive Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-auto">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            Configurações
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{org.name}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`pointer-events-auto px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${saved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}
                >
                    <Save size={16} /> {saved ? 'Salvo!' : isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pt-24 pb-8 px-6 md:px-12 relative z-10 custom-scrollbar">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 shrink-0 space-y-1">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
                        >
                            <Monitor size={16} /> Geral
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('team')}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab === 'team' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
                            >
                                <Users size={16} /> Membros da Equipe
                            </button>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-h-[500px]">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
