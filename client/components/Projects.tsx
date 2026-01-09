import React, { useState, useEffect } from 'react';
import { Server, Bot, Shield, Smartphone, Brain, Cloud, Wifi, X, CheckCircle2, Cpu, Rocket, ChevronRight, Hash } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Project } from '../types';

const iconMap: Record<string, React.ElementType> = {
  'Server': Server,
  'Bot': Bot,
  'Shield': Shield,
  'Smartphone': Smartphone,
  'Brain': Brain,
  'Cloud': Cloud,
  'Wifi': Wifi,
  'Rocket': Rocket
};

const Projects: React.FC = () => {
  const { content } = useLanguage();
  const { projects } = content;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  return (
    <section id="projects" className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20 relative bg-darker">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center mb-16">
          <span className="text-primary font-mono text-sm tracking-widest uppercase mb-2">[ WORK_LOG ]</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center">
            {projects.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.items.map((project) => {
            const Icon = iconMap[project.iconName] || Rocket;
            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-surface border border-slate-800 rounded-sm overflow-hidden hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col"
              >
                {/* Header Decoration */}
                <div className="h-1 w-full bg-slate-800 group-hover:bg-primary transition-colors"></div>

                {project.image ? (
                  <div className="h-56 overflow-hidden relative border-b border-slate-800">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 right-4 bg-darker/90 backdrop-blur border border-slate-700 p-2 rounded-sm text-primary">
                      <Icon size={18} />
                    </div>
                    {/* ID Badge */}
                    <div className="absolute top-4 left-4 font-mono text-xs bg-black/50 backdrop-blur px-2 py-1 text-slate-300 border border-slate-700 rounded-sm">
                      ID: {project.title.substring(0, 3).toUpperCase()}_0{project.id}
                    </div>
                  </div>
                ) : (
                  <div className="h-56 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center border-b border-slate-800 relative overflow-hidden">
                    <Icon size={64} className="text-slate-700 group-hover:text-primary/20 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                  </div>
                )}

                <div className="p-8 flex flex-col flex-grow">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                      {project.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">{project.subtitle}</p>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 font-light">
                    {project.challenge}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-800 flex flex-wrap gap-2">
                    {project.tech.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] font-mono bg-darker text-slate-400 px-2 py-1 rounded-sm border border-slate-800 uppercase tracking-tight">
                        {t}
                      </span>
                    ))}
                    {project.tech.length > 3 && (
                      <span className="text-[10px] font-mono text-primary px-2 py-1">+ {project.tech.length - 3}</span>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Industrial Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm animate-fade-in-up"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-surface border border-slate-600 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row rounded-sm"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-0 right-0 z-50 p-4 bg-darker text-slate-400 hover:text-white hover:bg-red-900/50 transition-colors border-l border-b border-slate-700"
            >
              <X size={24} />
            </button>

            {/* Left Col */}
            <div className="w-full md:w-5/12 bg-darker border-r border-slate-700 relative flex flex-col">
              <div className="h-64 md:h-80 w-full relative border-b border-slate-700 overflow-hidden">
                {selectedProject.image ? (
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover grayscale opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    {(() => { const Icon = iconMap[selectedProject.iconName] || Rocket; return <Icon size={80} className="text-slate-800" />; })()}
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
              </div>

              <div className="p-8 flex-grow">
                <div className="font-mono text-xs text-primary mb-2">PROJECT_ID: {selectedProject.id}</div>
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{selectedProject.title}</h3>
                <p className="text-sm text-slate-500 font-mono mb-6">{selectedProject.subtitle}</p>

                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <Cpu size={14} /> Technology Stack
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech.map(t => (
                      <span key={t} className="px-2 py-1 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono rounded-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="w-full md:w-7/12 p-8 md:p-12 bg-surface">
              <div className="space-y-10">
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 border-l-2 border-slate-600 pl-3">
                    {projects.labels.challenge}
                  </h4>
                  <p className="text-slate-300 leading-relaxed font-light text-lg">
                    {selectedProject.challenge}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 border-l-2 border-primary pl-3">
                    {projects.labels.solution}
                  </h4>
                  <p className="text-slate-300 leading-relaxed font-light text-lg">
                    {selectedProject.solution}
                  </p>
                </div>

                <div className="bg-darker border border-slate-700 p-6 rounded-sm relative mt-4">
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>

                  <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} /> {projects.labels.result}
                  </h4>
                  <p className="text-white text-lg font-medium">
                    {selectedProject.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;