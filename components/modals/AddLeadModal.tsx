import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Lead } from '../../types';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (lead: Lead) => void;
}

/**
 * Modal para adicionar um novo lead manualmente
 */
const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({
        clientName: '',
        projectName: '',
        budget: '',
        probability: '50'
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Lead = {
            id: `l-${Date.now()}`,
            clientName: form.clientName,
            projectName: form.projectName,
            budget: parseFloat(form.budget) || 0,
            probability: parseInt(form.probability),
            status: 'CONTACTED',
            source: 'MANUAL',
            createdAt: new Date().toISOString()
        };
        onAdd(newLead);
        onClose();
        setForm({ clientName: '', projectName: '', budget: '', probability: '50' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Plus size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Novo Lead Manual</h2>
                        <p className="text-xs text-zinc-500">Inserção direta no pipeline.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Cliente</label>
                        <input
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                            placeholder="Ex: Tech Solutions"
                            value={form.clientName}
                            onChange={e => setForm({ ...form, clientName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Projeto</label>
                        <input
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                            placeholder="Ex: App Delivery"
                            value={form.projectName}
                            onChange={e => setForm({ ...form, projectName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Orçamento (Est.)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-zinc-500 text-sm">R$</span>
                            <input
                                type="number"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white focus:border-amber-500 outline-none"
                                placeholder="0.00"
                                value={form.budget}
                                onChange={e => setForm({ ...form, budget: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Probabilidade Inicial</label>
                            <span className="text-xs font-bold text-amber-500">{form.probability}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" step="5"
                            className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            value={form.probability}
                            onChange={e => setForm({ ...form, probability: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-lg mt-2 transition-colors">
                        Cadastrar Lead
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLeadModal;
