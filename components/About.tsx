import React from 'react';
import { Cpu, Layers, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const About: React.FC = () => {
  const { content } = useLanguage();
  const { philosophy } = content;

  return (
    <section id="about" className="py-24 px-6 md:px-12 lg:px-24 bg-slate-900/30 overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        
        {/* Text Side */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <Layers className="text-primary" />
            {philosophy.title}
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            {philosophy.description}
          </p>
          
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 relative overflow-hidden group hover:border-primary/30 transition-colors">
             <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>

             <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2 relative z-10">
                <Zap className="text-yellow-400" size={20} />
                {philosophy.differentiatorTitle}
             </h3>
             <p className="text-slate-300 italic relative z-10 border-l-2 border-primary pl-4">
               "{philosophy.differentiator}"
             </p>
          </div>
        </div>

        {/* Visual Side */}
        <div className="relative">
          {/* Image Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group">
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors duration-500"></div>
            <img 
              src={philosophy.image} 
              alt="Industrial IoT" 
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0"
            />
            
            {/* Tech Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-20 pointer-events-none"></div>
            
            {/* Floating Code/Status Panel */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg z-30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
               <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                 <span className="text-xs font-mono text-primary">iot_stream_v2.py</span>
                 <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
               </div>
               <div className="space-y-1 font-mono text-xs text-slate-400">
                 <div className="flex justify-between"><span>Latency:</span> <span className="text-green-400">12ms</span></div>
                 <div className="flex justify-between"><span>Status:</span> <span className="text-primary">CONNECTED</span></div>
                 <div className="flex justify-between"><span>Packets:</span> <span className="text-blue-400">1024/s</span></div>
               </div>
            </div>
          </div>

          {/* Decorative ambient blob behind */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none animate-pulse-slow"></div>
        </div>

      </div>
    </section>
  );
};

export default About;