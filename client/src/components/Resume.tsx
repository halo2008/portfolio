import React from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import TechStack from './TechStack';

const Resume: React.FC = () => {
    const { content } = useLanguage();
    const { contact } = content;

    return (
        <section id="resume" className="py-24 px-6 md:px-12 lg:px-24 bg-dark overflow-hidden border-t border-slate-800">
            <div className="max-w-7xl mx-auto">

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
