import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, User as UserIcon, Tag, Calendar, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    task?: Task; // Se definido, é modo de edição
}

/**
 * Modal para criar ou editar tarefas
 */
const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
    const { users } = useAuth();
    const isEditing = !!task;

    const [form, setForm] = useState({
        title: '',
        status: TaskStatus.TODO as TaskStatus,
        assigneeId: '',
        description: '',
        dueDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
    });

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title,
                status: task.status,
                assigneeId: task.assigneeId || '',
                description: task.description || '',
                dueDate: task.dueDate || '',
                priority: task.priority || 'medium',
            });
        } else {
            setForm({
                title: '',
                status: TaskStatus.TODO,
                assigneeId: '',
                description: '',
                dueDate: '',
                priority: 'medium',
            });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTask: Task = {
            id: task?.id || `t-${Date.now()}`,
            title: form.title,
            status: form.status,
            assigneeId: form.assigneeId || undefined,
            description: form.description || undefined,
            dueDate: form.dueDate || undefined,
            priority: form.priority,
        };

        onSave(newTask);
        onClose();
    };

    const priorityColors = {
        low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        high: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const statusOptions = [
        { value: TaskStatus.TODO, label: 'A Fazer' },
        { value: TaskStatus.IN_PROGRESS, label: 'Em Andamento' },
        { value: TaskStatus.REVIEW, label: 'Revisão' },
        { value: TaskStatus.DONE, label: 'Concluído' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditing ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isEditing ? <Edit3 size={20} /> : <Plus size={20} />}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
                        <p className="text-xs text-zinc-500">{isEditing ? 'Atualize os detalhes da tarefa.' : 'Adicione uma nova tarefa ao projeto.'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Título */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Título *</label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            placeholder="Ex: Implementar autenticação"
                        />
                    </div>

                    {/* Status e Prioridade */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Prioridade</label>
                            <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                                        className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${form.priority === p ? priorityColors[p] : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                                            }`}
                                    >
                                        {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Responsável */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                            <UserIcon size={12} /> Responsável
                        </label>
                        <select
                            value={form.assigneeId}
                            onChange={(e) => setForm(prev => ({ ...prev, assigneeId: e.target.value }))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none"
                        >
                            <option value="">Sem responsável</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Data de Entrega */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={12} /> Data de Entrega
                        </label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none"
                        />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Descrição</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-500 outline-none resize-none"
                            placeholder="Detalhes adicionais..."
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isEditing
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                                }`}
                        >
                            <CheckCircle2 size={18} />
                            {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
