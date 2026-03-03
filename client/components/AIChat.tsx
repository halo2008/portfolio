import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, BookOpen } from 'lucide-react';
import { ChatMessage, LoadingState } from '../types';
import { useLanguage } from '../LanguageContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// API base URL - same origin for main page chat
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Response from POST /chat endpoint
interface ChatResponse {
  response: string;
  sources: { title: string }[];
  language: 'pl' | 'en';
}

const AIChat: React.FC = () => {
  const { content, language } = useLanguage();
  const { aiChat } = content;
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [detectedLanguage, setDetectedLanguage] = useState<'pl' | 'en'>(language === 'pl' ? 'pl' : 'en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Disclaimer text based on detected language
  const getDisclaimer = (lang: 'pl' | 'en'): string => {
    return lang === 'pl'
      ? 'Odpowiadam z oficjalnej bazy wiedzy'
      : 'Answering from official knowledge base';
  };

  // Reset/Init messages when language changes or on first load
  useEffect(() => {
    setMessages([{
      role: 'model',
      text: aiChat.initialMessage,
      timestamp: new Date()
    }]);
    setDetectedLanguage(language === 'pl' ? 'pl' : 'en');
  }, [language, aiChat.initialMessage]);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading === LoadingState.LOADING) return;

    if (!executeRecaptcha) {
      console.warn('Execute recaptcha not available yet');
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(LoadingState.LOADING);

    try {
      const token = await executeRecaptcha('chat_submit');
      
      // Call POST /chat endpoint (admin-only knowledge, CAPTCHA protected)
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: `main_page_${Date.now()}`,
          captcha: token,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      
      // Update detected language from response
      setDetectedLanguage(data.language);

      const modelMsg: ChatMessage = {
        role: 'model',
        text: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
      setLoading(LoadingState.SUCCESS);
    } catch (error) {
      console.error('Chat request failed', error);
      setLoading(LoadingState.ERROR);
      const errorText = detectedLanguage === 'pl'
        ? 'Przepraszam, wystąpił błąd. Spróbuj ponownie później.'
        : 'Sorry, an error occurred. Please try again later.';
      setMessages(prev => [...prev, { role: 'model', text: errorText, timestamp: new Date() }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-primary hover:bg-cyan-400 text-darker p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-110 flex items-center gap-2 font-bold"
        >
          <Bot size={24} />
          <span className="hidden md:inline">{aiChat.trigger}</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-[90vw] md:w-[400px] h-[500px] flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1.5 rounded-lg">
                <Bot size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{aiChat.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {aiChat.status}
                </p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center gap-2">
            <BookOpen size={14} className="text-primary flex-shrink-0" />
            <span className="text-xs text-primary font-medium">
              {getDisclaimer(detectedLanguage)}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary text-darker rounded-tr-none font-medium'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading === LoadingState.LOADING && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-xs text-slate-400">{aiChat.thinking}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={aiChat.placeholder}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading === LoadingState.LOADING || !input.trim()}
              className="bg-primary text-darker p-2 rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="bg-slate-800 px-4 pb-2 text-[10px] text-slate-500 text-center">
            This site is protected by reCAPTCHA and the Google
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary mx-1">Privacy Policy</a> and
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary mx-1">Terms of Service</a> apply.
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;