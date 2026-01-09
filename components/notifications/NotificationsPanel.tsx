import React from 'react';
import { X, Bell, Check, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationsContext';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Painel deslizante de notificações
 */
const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();

    if (!isOpen) return null;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            case 'error': return <XCircle size={18} className="text-red-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Agora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <Bell className="text-red-500" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Notificações</h2>
                            <p className="text-xs text-zinc-500">{unreadCount} não lidas</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                    <div className="px-6 py-3 border-b border-zinc-800 flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition-colors"
                            >
                                <CheckCheck size={14} /> Marcar todas como lidas
                            </button>
                        )}
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition-colors ml-auto"
                        >
                            <Trash2 size={14} /> Limpar
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <Bell size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800/50">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-zinc-800/50 transition-colors ${!notification.read ? 'bg-zinc-800/30' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className={`text-sm font-bold ${!notification.read ? 'text-white' : 'text-zinc-400'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                                                    {getTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mb-2">{notification.message}</p>

                                            <div className="flex items-center gap-2">
                                                {notification.action && (
                                                    <a
                                                        href={notification.action.href}
                                                        onClick={() => { markAsRead(notification.id); onClose(); }}
                                                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
                                                    >
                                                        {notification.action.label} <ExternalLink size={10} />
                                                    </a>
                                                )}

                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 ml-auto"
                                                    >
                                                        <Check size={12} /> Marcar como lida
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => removeNotification(notification.id)}
                                                    className="p-1 text-zinc-600 hover:text-red-400 transition-colors ml-auto"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsPanel;
