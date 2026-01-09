import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FolderKanban, ChevronRight,
    Clock, CheckCircle
} from 'lucide-react';
import { ProjectStatus, Project, Task } from '../../types';
import { PROJECT_STATUS_LABELS } from '../../constants';
import ClienteProjectModal from './ClienteProjectModal';

interface ClienteDashboardProps {
    projects: Project[];
    onAddTask?: (projectId: string, task: Omit<Task, 'id'>) => void;
}

/**
 * Dashboard para Cliente - Apenas projetos
 * Clica no card abre modal simplificado, não navega
 */
const ClienteDashboard: React.FC<ClienteDashboardProps> = ({ projects, onAddTask }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const activeProjects = projects.filter(p => p.status !== ProjectStatus.DEPLOYED);

    return (
        <div className="space-y-6">

            {/* Seus Projetos */}
            <section className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                            <FolderKanban size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Seus Projetos</h3>
                            <p className="text-xs text-zinc-500">{activeProjects.length} em andamento</p>
                        </div>
                    </div>
                    <Link to="/projects" className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium">
                        Ver todos <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="p-4 md:p-6">
                    {activeProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderKanban size={48} className="mx-auto text-zinc-700 mb-4" />
                            <p className="text-zinc-600">Nenhum projeto em andamento.</p>
                            <p className="text-zinc-700 text-sm mt-1">Seus projetos aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeProjects.map(project => (
                                <button
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 hover:border-red-500/30 transition-all group text-left w-full"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${project.status === ProjectStatus.BUILD ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                project.status === ProjectStatus.DEPLOYED ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    project.status === ProjectStatus.QA ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                        'bg-zinc-800 border-zinc-700 text-zinc-400'
                                            }`}>
                                            {PROJECT_STATUS_LABELS[project.status]}
                                        </span>
                                        <ChevronRight size={14} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1 group-hover:text-red-400 transition-colors">{project.name}</h4>

                                    {/* Barra de progresso */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                            <span>Progresso</span>
                                            <span>{Math.round((project.tasks.filter(t => t.status === 'DONE').length / Math.max(project.tasks.length, 1)) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all"
                                                style={{ width: `${(project.tasks.filter(t => t.status === 'DONE').length / Math.max(project.tasks.length, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-[10px] text-zinc-600">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle size={10} /> {project.tasks.filter(t => t.status === 'DONE').length} de {project.tasks.length}
                                        </span>
                                        {project.targetDate && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} /> {new Date(project.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal do Projeto */}
            {selectedProject && (
                <ClienteProjectModal
                    project={selectedProject}
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onAddTask={onAddTask}
                />
            )}

        </div>
    );
};

export default ClienteDashboard;
