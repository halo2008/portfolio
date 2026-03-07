import React from 'react';
import { useAuth } from '../core/auth/AuthContext';
import { AdminLogin } from '../components/AdminLogin';
import { KnowledgeManager } from '../components/KnowledgeManager';
import { LogOut, Database, Shield, ShieldAlert } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { user, isAdmin, logout } = useAuth();

    return (
        <div className="min-h-screen bg-dark text-white flex flex-col">
            <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-darker/80 border-b border-slate-800 h-16 flex items-center justify-between px-6 lg:px-12">
                <div className="flex items-center gap-4">
                    <a href="/" className="font-mono font-bold text-xl text-white tracking-tighter hover:text-primary transition-colors">
                        ks-infra<span className="text-primary">.dev</span>
                    </a>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-2 text-primary">
                        <Database size={18} />
                        <span className="font-bold text-sm">Knowledge Base</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs text-slate-400">{user?.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-sm border ${isAdmin
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                            {isAdmin ? 'Admin' : 'Demo'}
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Wyloguj"
                    >
                        <LogOut size={18} />
                    </button>
                    <a href="/" className="text-sm text-slate-300 hover:text-primary transition-colors">
                        Powrót
                    </a>
                </div>
            </nav>

            <main className="flex-1 pt-16 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    {!isAdmin && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-sm p-4 flex items-center gap-3">
                            <ShieldAlert size={20} className="text-amber-400 shrink-0" />
                            <div>
                                <p className="text-amber-400 text-sm font-bold">Tryb demonstracyjny</p>
                                <p className="text-slate-400 text-xs">Widzisz interfejs, ale operacje zapisu są zablokowane. Zaloguj się kontem admina, aby zarządzać bazą wiedzy.</p>
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 flex items-center gap-3">
                            <Shield size={20} className="text-primary shrink-0" />
                            <div>
                                <p className="text-primary text-sm font-bold">Pełne uprawnienia</p>
                                <p className="text-slate-400 text-xs">Masz dostęp do Qdrant. Możesz dodawać, edytować i usuwać wiedzę produkcyjną.</p>
                            </div>
                        </div>
                    )}

                    <KnowledgeManager />
                </div>
            </main>
        </div>
    );
};

export const AdminPage: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || user.isAnonymous) {
        return <AdminLogin />;
    }

    return <AdminDashboard />;
};
