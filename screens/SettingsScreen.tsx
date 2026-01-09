import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { supabase } from '../lib/supabaseClient';
import {
    Users, Plus, Loader2, Monitor, DollarSign,
    Activity, RefreshCw, ArrowLeft, Save, Trash2
} from 'lucide-react';
import AddMemberModal from '../components/modals/AddMemberModal';
import { Organization, Role } from '../types';
import { useNotifications } from '../contexts/NotificationsContext';

interface SettingsScreenProps {
    org: Organization;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ org }) => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { updateOrganization } = useAppData();
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState('general');

    // Organization State
    const [currency, setCurrency] = useState(org.settings?.currency || 'BRL');
    const [taxRate, setTaxRate] = useState(org.settings?.taxRate || 0.15);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrganization({
                name: org.name,
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
    const [showAddUser, setShowAddUser] = useState(false); // Using Modal now

    // Fetch Team
    React.useEffect(() => {
        if (activeTab === 'team') {
            fetchTeam();
        }
    }, [activeTab]);

    const fetchTeam = async () => {
        setIsLoadingTeam(true);
        try {
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) throw error;
            if (data) setTeamMembers(data);
        } catch (err: any) {
            console.error('Error fetching team:', err);
            addNotification({ type: 'error', title: 'Erro', message: 'Erro ao carregar equipe: ' + err.message });
        } finally {
            setIsLoadingTeam(false);
        }
    };

    // New Add Member Logic (Same as TeamScreen)
    const handleAddMember = async (formData: any): Promise<{ success: boolean; error?: string }> => {
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });

            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.name } }
            });

            if (authError) {
                console.error("Auth Error:", authError);
                // Return error to modal instead of alerting
                return { success: false, error: authError.message };
            }

            if (!authData.user) return { success: false, error: 'Erro desconhecido ao criar usuário.' };

            const { error: profileError } = await supabase.from('profiles').insert([{
                id: authData.user.id,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
            }]);

            if (profileError) {
                const msg = `Conta criada, mas perfil falhou: ${profileError.message}`;
                console.error(msg);
                addNotification({
                    type: 'warning',
                    title: 'Usuário Criado (Parcial)',
                    message: msg
                });
                fetchTeam();
                return { success: true };
            }

            addNotification({ type: 'success', title: 'Membro Adicionado', message: `${formData.name} entrou para a equipe.` });
            fetchTeam();
            return { success: true };

        } catch (err: any) {
            addNotification({ type: 'error', title: 'Erro Inesperado', message: err.message });
            return { success: false, error: err.message };
        }
    };

    const handleDeleteMember = async (userId: string, userName: string) => {
        if (!confirm(`Tem certeza que deseja remover ${userName}? \n\nIsso removerá o acesso do usuário, mas a conta não será excluída do provedor de autenticação (requer ação no painel Supabase).`)) {
            return;
        }

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', userId);

            if (error) {
                console.error("Delete error:", error);
                addNotification({
                    type: 'error',
                    title: 'Erro ao remover',
                    message: error.message
                });
            } else {
                addNotification({
                    type: 'success',
                    title: 'Membro Removido',
                    message: `${userName} foi removido da equipe.`
                });
                fetchTeam();
            }
        } catch (err: any) {
            console.error("Delete exception:", err);
            addNotification({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao remover membro.'
            });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Configurações Financeiras */}
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

                        {/* Integridade do Sistema */}
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
                                        <p className="text-xs text-zinc-500">v2.5.0 (ShipeCode OS)</p>
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
                                    onClick={() => setShowAddUser(true)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Plus size={14} /> Novo Usuário
                                </button>
                            </div>

                            {/* Team List */}
                            <div className="space-y-4">
                                {isLoadingTeam ? (
                                    <div className="text-center py-8 text-zinc-500"><Loader2 className="animate-spin mx-auto mb-2" />Carregando equipe...</div>
                                ) : (
                                    teamMembers.map((member) => (
                                        <div key={member.id} className="flex justify-between items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors group">
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
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-zinc-600 font-mono select-all hidden sm:block">
                                                    {member.id.substring(0, 8)}...
                                                </span>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteMember(member.id, member.name)}
                                                        className="text-zinc-600 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-zinc-900"
                                                        title="Remover Membro"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
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

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={showAddUser}
                onClose={() => setShowAddUser(false)}
                onAdd={handleAddMember}
            />

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
