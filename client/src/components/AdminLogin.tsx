import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../core/auth/firebase';
import { useAuth } from '../core/auth/AuthContext';
import { Lock, Mail, Key, AlertCircle, Loader2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            console.error(err);
            setError('Nieprawidłowe dane logowania lub brak dostępu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark p-4">
            <div className="max-w-sm w-full bg-surface border border-slate-700 rounded-sm p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-sm text-primary">
                        <Lock size={28} />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-white mb-1">Knowledge Base</h2>
                <p className="text-slate-400 text-center mb-6 text-xs">Zaloguj się, aby zarządzać bazą wiedzy</p>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-xs flex items-center gap-2">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-darker border border-slate-700 rounded-sm text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                placeholder="admin@ks-infra.dev"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Hasło</label>
                        <div className="relative">
                            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-darker border border-slate-700 rounded-sm text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-darker font-bold rounded-sm transition-colors text-sm"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>

                <p className="text-center text-[10px] text-slate-600 mt-6">
                    Firebase Auth · Email/Password
                </p>
            </div>
        </div>
    );
};
