import React, { useRef, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useLanguage } from '../LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const CAPTCHA_TIMEOUT_MS = 10000;

const LeadForm: React.FC = () => {
  const { content, language } = useLanguage();
  const { form } = content.home.call;
  const email = content.contact.emailUrl;
  const { executeRecaptcha } = useGoogleReCaptcha();
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [sending, setSending] = useState(false);

  const say = (text: string, withEmail = false) => {
    const status = statusRef.current;
    if (!status) return;
    status.textContent = text;
    if (!withEmail) return;
    const link = document.createElement('a');
    link.className = 'link';
    link.href = `mailto:${email}`;
    link.textContent = email;
    status.append(' ', link);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!formElement.checkValidity()) return;
    const data = new FormData(formElement);
    const service = String(data.get('service') || '');
    setSending(true);
    say(form.sending);

    try {
      const captcha = await Promise.race([
        Promise.resolve().then(() => executeRecaptcha?.('lead_submit')).catch(() => undefined),
        new Promise<undefined>(resolve => setTimeout(resolve, CAPTCHA_TIMEOUT_MS)),
      ]);
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
      say(form.sent);
    } catch {
      say(form.failed, true);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="form" method="post" noValidate data-fix={form.fix} onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="lead-name">{form.name}</label>
        <input id="lead-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={100} aria-describedby="lead-name-error" />
        <p className="field__error" id="lead-name-error" hidden>{form.nameError}</p>
      </div>
      <div className="field">
        <label htmlFor="lead-email">{form.email}</label>
        <input id="lead-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} aria-describedby="lead-email-error" />
        <p className="field__error" id="lead-email-error" hidden>{form.emailError}</p>
      </div>
      <div className="field field--full">
        <label htmlFor="lead-service">{form.service}</label>
        <select id="lead-service" name="service" defaultValue="">
          <option value="">{form.serviceOther}</option>
          {content.home.services.items.map(item => (
            <option key={item.title} value={item.title}>{item.title}</option>
          ))}
          <option value={content.home.product.topic}>{content.home.product.topic}</option>
        </select>
      </div>
      <div className="field field--full">
        <label htmlFor="lead-message">{form.message}</label>
        <textarea id="lead-message" name="message" required minLength={10} maxLength={3000} rows={4} aria-describedby="lead-message-error" />
        <p className="field__error" id="lead-message-error" hidden>{form.messageError}</p>
      </div>
      <div className="btn-row">
        <button className="btn btn--primary" type="submit" aria-busy={sending || undefined}>{content.home.hero.primary}</button>
      </div>
      <p className="form__status" role="status" data-form-status ref={statusRef} />
      <p className="t-small muted">{form.privacy}</p>
    </form>
  );
};

export default LeadForm;
