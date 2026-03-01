import React from 'react';
import { Activity } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const LiveTelemetry: React.FC = () => {
    const { content } = useLanguage();
    const { telemetry } = content;

    return (
        <section id="telemetry" className="py-24 px-6 md:px-12 lg:px-24 bg-darker relative overflow-hidden border-t border-slate-800">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Activity className="text-primary animate-pulse" size={24} />
                        <span className="text-primary font-mono text-sm tracking-widest uppercase">// LIVE SYSTEM</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        {telemetry.title}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        {telemetry.description}
                    </p>
                </div>

                <div className="w-full max-w-4xl mx-auto p-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] relative group cursor-pointer transition-all duration-300 hover:shadow-[0_0_60px_rgba(6,182,212,0.3)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                    <a
                        href="https://ksedkowski.grafana.net/public-dashboards/b3d49d0548d447a2b84d5c04a000b0b1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex flex-col items-center justify-center gap-6 p-12 bg-dark/90 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-primary/50 transition-colors z-10"
                    >
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                            <Activity size={40} className="animate-pulse" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">Open Live Dashboard</h3>
                            <p className="text-slate-400">View real-time system metrics, active connections, and latency directly in Grafana Cloud.</p>
                        </div>

                        <div className="mt-4 px-6 py-3 rounded-full bg-primary text-darker font-bold flex items-center gap-2 group-hover:bg-white transition-colors">
                            Launch Dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default LiveTelemetry;
