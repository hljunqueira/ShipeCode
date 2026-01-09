import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Rocket, Mail, Lock, Loader2,
    FolderKanban, Users, Zap, BarChart3, FileText, Bot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Tela de Login
 * Apresenta o ShipeCode OS e permite autenticação
 */
const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        let result;

        try {
            console.log('[LoginScreen] Chamando login()...');
            result = await login(email, password);
            console.log('[LoginScreen] Resultado login:', result);

            if (result.success) {
                console.log('[LoginScreen] Login bem-sucedido. Tentando navegar para / ...');
                navigate('/', { replace: true });
                console.log('[LoginScreen] Função navigate chamada.');
            } else {
                console.warn('[LoginScreen] Login falhou:', result.error);
                setError(result.error || 'Erro ao fazer login.');
                setIsLoading(false); // Re-enable button on failure
            }
        } catch (err) {
            console.error('[LoginScreen] Erro no catch:', err);
            setError('Erro ao fazer login. Tente novamente.');
            setIsLoading(false);
        }
    };

    const features = [
        { icon: FolderKanban, title: 'Gestão de Projetos', desc: 'Kanban, timeline e controle de entregas' },
        { icon: Zap, title: 'Pipeline de Leads', desc: 'CRM visual para conversão de vendas' },
        { icon: Users, title: 'Gestão de Equipe', desc: 'Alocação e produtividade do time' },
        { icon: BarChart3, title: 'Financeiro', desc: 'Receitas, custos e margem em tempo real' },
        { icon: FileText, title: 'Contratos', desc: 'Geração e assinatura digital' },
        { icon: Bot, title: 'Assistente IA', desc: 'Sugestões inteligentes com Gemini' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-200 flex">

            {/* Left Panel - Branding & Features */}
            <div className="hidden lg:flex flex-col w-1/2 items-center justify-center p-12 relative overflow-hidden bg-zinc-900/20 border-r border-zinc-800/50">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none"></div>

                {/* Main Content Centered */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Large Logo */}
                    <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center text-white font-bold text-5xl shadow-[0_0_50px_rgba(220,38,38,0.3)] mb-8 transform hover:scale-105 transition-transform duration-500">
                        S
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        ShipeCode OS
                    </h1>

                    {/* Simple Description */}
                    <p className="text-zinc-500 text-lg max-w-sm leading-relaxed">
                        Gerencie projetos, leads, equipe e finanças em um único lugar.
                    </p>
                </div>

                {/* Footer */}
                <div className="absolute bottom-12 text-xs text-zinc-700 font-mono">
                    © 2026 ShipeCode
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                            S
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">ShipeCode OS</h1>
                            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">v2.4.0</p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Rocket className="text-red-500" size={28} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h2>
                            <p className="text-zinc-500 text-sm">Entre para acessar sua sala de controle</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                                    E-mail
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white py-3.5 rounded-lg font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        <Rocket size={18} />
                                        Entrar no Sistema
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Demo Notice */}

                    </div>

                    {/* Mobile Features */}
                    <div className="lg:hidden mt-8 text-center">
                        <p className="text-zinc-500 text-sm mb-4">Gerencie em um só lugar:</p>
                        <div className="flex justify-center gap-4 text-zinc-600">
                            <FolderKanban size={20} />
                            <Zap size={20} />
                            <Users size={20} />
                            <BarChart3 size={20} />
                            <Bot size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
