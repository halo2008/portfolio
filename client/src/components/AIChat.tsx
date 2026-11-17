import React, { Suspense, lazy, useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Bot, BookOpen } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, LoadingState } from '../types';
import { useLanguage } from '../LanguageContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const WS_URL = import.meta.env.VITE_WS_URL || '';
// Loaded only when the chat opens, so the Markdown parser does not weigh on the page load.
const ChatMarkdown = lazy(() => import('./ChatMarkdown'));

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
  const socketRef = useRef<Socket | null>(null);
  const streamingTextRef = useRef('');
  const sessionIdRef = useRef(`main_page_${crypto.randomUUID()}`);

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

  // WebSocket connection management
  useEffect(() => {
    if (!isOpen) return;

    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('messageToClient', (payload: { sender: string; message: string; isChunk?: boolean }) => {
      if (payload.isChunk) {
        streamingTextRef.current += payload.message;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.isStreaming) {
            return [...prev.slice(0, -1), { ...last, text: streamingTextRef.current }];
          }
          return [...prev, { role: 'model', text: streamingTextRef.current, timestamp: new Date(), isStreaming: true }];
        });
      } else {
        // Non-chunk message (system message or human takeover)
        setMessages(prev => [...prev, { role: 'model', text: payload.message, timestamp: new Date() }]);
        setLoading(LoadingState.SUCCESS);
      }
    });

    socket.on('streamComplete', () => {
      streamingTextRef.current = '';
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.isStreaming) {
          return [...prev.slice(0, -1), { ...last, isStreaming: false }];
        }
        return prev;
      });
      setLoading(LoadingState.SUCCESS);
    });

    socket.on('connect_error', () => {
      setLoading(LoadingState.ERROR);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading === LoadingState.LOADING) return;

    if (!executeRecaptcha) {
      console.warn('Execute recaptcha not available yet');
      return;
    }

    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const messageText = input;
    setInput('');
    setLoading(LoadingState.LOADING);

    try {
      const token = await executeRecaptcha('chat_submit');

      socket.emit('messageToServer', {
        text: messageText,
        sessionId: sessionIdRef.current,
        captcha: token,
        language,
      });
    } catch (error) {
      console.error('Chat request failed:', error);
      setLoading(LoadingState.ERROR);
      const errorText = detectedLanguage === 'pl'
        ? 'Przepraszam, wystąpił błąd. Spróbuj ponownie później.'
        : 'Sorry, an error occurred. Please try again later.';
      setMessages(prev => [...prev, { role: 'model', text: errorText, timestamp: new Date() }]);
    }
  }, [input, loading, executeRecaptcha, detectedLanguage]);

  return (
    <div className="aichat">
      {!isOpen && (
        <button type="button" onClick={toggleChat} className="aichat__trigger" aria-label={aiChat.trigger} title={aiChat.trigger}>
          <Bot size={26} aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <section className="aichat__panel" role="dialog" aria-label={aiChat.title}>
          <header className="aichat__head">
            <span className="aichat__avatar"><Bot size={18} aria-hidden="true" /></span>
            <span className="aichat__who">
              <b>{aiChat.title}</b>
              <span><i aria-hidden="true" />{aiChat.status}</span>
            </span>
            <button type="button" onClick={toggleChat} className="aichat__close" aria-label={language === 'pl' ? 'Zamknij czat' : 'Close chat'}>
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <p className="aichat__note"><BookOpen size={14} aria-hidden="true" />{getDisclaimer(detectedLanguage)}</p>

          <div className="aichat__log" aria-live="polite">
            {messages.map((msg, idx) => (
              msg.role === 'user'
                ? <div key={idx} className="aichat__msg is-user">{msg.text}</div>
                : <div key={idx} className="aichat__msg aichat__md"><Suspense fallback={msg.text}><ChatMarkdown text={msg.text} /></Suspense></div>
            ))}
            {loading === LoadingState.LOADING && (
              <div className="aichat__msg aichat__thinking"><Loader2 size={14} aria-hidden="true" />{aiChat.thinking}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <p className="aichat__limit">{aiChat.rateLimitNote}</p>
          <form onSubmit={handleSend} className="aichat__form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={aiChat.placeholder}
              aria-label={aiChat.placeholder}
            />
            <button type="submit" disabled={loading === LoadingState.LOADING || !input.trim()} aria-label={language === 'pl' ? 'Wyślij' : 'Send'}>
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
          <p className="aichat__legal">
            This site is protected by reCAPTCHA and the Google
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a> apply.
          </p>
        </section>
      )}
    </div>
  );
};

export default AIChat;