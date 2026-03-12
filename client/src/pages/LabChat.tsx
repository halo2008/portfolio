import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { useLabTranslations, useLanguage } from '../LanguageContext';
import {
  Beaker,
  Clock,
  MessageSquare,
  Send,
  ChevronLeft,
  ChevronRight,
  FileText,
  Languages,
  AlertCircle,
  Loader2,
  PanelLeftOpen,
  PanelLeftClose,
  Upload,
  SlidersHorizontal,
  BrainCircuit,
  Sparkles,
  Scissors,
} from 'lucide-react';
import { LabStatsPanel } from '../components/LabStatsPanel';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ChatTimings {
  embeddingMs: number;
  searchMs: number;
  llmMs: number;
  totalMs: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  timings?: ChatTimings;
}

interface ChunkSource {
  title: string;
  content?: string;
}

interface ChatResponse {
  response: string;
  sources: ChunkSource[];
  language: 'pl' | 'en';
  timings?: ChatTimings;
}

interface ChatState {
  isLoading: boolean;
  error?: string;
}

interface SessionInfo {
  chunkCount: number;
  expiresAt: string;
  detectedLanguage: 'pl' | 'en';
  usage?: {
    requestCount: number;
    analysisTokens: number;
    indexingOps: number;
    chatTokens: number;
  };
  maxRequests?: number;
}

const Toast: React.FC<{
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-sm shadow-lg animate-fade-in-up ${type === 'error' ? 'bg-red-900/90 border border-red-700' : 'bg-green-900/90 border border-green-700'
        }`}
    >
      {type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle size={20} className="text-green-400" />}
      <span className="text-white text-sm">{message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};

const CheckCircle: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const X: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LabChat: React.FC = () => {
  const { user, loading } = useAuth();
  const t = useLabTranslations();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatState, setChatState] = useState<ChatState>({ isLoading: false });
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [retrievedChunks, setRetrievedChunks] = useState<ChunkSource[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number } | null>(null);
  const [scoreThreshold, setScoreThreshold] = useState(() => {
    const saved = sessionStorage.getItem('lab_scoreThreshold');
    return saved ? parseFloat(saved) : 0.4;
  });
  const [systemContext, setSystemContext] = useState(() => {
    return sessionStorage.getItem('lab_systemContext') || '';
  });
  const [searchStrategy, setSearchStrategy] = useState<'llm' | 'heuristic' | 'all'>(() => {
    return (sessionStorage.getItem('lab_searchStrategy') as 'llm' | 'heuristic' | 'all') || 'all';
  });

  useEffect(() => {
    sessionStorage.setItem('lab_scoreThreshold', String(scoreThreshold));
  }, [scoreThreshold]);

  useEffect(() => {
    sessionStorage.setItem('lab_systemContext', systemContext);
  }, [systemContext]);

  useEffect(() => {
    sessionStorage.setItem('lab_searchStrategy', searchStrategy);
  }, [searchStrategy]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSessionInfo();
    }
  }, [user]);

  useEffect(() => {
    if (!sessionInfo?.expiresAt) return;

    const updateTimer = () => {
      const expiresAt = new Date(sessionInfo.expiresAt).getTime();
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining({ hours, minutes });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [sessionInfo?.expiresAt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatState.isLoading]);

  const getAuthToken = async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  };

  const fetchSessionInfo = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/lab/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: SessionInfo = await response.json();
        setSessionInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setChatState({ isLoading: true });
    setRetrievedChunks([]);

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/lab/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: user?.uid || 'unknown',
          scoreThreshold,
          language,
          ...(searchStrategy !== 'all' && { chunkingStrategy: searchStrategy }),
          ...(systemContext.trim() && { systemContext: systemContext.trim() }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t.errorChat);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        timings: data.timings,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setRetrievedChunks(data.sources || []);

      if (data.language && sessionInfo) {
        setSessionInfo((prev) => (prev ? { ...prev, detectedLanguage: data.language } : null));
      }

      fetchSessionInfo();
    } catch (error) {
      setChatState({
        isLoading: false,
        error: error instanceof Error ? error.message : t.errorChat,
      });
      setToast({ message: error instanceof Error ? error.message : t.errorChat, type: 'error' });
    } finally {
      setChatState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [inputMessage, chatState.isLoading, user, t, sessionInfo, scoreThreshold]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasDocuments = sessionInfo && sessionInfo.chunkCount > 0;

  const formatCountdown = () => {
    if (!timeRemaining) return '';
    const { hours, minutes } = timeRemaining;
    if (language === 'pl') {
      return `${hours} ${t.hours} ${t.and} ${minutes} ${t.minutes}`;
    }
    return `${hours} ${t.hours} ${t.and} ${minutes} ${t.minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-darker/80 border-b border-slate-800 h-16 flex items-center justify-between px-6 lg:px-24">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="font-mono font-bold text-xl text-white tracking-tighter hover:text-primary transition-colors"
          >
            ks-infra<span className="text-primary">.dev</span>
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="/lab"
            className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
          >
            <Beaker size={16} />
            {t.title}
          </a>
        </div>
        <div className="flex items-center gap-4">
          {sessionInfo && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Languages size={14} />
              <span>
                {t.detectedLanguage}: <span className="text-primary font-bold">{sessionInfo.detectedLanguage.toUpperCase()}</span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-surface/50 px-3 py-1.5 rounded-sm">
            <Clock size={14} className="text-primary" />
            <span>
              {t.sessionExpiresIn}: <span className="text-primary font-mono">{formatCountdown()}</span>
            </span>
          </div>
          <a href="/" className="text-sm text-slate-300 hover:text-primary transition-colors">
            {t.back}
          </a>
        </div>
      </nav>

      <main className="flex-1 pt-16 flex overflow-hidden">
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'mr-80' : 'mr-0'}`}>
          <div className="px-6 py-4 border-b border-slate-800 bg-darker/30">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-primary" size={24} />
              <div>
                <h1 className="text-xl font-bold text-white">{t.chatTitle}</h1>
                <p className="text-sm text-slate-400">{t.chatWithAgent}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {hasDocuments ? t.startChat : t.noDocumentsYet}
                </p>
                {!hasDocuments && (
                  <>
                    <p className="text-sm mt-2">{t.uploadFirst}</p>
                    <a
                      href="/lab"
                      className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-sm transition-colors"
                    >
                      <Upload size={16} />
                      <span>{t.uploadTitle}</span>
                    </a>
                  </>
                )}
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-sm px-4 py-3 ${message.role === 'user'
                        ? 'bg-primary text-darker'
                        : 'bg-surface border border-slate-700 text-white'
                        }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div
                        className={`text-xs mt-2 flex items-center gap-3 ${message.role === 'user' ? 'text-darker/60' : 'text-slate-500'
                          }`}
                      >
                        <span>
                          {message.timestamp.toLocaleTimeString(language === 'pl' ? 'pl-PL' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {message.timings && (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-darker/60 border border-slate-700/50 rounded-sm px-2 py-0.5 ml-1">
                            <span className="text-blue-400" title="Embedding">emb {message.timings.embeddingMs}ms</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-emerald-400" title="Qdrant search">qdrant {message.timings.searchMs}ms</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-amber-400" title="Gemini LLM">llm {message.timings.llmMs}ms</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-primary font-bold" title="Total">Σ {message.timings.totalMs}ms</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {chatState.isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-sm px-4 py-3 bg-surface border border-slate-700">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">{t.thinking}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="px-6 py-2 border-t border-slate-800 bg-darker/30">
            <div className="text-[10px] text-amber-500/40 text-center mb-1">
              {t.rateLimitNote}
            </div>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chatPlaceholder}
                disabled={chatState.isLoading}
                className="flex-1 bg-surface border border-slate-700 rounded-sm px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={chatState.isLoading || !inputMessage.trim()}
                className="px-4 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-darker font-bold rounded-sm transition-colors flex items-center gap-2"
              >
                <Send size={18} />
                <span className="hidden sm:inline">{t.send}</span>
              </button>
            </div>
          </div>
        </div>

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 top-24 z-30 p-2 bg-surface border border-slate-700 rounded-sm hover:border-primary transition-colors"
            title={t.expand}
          >
            <PanelLeftOpen size={20} className="text-slate-400" />
          </button>
        )}

        <div
          className={`fixed right-0 top-16 bottom-0 w-80 bg-darker/90 border-l border-slate-800 transform transition-transform duration-300 z-20 overflow-hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h3 className="font-bold text-white text-sm">{t.retrievedChunks}</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title={t.collapse}
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <SlidersHorizontal size={14} className="text-primary" />
                <span className="text-xs text-slate-400">{t.searchPrecision}</span>
                <span className="text-xs font-mono text-primary ml-auto">{scoreThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-sm appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>{t.precisionLow}</span>
                <span>{t.precisionHigh}</span>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={14} className="text-primary" />
                <span className="text-xs text-slate-400">{t.systemContext}</span>
                <span className="text-[10px] text-slate-600 ml-auto">{systemContext.length}/500</span>
              </div>
              <div className="mb-2 text-[9px] text-amber-500/30">
                {t.rateLimitNote}
              </div>
              <textarea
                value={systemContext}
                onChange={(e) => setSystemContext(e.target.value.slice(0, 500))}
                placeholder={language === 'pl' ? t.systemContextPlaceholderPl : t.systemContextPlaceholderEn}
                rows={3}
                className="w-full bg-surface border border-slate-700 rounded-sm px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="px-4 py-3 border-b border-slate-800">
              <label className="block text-xs text-slate-400 mb-2">
                {language === 'pl' ? 'Źródło wiedzy' : 'Knowledge source'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setSearchStrategy('all')}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-sm border text-[11px] font-bold transition-colors ${searchStrategy === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  {language === 'pl' ? 'Wszystko' : 'All'}
                </button>
                <button
                  onClick={() => setSearchStrategy('llm')}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-sm border text-[11px] font-bold transition-colors ${searchStrategy === 'llm'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Sparkles size={10} />
                  {language === 'pl' ? 'Tylko AI' : 'AI only'}
                </button>
                <button
                  onClick={() => setSearchStrategy('heuristic')}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-sm border text-[11px] font-bold transition-colors ${searchStrategy === 'heuristic'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Scissors size={10} />
                  {language === 'pl' ? 'Heuryst.' : 'Heurist.'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {retrievedChunks.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <FileText size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{messages.length > 0 ? t.thinking : t.noDocumentsYet}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {retrievedChunks.map((chunk, index) => (
                    <div
                      key={index}
                      className="bg-surface border border-slate-700 rounded-sm p-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-primary font-mono">#{index + 1}</span>
                        <h4 className="text-sm font-medium text-white truncate">{chunk.title}</h4>
                      </div>
                      {chunk.content && (
                        <p className="text-xs text-slate-400 line-clamp-4">{chunk.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {sessionInfo && (
              <div className="px-4 py-3 border-t border-slate-800">
                <LabStatsPanel
                  stats={{
                    requestCount: sessionInfo.usage?.requestCount ?? 0,
                    analysisTokens: sessionInfo.usage?.analysisTokens ?? 0,
                    indexingOps: sessionInfo.usage?.indexingOps ?? 0,
                    chatTokens: sessionInfo.usage?.chatTokens ?? 0,
                    maxRequests: sessionInfo.maxRequests ?? 50,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LabChat;
