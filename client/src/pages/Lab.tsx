import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { useLabTranslations } from '../LanguageContext';
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
} from 'lucide-react';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Types
interface SemanticChunk {
  content: string;
  title?: string;
  rationale?: string;
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

// File icons component
const FileTypeIcon: React.FC<{ extension: string; size?: number }> = ({ extension, size = 24 }) => {
  const ext = extension.toLowerCase();
  if (ext === '.pdf') {
    return <FileType size={size} className="text-red-400" />;
  }
  if (ext === '.md') {
    return <FileType size={size} className="text-blue-400" />;
  }
  return <FileIcon size={size} className="text-green-400" />;
};

// Toast notification component
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
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-sm shadow-lg animate-fade-in-up ${
        type === 'error' ? 'bg-red-900/90 border border-red-700' : 'bg-green-900/90 border border-green-700'
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

const Lab: React.FC = () => {
  const { user, loading } = useAuth();
  const t = useLabTranslations();
  const navigate = useNavigate();

  // State
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [indexState, setIndexState] = useState<IndexState>({ status: 'idle' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chunks, setChunks] = useState<SemanticChunk[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Get auth token for API calls
  const getAuthToken = async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  };

  // Handle file upload
  const uploadFile = async (file: File) => {
    try {
      setFileName(file.name);
      setUploadState({ status: 'uploading', progress: 0 });
      setAnalysisResult(null);
      setChunks([]);

      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const response = await fetch(`${API_BASE_URL}/lab/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : t.errorUpload,
      });
      setToast({ message: error instanceof Error ? error.message : t.errorUpload, type: 'error' });
    }
  };

  // Handle confirm and index
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
          chunks: chunks.map((chunk) => ({
            content: chunk.content,
            title: chunk.title || '',
          })),
          language: analysisResult.detectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t.errorConfirm);
      }

      setIndexState({ status: 'success' });
      setToast({ message: t.confirmSuccess, type: 'success' });
    } catch (error) {
      setIndexState({
        status: 'error',
        error: error instanceof Error ? error.message : t.errorConfirm,
      });
      setToast({ message: error instanceof Error ? error.message : t.errorConfirm, type: 'error' });
    }
  };

  // Drag handlers
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        const validExtensions = ['.txt', '.md', '.pdf'];
        const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

        if (validExtensions.includes(extension) && file.size <= 10 * 1024 * 1024) {
          uploadFile(file);
        } else {
          setToast({ message: t.errorUpload, type: 'error' });
        }
      }
    },
    [t]
  );

  // File input handler
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadFile(files[0]);
      }
    },
    [uploadFile]
  );

  // Update chunk
  const updateChunk = (index: number, field: 'title' | 'content', value: string) => {
    setChunks((prev) =>
      prev.map((chunk, i) => (i === index ? { ...chunk, [field]: value } : chunk))
    );
  };

  // Cancel/reset
  const handleCancel = () => {
    setUploadState({ status: 'idle', progress: 0 });
    setIndexState({ status: 'idle' });
    setAnalysisResult(null);
    setChunks([]);
    setFileName('');
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

  const getFileExtension = (name: string) => {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    return ext;
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-darker/80 border-b border-slate-800 h-16 flex items-center justify-between px-6 lg:px-24">
        <a
          href="/"
          className="font-mono font-bold text-xl text-white tracking-tighter hover:text-primary transition-colors"
        >
          ks-infra<span className="text-primary">.dev</span>
        </a>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-mono">
            {t.sessionInfo}: 24h
          </span>
          <a href="/" className="text-sm text-slate-300 hover:text-primary transition-colors">
            {t.back}
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6 lg:px-24 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Beaker className="text-primary" size={28} />
            <h1 className="text-3xl md:text-4xl font-bold text-white">{t.personalLab}</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">{t.labDescription}</p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface/50 border border-slate-700 p-6 rounded-sm">
            <Clock className="text-primary mb-3" size={24} />
            <h3 className="text-white font-bold mb-2">{t.session24h}</h3>
            <p className="text-slate-400 text-sm">{t.session24hDesc}</p>
          </div>
          <div className="bg-surface/50 border border-slate-700 p-6 rounded-sm">
            <Shield className="text-primary mb-3" size={24} />
            <h3 className="text-white font-bold mb-2">{t.privacyFirst}</h3>
            <p className="text-slate-400 text-sm">{t.privacyFirstDesc}</p>
          </div>
          <div className="bg-surface/50 border border-slate-700 p-6 rounded-sm">
            <Brain className="text-primary mb-3" size={24} />
            <h3 className="text-white font-bold mb-2">{t.geminiAI}</h3>
            <p className="text-slate-400 text-sm">{t.geminiAIDesc}</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-surface border border-slate-700 rounded-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-white">{t.uploadTitle}</h2>
          </div>

          {/* Drag and Drop Zone */}
          {uploadState.status === 'idle' && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-sm p-12 text-center transition-all duration-200 ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-600 hover:border-primary/50'
              }`}
            >
              <div className="max-w-md mx-auto">
                <Upload
                  size={48}
                  className={`mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-slate-500'}`}
                />
                <p className="text-white mb-2">
                  {isDragActive ? t.dropHere : t.dragDropText}
                </p>
                <p className="text-slate-400 text-sm mb-6">{t.maxSize}</p>

                {/* File Type Icons */}
                <div className="flex justify-center gap-6 mb-6">
                  <div className="flex flex-col items-center gap-2">
                    <FileIcon size={32} className="text-green-400" />
                    <span className="text-xs text-slate-500">.txt</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <FileType size={32} className="text-blue-400" />
                    <span className="text-xs text-slate-500">.md</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <FileType size={32} className="text-red-400" />
                    <span className="text-xs text-slate-500">.pdf</span>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-sm cursor-pointer transition-colors">
                  <Upload size={16} />
                  <span>{t.browseFiles}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Uploading Progress */}
          {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
            <div className="border-2 border-slate-600 rounded-sm p-12 text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-primary animate-spin" />
              <p className="text-white mb-4">
                {uploadState.status === 'uploading' ? t.uploading : t.processing}
              </p>
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-slate-400 text-sm mt-2">{uploadState.progress}%</p>
              </div>
              {fileName && (
                <p className="text-slate-500 text-sm mt-4 flex items-center justify-center gap-2">
                  <FileTypeIcon extension={getFileExtension(fileName)} size={16} />
                  {fileName}
                </p>
              )}
            </div>
          )}

          {/* Error State */}
          {uploadState.status === 'error' && (
            <div className="border-2 border-red-700/50 bg-red-900/10 rounded-sm p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
              <p className="text-red-400 mb-4">{uploadState.error || t.errorUpload}</p>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-sm transition-colors"
              >
                <Upload size={16} />
                <span>{t.retry}</span>
              </button>
            </div>
          )}

          {/* Success - Analysis Results */}
          {uploadState.status === 'success' && analysisResult && (
            <div className="space-y-6">
              {/* Language Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Languages size={20} className="text-primary" />
                  <span className="text-slate-300">
                    {t.detectedLanguage}:{' '}
                    <span className="text-white font-bold">
                      {analysisResult.detectedLanguage.toUpperCase()}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <FileTypeIcon extension={getFileExtension(fileName)} size={16} />
                  <span>{fileName}</span>
                </div>
              </div>

              {/* Chunks Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-4">
                <p className="text-primary text-sm">
                  {t.chunksExtracted}:{' '}
                  <span className="font-bold">{chunks.length}</span>
                </p>
              </div>

              {/* Edit Chunks Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">{t.editChunks}</h3>
                <button
                  onClick={handleCancel}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {t.cancel}
                </button>
              </div>

              {/* Chunk Cards */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {chunks.map((chunk, index) => (
                  <div
                    key={index}
                    className="bg-surface/50 border border-slate-700 rounded-sm p-4 space-y-3"
                  >
                    {/* Title Input */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        {t.titleLabel}
                      </label>
                      <input
                        type="text"
                        value={chunk.title || ''}
                        onChange={(e) => updateChunk(index, 'title', e.target.value)}
                        placeholder={`${t.titleLabel} ${index + 1}`}
                        className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-2 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Content Textarea */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        {t.contentLabel}
                      </label>
                      <textarea
                        value={chunk.content}
                        onChange={(e) => updateChunk(index, 'content', e.target.value)}
                        rows={3}
                        className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-2 text-white text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Rationale (read-only) */}
                    {chunk.rationale && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          {t.rationaleLabel}
                        </label>
                        <p className="text-xs text-slate-400 bg-darker/50 p-2 rounded-sm">
                          {chunk.rationale}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Confirm Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleConfirmIndex}
                  disabled={indexState.status === 'indexing' || chunks.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-darker font-bold rounded-sm transition-colors"
                >
                  {indexState.status === 'indexing' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{t.processing}</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{t.confirmIndex}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Index Error */}
              {indexState.status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  <span>{indexState.error || t.errorConfirm}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-sm">
          <div className="flex items-center gap-2 text-primary text-sm">
            <ArrowRight size={16} />
            <span className="font-mono">
              UID: {user.uid.slice(0, 8)}... | {t.sessionInfo}: 24h
            </span>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Lab;
