import React from 'react';
import { ChevronDown, Terminal, Briefcase, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Hero: React.FC = () => {
  const { content } = useLanguage();
  const { name, title, hero, availability, philosophy, contact } = content;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 pt-20 overflow-hidden bg-dark">

      {/* Industrial Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.2
        }}>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/80 z-0 pointer-events-none"></div>

      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center z-10 relative">
        {/* Text Content */}
        <div className="order-2 md:order-1">
          <div className="flex items-center space-x-2 text-primary font-mono mb-6 animate-fade-in-up border border-primary/20 bg-primary/5 px-4 py-1.5 w-fit rounded-sm" style={{ animationDelay: '0.1s' }}>
            <Terminal size={16} />
            <span className="text-sm tracking-wide uppercase">{title}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-none tracking-tighter animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {name}
            <span className="block text-slate-400 mt-2 text-2xl md:text-4xl lg:text-5xl font-light">
              {hero.headline}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-8 leading-relaxed border-l-2 border-primary pl-6 animate-fade-in-up font-light" style={{ animationDelay: '0.3s' }}>
            {hero.subheadline}
          </p>

          <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface border border-slate-700 rounded-sm">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-green-400 text-xs font-mono tracking-wider uppercase">
                {availability}
              </span>
            </div>
          </div>

          {/* About Me / Philosophy Section Merged */}
          <div className="mb-10 animate-fade-in-up space-y-6" style={{ animationDelay: '0.4s' }}>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{philosophy.title}</h3>
              <p className="text-slate-400 font-light leading-relaxed text-sm md:text-base">
                {philosophy.description}
              </p>
            </div>

            <div className="bg-surface/50 p-4 rounded-sm border-l-2 border-primary">
              <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
                <Zap size={14} className="text-primary" />
                {philosophy.differentiatorTitle}
              </h4>
              <p className="text-slate-400 text-xs md:text-sm font-mono">
                {philosophy.differentiator}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent border border-primary text-primary font-bold rounded-sm hover:bg-primary hover:text-darker transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              {hero.cta}
              <ChevronDown size={20} />
            </a>
            <a
              href="/cv.pdf"
              download
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-surface border border-slate-700 text-slate-300 font-bold rounded-sm hover:border-slate-500 hover:text-white transition-all duration-300"
            >
              <Briefcase size={20} />
              {contact.buttons.cv}
            </a>
          </div>
        </div>

        {/* Image Content */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]">
            {/* Technical Rings */}
            <div className="absolute inset-0 border border-slate-700 rounded-full animate-spin-slow opacity-30"></div>
            <div className="absolute inset-8 border border-dashed border-primary/30 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>

            {/* Main Image */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-slate-700 shadow-2xl bg-surface">
              <img
                src={hero.profileImage}
                alt={name}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100"
              />
              {/* Tech Overlay */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-60 pointer-events-none"></div>
            </div>

            {/* Floating Info Panel */}
            <div className="absolute -bottom-6 -left-6 bg-surface border border-slate-700 p-4 rounded-sm shadow-xl z-20 backdrop-blur-md">
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-slate-500">STATUS:</span> <span className="text-primary">ONLINE</span>
                  <span className="text-slate-500">REGION:</span> <span className="text-slate-300">EU-WEST</span>
                  <span className="text-slate-500">UPTIME:</span> <span className="text-slate-300">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;