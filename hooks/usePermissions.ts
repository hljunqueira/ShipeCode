import { Role } from '../types';
import { useAuth } from '../contexts/AuthContext';


/**
 * Definição de permissões por role
 */
export interface Permissions {
    // Navegação
    canViewDashboard: boolean;
    canViewProjects: boolean;
    canViewLeads: boolean;
    canViewTeam: boolean;
    canViewSettings: boolean;
    canViewFinance: boolean;

    // Ações
    canCreateProject: boolean;
    canEditProject: boolean;
    canDeleteProject: boolean;
    canManageLeads: boolean;
    canManageTasks: boolean;
    canInviteMembers: boolean;
    canEditSettings: boolean;
    canSignContracts: boolean;
}

/**
 * Mapa de permissões por role
 */
const PERMISSIONS_MAP: Record<Role, Permissions> = {
    [Role.ADMIN]: {
        canViewDashboard: true,
        canViewProjects: true,
        canViewLeads: true,
        canViewTeam: true,
        canViewSettings: true,
        canViewFinance: true,
        canCreateProject: true,
        canEditProject: true,
        canDeleteProject: true,
        canManageLeads: true,
        canManageTasks: true,
        canInviteMembers: true,
        canEditSettings: true,
        canSignContracts: true,
    },
    [Role.MANAGER]: {
        canViewDashboard: true,
        canViewProjects: true,
        canViewLeads: true,
        canViewTeam: true,
        canViewSettings: false,
        canViewFinance: true,
        canCreateProject: true,
        canEditProject: true,
        canDeleteProject: false,
        canManageLeads: true,
        canManageTasks: true,
        canInviteMembers: true,
        canEditSettings: false,
        canSignContracts: true,
    },
    [Role.CONTRIBUTOR]: {
        canViewDashboard: true,
        canViewProjects: true,
        canViewLeads: false,
        canViewTeam: true,
        canViewSettings: false,
        canViewFinance: false,
        canCreateProject: false,
        canEditProject: false,
        canDeleteProject: false,
        canManageLeads: false,
        canManageTasks: true,
        canInviteMembers: false,
        canEditSettings: false,
        canSignContracts: false,
    },
    [Role.CLIENT]: {
        canViewDashboard: true,
        canViewProjects: true, // Apenas seus projetos
        canViewLeads: false,
        canViewTeam: false,
        canViewSettings: false,
        canViewFinance: false,
        canCreateProject: false,
        canEditProject: false,
        canDeleteProject: false,
        canManageLeads: false,
        canManageTasks: true,  // Pode criar tarefas nos seus projetos
        canInviteMembers: false,
        canEditSettings: false,
        canSignContracts: false,
    },
};

/**
 * Hook para verificar permissões do usuário atual
 */
export const usePermissions = (): Permissions & { role: Role | null } => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return {
            role: null,
            canViewDashboard: false,
            canViewProjects: false,
            canViewLeads: false,
            canViewTeam: false,
            canViewSettings: false,
            canViewFinance: false,
            canCreateProject: false,
            canEditProject: false,
            canDeleteProject: false,
            canManageLeads: false,
            canManageTasks: false,
            canInviteMembers: false,
            canEditSettings: false,
            canSignContracts: false,
        };
    }

    return {
        role: currentUser.role,
        ...PERMISSIONS_MAP[currentUser.role],
    };
};

/**
 * Labels em português para os roles
 */
export const ROLE_LABELS: Record<Role, string> = {
    [Role.ADMIN]: 'Administrador',
    [Role.MANAGER]: 'Gerente',
    [Role.CONTRIBUTOR]: 'Desenvolvedor',
    [Role.CLIENT]: 'Cliente',
};

/**
 * Cores para badges de role
 */
export const ROLE_COLORS: Record<Role, string> = {
    [Role.ADMIN]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [Role.MANAGER]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [Role.CONTRIBUTOR]: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    [Role.CLIENT]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default usePermissions;
