import React from 'react';
import { Rocket, Brain, Wifi } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Services: React.FC = () => {
    const { content } = useLanguage();
    const { services } = content;

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Rocket': return <Rocket size={40} />;
            case 'Brain': return <Brain size={40} />;
            case 'Wifi': return <Wifi size={40} />;
            default: return <Rocket size={40} />;
        }
    };

    return (
        <section id="services" className="py-24 px-6 md:px-12 lg:px-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-slate-900/0 via-primary/5 to-slate-900/0 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
                    {services.title}
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {services.items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl hover:border-primary/50 hover:bg-slate-800/60 transition-all duration-300 group hover:-translate-y-2"
                        >
                            <div className="mb-6 p-4 bg-slate-900/50 rounded-xl w-fit text-primary group-hover:text-white group-hover:bg-primary transition-colors duration-300">
                                {getIcon(item.iconName)}
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-slate-400 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
