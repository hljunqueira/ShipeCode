import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Check } from 'lucide-react';
import { Role } from '../../types';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Modal para adicionar membros manualmente
 */
const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: Role.CONTRIBUTOR as Role,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        // Aggressive sanitization
        const cleanEmail = form.email.replace(/\s/g, '').toLowerCase(); // Remove ALL spaces and lowercase

        console.log(`[AddMember] Attempting signup for: '${cleanEmail}' (Length: ${cleanEmail.length})`);

        const cleanData = {
            ...form,
            name: form.name.trim(),
            email: cleanEmail,
            password: form.password.trim()
        };

        const result = await onAdd(cleanData);
        setIsLoading(false);

        if (result.success) {
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setForm({ name: '', email: '', password: '', role: Role.CONTRIBUTOR });
                onClose();
            }, 2000);
        } else {
            setErrorMsg(result.error || 'Erro ao criar usuário.');
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
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Adicionar Membro</h2>
                        <p className="text-xs text-zinc-500">Crie uma conta de acesso manualmente.</p>
                    </div>
                </div>

                {sent ? (
                    <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in-95">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <Check className="text-emerald-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Membro Adicionado!</h3>
                        <p className="text-sm text-zinc-500">{form.name} já pode fazer login.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                                {errorMsg}
                            </div>
                        )}
                        {/* Nome */}
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Nome</label>
                            <input
                                required
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                placeholder="Nome completo"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <Mail size={12} /> E-mail
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

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <Lock size={12} /> Senha Provisória
                            </label>
                            <input
                                type="text"
                                required
                                minLength={6}
                                value={form.password}
                                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2 pt-2">
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

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Criando conta...</span>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Criar Usuário
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddMemberModal;
