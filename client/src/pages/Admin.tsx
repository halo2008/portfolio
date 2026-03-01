import React from 'react';
import { useAuth } from '../core/auth/AuthContext';
import { AdminLogin } from '../components/AdminLogin';
import { KnowledgeManager } from '../components/KnowledgeManager';
import { LogOut, Database, UserCheck, ShieldAlert } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { user, isAdmin, logout } = useAuth();

    // Tu za chwilę dodamy obsługę pobierania statystyk i wgrywania z NestJS

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-800">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Database className="text-blue-500" />
                            Knowledge Base Engine
                        </h1>
                        <p className="text-gray-400 mt-2">Dostęp uwierzytelniony z przypisanymi rolami</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user?.email}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${isAdmin ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-green-500/20 text-green-400 border border-green-500/20'}`}>
                                {isAdmin ? 'Administrator (Write Access)' : 'Demo User (View Only)'}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Wyloguj"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Role Display Card */}
                    <div className="col-span-1 border border-gray-800 bg-gray-900/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Twój poziom dostępu</h3>
                        {isAdmin ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-blue-400">
                                    <UserCheck size={24} />
                                    <span>Pełne uprawnienia Admina</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Masz bezpośredni dostęp do API i bazy Qdrant. Możesz trenować model nowymi danymi i usuwać jego pamięć.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-green-400">
                                    <ShieldAlert size={24} />
                                    <span>Tryb Demonstracyjny</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Zalogowano w trybie ograniczonego zaufania (Demo). Widzisz interfejs, ale wprowadzanie danych zostało sztucznie zamokowane w celu bezpieczeństwa bazy produkcyjnej.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Stats & Tools Placeholder */}
                    <div className="col-span-1 md:col-span-2">
                        <KnowledgeManager />
                    </div>

                </div>
            </div>
        </div>
    );
};

export const AdminPage: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return <AdminLogin />;
    }

    return <AdminDashboard />;
};
