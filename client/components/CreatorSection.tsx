import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Linkedin, Github } from 'lucide-react';

const CreatorSection: React.FC = () => {
    const { content } = useLanguage();
    const { creator } = content.landing;

    return (
        <section className="py-24 relative overflow-hidden">

            <div className="max-w-4xl mx-auto px-6 lg:px-24 text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-12">{creator.title}</h2>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 lg:p-12 backdrop-blur-sm relative group hover:border-slate-700 transition-colors">

                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl">
                                <img src={creator.image} alt={creator.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-4 border-slate-900 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{creator.name}</h3>
                                <p className="text-primary font-medium">{creator.role}</p>
                            </div>
                            <p className="text-slate-400 text-lg italic max-w-2xl mx-auto">
                                "{creator.bio}"
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-slate-800 hover:bg-[#0077b5] hover:text-white text-slate-400 transition-all">
                                <Linkedin size={20} />
                            </a>
                            <a href="/cv" className="px-6 py-2.5 rounded-full bg-slate-800 border border-slate-600 hover:border-primary text-white font-medium text-sm transition-all hover:bg-slate-700">
                                View Full CV / Resume
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CreatorSection;
