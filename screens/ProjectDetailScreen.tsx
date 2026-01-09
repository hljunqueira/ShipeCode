import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Project } from '../types';
import ProjectDetail from '../components/ProjectDetail';

interface ProjectDetailScreenProps {
    projects: Project[];
    onUpdateProject: (project: Project) => void;
}

/**
 * Tela de detalhes do projeto com abas (Board, Financeiro, Contrato)
 */
const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({ projects, onUpdateProject }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = projects.find(p => p.id === id);

    if (!project) return <Navigate to="/projects" />;

    return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl"></div>
            </div>

            {/* Immersive Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => navigate('/projects')} className="w-10 h-10 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            {project.name}
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border tracking-wider ${project.status === 'BUILD' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                {project.status}
                            </span>
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{project.clientName}</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pt-24 pb-8 px-6 md:px-12 relative z-10 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    <ProjectDetail project={project} onUpdateProject={onUpdateProject} />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailScreen;
