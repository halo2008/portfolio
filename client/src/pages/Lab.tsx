import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../core/auth/AuthContext';
import { useLabTranslations, useLanguage } from '../LanguageContext';
import {
  Beaker,
  Clock,
  Shield,
  FileText,
  Brain,
  Upload,
  X,
  FileType,
  File as FileIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Languages,
  Save,
  MessageSquare,
  Send,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  BrainCircuit,
  Scissors,
  Sparkles,
  Eye,
  EyeOff,
  ChevronRight,
  Trash2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { LabStatsPanel } from '../components/LabStatsPanel';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ── Types ─────────────────────────────────────────────
interface SemanticChunk {
  content: string;
  title?: string;
  rationale?: string;
  suggestedTags?: string[];
  startLine?: number;
  endLine?: number;
}

interface AnalysisResult {
  detectedLanguage: 'pl' | 'en';
  chunks: SemanticChunk[];
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface IndexState {
  status: 'idle' | 'indexing' | 'success' | 'error';
  error?: string;
}

interface ChatTimings {
  embeddingMs: number;
  searchMs: number;
  llmMs: number;
  totalMs: number;
}

interface ChatMessage {
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

interface UserKnowledgePoint {
  id: string;
  title?: string;
  content: string;
  language?: string;
  createdAt?: string;
}

// ── Small reusable components ─────────────────────────
const FileTypeIcon: React.FC<{ extension: string; size?: number }> = ({ extension, size = 24 }) => {
  const ext = extension.toLowerCase();
  if (ext === '.pdf') return <FileType size={size} className="text-red-400" />;
  if (ext === '.md') return <FileType size={size} className="text-blue-400" />;
  return <FileIcon size={size} className="text-green-400" />;
};

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

// ══════════════════════════════════════════════════════
// Main Lab component – two-panel layout
// ══════════════════════════════════════════════════════
const Lab: React.FC = () => {
  const { user, loading } = useAuth();
  const t = useLabTranslations();
  const { language } = useLanguage();

  // ── Upload / Analysis state ─────────────────────────
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [indexState, setIndexState] = useState<IndexState>({ status: 'idle' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chunks, setChunks] = useState<SemanticChunk[]>([]);
  const [fileName, setFileName] = useState('');

  // ── Chat state ──────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatState, setChatState] = useState<ChatState>({ isLoading: false });
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [retrievedChunks, setRetrievedChunks] = useState<ChunkSource[]>([]);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number } | null>(null);

  // ── Shared state ────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // ── Search & AI settings (persisted in sessionStorage) ──
  const [scoreThreshold, setScoreThreshold] = useState(() => {
    const saved = sessionStorage.getItem('lab_scoreThreshold');
    return saved ? parseFloat(saved) : 0.4;
  });
  const [systemContext, setSystemContext] = useState(() => {
    return sessionStorage.getItem('lab_systemContext') || '';
  });
  const [uploadStrategy, setUploadStrategy] = useState<'llm' | 'heuristic'>(() => {
    return (sessionStorage.getItem('lab_uploadStrategy') as 'llm' | 'heuristic') || 'llm';
  });
  const [searchStrategy, setSearchStrategy] = useState<'llm' | 'heuristic' | 'all'>(() => {
    return (sessionStorage.getItem('lab_searchStrategy') as 'llm' | 'heuristic' | 'all') || 'all';
  });

  useEffect(() => { sessionStorage.setItem('lab_scoreThreshold', String(scoreThreshold)); }, [scoreThreshold]);
  useEffect(() => { sessionStorage.setItem('lab_systemContext', systemContext); }, [systemContext]);
  useEffect(() => { sessionStorage.setItem('lab_uploadStrategy', uploadStrategy); }, [uploadStrategy]);
  useEffect(() => { sessionStorage.setItem('lab_searchStrategy', searchStrategy); }, [searchStrategy]);

  // ── Knowledge browser state ────────────────────────
  const [userPoints, setUserPoints] = useState<UserKnowledgePoint[]>([]);
  const [userPointsLoading, setUserPointsLoading] = useState(false);
  const [userPointsOpen, setUserPointsOpen] = useState(false);
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null);
  const [userPointsNextOffset, setUserPointsNextOffset] = useState<string | undefined>();

  // ── Share session state ─────────────────────────────
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // ── Refs ────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Auth token helper ───────────────────────────────
  const getAuthToken = async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  };

  // ── Share session ──────────────────────────────────
  const handleShareSession = useCallback(async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/lab/share-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to generate share token');
      const { token: sessionToken } = await response.json();
      const url = `${window.location.origin}/lab?sessionToken=${encodeURIComponent(sessionToken)}`;
      setShareLink(url);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
      setToast({
        message: language === 'pl' ? 'Link skopiowany do schowka!' : 'Link copied to clipboard!',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to share session:', error);
      setToast({
        message: language === 'pl' ? 'Nie udało się wygenerować linku.' : 'Failed to generate share link.',
        type: 'error',
      });
    } finally {
      setShareLoading(false);
    }
  }, [shareLoading, language]);

  // ── Fetch session info ──────────────────────────────
  const fetchSessionInfo = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/lab/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: SessionInfo = await response.json();
        setSessionInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchSessionInfo();
  }, [user, fetchSessionInfo]);

  // ── Fetch user knowledge points ───────────────────
  const fetchUserKnowledge = useCallback(async (reset = false) => {
    if (!user) return;
    setUserPointsLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: '20' });
      if (!reset && userPointsNextOffset) params.set('offset', userPointsNextOffset);
      const response = await fetch(`${API_BASE_URL}/lab/knowledge?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: { points: UserKnowledgePoint[]; nextOffset?: string } = await response.json();
        setUserPoints(prev => reset ? data.points : [...prev, ...data.points]);
        setUserPointsNextOffset(data.nextOffset);
      }
    } catch (error) {
      console.error('Failed to fetch user knowledge:', error);
    } finally {
      setUserPointsLoading(false);
    }
  }, [user, userPointsNextOffset]);

  // ── Session countdown ───────────────────────────────
  useEffect(() => {
    if (!sessionInfo?.expiresAt) return;
    const updateTimer = () => {
      const diff = new Date(sessionInfo.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0 });
        return;
      }
      setTimeRemaining({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60_000);
    return () => clearInterval(interval);
  }, [sessionInfo?.expiresAt]);

  // ── Auto-scroll chat ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatState.isLoading]);

  // ══════════════════════════════════════════════════════
  // Upload / Analyze / Index logic
  // ══════════════════════════════════════════════════════

  const uploadFile = async (file: File) => {
    try {
      setFileName(file.name);
      setUploadState({ status: 'uploading', progress: 0 });
      setAnalysisResult(null);
      setChunks([]);

      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chunkingStrategy', uploadStrategy);

      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const response = await fetch(`${API_BASE_URL}/lab/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t.errorUpload);
      }

      setUploadState({ status: 'processing', progress: 95 });

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      setChunks(result.chunks.map((chunk) => ({ ...chunk })));
      setUploadState({ status: 'success', progress: 100 });
      fetchSessionInfo();
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : t.errorUpload,
      });
      setToast({ message: error instanceof Error ? error.message : t.errorUpload, type: 'error' });
    }
  };

  const handleConfirmIndex = async () => {
    if (!analysisResult || chunks.length === 0) return;
    try {
      setIndexState({ status: 'indexing' });
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/lab/confirm-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chunks: chunks.map((c) => ({ content: c.content, title: c.title || '', tags: c.suggestedTags || [] })),
          language: analysisResult.detectedLanguage,
          chunkingStrategy: uploadStrategy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t.errorConfirm);
      }

      setIndexState({ status: 'success' });
      setToast({ message: t.confirmSuccess, type: 'success' });
      fetchSessionInfo();
      if (userPointsOpen) fetchUserKnowledge(true);
    } catch (error) {
      setIndexState({
        status: 'error',
        error: error instanceof Error ? error.message : t.errorConfirm,
      });
      setToast({ message: error instanceof Error ? error.message : t.errorConfirm, type: 'error' });
    }
  };

  // ── Drag-and-drop handlers ──────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validExtensions = ['.txt', '.md', '.pdf'];
      const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (validExtensions.includes(extension) && file.size <= 1 * 1024 * 1024) {
        uploadFile(file);
      } else {
        setToast({ message: t.errorUpload, type: 'error' });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) uploadFile(files[0]);
  };

  const updateChunk = (index: number, field: 'title' | 'content', value: string) => {
    setChunks((prev) => prev.map((chunk, i) => (i === index ? { ...chunk, [field]: value } : chunk)));
  };

  const updateChunkTags = (index: number, tags: string[]) => {
    setChunks((prev) => prev.map((chunk, i) => (i === index ? { ...chunk, suggestedTags: tags } : chunk)));
  };

  const addTagToChunk = (index: number, tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    setChunks((prev) => prev.map((chunk, i) => {
      if (i !== index) return chunk;
      const existing = chunk.suggestedTags || [];
      if (existing.includes(trimmed)) return chunk;
      return { ...chunk, suggestedTags: [...existing, trimmed] };
    }));
  };

  const removeTagFromChunk = (index: number, tagToRemove: string) => {
    setChunks((prev) => prev.map((chunk, i) => {
      if (i !== index) return chunk;
      return { ...chunk, suggestedTags: (chunk.suggestedTags || []).filter(t => t !== tagToRemove) };
    }));
  };

  const handleCancel = () => {
    setUploadState({ status: 'idle', progress: 0 });
    setIndexState({ status: 'idle' });
    setAnalysisResult(null);
    setChunks([]);
    setFileName('');
  };

  // ══════════════════════════════════════════════════════
  // Chat logic
  // ══════════════════════════════════════════════════════

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || chatState.isLoading) return;

    const userMessage: ChatMessage = {
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
          ...(searchStrategy !== 'all' && { chunkingStrategy: searchStrategy }),
          ...(systemContext.trim() && { systemContext: systemContext.trim() }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t.errorChat);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: ChatMessage = {
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
    } catch (error) {
      setChatState({
        isLoading: false,
        error: error instanceof Error ? error.message : t.errorChat,
      });
      setToast({ message: error instanceof Error ? error.message : t.errorChat, type: 'error' });
    } finally {
      setChatState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [inputMessage, chatState.isLoading, user, t, sessionInfo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Derived ─────────────────────────────────────────
  const hasDocuments = sessionInfo && sessionInfo.chunkCount > 0;

  const formatCountdown = () => {
    if (!timeRemaining) return '';
    return `${timeRemaining.hours} ${t.hours} ${t.and} ${timeRemaining.minutes} ${t.minutes}`;
  };

  const getFileExtension = (name: string) => name.slice(name.lastIndexOf('.')).toLowerCase();

  // ── Loading / guard ─────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user) return null;

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col relative">
      {/* Lab background effects */}
      <div className="lab-scanline fixed inset-0 z-0 pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-darker/80 border-b border-slate-800 h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-4">
          <a href="/" className="font-mono font-bold text-xl text-white tracking-tighter hover:text-primary transition-colors">
            ks-infra<span className="text-primary">.dev</span>
          </a>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2 text-primary">
            <Beaker size={18} />
            <span className="font-bold text-sm">{t.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {sessionInfo && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Languages size={14} />
              <span>
                {t.detectedLanguage}: <span className="text-primary font-bold">{sessionInfo.detectedLanguage.toUpperCase()}</span>
              </span>
            </div>
          )}
          {timeRemaining && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-surface/50 px-3 py-1.5 rounded-sm">
              <Clock size={14} className="text-primary" />
              <span>
                {t.sessionExpiresIn}: <span className="text-primary font-mono">{formatCountdown()}</span>
              </span>
            </div>
          )}
          <button
            onClick={handleShareSession}
            disabled={shareLoading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary bg-surface/50 px-3 py-1.5 rounded-sm transition-colors disabled:opacity-50"
            title={language === 'pl' ? 'Udostępnij sesję (np. do trybu prywatnego)' : 'Share session (e.g. for incognito mode)'}
          >
            {shareLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : shareCopied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Share2 size={14} />
            )}
            <span className="hidden sm:inline">{language === 'pl' ? 'Udostępnij sesję' : 'Share session'}</span>
          </button>
          <a href="/" className="text-sm text-slate-300 hover:text-primary transition-colors">
            {t.back}
          </a>
        </div>
      </nav>

      <main className="flex-1 pt-16 flex flex-col lg:flex-row overflow-hidden">
        {/* ╔══════════════════════════════════════════════╗
           ║  LEFT PANEL — Upload / Analyze / Index       ║
           ╚══════════════════════════════════════════════╝ */}
        <div className="lab-panel-left lg:w-1/2 w-full overflow-y-auto border-r border-slate-800/50 p-6 lg:p-8 flex flex-col gap-6">

          {sessionInfo && (
            <LabStatsPanel
              stats={{
                requestCount: sessionInfo.usage?.requestCount ?? 0,
                analysisTokens: sessionInfo.usage?.analysisTokens ?? 0,
                indexingOps: sessionInfo.usage?.indexingOps ?? 0,
                chatTokens: sessionInfo.usage?.chatTokens ?? 0,
                maxRequests: sessionInfo.maxRequests ?? 50
              }}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface/50 border border-slate-700 p-4 rounded-sm">
              <Clock className="text-primary mb-2" size={20} />
              <h3 className="text-white font-bold text-sm mb-1">{t.session24h}</h3>
              <p className="text-slate-400 text-xs">{t.session24hDesc}</p>
            </div>
            <div className="bg-surface/50 border border-slate-700 p-4 rounded-sm">
              <Shield className="text-primary mb-2" size={20} />
              <h3 className="text-white font-bold text-sm mb-1">{t.privacyFirst}</h3>
              <p className="text-slate-400 text-xs">{t.privacyFirstDesc}</p>
            </div>
            <div className="bg-surface/50 border border-slate-700 p-4 rounded-sm">
              <Brain className="text-primary mb-2" size={20} />
              <h3 className="text-white font-bold text-sm mb-1">{t.geminiAI}</h3>
              <p className="text-slate-400 text-xs">{t.geminiAIDesc}</p>
            </div>
          </div>

          <div className="bg-surface border border-slate-700 rounded-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <SlidersHorizontal className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-white">{language === 'pl' ? 'Ustawienia' : 'Settings'}</h2>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">
                <Upload size={12} className="inline mr-1" />
                {language === 'pl' ? 'Strategia podziału (upload)' : 'Chunking strategy (upload)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setUploadStrategy('llm')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-colors ${uploadStrategy === 'llm'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Sparkles size={14} />
                  <div className="text-left">
                    <div className="font-bold">{t.chunkingLlm}</div>
                    <div className="text-[10px] opacity-70">{t.chunkingLlmDesc}</div>
                  </div>
                </button>
                <button
                  onClick={() => setUploadStrategy('heuristic')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-colors ${uploadStrategy === 'heuristic'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Scissors size={14} />
                  <div className="text-left">
                    <div className="font-bold">{t.chunkingHeuristic}</div>
                    <div className="text-[10px] opacity-70">{t.chunkingHeuristicDesc}</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">
                <MessageSquare size={12} className="inline mr-1" />
                {language === 'pl' ? 'Źródło wiedzy (czat)' : 'Knowledge source (chat)'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSearchStrategy('all')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-colors ${searchStrategy === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Brain size={14} />
                  <div className="text-left">
                    <div className="font-bold">{language === 'pl' ? 'Wszystko' : 'All'}</div>
                  </div>
                </button>
                <button
                  onClick={() => setSearchStrategy('llm')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-colors ${searchStrategy === 'llm'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Sparkles size={14} />
                  <div className="text-left">
                    <div className="font-bold">{language === 'pl' ? 'Tylko AI' : 'AI only'}</div>
                  </div>
                </button>
                <button
                  onClick={() => setSearchStrategy('heuristic')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-colors ${searchStrategy === 'heuristic'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Scissors size={14} />
                  <div className="text-left">
                    <div className="font-bold">{language === 'pl' ? 'Tylko heuryst.' : 'Heuristic only'}</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
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

            <div>
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={14} className="text-primary" />
                <span className="text-xs text-slate-400">{t.systemContext}</span>
                <span className="text-[10px] text-slate-600 ml-auto">{systemContext.length}/500</span>
              </div>
              <textarea
                value={systemContext}
                onChange={(e) => setSystemContext(e.target.value.slice(0, 500))}
                placeholder={language === 'pl' ? t.systemContextPlaceholderPl : t.systemContextPlaceholderEn}
                rows={2}
                className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="bg-surface border border-slate-700 rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-white">{t.uploadTitle}</h2>
            </div>

            {uploadState.status === 'idle' && (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-sm p-8 text-center transition-all duration-200 ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-600 hover:border-primary/50'
                  }`}
              >
                <div className="max-w-md mx-auto">
                  <Upload size={40} className={`mx-auto mb-3 ${isDragActive ? 'text-primary' : 'text-slate-500'}`} />
                  <p className="text-white mb-1 text-sm">{isDragActive ? t.dropHere : t.dragDropText}</p>
                  <p className="text-slate-400 text-xs mb-4">{t.maxSize}</p>

                  <div className="flex justify-center gap-5 mb-4">
                    <div className="flex flex-col items-center gap-1">
                      <FileIcon size={24} className="text-green-400" />
                      <span className="text-xs text-slate-500">.txt</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <FileType size={24} className="text-blue-400" />
                      <span className="text-xs text-slate-500">.md</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <FileType size={24} className="text-red-400" />
                      <span className="text-xs text-slate-500">.pdf</span>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-sm cursor-pointer transition-colors text-sm">
                    <Upload size={14} />
                    <span>{t.browseFiles}</span>
                    <input type="file" accept=".txt,.md,.pdf" onChange={handleFileInput} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
              <div className="border-2 border-slate-600 rounded-sm p-8 text-center">
                <Loader2 size={40} className="mx-auto mb-3 text-primary animate-spin" />
                <p className="text-white mb-3 text-sm">{uploadState.status === 'uploading' ? t.uploading : t.processing}</p>
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadState.progress}%` }} />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">{uploadState.progress}%</p>
                </div>
                {fileName && (
                  <p className="text-slate-500 text-xs mt-3 flex items-center justify-center gap-2">
                    <FileTypeIcon extension={getFileExtension(fileName)} size={14} />
                    {fileName}
                  </p>
                )}
              </div>
            )}

            {uploadState.status === 'error' && (
              <div className="border-2 border-red-700/50 bg-red-900/10 rounded-sm p-8 text-center">
                <AlertCircle size={40} className="mx-auto mb-3 text-red-400" />
                <p className="text-red-400 mb-3 text-sm">{uploadState.error || t.errorUpload}</p>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-sm transition-colors text-sm"
                >
                  <Upload size={14} />
                  <span>{t.retry}</span>
                </button>
              </div>
            )}

            {uploadState.status === 'success' && analysisResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Languages size={18} className="text-primary" />
                    <span className="text-slate-300 text-sm">
                      {t.detectedLanguage}: <span className="text-white font-bold">{analysisResult.detectedLanguage.toUpperCase()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <FileTypeIcon extension={getFileExtension(fileName)} size={14} />
                    <span>{fileName}</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-sm p-3">
                  <p className="text-primary text-sm">
                    {t.chunksExtracted}: <span className="font-bold">{chunks.length}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">{t.editChunks}</h3>
                  <button onClick={handleCancel} className="text-xs text-slate-400 hover:text-white transition-colors">
                    {t.cancel}
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {chunks.map((chunk, index) => (
                    <div key={index} className="bg-surface/50 border border-slate-700 rounded-sm p-3 space-y-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">{t.titleLabel}</label>
                        <input
                          type="text"
                          value={chunk.title || ''}
                          onChange={(e) => updateChunk(index, 'title', e.target.value)}
                          placeholder={`${t.titleLabel} ${index + 1}`}
                          className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-1.5 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">{t.contentLabel}</label>
                        <textarea
                          value={chunk.content}
                          onChange={(e) => {
                            updateChunk(index, 'content', e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }
                          }}
                          rows={2}
                          className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-1.5 text-white text-sm focus:border-primary focus:outline-none transition-colors resize-y min-h-[40px]"
                        />
                      </div>
                      {chunk.rationale && (
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">{t.rationaleLabel}</label>
                          <p className="text-xs text-slate-400 bg-darker/50 p-2 rounded-sm">{chunk.rationale}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          {language === 'pl' ? 'Tagi' : 'Tags'}
                        </label>
                        <div className="flex gap-1 flex-wrap items-center">
                          {(chunk.suggestedTags || []).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm border border-primary/20 inline-flex items-center gap-1 group/tag"
                            >
                              {tag}
                              <button
                                onClick={() => removeTagFromChunk(index, tag)}
                                className="text-primary/40 hover:text-red-400 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder={language === 'pl' ? '+ dodaj tag' : '+ add tag'}
                            className="text-[10px] bg-transparent border border-dashed border-slate-600 rounded-sm px-1.5 py-0.5 text-slate-400 placeholder-slate-600 focus:border-primary focus:outline-none w-20 transition-colors"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTagToChunk(index, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleConfirmIndex}
                    disabled={indexState.status === 'indexing' || chunks.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-darker font-bold rounded-sm transition-colors text-sm"
                  >
                    {indexState.status === 'indexing' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t.processing}</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>{t.confirmIndex}</span>
                      </>
                    )}
                  </button>
                </div>

                {indexState.status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    <span>{indexState.error || t.errorConfirm}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Knowledge browser ─────────────────────── */}
          <div className="bg-surface border border-slate-700 rounded-sm">
            <button
              onClick={() => {
                const willOpen = !userPointsOpen;
                setUserPointsOpen(willOpen);
                if (willOpen && userPoints.length === 0) fetchUserKnowledge(true);
              }}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Eye className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-white">
                  {language === 'pl' ? 'Baza wiedzy' : 'Knowledge base'}
                </h2>
                {sessionInfo && (
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                    {sessionInfo.chunkCount}
                  </span>
                )}
              </div>
              {userPointsOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
            </button>

            {userPointsOpen && (
              <div className="px-6 pb-4 space-y-2">
                {userPoints.length === 0 && !userPointsLoading && (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    {language === 'pl' ? 'Brak wektorów w bazie.' : 'No vectors in knowledge base.'}
                  </p>
                )}

                {userPoints.map((point) => (
                  <div key={point.id} className="bg-darker border border-slate-700 rounded-sm">
                    <button
                      onClick={() => setExpandedPointId(expandedPointId === point.id ? null : point.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface/30 transition-colors"
                    >
                      <ChevronRight
                        size={14}
                        className={`text-slate-500 transition-transform flex-shrink-0 ${expandedPointId === point.id ? 'rotate-90' : ''}`}
                      />
                      <span className="text-sm text-white truncate flex-1">
                        {point.title || point.content.slice(0, 60) + (point.content.length > 60 ? '…' : '')}
                      </span>
                      {point.language && (
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{point.language.toUpperCase()}</span>
                      )}
                    </button>

                    {expandedPointId === point.id && (
                      <div className="px-3 pb-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-300 whitespace-pre-wrap mt-2 max-h-40 overflow-y-auto">
                          {point.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                          <span>ID: {point.id.slice(0, 8)}…</span>
                          {point.createdAt && <span>{new Date(point.createdAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {userPointsLoading && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 size={18} className="animate-spin text-primary" />
                  </div>
                )}

                {userPointsNextOffset && !userPointsLoading && (
                  <button
                    onClick={() => fetchUserKnowledge(false)}
                    className="w-full text-center py-2 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {language === 'pl' ? 'Załaduj więcej…' : 'Load more…'}
                  </button>
                )}

                {userPoints.length > 0 && !userPointsLoading && (
                  <button
                    onClick={() => fetchUserKnowledge(true)}
                    className="w-full text-center py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {language === 'pl' ? 'Odśwież' : 'Refresh'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-sm">
            <div className="flex items-center gap-2 text-primary text-xs">
              <ArrowRight size={14} />
              <span className="font-mono">
                UID: {user.uid.slice(0, 8)}... | {t.sessionInfo}: 24h
                {sessionInfo ? ` | ${sessionInfo.chunkCount} chunks` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ╔══════════════════════════════════════════════╗
           ║  RIGHT PANEL — Chat                          ║
           ╚══════════════════════════════════════════════╝ */}
        <div className="lab-panel-right lg:w-1/2 w-full flex flex-col bg-darker/30">
          <div className="px-6 py-4 border-b border-slate-800 bg-darker/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-primary" size={22} />
              <div>
                <h2 className="text-lg font-bold text-white">{t.chatTitle}</h2>
                <p className="text-xs text-slate-400">{t.chatWithAgent}</p>
              </div>
            </div>
            {hasDocuments && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                {sessionInfo!.chunkCount} chunks
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-[300px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <MessageSquare size={44} className="mb-4 opacity-40" />
                <p className="text-base font-medium">{hasDocuments ? t.startChat : t.noDocumentsYet}</p>
                {!hasDocuments && <p className="text-sm mt-2 text-center max-w-xs">{t.uploadFirst}</p>}
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`lab-message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-sm px-4 py-3 ${message.role === 'user'
                        ? 'bg-primary text-darker'
                        : 'bg-surface border border-slate-700 text-white'
                        }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 flex items-center gap-3 ${message.role === 'user' ? 'text-darker/60' : 'text-slate-500'}`}>
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
                    <div className="max-w-[85%] rounded-sm px-4 py-3 bg-surface border border-slate-700">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-sm">{t.thinking}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {retrievedChunks.length > 0 && (
            <div className="border-t border-slate-800">
              <button
                onClick={() => setSourcesOpen(!sourcesOpen)}
                className="w-full px-6 py-2 flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors bg-surface/30"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  <span className="font-medium">{t.retrievedChunks} ({retrievedChunks.length})</span>
                </div>
                {sourcesOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {sourcesOpen && (
                <div className="px-6 py-3 space-y-2 max-h-40 overflow-y-auto bg-darker/50">
                  {retrievedChunks.map((chunk, index) => (
                    <div key={index} className="bg-surface border border-slate-700 rounded-sm p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-primary font-mono">#{index + 1}</span>
                        <h4 className="text-xs font-medium text-white truncate">{chunk.title}</h4>
                      </div>
                      {chunk.content && <p className="text-xs text-slate-400 line-clamp-2">{chunk.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-800 bg-darker/50">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chatPlaceholder}
                disabled={chatState.isLoading}
                className="flex-1 bg-surface border border-slate-700 rounded-sm px-4 py-3 text-white text-sm placeholder-slate-500 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={chatState.isLoading || !inputMessage.trim()}
                className="px-4 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-darker font-bold rounded-sm transition-colors flex items-center gap-2"
              >
                <Send size={16} />
                <span className="hidden sm:inline text-sm">{t.send}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Lab;
