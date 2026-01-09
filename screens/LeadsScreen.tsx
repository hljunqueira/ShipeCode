import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import { Lead } from '../types';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import AddLeadModal from '../components/modals/AddLeadModal';
import IncomingLeadsModal from '../components/modals/IncomingLeadsModal';
import EditLeadModal from '../components/modals/EditLeadModal';

interface LeadsScreenProps {
    leads: Lead[];
    onAdd: (lead: Lead) => void;
    onUpdate: (lead: Lead) => void;
}

/**
 * Tela de pipeline de leads (CRM)
 */
const LeadsScreen: React.FC<LeadsScreenProps> = ({ leads, onAdd, onUpdate }) => {
    const scrollRef = useDraggableScroll();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showIncomingModal, setShowIncomingModal] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const pendingCount = leads.filter(l => l.status === 'NEW').length;

    const handleIncomingAction = (lead: Lead, approved: boolean) => {
        const updatedLead: Lead = {
            ...lead,
            status: approved ? 'QUALIFIED' : 'LOST'
        };
        onUpdate(updatedLead);
    };

    const handleLeadClick = (lead: Lead) => {
        setEditingLead(lead);
    };

    const handleSaveLead = (lead: Lead) => {
        onUpdate(lead);
        setEditingLead(null);
    };

    return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">

            {/* Modals */}
            <AddLeadModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={onAdd} />
            <IncomingLeadsModal
                isOpen={showIncomingModal}
                onClose={() => setShowIncomingModal(false)}
                leads={leads}
                onAction={handleIncomingAction}
            />
            {editingLead && (
                <EditLeadModal
                    isOpen={!!editingLead}
                    onClose={() => setEditingLead(null)}
                    onSave={handleSaveLead}
                    lead={editingLead}
                />
            )}

            {/* Immersive Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-amber-500 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        Radar de Leads <span className="text-zinc-600 text-lg font-normal">/ Pipeline</span>
                    </h1>
                </div>
                <div className="flex gap-4 pointer-events-auto">
                    {pendingCount > 0 && (
                        <button
                            onClick={() => setShowIncomingModal(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all animate-pulse"
                        >
                            <Filter size={16} /> Revisar Pendentes ({pendingCount})
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105"
                    >
                        <Plus size={16} /> Adicionar Lead
                    </button>
                </div>
            </div>

            {/* Leads Stream - Compact Timeline-style cards */}
            <div ref={scrollRef} className="flex-1 flex items-center justify-center overflow-x-auto px-20 gap-8 hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing">
                <div className="fixed top-1/2 left-0 w-full h-[1px] bg-zinc-800 z-0 pointer-events-none"></div>
                {leads.filter(l => l.status !== 'NEW' && l.status !== 'LOST').map((lead, index) => {
                    const isEven = index % 2 === 0;
                    const isHot = lead.probability >= 70;
                    const isConverted = lead.status === 'CONVERTED';

                    return (
                        <div
                            key={lead.id}
                            onClick={() => handleLeadClick(lead)}
                            className={`snap-center shrink-0 relative w-[240px] group cursor-pointer perspective-1000 ${isEven ? '-translate-y-14' : 'translate-y-14'}`}
                        >

                            {/* Connector Line */}
                            <div className={`absolute left-1/2 w-[1px] h-14 bg-zinc-800 group-hover:bg-amber-500/50 transition-colors z-0 ${isEven ? 'top-full' : 'bottom-full'}`}></div>

                            {/* Node on Line */}
                            <div className={`fixed top-1/2 ml-[119px] w-2.5 h-2.5 rounded-full z-0 transition-all duration-500 border-2 border-[#050505] 
                ${isConverted ? 'bg-emerald-500' : isHot ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]' : 'bg-zinc-700 group-hover:bg-amber-500'}`}>
                            </div>

                            {/* Compact Card */}
                            <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-4 transition-all duration-500 transform group-hover:scale-105 group-hover:border-amber-500/30 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">

                                {/* Top Meta */}
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase() : 'N/A'}
                                    </span>
                                    <span className={`w-2 h-2 rounded-full ${isConverted ? 'bg-emerald-500' : isHot ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                                </div>

                                {/* Main Content */}
                                <h3 className="text-base font-bold text-white leading-tight mb-1 group-hover:text-amber-500 transition-colors">{lead.clientName}</h3>
                                <p className="text-[11px] text-zinc-400 mb-3 truncate">{lead.projectName}</p>

                                {/* Budget */}
                                <p className="text-sm font-mono text-amber-400 mb-3">
                                    R$ {lead.budget.toLocaleString('pt-BR')}
                                </p>

                                {/* Footer Status */}
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border 
                      ${isConverted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                isHot ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                    'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-zinc-500 font-mono">
                                            {lead.probability}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div className="w-20 shrink-0"></div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/5 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default LeadsScreen;
