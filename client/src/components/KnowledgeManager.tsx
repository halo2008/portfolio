import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/auth/AuthContext';
import { RefreshCw, Trash2, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface KnowledgeStats {
    categories: Record<string, number>;
    total: number;
}

export const KnowledgeManager: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState<KnowledgeStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [text, setText] = useState('');
    const [category, setCategory] = useState('Experience');
    const [tags, setTags] = useState('');

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

    const handleIngest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = await user.getIdToken();
            const endpoint = isAdmin ? '/internal/ingest/batch' : '/internal/ingest/demo-batch';

            const payload = [{
                text,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean)
            }];

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Błąd podczas wgrywania wiedzy');

            const data = await res.json();
            if (isAdmin) {
                setSuccess(`Sukces: Dodano ${data.inserted} wektorów (Pominięto ${data.duplicates} duplikatów).`);
                setText('');
                fetchStats();
            } else {
                setSuccess(`[DEMO] Symulacja udana. Dodano ${data.inserted} elementów wirtualnie.`);
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
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Trenowanie Modelu (Ingestion)</h3>
                    <form onSubmit={handleIngest} className="space-y-4">
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
                            <label className="block text-sm font-medium text-gray-400 mb-1">Treść Kontekstu</label>
                            <textarea
                                required
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={6}
                                placeholder="Wklej dokumentację, opis projektu lub artykuł..."
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !text.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            <Send size={18} />
                            {isAdmin ? 'Ingest to Qdrant' : 'Test Modelu (Demo)'}
                        </button>
                    </form>
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

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
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
