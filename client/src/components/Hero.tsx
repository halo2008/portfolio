import React from 'react';
import { ArrowRight, Beaker } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { TextEffect } from './ui/text-effect';
import { BlurFade } from './ui/blur-fade';
import { DotPattern } from './ui/dot-pattern';

const Hero: React.FC = () => {
  const { content, language } = useLanguage();
  const { name, title, hero, availability, contact } = content;

  return (
    <section id="home" className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-24 pt-24 pb-16 overflow-hidden bg-dark">
      <DotPattern
        width={24}
        height={24}
        cr={1}
        className="text-slate-700/60 [mask-image:radial-gradient(60vw_circle_at_30%_40%,white,transparent)]"
      />

      <div className="max-w-7xl w-full mx-auto grid md:grid-cols-[1.4fr_1fr] gap-12 items-center relative z-10">
        <div>
          <BlurFade delay={0.05}>
            <p className="text-primary font-mono text-sm tracking-widest uppercase mb-6">{title}</p>
          </BlurFade>

          <TextEffect
            key={language}
            as="h1"
            per="word"
            preset="fade-in-blur"
            speedReveal={1.6}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-6"
          >
            {hero.headline}
          </TextEffect>

          <BlurFade delay={0.35}>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              {hero.subheadline}
            </p>
          </BlurFade>

          <BlurFade delay={0.45}>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 px-7 py-4 bg-primary text-darker font-bold rounded-sm transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                {hero.cta}
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#projects"
                className="inline-flex items-center px-7 py-4 border border-slate-600 text-white font-bold rounded-sm transition-colors duration-200 hover:border-primary hover:text-primary"
              >
                {hero.ctaSecondary}
              </a>
            </div>
          </BlurFade>

          <BlurFade delay={0.55}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2 text-green-400 font-mono uppercase tracking-wider text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {availability}
              </span>
              <Link to="/lab" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                <Beaker size={16} />
                {contact.buttons.tryLab}
              </Link>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.25} direction="left" className="flex justify-center md:justify-end">
          <figure className="relative w-64 md:w-full max-w-sm aspect-[4/5] overflow-hidden rounded-sm border border-slate-700 bg-surface">
            <img
              src={hero.profileImage}
              alt={name}
              width={862}
              height={1024}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
            <figcaption className="absolute bottom-0 inset-x-0 px-5 py-4 bg-gradient-to-t from-darker to-transparent text-white font-bold">
              {name}
            </figcaption>
          </figure>
        </BlurFade>
      </div>
    </section>
  );
};

export default Hero;
