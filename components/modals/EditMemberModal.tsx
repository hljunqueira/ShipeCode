import React, { useState, useEffect } from 'react';
import { X, Save, Shield, KeyRound, Check } from 'lucide-react';
import { User, Role } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: (userId: string, data: Partial<User>) => Promise<boolean>;
}

/**
 * Modal para editar membros da equipe
 */
const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
    const [form, setForm] = useState({
        name: '',
        role: Role.CONTRIBUTOR as Role,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name,
                role: user.role,
            });
            setResetSent(false);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await onUpdate(user.id, form);
        setIsLoading(false);
        if (success) {
            onClose();
        }
    };

    const handlePasswordReset = async () => {
        if (!user.email) return;
        setResetLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/reset-password', // Ensure this route exists or redirect to settings
        });
        setResetLoading(false);
        if (!error) {
            setResetSent(true);
        } else {
            alert('Erro ao enviar email: ' + error.message);
        }
    };

    const roleOptions = [
        { value: Role.ADMIN, label: 'Administrador', desc: 'Acesso total ao sistema' },
        { value: Role.MANAGER, label: 'Gerente', desc: 'Gerencia projetos e equipe' },
        { value: Role.CONTRIBUTOR, label: 'Colaborador', desc: 'Trabalha em tarefas' },
        { value: Role.CLIENT, label: 'Cliente', desc: 'Visualiza seus projetos' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Editar Membro</h2>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nome */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Nome</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Função</label>
                        <div className="grid grid-cols-2 gap-2">
                            {roleOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, role: opt.value }))}
                                    className={`p-3 rounded-lg border text-left transition-all ${form.role === opt.value
                                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                        }`}
                                >
                                    <p className="text-xs font-bold">{opt.label}</p>
                                    <p className="text-[10px] opacity-60">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Password Reset Section */}
                    <div className="pt-4 border-t border-zinc-800/50">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2 block">Segurança</label>
                        <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <KeyRound size={16} />
                                <span>Redefinir Senha</span>
                            </div>
                            {resetSent ? (
                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                    <Check size={14} /> Email Enviado
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handlePasswordReset}
                                    disabled={resetLoading || !user.email}
                                    className="text-xs font-bold text-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                                >
                                    {resetLoading ? 'Enviando...' : 'Enviar Email'}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1">O usuário receberá um link para criar uma nova senha.</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? <span className="animate-pulse">Salvando...</span> : <> <Save size={18} /> Salvar Alterações </>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditMemberModal;
