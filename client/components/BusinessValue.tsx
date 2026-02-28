import React from 'react';
import { Zap, ShieldCheck, Layers, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const BusinessValue: React.FC = () => {
    const { content } = useLanguage();
    const { businessValue } = content;

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Zap': return <Zap size={32} />;
            case 'ShieldCheck': return <ShieldCheck size={32} />;
            case 'Layers': return <Layers size={32} />;
            case 'TrendingUp': return <TrendingUp size={32} />;
            default: return <Zap size={32} />;
        }
    };

    return (
        <section id="business-value" className="py-24 px-6 md:px-12 lg:px-24 bg-dark relative overflow-hidden border-t border-slate-800">
            {/* Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.2]"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="text-primary font-mono text-sm tracking-widest uppercase mb-2 block">// VALUE</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        {businessValue.title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {businessValue.items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-darker/50 backdrop-blur border border-slate-800 p-8 rounded-sm hover:border-primary/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Hover corner accent */}
                            <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-transparent border-r-slate-800 group-hover:border-r-primary transition-all duration-300"></div>

                            <div className="mb-6 p-3 bg-surface/50 border border-slate-700 rounded-sm w-fit text-slate-400 group-hover:text-primary group-hover:border-primary/50 transition-colors duration-300">
                                {getIcon(item.iconName)}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-slate-400 leading-relaxed font-light text-sm">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BusinessValue;
