import React from 'react';
import { Brain, Wifi, Cloud, Bot, Check, ArrowRight, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { BlurFade } from './ui/blur-fade';
import { Spotlight } from './ui/spotlight';
import { LEAD_SERVICE_EVENT } from './Contact';

const ICONS: Record<string, LucideIcon> = { Cloud, Wifi, Brain, Bot };

const Services: React.FC = () => {
    const { content } = useLanguage();
    const { services } = content;

    const preselect = (service: string) =>
        window.dispatchEvent(new CustomEvent(LEAD_SERVICE_EVENT, { detail: service }));

    return (
        <section id="services" className="py-24 px-6 md:px-12 lg:px-24 bg-darker border-t border-slate-800">
            <div className="max-w-7xl mx-auto">
                <BlurFade inView>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-14 max-w-3xl">{services.title}</h2>
                </BlurFade>

                <div className="grid md:grid-cols-2 gap-6">
                    {services.items.map((item, index) => {
                        const Icon = ICONS[item.iconName] ?? Cloud;
                        return (
                            <BlurFade key={item.title} inView delay={index * 0.1} className="h-full">
                                <article className="group relative h-full flex flex-col overflow-hidden rounded-sm border border-slate-800 bg-dark transition-colors duration-300 hover:border-slate-600">
                                    <Spotlight className="from-primary/40 via-primary/10 to-transparent blur-3xl" size={260} />

                                    <div className="relative aspect-[3/1] overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt=""
                                            loading="lazy"
                                            width={1200}
                                            height={800}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        />
                                    </div>

                                    <div className="relative flex flex-col flex-1 p-8">
                                        <Icon size={32} className="text-primary mb-6" />
                                        <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                        <p className="text-slate-400 leading-relaxed mb-8">{item.description}</p>

                                        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
                                            {services.deliverablesLabel}
                                        </p>
                                        <ul className="space-y-3 mb-8">
                                            {item.deliverables.map(deliverable => (
                                                <li key={deliverable} className="flex gap-3 text-sm text-slate-300">
                                                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                                                    {deliverable}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-auto pt-6 border-t border-slate-800">
                                            <p className="text-sm text-slate-400 mb-5">
                                                <span className="text-slate-500">{services.firstStepLabel}: </span>
                                                {item.firstStep}
                                            </p>
                                            <a
                                                href="#contact"
                                                onClick={() => preselect(item.title)}
                                                className="inline-flex items-center gap-2 font-bold text-primary"
                                            >
                                                {services.cta}
                                                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </BlurFade>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;
