import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot } from 'lucide-react';
import { ChatMessage, LoadingState } from '../types';
import { useLanguage } from '../LanguageContext';
import { io, Socket } from 'socket.io-client';

// Initialize socket connection outside component to avoid reconnects on re-render
// When no URL is provided, it defaults to window.location.origin
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const socket: Socket = io();

const AIChat: React.FC = () => {
  const { content, language } = useLanguage();
  const { aiChat } = content;
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset/Init messages when language changes or on first load
  useEffect(() => {
    setMessages([{
      role: 'model',
      text: aiChat.initialMessage,
      timestamp: new Date()
    }]);
  }, [language, aiChat.initialMessage]);

  // WebSocket Event Listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('messageToClient', (payload: { sender: string, message: string, isChunk?: boolean }) => {
      if (payload.isChunk) {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'model' && lastMsg.isStreaming) {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, text: lastMsg.text + payload.message }
            ];
          } else {
            return [...prev, { role: 'model', text: payload.message, timestamp: new Date(), isStreaming: true }];
          }
        });
        setLoading(LoadingState.SUCCESS);
      } else {
        const modelMsg: ChatMessage = {
          role: 'model',
          text: payload.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, modelMsg]);
        setLoading(LoadingState.SUCCESS);
      }
    });

    socket.on('streamComplete', () => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          return [...prev.slice(0, -1), { ...lastMsg, isStreaming: false }];
        }
        return prev;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('messageToClient');
    };
  }, []);

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
      // Send message via WebSocket
      socket.emit('messageToServer', { text: input, captcha: token });
    } catch (error) {
      console.error('Recaptcha execution failed', error);
      setLoading(LoadingState.ERROR);
      setMessages(prev => [...prev, { role: 'model', text: 'Error verifying captcha. Please try again.', timestamp: new Date() }]);
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