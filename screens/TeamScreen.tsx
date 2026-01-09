import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Github, Linkedin, Mail, Users } from 'lucide-react';
import { User, Role } from '../types';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import InviteMemberModal from '../components/modals/InviteMemberModal';
import { useNotifications } from '../contexts/NotificationsContext';

interface TeamScreenProps {
    users: User[];
}

/**
 * Tela de gestão da equipe
 */
const TeamScreen: React.FC<TeamScreenProps> = ({ users }) => {
    const scrollRef = useDraggableScroll();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [showInviteModal, setShowInviteModal] = useState(false);

    const handleInvite = (email: string, role: Role, name: string) => {
        // Simula envio de convite
        addNotification({
            type: 'success',
            title: 'Convite Enviado',
            message: `Um convite foi enviado para ${email} como ${role}.`,
        });
    };

    return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">

            {/* Invite Modal */}
            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onInvite={handleInvite}
            />

            {/* Immersive Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-cyan-500 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        Rede da Equipe <span className="text-zinc-600 text-lg font-normal">/ Talents</span>
                    </h1>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="pointer-events-auto bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all hover:scale-105"
                >
                    <Plus size={16} /> Convidar Membro
                </button>
            </div>

            {/* Team Stream - Compact Tag Cards */}
            <div ref={scrollRef} className="flex-1 flex items-center overflow-x-auto px-40 gap-8 hide-scrollbar cursor-grab active:cursor-grabbing">
                <div className="fixed top-1/2 left-0 w-full h-[1px] bg-zinc-800 z-0 pointer-events-none"></div>
                {users.map((user, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <div key={user.id} className={`snap-center shrink-0 relative w-[240px] group cursor-pointer perspective-1000 ${isEven ? '-translate-y-14' : 'translate-y-14'}`}>

                            {/* Connector Line */}
                            <div className={`absolute left-1/2 w-[1px] h-14 bg-zinc-800 group-hover:bg-cyan-500/50 transition-colors z-0 ${isEven ? 'top-full' : 'bottom-full'}`}></div>

                            {/* Node on Line */}
                            <div className="fixed top-1/2 ml-[119px] w-2.5 h-2.5 rounded-full z-0 transition-all duration-500 border-2 border-[#050505] bg-zinc-700 group-hover:bg-cyan-500 shadow-sm"></div>

                            {/* Card Container - Compact */}
                            <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-4 transition-all duration-500 transform group-hover:scale-105 group-hover:border-cyan-500/30 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-zinc-800 overflow-hidden group-hover:border-cyan-500 transition-colors">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                <Users size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-0.5 leading-none">{user.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Online</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="inline-block px-2 py-0.5 rounded bg-cyan-950/30 border border-cyan-900 text-cyan-400 text-[10px] font-bold tracking-wide">
                                        {user.role}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                                    <div className="flex gap-2">
                                        {user.githubUrl && (
                                            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <Github size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                                            </a>
                                        )}
                                        {user.linkedinUrl && (
                                            <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <Linkedin size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                                            </a>
                                        )}
                                        {user.email && (
                                            <a href={`mailto:${user.email}`} onClick={(e) => e.stopPropagation()}>
                                                <Mail size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-600">
                                        ID: {user.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div className="w-40 shrink-0"></div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/5 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default TeamScreen;
