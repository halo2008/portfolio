import React from 'react';
import { useLanguage } from '../LanguageContext';
import { FileText, Database, Brain, MessageSquare, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
    const { content } = useLanguage();
    const { howItWorks } = content.landing;

    const icons = {
        FileText: FileText,
        Database: Database,
        Brain: Brain,
        MessageSquare: MessageSquare
    };

    return (
        <section className="py-24 bg-darker relative border-t border-slate-900/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{howItWorks.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-slate-800 via-primary/50 to-slate-800 z-0"></div>

                    {howItWorks.steps.map((step, index) => {
                        const Icon = icons[step.iconName as keyof typeof icons] || FileText;
                        return (
                            <div key={index} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300">
                                    <Icon size={40} className="text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">{step.description}</p>

                                {/* Mobile Arrow */}
                                {index < howItWorks.steps.length - 1 && (
                                    <div className="lg:hidden my-4 text-slate-700">
                                        <ArrowRight size={24} className="rotate-90" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
