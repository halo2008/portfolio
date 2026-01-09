import React, { useState, useEffect } from 'react';
import { Server, Bot, Shield, Smartphone, Brain, Cloud, Wifi, X, CheckCircle2, Cpu, Rocket } from 'lucide-react';
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

  // Lock body scroll when modal is open
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
    <section id="projects" className="py-24 px-6 md:px-12 lg:px-24 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 text-center">
          {projects.title}
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {projects.items.map((project) => {
            const Icon = iconMap[project.iconName];
            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                {/* Image Header if available */}
                {project.image && (
                  <div className="h-56 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10 opacity-90" />
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg border border-slate-700 text-primary shadow-lg">
                      <Icon size={20} />
                    </div>
                    <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary text-darker text-xs font-bold px-3 py-1 rounded-full">
                      Click to Expand
                    </div>
                  </div>
                )}

                <div className={`p-8 flex flex-col flex-grow ${!project.image ? 'pt-8' : 'pt-4'}`}>
                  {!project.image && (
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Icon size={32} />
                      </div>
                    </div>
                  )}

                  <div className="mb-6 relative z-20">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                      {project.title}
                    </h3>
                    <p className="text-sm font-mono text-primary">{project.subtitle}</p>
                  </div>

                  <div className="space-y-4 mb-8 flex-grow relative z-20">
                    {/* Truncated preview for card */}
                    <div className="line-clamp-3 text-slate-400 text-sm">
                      {project.solution}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto relative z-20">
                    {project.tech.slice(0, 3).map(t => (
                      <span key={t} className="text-xs bg-slate-800/50 text-slate-400 px-2 py-1 rounded border border-slate-700/50">
                        {t}
                      </span>
                    ))}
                    {project.tech.length > 3 && (
                      <span className="text-xs bg-slate-800/50 text-slate-400 px-2 py-1 rounded border border-slate-700/50">
                        +{project.tech.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-darker/90 backdrop-blur-md animate-fade-in-up"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-slate-800/80 text-white rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm border border-slate-700"
            >
              <X size={24} />
            </button>

            {/* Left/Top: Visuals */}
            <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-slate-950">
              {selectedProject.image ? (
                <>
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-slate-900"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  {(() => {
                    const Icon = iconMap[selectedProject.iconName];
                    return <Icon size={64} className="text-slate-700" />;
                  })()}
                </div>
              )}

              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-mono rounded-full border border-primary/20 mb-2 backdrop-blur-sm">
                  {selectedProject.subtitle}
                </div>
                <h3 className="text-3xl font-bold text-white leading-tight shadow-black drop-shadow-lg">
                  {selectedProject.title}
                </h3>
              </div>
            </div>

            {/* Right/Bottom: Details */}
            <div className="w-full md:w-3/5 p-8 md:p-12 bg-slate-900 flex flex-col">

              <div className="space-y-8 flex-grow">
                {/* Challenge */}
                <div className="relative pl-6 border-l-2 border-red-500/30">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-red-500 rounded-full"></div>
                  <h4 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-2">{projects.labels.challenge}</h4>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {selectedProject.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div className="relative pl-6 border-l-2 border-blue-500/30">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-blue-500 rounded-full"></div>
                  <h4 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-2">{projects.labels.solution}</h4>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {selectedProject.solution}
                  </p>
                </div>

                {/* Result */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-green-500/20 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 bg-green-500/10 w-24 h-24 rounded-full blur-2xl"></div>
                  <h4 className="text-sm uppercase tracking-widest text-green-500 font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} /> {projects.labels.result}
                  </h4>
                  <p className="text-white font-medium text-lg relative z-10">
                    {selectedProject.result}
                  </p>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mt-8 pt-8 border-t border-slate-800">
                <h4 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                  <Cpu size={16} /> Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg hover:border-primary/50 transition-colors cursor-default"
                    >
                      {t}
                    </span>
                  ))}
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