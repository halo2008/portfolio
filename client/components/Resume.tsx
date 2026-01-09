import React from 'react';
import { Layers, Zap, Download, Calendar } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import TechStack from './TechStack';

const Resume: React.FC = () => {
    const { content } = useLanguage();
    const { philosophy, contact } = content;

    return (
        <section id="resume" className="py-24 px-6 md:px-12 lg:px-24 bg-slate-900/30 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Bio / Philosophy Section */}
                <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-3">
                            <Layers className="text-primary" />
                            {philosophy.title}
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            {philosophy.description}
                        </p>

                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 relative overflow-hidden group hover:border-primary/30 transition-colors mb-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2 relative z-10">
                                <Zap className="text-yellow-400" size={20} />
                                {philosophy.differentiatorTitle}
                            </h3>
                            <p className="text-slate-300 italic relative z-10 border-l-2 border-primary pl-4">
                                "{philosophy.differentiator}"
                            </p>
                        </div>

                        <a
                            href="/cv.pdf"
                            download
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700 hover:border-primary"
                        >
                            <Download size={18} />
                            {contact.buttons.cv}
                        </a>
                    </div>

                    <div className="relative">
                        {/* Visual Side (Image) from About */}
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group">
                            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                            <img
                                src={philosophy.image}
                                alt="Industrial IoT"
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-20 pointer-events-none"></div>
                        </div>
                        {/* Decorative blob */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none animate-pulse-slow"></div>
                    </div>
                </div>

                {/* Timeline Section (Static for now) */}
                <div className="mb-24">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                        <Calendar className="text-primary" />
                        Experience Timeline
                    </h3>
                    <div className="border-l-2 border-slate-800 ml-4 space-y-12">
                        {/* Item 1 */}
                        <div className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-darker"></div>
                            <span className="text-sm font-mono text-primary mb-1 block">2023 - Present</span>
                            <h4 className="text-xl font-bold text-white">Full-Stack AI Engineer</h4>
                            <p className="text-slate-400 mt-2">Freelance & B2B Consulting. Building RAG systems and autonomous agents.</p>
                        </div>
                        {/* Item 2 */}
                        <div className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-600 border-4 border-darker"></div>
                            <span className="text-sm font-mono text-slate-500 mb-1 block">2020 - 2023</span>
                            <h4 className="text-xl font-bold text-white">Cloud Infrastructure Architect</h4>
                            <p className="text-slate-400 mt-2">Designing scalable Kubernetes clusters and IoT integration layers.</p>
                        </div>
                        {/* Item 3 */}
                        <div className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-600 border-4 border-darker"></div>
                            <span className="text-sm font-mono text-slate-500 mb-1 block">2018 - 2020</span>
                            <h4 className="text-xl font-bold text-white">Industrial Automation Engineer</h4>
                            <p className="text-slate-400 mt-2">Connecting physical sensors (RS232/Modbus) to IT systems.</p>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <TechStack />

            </div>
        </section>
    );
};

export default Resume;
