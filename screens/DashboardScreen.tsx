import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { usePermissions, ROLE_LABELS, ROLE_COLORS } from '../hooks/usePermissions';
import { Role, Project, Task } from '../types';
import NotificationsPanel from '../components/notifications/NotificationsPanel';

// Dashboard components por role
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import DevDashboard from '../components/dashboard/DevDashboard';
import ClienteDashboard from '../components/dashboard/ClienteDashboard';

interface DashboardScreenProps {
    projects: ReturnType<typeof useAppData>['projects'];
    leads: ReturnType<typeof useAppData>['leads'];
    onUpdateProject?: (project: Project) => void;
}

/**
 * Tela principal do sistema - Hub de controle
 * Roteia para o dashboard apropriado baseado no role do usuário
 */
const DashboardScreen: React.FC<DashboardScreenProps> = ({ projects, leads, onUpdateProject }) => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { organization, users } = useAppData();
    const { unreadCount } = useNotifications();
    const permissions = usePermissions();
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Função para adicionar tarefa ao projeto
    const handleAddTask = (projectId: string, task: Omit<Task, 'id'>) => {
        const project = projects.find(p => p.id === projectId);
        if (!project || !onUpdateProject) return;

        const newTask: Task = {
            ...task,
            id: `task-${Date.now()}`,
        };

        onUpdateProject({
            ...project,
            tasks: [...project.tasks, newTask],
        });
    };

    // Mensagem personalizada por role
    const getRoleMessage = () => {
        switch (permissions.role) {
            case Role.ADMIN: return 'Você tem acesso total ao sistema.';
            case Role.MANAGER: return 'Gerencie projetos, leads e equipe.';
            case Role.CONTRIBUTOR: return 'Veja seus projetos e tarefas atribuídas.';
            case Role.CLIENT: return 'Acompanhe o progresso dos seus projetos.';
            default: return 'Selecione um módulo para iniciar.';
        }
    };

    // Renderiza o dashboard apropriado baseado no role
    const renderDashboard = () => {
        switch (permissions.role) {
            case Role.ADMIN:
                return <AdminDashboard projects={projects} leads={leads} users={users} />;
            case Role.MANAGER:
                return <ManagerDashboard projects={projects} leads={leads} />;
            case Role.CONTRIBUTOR:
                return <DevDashboard projects={projects} />;
            case Role.CLIENT:
                return <ClienteDashboard projects={projects} onAddTask={handleAddTask} />;
            default:
                return <ClienteDashboard projects={projects} onAddTask={handleAddTask} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-red-500/30 flex flex-col relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>

            {/* Header */}
            <div className="w-full p-6 md:p-8 z-20 flex justify-between items-start border-b border-zinc-900">
                {/* Brand */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                            {organization.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{organization.name} OS</h1>
                            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">v2.4.0 • Stable</p>
                        </div>
                    </div>
                </div>

                {/* User / Notifications */}
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => setShowNotifications(true)} className="relative group">
                        <div className="p-2 md:p-3 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-all">
                            <Bell size={18} />
                        </div>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full border-2 border-[#050505] text-[10px] font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-6 border-l border-zinc-900">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white">{currentUser?.name || 'Usuário'}</p>
                            {permissions.role && (
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${ROLE_COLORS[permissions.role]}`}>
                                    {ROLE_LABELS[permissions.role]}
                                </span>
                            )}
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full p-0.5 bg-gradient-to-br from-zinc-700 to-zinc-900">
                            {currentUser?.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover rounded-full border-2 border-[#050505]" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                    <Users size={18} />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto z-10">
                <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">

                    {/* Welcome Message */}
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-1">
                            Bem-vindo, {currentUser?.name.split(' ')[0] || 'Usuário'}.
                        </h2>
                        <p className="text-zinc-500 text-sm md:text-lg">{getRoleMessage()}</p>
                    </div>

                    {/* Dashboard Content - Role-based */}
                    {renderDashboard()}

                </div>
            </div>

            {/* Footer Status */}
            <div className="w-full p-4 md:p-6 flex justify-between items-center text-xs text-zinc-600 font-mono border-t border-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    SISTEMA OPERACIONAL
                </div>
                <div>
                    LATÊNCIA: 12ms
                </div>
            </div>

            {/* Notifications Panel */}
            <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        </div>
    );
};

export default DashboardScreen;
