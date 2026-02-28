import React from 'react';
import { Mail, Linkedin, Briefcase } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Contact: React.FC = () => {
  const { content } = useLanguage();
  const { contact } = content;

  return (
    <section id="contact" className="py-32 px-6 md:px-12 lg:px-24 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {contact.cta}
        </h2>
        <p className="text-slate-400 mb-12 text-lg">
          {contact.sub}
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-950 font-bold rounded hover:bg-slate-200 transition-all"
          >
            <Briefcase size={20} />
            {contact.buttons.cv}
          </a>
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0077b5] !text-white font-bold rounded hover:bg-[#006396] transition-all"
          >
            <Linkedin size={20} />
            {contact.buttons.linkedin}
          </a>
          <a
            href={`mailto:${contact.emailUrl}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white font-bold rounded hover:bg-slate-700 transition-all border border-slate-700"
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