import React from 'react';
import { X, CheckCircle2, ThumbsUp, ThumbsDown, Globe } from 'lucide-react';
import { Lead } from '../../types';

interface IncomingLeadsModalProps {
    isOpen: boolean;
    onClose: () => void;
    leads: Lead[];
    onAction: (lead: Lead, approved: boolean) => void;
}

/**
 * Modal para revisar e aprovar/rejeitar leads vindos de campanhas
 */
const IncomingLeadsModal: React.FC<IncomingLeadsModalProps> = ({ isOpen, onClose, leads, onAction }) => {
    if (!isOpen) return null;

    const pendingLeads = leads.filter(l => l.status === 'NEW');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Background Gradient Spot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md h-auto min-h-[600px] flex flex-col relative z-10 px-4">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            Fila de Aprovação
                            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{pendingLeads.length}</span>
                        </h2>
                        <p className="text-zinc-500 text-sm">Analise novas oportunidades vindas de campanhas.</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:bg-zinc-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Cards Container */}
                <div className="flex-1 relative">
                    {pendingLeads.length === 0 ? (
                        <div className="w-full h-[400px] flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-2">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <p className="font-medium">Tudo limpo por aqui!</p>
                            <p className="text-xs text-zinc-600 max-w-[200px] text-center">Novos leads aparecerão automaticamente nesta fila.</p>
                            <button onClick={onClose} className="mt-4 text-sm text-zinc-400 hover:text-white underline">
                                Voltar ao Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-12 hide-scrollbar">
                            {pendingLeads.map((lead) => (
                                <div key={lead.id} className="snap-center shrink-0 w-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-1 shadow-2xl relative flex flex-col group">

                                    {/* Card Content */}
                                    <div className="p-7 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                                                <Globe size={10} className="text-blue-500" />
                                                {lead.source?.replace('CAMPAIGN_', '') || 'AUTO'}
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        </div>

                                        <h3 className="text-3xl font-bold text-white leading-tight mb-2 tracking-tight">{lead.clientName}</h3>
                                        <p className="text-zinc-400 font-medium mb-8 text-lg">{lead.projectName}</p>

                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Orçamento</span>
                                                <span className="font-mono text-emerald-400 font-bold">R$ {lead.budget.toLocaleString('pt-BR')}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Data</span>
                                                <span className="font-mono text-zinc-300">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="p-2 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => onAction(lead, false)}
                                            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-red-950/30 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-wide group/btn"
                                        >
                                            <ThumbsDown size={18} className="group-hover/btn:-rotate-12 transition-transform" /> Rejeitar
                                        </button>
                                        <button
                                            onClick={() => onAction(lead, true)}
                                            className="flex items-center justify-center gap-2 bg-white text-black hover:bg-emerald-400 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] group/btn"
                                        >
                                            <ThumbsUp size={18} className="group-hover/btn:-rotate-12 transition-transform" /> Aprovar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Dots (Visual Only if needed, simpler to omit for clean UX) */}
                {pendingLeads.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4 absolute bottom-4 left-0 w-full pointer-events-none">
                        {pendingLeads.map((_, idx) => (
                            <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-zinc-800'}`}></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomingLeadsModal;
