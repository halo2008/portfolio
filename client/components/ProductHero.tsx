import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Bot, ArrowRight, ShieldCheck } from 'lucide-react';

const ProductHero: React.FC = () => {
    const { content } = useLanguage();
    const { hero } = content.landing;

    return (
        <section className="relative pt-32 pb-20 px-6 lg:px-24 overflow-hidden min-h-[90vh] flex flex-col justify-center items-center text-center">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up">

                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-primary mb-4 backdrop-blur-sm">
                    <ShieldCheck size={14} />
                    <span>Enterprise-Grade Security & Privacy</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                    {hero.headline}
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    {hero.subheadline}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button className="px-8 py-4 bg-primary text-darker font-bold rounded-lg hover:bg-primary-dark transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center gap-2 group">
                        {hero.cta}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-slate-800 text-white font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2">
                        <Bot size={18} className="text-slate-400" />
                        Live Demo
                    </button>
                </div>
            </div>

            {/* Product Visual */}
            <div className="relative mt-16 max-w-5xl w-full mx-auto animate-fade-in-up delay-200">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur opacity-30"></div>
                <div className="relative bg-[#1a1d21] rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center group">
                    {/* Placeholder for Slack Screenshot if image missing */}
                    {hero.demoImage ? (
                        <img
                            src={hero.demoImage}
                            alt="Slack Bot Demo"
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    ) : (
                        <div className="text-slate-500 flex flex-col items-center gap-4">
                            <Bot size={64} />
                            <span className="font-mono text-sm">Waiting for Demo Screenshot...</span>
                        </div>
                    )}

                    {/* Overlay UI Mockup (optional decoration) */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                </div>
            </div>

        </section>
    );
};

export default ProductHero;
