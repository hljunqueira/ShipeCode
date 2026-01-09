import React, { useState } from 'react';
import { X, UserPlus, Mail, Send, Check, Copy } from 'lucide-react';
import { Role } from '../../types';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: Role, name: string) => void;
}

/**
 * Modal para convidar novos membros para a equipe
 */
const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onInvite }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: Role.CONTRIBUTOR as Role,
    });
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite(form.email, form.role, form.name);
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setForm({ name: '', email: '', role: Role.CONTRIBUTOR });
            onClose();
        }, 2000);
    };

    const inviteLink = `https://shipcode.app/invite/${btoa(Date.now().toString()).slice(0, 8)}`;

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Convidar Membro</h2>
                        <p className="text-xs text-zinc-500">Adicione novos membros à equipe.</p>
                    </div>
                </div>

                {sent ? (
                    <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in-95">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <Check className="text-emerald-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Convite Enviado!</h3>
                        <p className="text-sm text-zinc-500">Um e-mail foi enviado para {form.email}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Nome</label>
                            <input
                                required
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                placeholder="Nome do membro"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <Mail size={12} /> E-mail *
                            </label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                placeholder="email@exemplo.com"
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

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-zinc-900 px-3 text-xs text-zinc-600">ou compartilhe o link</span>
                            </div>
                        </div>

                        {/* Share Link */}
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={inviteLink}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-500 font-mono"
                            />
                            <button
                                type="button"
                                onClick={copyLink}
                                className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-medium ${copied
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                                    }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                        >
                            <Send size={18} />
                            Enviar Convite
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InviteMemberModal;
