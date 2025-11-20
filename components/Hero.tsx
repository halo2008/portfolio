import React from 'react';
import { ChevronDown, Terminal } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Hero: React.FC = () => {
  const { content } = useLanguage();
  const { name, title, hero } = content;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 pt-20 overflow-hidden">
      
      {/* Abstract Background Elements with new animations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none animate-float" />

      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center z-10">
        {/* Text Content */}
        <div className="order-2 md:order-1">
          <div className="flex items-center space-x-2 text-primary font-mono mb-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <Terminal size={20} />
            <span>{title}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {name}
            <span className="block text-slate-400 mt-2 text-3xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-slate-400 to-slate-600">
              {hero.headline}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-8 leading-relaxed border-l-4 border-primary pl-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            {hero.subheadline}
          </p>

          <div className="flex flex-wrap gap-3 mb-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            {hero.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-4 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-sm font-medium text-slate-300 hover:border-primary hover:text-primary transition-colors cursor-default"
              >
                #{tag.replace(/\s+/g, '')}
              </span>
            ))}
          </div>

          <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <a 
              href="#projects" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-darker font-bold rounded hover:bg-cyan-400 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {hero.cta}
              <ChevronDown size={20} />
            </a>
          </div>
        </div>

        {/* Image Content */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end relative animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]">
             {/* Animated rings */}
             <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin-slow"></div>
             <div className="absolute inset-4 border border-secondary/20 rounded-full animate-spin-slow" style={{animationDirection: 'reverse'}}></div>
             
             {/* Glowing backlight */}
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-2xl animate-pulse-slow"></div>

             {/* Main Image */}
             <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-slate-800/80 shadow-2xl animate-float">
                <img 
                  src={hero.profileImage} 
                  alt={name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-darker/80 to-transparent mix-blend-multiply pointer-events-none"></div>
             </div>

             {/* Floating badges */}
             <div className="absolute -bottom-4 -right-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-xl animate-float-delayed z-20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-slate-300">System: ONLINE</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;