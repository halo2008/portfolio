import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/auth/AuthContext';
import {
    RefreshCw, Trash2, CheckCircle, AlertCircle, Loader2,
    Sparkles, X, Database, FileText, Languages, Save,
    ChevronDown, ChevronRight, Eye, EyeOff
} from 'lucide-react';

interface KnowledgeStats {
    categories: Record<string, number>;
    total: number;
}

interface SemanticChunk {
    title?: string;
    content: string;
}

interface KnowledgePoint {
    id: string;
    title?: string;
    content: string;
    category?: string;
    technologies?: string[];
    language?: string;
    createdAt?: string;
}

type Step = 'input' | 'review';

const CATEGORIES = [
    { value: 'Experience', label: 'Experience' },
    { value: 'Cloud', label: 'Cloud (GCP, AWS)' },
    { value: 'AI', label: 'AI (Modele, RAG)' },
    { value: 'IoT', label: 'IoT (Hardware)' },
    { value: 'Philosophy', label: 'Philosophy' },
] as const;

export const KnowledgeManager: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState<KnowledgeStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [step, setStep] = useState<Step>('input');
    const [text, setText] = useState('');
    const [category, setCategory] = useState('Experience');
    const [tags, setTags] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState<'pl' | 'en'>('pl');
    const [chunks, setChunks] = useState<SemanticChunk[]>([]);

    // Browse state
    const [browseCategory, setBrowseCategory] = useState<string | ''>('');
    const [browsePoints, setBrowsePoints] = useState<KnowledgePoint[]>([]);
    const [browseLoading, setBrowseLoading] = useState(false);
    const [browseNextOffset, setBrowseNextOffset] = useState<string | undefined>();
    const [browseOpen, setBrowseOpen] = useState(false);
    const [expandedPointId, setExpandedPointId] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    const fetchStats = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/internal/ingest/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Nie udało się pobrać statystyk');
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    const fetchBrowse = async (offset?: string) => {
        if (!user) return;
        setBrowseLoading(true);
        try {
            const token = await user.getIdToken();
            const params = new URLSearchParams({ limit: '20' });
            if (browseCategory) params.set('category', browseCategory);
            if (offset) params.set('offset', offset);

            const res = await fetch(`${API_URL}/internal/ingest/browse?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Nie udało się pobrać danych');
            const data = await res.json();

            if (offset) {
                setBrowsePoints(prev => [...prev, ...data.points]);
            } else {
                setBrowsePoints(data.points);
            }
            setBrowseNextOffset(data.nextOffset);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBrowseLoading(false);
        }
    };

    const handleOpenBrowse = () => {
        setBrowseOpen(true);
        fetchBrowse();
    };

    const handleBrowseCategoryChange = (cat: string) => {
        setBrowseCategory(cat);
        setBrowsePoints([]);
        setBrowseNextOffset(undefined);
    };

    useEffect(() => {
        if (browseOpen) {
            fetchBrowse();
        }
    }, [browseCategory]);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/internal/ingest/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text, filename: 'admin_input.txt' })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Analiza nie powiodła się');
            }

            const data = await res.json();
            setDetectedLanguage(data.detectedLanguage);
            setChunks(data.chunks.map((c: any) => ({ title: c.title || '', content: c.content })));
            setStep('review');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmIndex = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = await user.getIdToken();

            const payload = {
                chunks: chunks.filter(c => c.content.trim() !== ''),
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                language: detectedLanguage
            };

            const endpoint = isAdmin ? '/internal/ingest/confirm-index' : '/internal/ingest/demo-batch';

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Indeksowanie nie powiodło się');
            }

            const data = await res.json();

            if (isAdmin) {
                setSuccess(`Wgrano ${data.inserted} wektorów (${data.duplicates} duplikatów pominięto)`);
                setText('');
                setChunks([]);
                setStep('input');
                fetchStats();
            } else {
                setSuccess('Symulacja zakończona pomyślnie (tryb demo)');
                setStep('input');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cat: string) => {
        if (!user || !isAdmin) return;
        if (!confirm(`Usunąć wszystkie wektory z kategorii "${cat}"?`)) return;

        setLoading(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/internal/ingest/knowledge?category=${cat}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Usuwanie nie powiodło się');

            const data = await res.json();
            setSuccess(`Usunięto ${data.deleted} wektorów z "${cat}"`);
            fetchStats();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePoint = async (pointId: string) => {
        if (!user || !isAdmin) return;
        if (!confirm('Usunąć ten wektor?')) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/internal/ingest/knowledge?id=${pointId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Usuwanie nie powiodło się');
            setBrowsePoints(prev => prev.filter(p => p.id !== pointId));
            fetchStats();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleChunkChange = (index: number, field: 'title' | 'content', value: string) => {
        setChunks(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    const dismissError = () => setError(null);
    const dismissSuccess = () => setSuccess(null);

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3 flex items-center gap-3">
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    <span className="text-red-400 text-sm flex-1">{error}</span>
                    <button onClick={dismissError} className="text-red-400/50 hover:text-red-400"><X size={14} /></button>
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-sm p-3 flex items-center gap-3">
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                    <span className="text-green-400 text-sm flex-1">{success}</span>
                    <button onClick={dismissSuccess} className="text-green-400/50 hover:text-green-400"><X size={14} /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Training */}
                <div className="lg:col-span-3 bg-surface border border-slate-700 rounded-sm p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-primary" size={20} />
                        <h2 className="text-lg font-bold text-white">Trenowanie wiedzy</h2>
                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20 ml-auto">
                            Gemini AI Split
                        </span>
                    </div>

                    {step === 'input' && (
                        <form onSubmit={handleAnalyze} className="space-y-4 flex-1 flex flex-col">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Kategoria</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-2 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Tagi</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="React, NestJS, Terraform"
                                        className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-2 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1.5">Tekst do analizy</label>
                                <textarea
                                    required
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={12}
                                    placeholder={"Wklej dokumentację, opis projektu, doświadczenie zawodowe...\n\nGemini podzieli tekst semantycznie na chunki, które możesz edytować przed zaindeksowaniem."}
                                    className="w-full bg-darker border border-slate-700 rounded-sm px-3 py-2 text-white text-sm focus:border-primary focus:outline-none transition-colors resize-none h-full min-h-[200px]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !text.trim()}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-darker font-bold rounded-sm transition-colors text-sm"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                Analizuj z Gemini
                            </button>
                        </form>
                    )}

                    {step === 'review' && (
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Languages size={14} className="text-primary" />
                                        <span className="text-xs text-slate-400">
                                            Język: <span className="text-white font-bold">{detectedLanguage.toUpperCase()}</span>
                                        </span>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-sm px-2 py-0.5">
                                        <span className="text-primary text-xs font-bold">{chunks.length}</span>
                                        <span className="text-slate-400 text-xs ml-1">chunków</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep('input')}
                                    className="text-slate-400 hover:text-white transition-colors text-xs"
                                >
                                    Anuluj
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 max-h-[500px]">
                                {chunks.map((chunk, index) => (
                                    <div key={index} className="bg-darker border border-slate-700 rounded-sm p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm border border-primary/20">
                                                #{index + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={chunk.title || ''}
                                                onChange={e => handleChunkChange(index, 'title', e.target.value)}
                                                placeholder="Tytuł chunka..."
                                                className="flex-1 bg-transparent text-sm font-bold text-white border-b border-slate-700 focus:border-primary outline-none pb-0.5 transition-colors"
                                            />
                                        </div>
                                        <textarea
                                            value={chunk.content}
                                            onChange={e => handleChunkChange(index, 'content', e.target.value)}
                                            rows={3}
                                            className="w-full bg-transparent text-sm text-slate-300 resize-y outline-none border border-transparent focus:border-slate-600 rounded-sm px-1 py-0.5 transition-colors min-h-[60px]"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleConfirmIndex}
                                disabled={loading || chunks.length === 0}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-darker font-bold rounded-sm transition-colors text-sm mt-4 shrink-0"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isAdmin ? 'Zaindeksuj do Qdrant' : 'Symuluj (Demo)'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Knowledge Base Stats */}
                <div className="lg:col-span-2 bg-surface border border-slate-700 rounded-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Database className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-white">Baza wiedzy</h2>
                        </div>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="p-1.5 text-slate-400 hover:text-primary border border-slate-700 hover:border-primary/30 rounded-sm transition-colors"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {!stats ? (
                        <div className="text-center py-12">
                            {loading ? (
                                <Loader2 size={24} className="mx-auto text-primary animate-spin" />
                            ) : (
                                <>
                                    <Database size={32} className="mx-auto mb-3 text-slate-600" />
                                    <p className="text-sm text-slate-500">Nie udało się połączyć z bazą</p>
                                    <button
                                        onClick={fetchStats}
                                        className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Spróbuj ponownie
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Łącznie</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-primary font-mono">{stats.total}</span>
                                    <span className="text-xs text-slate-500 ml-1.5">wektorów</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {Object.entries(stats.categories).length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText size={24} className="mx-auto mb-2 text-slate-600" />
                                        <p className="text-sm text-slate-500">Baza jest pusta</p>
                                    </div>
                                ) : (
                                    Object.entries(stats.categories).map(([cat, count]) => (
                                        <div
                                            key={cat}
                                            className="flex items-center justify-between bg-darker border border-slate-700 p-3 rounded-sm group hover:border-slate-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                <span className="text-white text-sm">{cat}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-400 text-xs font-mono">{count}</span>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(cat)}
                                                        className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                        title={`Usuń kategorię ${cat}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => browseOpen ? setBrowseOpen(false) : handleOpenBrowse()}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-primary border border-slate-700 hover:border-primary/30 rounded-sm transition-colors"
                                >
                                    {browseOpen ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {browseOpen ? 'Ukryj podgląd' : 'Podgląd wektorów'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Browse panel - full width below */}
            {browseOpen && isAdmin && (
                <div className="bg-surface border border-slate-700 rounded-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Eye className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-white">Podgląd Qdrant</h2>
                            <span className="text-xs text-slate-500">{browsePoints.length} wyników</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={browseCategory}
                                onChange={(e) => handleBrowseCategoryChange(e.target.value)}
                                className="bg-darker border border-slate-700 rounded-sm px-3 py-1.5 text-white text-xs focus:border-primary focus:outline-none transition-colors"
                            >
                                <option value="">Wszystkie kategorie</option>
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => fetchBrowse()}
                                disabled={browseLoading}
                                className="p-1.5 text-slate-400 hover:text-primary border border-slate-700 hover:border-primary/30 rounded-sm transition-colors"
                            >
                                <RefreshCw size={14} className={browseLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {browseLoading && browsePoints.length === 0 ? (
                        <div className="text-center py-8">
                            <Loader2 size={24} className="mx-auto text-primary animate-spin" />
                        </div>
                    ) : browsePoints.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText size={24} className="mx-auto mb-2 text-slate-600" />
                            <p className="text-sm text-slate-500">Brak wektorów</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                                {browsePoints.map((point) => (
                                    <div
                                        key={point.id}
                                        className="bg-darker border border-slate-700 rounded-sm hover:border-slate-600 transition-colors"
                                    >
                                        <button
                                            onClick={() => setExpandedPointId(expandedPointId === point.id ? null : point.id)}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-left"
                                        >
                                            {expandedPointId === point.id
                                                ? <ChevronDown size={14} className="text-primary shrink-0" />
                                                : <ChevronRight size={14} className="text-slate-500 shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-sm font-medium truncate">
                                                        {point.title || point.content.slice(0, 60) + '...'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {point.category && (
                                                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm border border-primary/20">
                                                            {point.category}
                                                        </span>
                                                    )}
                                                    {point.language && (
                                                        <span className="text-[10px] text-slate-500">{point.language.toUpperCase()}</span>
                                                    )}
                                                    <span className="text-[10px] text-slate-600 font-mono">{point.id.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeletePoint(point.id); }}
                                                className="text-slate-700 hover:text-red-400 transition-colors shrink-0"
                                                title="Usuń wektor"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </button>

                                        {expandedPointId === point.id && (
                                            <div className="px-4 pb-3 border-t border-slate-700/50">
                                                <pre className="text-xs text-slate-300 whitespace-pre-wrap mt-2 max-h-[200px] overflow-y-auto">
                                                    {point.content}
                                                </pre>
                                                {point.technologies && point.technologies.length > 0 && (
                                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                                        {point.technologies.map((tech, i) => (
                                                            <span key={i} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-sm">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {point.createdAt && (
                                                    <p className="text-[10px] text-slate-600 mt-2">
                                                        Dodano: {new Date(point.createdAt).toLocaleString('pl-PL')}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {browseNextOffset && (
                                <button
                                    onClick={() => fetchBrowse(browseNextOffset)}
                                    disabled={browseLoading}
                                    className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-primary border border-slate-700 hover:border-primary/30 rounded-sm transition-colors"
                                >
                                    {browseLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                    Załaduj więcej
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
