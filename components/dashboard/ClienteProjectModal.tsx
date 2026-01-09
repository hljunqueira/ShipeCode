import React, { useState, useRef } from 'react';
import {
    X, FolderKanban, Users, MessageSquarePlus, Clock,
    CheckCircle, Circle, AlertCircle, Camera, Image, Trash2, Lightbulb, Loader2
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';
import { PROJECT_STATUS_LABELS } from '../../constants';
import { supabase } from '../../lib/supabaseClient';

interface Feedback {
    id: string;
    projectId: string;
    message: string;
    screenshots: string[]; // base64 images
    createdAt: string;
    clientName: string;
    status: 'PENDING' | 'REVIEWED' | 'CONVERTED';
}

interface ClienteProjectModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onSubmitFeedback?: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => void;
}

/**
 * Modal simplificado para cliente ver seu projeto
 * Mostra: status, quem está trabalhando, progresso
 * Permite enviar feedback com screenshots
 */
const ClienteProjectModal: React.FC<ClienteProjectModalProps> = ({
    project,
    isOpen,
    onClose,
    onSubmitFeedback
}) => {
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [screenshots, setScreenshots] = useState<string[]>([]); // URLs agora, não base64
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const progress = Math.round(
        (project.tasks.filter(t => t.status === 'DONE').length /
            Math.max(project.tasks.length, 1)) * 100
    );

    // Extrai membros únicos das tarefas
    const teamMembers = Array.from(
        new Set(project.tasks.map(t => t.assignee).filter(Boolean))
    );

    // Upload function
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${project.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('feedback-attachments')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                return null;
            }

            const { data } = supabase.storage
                .from('feedback-attachments')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error in upload process:', error);
            return null;
        }
    };

    // Handler para upload de imagem
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newScreenshots: string[] = [];

        try {
            for (const file of Array.from(files)) {
                if ((file as File).type.startsWith('image/')) {
                    const publicUrl = await uploadImage(file as File);
                    if (publicUrl) {
                        newScreenshots.push(publicUrl);
                    }
                }
            }
            setScreenshots(prev => [...prev, ...newScreenshots]);
        } finally {
            setIsUploading(false);
            // Limpa o input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Remove screenshot
    const removeScreenshot = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
    };

    // Envia feedback
    const handleSubmitFeedback = async () => {
        if (!feedbackMessage.trim()) return;

        try {
            // Salva no banco
            const { error } = await supabase.from('feedbacks').insert({
                project_id: project.id,
                message: feedbackMessage.trim(),
                screenshots: screenshots, // Supabase entende array jsonb
                client_name: 'Cliente (Portal)', // Idealmente pegar do AuthContext
                status: 'PENDING'
            });

            if (error) throw error;

            if (onSubmitFeedback) {
                onSubmitFeedback({
                    projectId: project.id,
                    message: feedbackMessage.trim(),
                    screenshots,
                    clientName: 'Cliente'
                });
            }

            // Reset form
            setFeedbackMessage('');
            setScreenshots([]);
            setShowFeedbackForm(false);
            alert('Feedback enviado com sucesso!'); // Feedback visual simples
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
            alert('Erro ao enviar feedback. Tente novamente.');
        }
    };

    // Status do projeto com cores
    const getStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.BUILD:
                return 'bg-red-500/10 border-red-500/30 text-red-400';
            case ProjectStatus.QA:
                return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            case ProjectStatus.DEPLOYED:
                return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
            default:
                return 'bg-zinc-800 border-zinc-700 text-zinc-400';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                            <FolderKanban size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{project.name}</h2>
                            <p className="text-xs text-zinc-500">Seu projeto</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Status do Projeto */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Status</span>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(project.status)}`}>
                            {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Progresso</span>
                            <span className="text-white font-bold">{progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-zinc-600 mt-2">
                            <span>{project.tasks.filter(t => t.status === 'DONE').length} concluídas</span>
                            <span>{project.tasks.length} tarefas no total</span>
                        </div>
                    </div>

                    {/* Quem está trabalhando */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={16} className="text-zinc-500" />
                            <span className="text-sm text-zinc-400">Equipe trabalhando</span>
                        </div>
                        {teamMembers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {teamMembers.map((member, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-cyan-400">
                                                {(member as string).charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-sm text-white">{member}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-600">Nenhum membro atribuído ainda.</p>
                        )}
                    </div>

                    {/* Resumo de Tarefas */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-3 text-center">
                            <Circle size={16} className="mx-auto text-zinc-500 mb-1" />
                            <p className="text-lg font-bold text-white">
                                {project.tasks.filter(t => t.status === 'TODO').length}
                            </p>
                            <p className="text-[10px] text-zinc-500">Pendentes</p>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
                            <AlertCircle size={16} className="mx-auto text-amber-500 mb-1" />
                            <p className="text-lg font-bold text-amber-400">
                                {project.tasks.filter(t => t.status === 'IN_PROGRESS').length}
                            </p>
                            <p className="text-[10px] text-zinc-500">Em andamento</p>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <CheckCircle size={16} className="mx-auto text-emerald-500 mb-1" />
                            <p className="text-lg font-bold text-emerald-400">
                                {project.tasks.filter(t => t.status === 'DONE').length}
                            </p>
                            <p className="text-[10px] text-zinc-500">Concluídas</p>
                        </div>
                    </div>

                    {/* Data estimada */}
                    {project.targetDate && (
                        <div className="flex items-center justify-between bg-zinc-800/30 border border-zinc-800 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-zinc-500" />
                                <span className="text-sm text-zinc-400">Previsão de entrega</span>
                            </div>
                            <span className="text-sm font-bold text-white">
                                {new Date(project.targetDate).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    )}

                </div>

                {/* Footer - Feedback Form */}
                <div className="p-6 border-t border-zinc-800 shrink-0">
                    {showFeedbackForm ? (
                        <div className="space-y-4">
                            {/* Dica */}
                            <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                                <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-zinc-400">
                                    <p className="font-bold text-amber-400 mb-1">Como fazer uma boa sugestão:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Tire um <strong className="text-white">print da tela</strong> onde está o problema</li>
                                        <li>Descreva o que você <strong className="text-white">gostaria de mudar</strong></li>
                                        <li>Se possível, sugira como deveria ser</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Área de texto */}
                            <textarea
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                placeholder="Descreva sua sugestão de melhoria..."
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 resize-none h-24"
                                autoFocus
                            />

                            {/* Upload de imagens */}
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                {/* Preview de screenshots */}
                                {screenshots.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                        {screenshots.map((src, idx) => (
                                            <div key={idx} className="relative shrink-0">
                                                <img
                                                    src={src}
                                                    alt={`Screenshot ${idx + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                                                />
                                                <button
                                                    onClick={() => removeScreenshot(idx)}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Botão de upload */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-all"
                                >
                                    <Camera size={18} />
                                    <span className="text-sm">
                                        {screenshots.length > 0
                                            ? `${screenshots.length} imagem(s) • Adicionar mais`
                                            : 'Anexar print ou foto'
                                        }
                                    </span>
                                </button>
                            </div>

                            {/* Botões de ação */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowFeedbackForm(false);
                                        setFeedbackMessage('');
                                        setScreenshots([]);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    disabled={!feedbackMessage.trim()}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Enviar Sugestão
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowFeedbackForm(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                        >
                            <MessageSquarePlus size={18} />
                            Sugerir Melhoria
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClienteProjectModal;
