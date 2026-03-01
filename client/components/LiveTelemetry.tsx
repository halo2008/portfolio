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

                <div className="w-full h-[600px] border border-slate-800 rounded-lg overflow-hidden bg-dark shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <iframe
                        src="https://ksedkowski.grafana.net/public-dashboards/b3d49d0548d447a2b84d5c04a000b0b1"
                        title="Live Telemetry Dashboard"
                        className="w-full h-full border-none"
                        allow="fullscreen"
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default LiveTelemetry;
