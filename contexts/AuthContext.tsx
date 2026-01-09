import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

    useEffect(() => {
        // Verifica sessão atual ao carregar
        checkSession();

        // Escuta mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfile = async (userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Erro ao buscar perfil:', error);
                return false;
            }

            if (data) {
                setCurrentUser({
                    id: data.id,
                    name: data.name,
                    role: data.role as Role,
                    avatarUrl: data.avatar_url,
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('[Auth] Iniciando login para:', email);

            // Timeout de segurança após 15 segundos
            const timeoutPromise = new Promise<{ success: boolean; error?: string }>((_, reject) => {
                setTimeout(() => reject(new Error('Tempo limite de conexão excedido (15s). Verifique sua internet ou se o backend está rodando.')), 15000);
            });

            const loginPromise = (async () => {
                console.log('[Auth] Chamando supabase.auth.signInWithPassword...');
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    console.error('[Auth] Erro no signInWithPassword:', error);
                    return { success: false, error: error.message };
                }

                console.log('[Auth] Sucesso no signIn. User:', data.user?.id);

                if (data.user) {
                    // Fetch profile explicitamente
                    console.log('[Auth] Buscando perfil explicitamente...');
                    const profileSuccess = await fetchProfile(data.user.id);
                    console.log('[Auth] Resultado fetchProfile:', profileSuccess);

                    if (profileSuccess) {
                        return { success: true };
                    } else {
                        // Se falhar ao buscar perfil, desloga para evitar estado inconsistente
                        console.warn('[Auth] Perfil não encontrado. Deslogando...');
                        await logout();
                        return {
                            success: false,
                            error: 'Login realizado, mas erro ao carregar perfil. Verifique se o usuário possui registro na tabela profiles.'
                        };
                    }
                }
                return { success: false, error: 'Erro desconhecido: Usuário nulo.' };
            })();

            // Race entre login e timeout
            return await Promise.race([loginPromise, timeoutPromise]);

        } catch (error: any) {
            console.error('[Auth] Exception no login:', error);
            return { success: false, error: error.message || 'Erro ao fazer login' };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

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
