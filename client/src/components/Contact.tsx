import React from 'react';
import { Mail, Linkedin, Briefcase, Github } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Contact: React.FC = () => {
  const { content } = useLanguage();
  const { contact } = content;
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="contact" className="py-32 px-6 md:px-12 lg:px-24 text-center">
      <div ref={ref} className="max-w-3xl mx-auto">
        <h2
          className={`text-4xl md:text-5xl font-bold text-white mb-6 leading-tight ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
          style={isVisible ? { animation: 'slideInUp 0.6s ease-out forwards, pulseGlow 3s ease-in-out 1s infinite' } : undefined}
        >
          {contact.cta}
        </h2>
        <p className={`text-slate-400 mb-12 text-lg ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`} style={{ animationDelay: '150ms' }}>
          {contact.sub}
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch">
          <a
            href="#"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-950 font-bold rounded hover:bg-slate-200 transition-all min-w-[220px] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
            style={{ animationDelay: '200ms' }}
          >
            <Briefcase size={20} />
            {contact.buttons.cv}
          </a>
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0077b5] !text-white font-bold rounded hover:bg-[#006396] transition-all min-w-[220px] hover:scale-105 hover:shadow-[0_0_20px_rgba(0,119,181,0.3)] ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
            style={{ animationDelay: '300ms' }}
          >
            <Linkedin size={20} />
            {contact.buttons.linkedin}
          </a>
          <a
            href={contact.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#24292e] !text-white font-bold rounded hover:bg-[#1b1f23] transition-all min-w-[220px] hover:scale-105 hover:shadow-[0_0_20px_rgba(36,41,46,0.3)] ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
            style={{ animationDelay: '350ms' }}
          >
            <Github size={20} />
            {contact.buttons.github}
          </a>
          <a
            href={`mailto:${contact.emailUrl}`}
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white font-bold rounded hover:bg-slate-700 transition-all border border-slate-700 min-w-[220px] hover:scale-105 hover:shadow-[0_0_20px_rgba(100,116,139,0.2)] ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
            style={{ animationDelay: '450ms' }}
          >
            <Mail size={20} />
            {contact.buttons.email}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
