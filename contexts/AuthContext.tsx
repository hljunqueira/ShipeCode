import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, Role } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const mountingRef = useRef(true);

    // Initial Auth Check
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                console.log("[Auth] Initial session found. Fetching profile...");
                const success = await fetchProfile(session.user.id);
                if (!success && mounted) {
                    console.warn("[Auth] Session exists but profile download failed. Force signing out.");
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                }
            } else {
                if (mounted) setCurrentUser(null);
            }
            if (mounted) setIsLoading(false);

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                if (session?.user) {
                    if (currentUser?.id !== session.user.id) {
                        await fetchProfile(session.user.id);
                    }
                } else {
                    setCurrentUser(null);
                    setIsLoading(false);
                }
            });

            return () => {
                mounted = false;
                subscription.unsubscribe();
            };
        };

        initializeAuth();
    }, []);

    const fetchProfile = async (userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setCurrentUser({
                    id: data.id,
                    name: data.name,
                    role: data.role as Role,
                    avatarUrl: data.avatar_url,
                });
                return true;
            } else {
                console.error('Erro ao buscar perfil:', error);
                return false;
            }
        } catch (error) {
            console.error('Exception ao buscar perfil:', error);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setIsLoading(false);
                return { success: false, error: 'Credenciais inválidas ou erro de conexão.' };
            }

            if (data.user) {
                const profileSuccess = await fetchProfile(data.user.id);
                setIsLoading(false);

                if (profileSuccess) {
                    return { success: true };
                } else {
                    await logout();
                    return {
                        success: false,
                        error: 'Login efetuado, mas falha ao carregar perfil do usuário.'
                    };
                }
            }
            setIsLoading(false);
            return { success: false, error: 'Erro desconhecido.' };

        } catch (error: any) {
            setIsLoading(false);
            return { success: false, error: error.message || 'Erro ao realizar login.' };
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setCurrentUser(null);
        setIsLoading(false);
        localStorage.removeItem('sb-tokens');
    };

    // --- AUTO LOGOUT (3 Hours Inactivity) ---
    useEffect(() => {
        if (!currentUser) return; // Only monitor if logged in

        const INACTIVITY_LIMIT = 3 * 60 * 60 * 1000; // 3 Hours in ms
        let activityTimer: NodeJS.Timeout;

        const resetTimer = () => {
            if (activityTimer) clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                console.warn('[Auth] Sessão expirada por inatividade (3h). Deslogando...');
                logout();
                alert('Sua sessão expirou por inatividade de 3 horas.');
            }, INACTIVITY_LIMIT);
        };

        const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        const handleActivity = () => resetTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));

        // Start init
        resetTimer();

        return () => {
            if (activityTimer) clearTimeout(activityTimer);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [currentUser]); // Note: In a real app we might wrap 'logout' in useCallback to safely include it in deps, but here this works as 'logout' reference is stable per render (closure).

    const value: AuthContextType = {
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === Role.ADMIN,
        login,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export default AuthContext;
