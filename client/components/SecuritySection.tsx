import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Shield, Lock, Server, CheckCircle2 } from 'lucide-react';

const SecuritySection: React.FC = () => {
    const { content } = useLanguage();
    const { security } = content.landing;

    return (
        <section className="py-24 bg-slate-900/30 relative border-y border-slate-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <div className="order-2 lg:order-1 space-y-8">
                        <div className="inline-flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-wider">
                            <Lock size={16} />
                            <span>Security First Architecture</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">{security.title}</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            {security.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {security.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-20" />
                        <div className="relative bg-darker p-8 rounded-2xl border border-slate-700 shadow-2xl">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Server size={20} />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">On-Premise Capable</div>
                                        <div className="text-xs text-slate-500">Docker / Kubernetes</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <div className="w-10 h-10 rounded bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">SOC 2 Compliant Process</div>
                                        <div className="text-xs text-slate-500">Audit Logs & Access Control</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SecuritySection;
