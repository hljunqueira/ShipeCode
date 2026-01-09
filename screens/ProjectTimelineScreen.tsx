import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

interface ProjectTimelineScreenProps {
    projects: Project[];
    onSelect: (id: string) => void;
}

/**
 * Tela de timeline horizontal de projetos
 */
const ProjectTimelineScreen: React.FC<ProjectTimelineScreenProps> = ({ projects, onSelect }) => {
    const scrollRef = useDraggableScroll();
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">
            {/* Immersive Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-600 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        Timeline de Projetos <span className="text-zinc-600 text-lg font-normal">/ 2026</span>
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/projects/new')}
                    className="pointer-events-auto bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:scale-105"
                >
                    <Plus size={16} /> Novo Projeto
                </button>
            </div>

            {/* Timeline Stream - COMPACT CARDS */}
            <div ref={scrollRef} className="flex-1 flex items-center justify-center overflow-x-auto px-20 gap-8 hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing">
                <div className="fixed top-1/2 left-0 w-full h-[1px] bg-zinc-800 z-0 pointer-events-none"></div>
                {projects.map((project, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <div key={project.id} onClick={() => onSelect(project.id)} className={`snap-center shrink-0 relative w-[240px] group cursor-pointer perspective-1000 ${isEven ? '-translate-y-14' : 'translate-y-14'}`}>

                            {/* Connector Line */}
                            <div className={`absolute left-1/2 w-[1px] h-14 bg-zinc-800 group-hover:bg-red-600/50 transition-colors z-0 ${isEven ? 'top-full' : 'bottom-full'}`}></div>

                            {/* Node on Line */}
                            <div className={`fixed top-1/2 ml-[119px] w-2.5 h-2.5 rounded-full z-0 transition-all duration-500 border-2 border-[#050505] ${project.status === 'BUILD' ? 'bg-red-500 shadow-[0_0_10px_rgba(220,38,38,1)]' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}></div>

                            {/* Compact Card */}
                            <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-4 transition-all duration-500 transform group-hover:scale-105 group-hover:border-red-500/30 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]">

                                {/* Top Meta */}
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                                        15 DEZ
                                    </span>
                                    <span className={`w-2 h-2 rounded-full ${project.status === 'BUILD' ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                                </div>

                                {/* Main Content */}
                                <h3 className="text-base font-bold text-white leading-tight mb-1 group-hover:text-red-500 transition-colors">{project.name}</h3>
                                <p className="text-[11px] text-zinc-400 mb-3">{project.clientName}</p>

                                {/* Footer Status */}
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${project.status === 'BUILD' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                        {project.status}
                                    </span>
                                    <ArrowUpRight size={12} className="text-zinc-600 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div className="w-20 shrink-0"></div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/5 via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};

export default ProjectTimelineScreen;
