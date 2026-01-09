import React, { useState, useEffect } from 'react';
import { X, Edit3, User as UserIcon, DollarSign, Percent, Globe, Calendar, CheckCircle2 } from 'lucide-react';
import { Lead } from '../../types';

interface EditLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lead: Lead) => void;
    lead: Lead;
}

/**
 * Modal para editar leads existentes
 */
const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
    const [form, setForm] = useState({
        clientName: '',
        projectName: '',
        budget: '',
        probability: '',
        status: 'CONTACTED' as Lead['status'],
        source: 'MANUAL' as Lead['source'],
        notes: '',
    });

    useEffect(() => {
        if (lead) {
            setForm({
                clientName: lead.clientName,
                projectName: lead.projectName,
                budget: lead.budget.toString(),
                probability: lead.probability.toString(),
                status: lead.status,
                source: lead.source || 'MANUAL',
                notes: lead.notes || '',
            });
        }
    }, [lead, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updatedLead: Lead = {
            ...lead,
            clientName: form.clientName,
            projectName: form.projectName,
            budget: parseFloat(form.budget) || 0,
            probability: parseInt(form.probability) || 0,
            status: form.status,
            source: form.source,
            notes: form.notes || undefined,
        };

        onSave(updatedLead);
        onClose();
    };

    const statusOptions = [
        { value: 'NEW', label: 'Novo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        { value: 'CONTACTED', label: 'Contatado', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
        { value: 'QUALIFIED', label: 'Qualificado', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { value: 'CONVERTED', label: 'Convertido', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        { value: 'LOST', label: 'Perdido', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    ];

    const sourceOptions = [
        { value: 'MANUAL', label: 'Manual' },
        { value: 'REFERRAL', label: 'Indicação' },
        { value: 'CAMPAIGN_ADS', label: 'Campanha Ads' },
        { value: 'CAMPAIGN_LINKEDIN', label: 'LinkedIn' },
        { value: 'WEBSITE', label: 'Website' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Edit3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Editar Lead</h2>
                        <p className="text-xs text-zinc-500">Atualize as informações do lead.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Cliente e Projeto */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <UserIcon size={12} /> Cliente *
                            </label>
                            <input
                                required
                                value={form.clientName}
                                onChange={(e) => setForm(prev => ({ ...prev, clientName: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none"
                                placeholder="Nome do cliente"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Projeto *</label>
                            <input
                                required
                                value={form.projectName}
                                onChange={(e) => setForm(prev => ({ ...prev, projectName: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none"
                                placeholder="Nome do projeto"
                            />
                        </div>
                    </div>

                    {/* Orçamento e Probabilidade */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <DollarSign size={12} /> Orçamento (R$)
                            </label>
                            <input
                                type="number"
                                value={form.budget}
                                onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <Percent size={12} /> Probabilidade
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.probability}
                                    onChange={(e) => setForm(prev => ({ ...prev, probability: e.target.value }))}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none pr-8"
                                    placeholder="0"
                                />
                                <span className="absolute right-3 top-3 text-zinc-500">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Status</label>
                        <div className="grid grid-cols-5 gap-2">
                            {statusOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, status: opt.value as Lead['status'] }))}
                                    className={`py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${form.status === opt.value ? opt.color : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Origem */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                            <Globe size={12} /> Origem
                        </label>
                        <select
                            value={form.source}
                            onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value as Lead['source'] }))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none"
                        >
                            {sourceOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Notas</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                            placeholder="Observações sobre o lead..."
                        />
                    </div>

                    {/* Info */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 text-xs text-zinc-500">
                        <Calendar size={14} />
                        <span>Criado em: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
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
                            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <CheckCircle2 size={18} />
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLeadModal;
