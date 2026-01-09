import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    action?: {
        label: string;
        href: string;
    };
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);



interface NotificationsProviderProps {
    children: ReactNode;
}

/**
 * Provider de notificações
 * Gerencia o sistema de notificações da aplicação
 */
export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Carregar notificações iniciais
    useEffect(() => {
        if (currentUser) {
            loadNotifications();
            subscribeToNotifications();
        } else {
            setNotifications([]);
        }

        return () => {
            supabase.removeAllChannels(); // Cleanup subscriptions
        };
    }, [currentUser]);

    const loadNotifications = async () => {
        if (!currentUser) return;

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(50); // Limit to last 50

            if (data) {
                // Map DB snake_case to CamelCase if needed, but our Types match mostly except 'createdAt' vs 'created_at' and 'read' vs 'is_read'
                const mapped: Notification[] = data.map(n => ({
                    id: n.id,
                    type: n.type as 'info' | 'success' | 'warning' | 'error',
                    title: n.title,
                    message: n.message,
                    read: n.is_read, // DB column is usually is_read
                    createdAt: n.created_at,
                    action: n.data?.action
                }));
                setNotifications(mapped);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const subscribeToNotifications = () => {
        if (!currentUser) return;

        supabase
            .channel(`notifications:user:${currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUser.id}`
                },
                (payload) => {
                    const newNotif = payload.new;
                    setNotifications(prev => [{
                        id: newNotif.id,
                        type: newNotif.type,
                        title: newNotif.title,
                        message: newNotif.message,
                        read: newNotif.is_read,
                        createdAt: newNotif.created_at,
                        action: newNotif.data?.action
                    }, ...prev]);

                    // Opcional: Tocar som
                }
            )
            .subscribe();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        // Create a temporary ID and local object
        const tempId = crypto.randomUUID();
        const newNotif: Notification = {
            id: tempId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: false,
            createdAt: new Date().toISOString(),
            action: notification.action
        };

        // Update local state immediately (Optimistic / Local Fallback)
        setNotifications(prev => [newNotif, ...prev]);

        if (!currentUser) return;

        try {
            // Try to persist to DB
            const { error } = await supabase.from('notifications').insert({
                user_id: currentUser.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                is_read: false,
                data: { action: notification.action }
            });

            if (error) {
                console.warn('Failed to save notification to DB (using local only):', error);
                // We don't remove it from local state, so the user still sees it.
            }
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    }, [currentUser]);

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));

        // DB Update
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!currentUser) return;

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', currentUser.id)
            .eq('is_read', false);
    }, [currentUser]);

    const removeNotification = useCallback(async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await supabase.from('notifications').delete().eq('id', id);
    }, []);

    const clearAll = useCallback(async () => {
        if (!currentUser) return;
        setNotifications([]);
        await supabase.from('notifications').delete().eq('user_id', currentUser.id);
    }, [currentUser]);

    const value: NotificationsContextType = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

/**
 * Hook para usar o contexto de notificações
 */
export const useNotifications = (): NotificationsContextType => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationsProvider');
    }
    return context;
};

export default NotificationsContext;
