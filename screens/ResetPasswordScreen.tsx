import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, Eye, EyeOff, Check, XCircle } from 'lucide-react';

const ResetPasswordScreen: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check if we are really in a recovery session?
        // Usually Supabase handles the session exchange automatically before rendering.
        // We can just verify if we have a user.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, maybe the link is invalid or expired
                setMessage({ type: 'error', text: 'Link inválido ou expirado. Tente solicitar novamente.' });
            }
        };
        checkSession();
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Senha alterada com sucesso! Redirecionando...' });

            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao redefinir senha.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-500">
                        <Lock size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Nova Senha</h1>
                    <p className="text-zinc-500 text-sm mt-2">Digite sua nova senha abaixo.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Nova Senha</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-4 pr-10 py-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Confirmar Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full bg-zinc-950 border rounded-lg px-4 py-3 text-white focus:ring-1 outline-none transition-all ${confirmPassword && password !== confirmPassword
                                    ? 'border-red-500/50 focus:ring-red-500'
                                    : 'border-zinc-700 focus:ring-cyan-500'
                                }`}
                            placeholder="Repita a senha"
                            required
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 text-sm ${message.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {message.type === 'success' ? <Check size={18} className="shrink-0 mt-0.5" /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white py-3.5 rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/20"
                    >
                        {isLoading ? 'Salvando...' : 'Redefinir Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;
