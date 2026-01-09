import React from 'react';
import { Layers, Zap, Download, Calendar } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import TechStack from './TechStack';

const Resume: React.FC = () => {
    const { content } = useLanguage();
    const { philosophy, contact } = content;

    return (
        <section id="resume" className="py-24 px-6 md:px-12 lg:px-24 bg-dark overflow-hidden border-t border-slate-800">
            <div className="max-w-7xl mx-auto">

                {/* Bio / Philosophy Section */}
                <div className="grid md:grid-cols-2 gap-16 items-start mb-24">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-6 text-primary font-mono text-sm tracking-wider uppercase">
                            <Layers size={16} />
                            <span>About Me</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {philosophy.title}
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light border-l-2 border-slate-700 pl-6">
                            {philosophy.description}
                        </p>

                        <div className="bg-surface p-8 rounded-sm border-l-4 border-primary shadow-lg mb-8 relative">
                            {/* Tech accent lines */}
                            <div className="absolute top-0 right-0 p-2 opacity-20">
                                <Zap className="text-primary" size={48} />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                {philosophy.differentiatorTitle}
                            </h3>
                            <p className="text-slate-300 text-sm font-mono leading-relaxed">
                                {philosophy.differentiator}
                            </p>
                        </div>

                        <a
                            href="/cv.pdf"
                            download
                            className="inline-flex items-center gap-3 px-6 py-3 bg-transparent hover:bg-slate-800 text-white font-mono text-sm rounded-sm transition-all border border-slate-600 hover:border-primary group"
                        >
                            <Download size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                            {contact.buttons.cv}
                        </a>
                    </div>

                    <div className="relative mt-8 md:mt-0">
                        {/* Visual Side (Image) */}
                        <div className="relative rounded-sm overflow-hidden border border-slate-700 bg-surface shadow-2xl">
                            {/* Image Overlay */}
                            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10"></div>
                            <img
                                src={philosophy.image || "/portrait.jpg"} // Fallback if empty
                                alt="Industrial Context"
                                className="w-full h-auto object-cover grayscale opacity-80"
                            />
                            {/* Grid overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                            {/* Tech readout */}
                            <div className="absolute bottom-0 left-0 right-0 bg-darker/90 border-t border-slate-700 p-4 flex justify-between items-center font-mono text-xs text-slate-400">
                                <span>IMG_SOURCE: INDUSTRIAL_CAM_04</span>
                                <span className="text-primary animate-pulse">REC ●</span>
                            </div>
                        </div>
                        {/* Underlay decoration */}
                        <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full border border-slate-800 rounded-sm"></div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="mb-24 px-4 md:px-0">
                    <div className="flex items-center gap-3 mb-10 text-white font-bold text-2xl">
                        <Calendar className="text-amber-500" size={24} />
                        <h3 className="font-mono">{content.timeline.title}</h3>
                    </div>

                    <div className="relative ml-4 md:ml-8 border-l border-slate-800 space-y-12">
                        {content.timeline.items.map((item) => (
                            <div key={item.id} className="relative pl-8 md:pl-12 group">
                                {/* Dot */}
                                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-sm transition-colors ${item.isCurrent
                                        ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                        : "bg-slate-600 group-hover:bg-slate-400"
                                    }`}></div>

                                {/* Period */}
                                <span className={`text-xs font-mono mb-1 block ${item.isCurrent
                                        ? "text-amber-500 px-2 py-0.5 bg-amber-500/10 w-fit rounded-sm border border-amber-500/20"
                                        : "text-slate-500"
                                    }`}>
                                    {item.period}
                                </span>

                                {/* Title */}
                                <h4 className={`text-xl font-bold text-white transition-colors ${item.isCurrent ? "group-hover:text-amber-500" : "group-hover:text-slate-300"
                                    }`}>
                                    {item.role}
                                </h4>
                                <div className="text-sm font-mono text-slate-500 mb-2">{item.company}</div>

                                {/* Description */}
                                <p
                                    className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: item.description.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-300">$1</strong>') }}
                                />

                                {/* Details List */}
                                {item.details && item.details.length > 0 && (
                                    <ul className={`mt-3 space-y-1 text-sm text-slate-400 list-disc list-inside ${item.isCurrent ? "marker:text-amber-500/50" : "marker:text-slate-600"
                                        }`}>
                                        {item.details.map((detail, index) => (
                                            <li key={index} dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-300">$1</strong>') }} />
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <TechStack />

            </div>
        </section>
    );
};

export default Resume;
