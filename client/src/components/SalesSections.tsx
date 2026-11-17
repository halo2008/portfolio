import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { BlurFade } from './ui/blur-fade';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';

export const Process: React.FC = () => {
    const { process } = useLanguage().content;

    return (
        <section id="process" className="py-24 px-6 md:px-12 lg:px-24 bg-dark border-t border-slate-800">
            <div className="max-w-7xl mx-auto">
                <BlurFade inView>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-14 max-w-3xl">{process.title}</h2>
                </BlurFade>

                <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {process.steps.map((step, index) => (
                        <BlurFade key={step.title} inView delay={index * 0.1}>
                            <li className="border-t border-slate-700 pt-6">
                                <span className="block font-mono text-primary text-sm mb-4">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{step.description}</p>
                            </li>
                        </BlurFade>
                    ))}
                </ol>
            </div>
        </section>
    );
};

export const Faq: React.FC = () => {
    const { faq } = useLanguage().content;

    return (
        <section id="faq" className="py-24 px-6 md:px-12 lg:px-24 bg-dark border-t border-slate-800">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.6fr] gap-12">
                <BlurFade inView>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">{faq.title}</h2>
                </BlurFade>

                <BlurFade inView delay={0.1}>
                    <Accordion
                        className="divide-y divide-slate-800 border-y border-slate-800"
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {faq.items.map(item => (
                            <AccordionItem key={item.question} value={item.question} className="py-5">
                                <AccordionTrigger className="group w-full flex items-center justify-between gap-6 text-left text-lg font-bold text-white hover:text-primary transition-colors">
                                    {item.question}
                                    <ChevronDown
                                        size={20}
                                        className="shrink-0 text-slate-500 transition-transform duration-200 group-data-[expanded]:rotate-180"
                                    />
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="pt-4 text-slate-400 leading-relaxed max-w-2xl">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </BlurFade>
            </div>
        </section>
    );
};
