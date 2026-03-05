import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/auth/AuthContext';
import { RefreshCw, Trash2, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';

interface KnowledgeStats {
    categories: Record<string, number>;
    total: number;
}

interface SemanticChunk {
    title?: string;
    content: string;
}

type Step = 'input' | 'review';

export const KnowledgeManager: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState<KnowledgeStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form State
    const [step, setStep] = useState<Step>('input');
    const [text, setText] = useState('');
    const [category, setCategory] = useState('Experience');
    const [tags, setTags] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState<'pl' | 'en'>('pl');
    const [chunks, setChunks] = useState<SemanticChunk[]>([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchStats = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/internal/ingest/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Błąd pobierania statystyk');
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
                throw new Error(errorData.message || 'Błąd analizy tekstu');
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

            // In demo mode, we could use demo-batch endpoint, but for simplicity let's assume
            // this is primarily the admin panel. Let's send to confirm-index.
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
                throw new Error(errorData.message || 'Błąd podczas wgrywania wiedzy');
            }

            const data = await res.json();

            if (isAdmin) {
                setSuccess(`Sukces: Wgrano ${data.inserted} wektorów z użyciem Gemini (Pominięto ${data.duplicates} duplikatów).`);
                setText('');
                setChunks([]);
                setStep('input');
                fetchStats();
            } else {
                setSuccess(`[DEMO] Symulacja udana. Zindeksowano wirtualnie.`);
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
        if (!confirm(`Czy na pewno chcesz usunąć całą wiedzę z kategorii: ${cat}?`)) return;

        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/internal/ingest/knowledge?category=${cat}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Błąd usuwania');

            const data = await res.json();
            setSuccess(`Usunięto ${data.deleted} wektorów z kategorii ${cat}.`);
            fetchStats();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChunkChange = (index: number, field: 'title' | 'content', value: string) => {
        setChunks(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Wgrywanie Danych */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col max-h-[800px]">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        Trenowanie Modelu
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">Gemini Semantic Split</span>
                    </h3>

                    {step === 'input' && (
                        <form onSubmit={handleAnalyze} className="space-y-4 flex-1 overflow-y-auto pr-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Kategoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Experience">Experience (Doświadczenie zawodowe)</option>
                                    <option value="Cloud">Cloud (GCP, AWS)</option>
                                    <option value="AI">AI (Modele, RAG)</option>
                                    <option value="IoT">IoT (Hardware)</option>
                                    <option value="Philosophy">Philosophy (Prywatne przemyślenia)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Tagi (po przecinku)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="np. React, NestJS, Terraform"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Surowy tekst do podziału</label>
                                <textarea
                                    required
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={8}
                                    placeholder="Wklej dokumentację, opis projektu lub artykuł (Gemini podzieli go semantycznie)..."
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !text.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-4"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                Analizuj z Gemini (Krok 1/2)
                            </button>
                        </form>
                    )}

                    {step === 'review' && (
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="text-sm text-gray-400">Język: <strong className="text-white">{detectedLanguage.toUpperCase()}</strong></span>
                                    <span className="text-sm text-gray-400 ml-4">Wyodrębniono: <strong className="text-white">{chunks.length}</strong> sekcji</span>
                                </div>
                                <button
                                    onClick={() => setStep('input')}
                                    className="text-gray-400 hover:text-white"
                                    title="Anuluj"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                                {chunks.map((chunk, index) => (
                                    <div key={index} className="bg-gray-950 border border-gray-800 p-3 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-blue-500 px-1 border border-blue-500/30 rounded">#{index + 1}</span>
                                            <input
                                                type="text"
                                                value={chunk.title || ''}
                                                onChange={e => handleChunkChange(index, 'title', e.target.value)}
                                                placeholder="Opcjonalny tytuł..."
                                                className="flex-1 bg-transparent text-sm font-bold text-white border-b border-transparent focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <textarea
                                            value={chunk.content}
                                            onChange={e => handleChunkChange(index, 'content', e.target.value)}
                                            rows={3}
                                            className="w-full bg-transparent text-sm text-gray-300 resize-none outline-none focus:ring-1 focus:ring-blue-500/50 rounded"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleConfirmIndex}
                                disabled={loading || chunks.length === 0}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-auto shrink-0"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {isAdmin ? 'Zatwierdź i Indeksuj do Qdrant' : 'Zatwierdź (Demo)'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Baza Danych Stats */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Zawartość Bazy Wiedzy</h3>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-white bg-gray-950 rounded border border-gray-800 hover:border-gray-600 transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {!stats ? (
                        <div className="text-center text-gray-500 py-10">
                            {loading ? 'Ładowanie...' : 'Brak połączenia z bazą.'}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 flex justify-between items-center">
                                <span className="text-gray-400 font-medium">Baza Całkowita:</span>
                                <span className="text-2xl font-bold text-blue-400">{stats.total} <span className="text-sm font-normal text-gray-500">chunków</span></span>
                            </div>

                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                {Object.entries(stats.categories).length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">Baza wektorowa jest pusta.</p>
                                ) : (
                                    Object.entries(stats.categories).map(([cat, count]) => (
                                        <div key={cat} className="flex items-center justify-between bg-gray-950 border border-gray-800 p-3 rounded-lg group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-gray-200">{cat}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-400 text-sm">{count} wektorów</span>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(cat)}
                                                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Usuń całą kategorię"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
