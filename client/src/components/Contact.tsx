import React, { useEffect, useState } from 'react';
import { Mail, Linkedin, Github, Send } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useLanguage } from '../LanguageContext';
import { BlurFade } from './ui/blur-fade';
import { BorderBeam } from './ui/border-beam';

export const LEAD_SERVICE_EVENT = 'lead-service-selected';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

const FIELD_CLASS =
  'w-full bg-darker border border-slate-700 rounded-sm px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors';

const Contact: React.FC = () => {
  const { content, language } = useLanguage();
  const { contact, services } = content;
  const { form } = contact;
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [service, setService] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  useEffect(() => {
    const onServiceSelected = (event: Event) => setService((event as CustomEvent<string>).detail);
    window.addEventListener(LEAD_SERVICE_EVENT, onServiceSelected);
    return () => window.removeEventListener(LEAD_SERVICE_EVENT, onServiceSelected);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    setState('sending');

    try {
      const captcha = executeRecaptcha ? await executeRecaptcha('lead_submit') : undefined;
      const response = await fetch(`${API_BASE_URL}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          service: service || undefined,
          language,
          captcha,
        }),
      });
      if (!response.ok) throw new Error(`Lead request failed: ${response.status}`);

      window.gtag?.('event', 'generate_lead', { service: service || 'other' });
      formElement.reset();
      setService('');
      setState('success');
    } catch {
      setState('error');
    }
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24 bg-darker border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
        <BlurFade inView>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{contact.cta}</h2>
          <p className="text-slate-400 text-lg mb-10">{contact.sub}</p>

          <ul className="space-y-4 text-slate-300">
            <li>
              <a href={`mailto:${contact.emailUrl}`} className="inline-flex items-center gap-3 hover:text-primary transition-colors">
                <Mail size={20} className="text-primary" />
                {contact.emailUrl}
              </a>
            </li>
            <li>
              <a href={`https://${contact.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-primary transition-colors">
                <Linkedin size={20} className="text-primary" />
                {contact.buttons.linkedin}
              </a>
            </li>
            <li>
              <a href={contact.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-primary transition-colors">
                <Github size={20} className="text-primary" />
                {contact.buttons.github}
              </a>
            </li>
          </ul>
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-sm border border-slate-800 bg-dark p-8 space-y-5">
            <BorderBeam size={120} duration={10} colorFrom="#f59e0b" colorTo="#3b82f6" />

            <div className="grid md:grid-cols-2 gap-5">
              <label className="block text-sm text-slate-400">
                <span className="block mb-2">{form.name}</span>
                <input name="name" required maxLength={100} autoComplete="name" className={FIELD_CLASS} />
              </label>
              <label className="block text-sm text-slate-400">
                <span className="block mb-2">{form.email}</span>
                <input name="email" type="email" required maxLength={200} autoComplete="email" className={FIELD_CLASS} />
              </label>
            </div>

            <label className="block text-sm text-slate-400">
              <span className="block mb-2">{form.service}</span>
              <select value={service} onChange={event => setService(event.target.value)} className={FIELD_CLASS}>
                <option value="">{form.serviceOther}</option>
                {services.items.map(item => (
                  <option key={item.title} value={item.title}>{item.title}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-400">
              <span className="block mb-2">{form.message}</span>
              <textarea name="message" required minLength={10} maxLength={3000} rows={5} className={FIELD_CLASS} />
            </label>

            <button
              type="submit"
              disabled={state === 'sending'}
              className="inline-flex items-center gap-2 px-7 py-4 bg-primary text-darker font-bold rounded-sm transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <Send size={18} />
              {state === 'sending' ? form.sending : form.submit}
            </button>

            <div aria-live="polite">
              {state === 'success' && <p className="text-green-400">{form.success}</p>}
              {state === 'error' && (
                <p className="text-red-400">
                  {form.error}{' '}
                  <a href={`mailto:${contact.emailUrl}`} className="underline">{contact.emailUrl}</a>
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500">{form.privacy}</p>
          </form>
        </BlurFade>
      </div>
    </section>
  );
};

export default Contact;
