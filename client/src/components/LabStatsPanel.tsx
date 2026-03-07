import React from 'react';
import { useLabTranslations } from '../LanguageContext';
import { Activity, Database, MessageSquare, Zap, AlertTriangle } from 'lucide-react';

interface LabStatsPanelProps {
    stats: {
        requestCount: number;
        analysisTokens: number;
        indexingOps: number;
        chatTokens: number;
        maxRequests: number;
    };
}

export const LabStatsPanel: React.FC<LabStatsPanelProps> = ({ stats }) => {
    const t = useLabTranslations();

    const requestsRemaining = Math.max(0, stats.maxRequests - stats.requestCount);
    const percentUsed = Math.min(100, (stats.requestCount / stats.maxRequests) * 100);
    const isNearLimit = percentUsed > 80;
    const isAtLimit = percentUsed >= 100;

    return (
        <div className="bg-surface/60 border border-slate-700/50 rounded-sm p-4 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                {t.statsTitle}
            </h3>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs text-slate-400">{t.sessionRequests}</span>
                        <span className={`text-xs font-bold ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-primary'}`}>
                            {requestsRemaining} {t.remaining}
                        </span>
                    </div>
                    <div className="h-2 bg-dark rounded-full overflow-hidden border border-slate-800">
                        <div
                            className={`h-full transition-all duration-500 ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'}`}
                            style={{ width: `${percentUsed}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    <div className="bg-darker/50 p-2 rounded-sm border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                            <Zap size={12} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">{t.analysis}</span>
                        </div>
                        <div className="text-white font-mono text-sm">{stats.analysisTokens.toLocaleString()} <span className="text-[10px] text-slate-500">{t.tokens}</span></div>
                    </div>

                    <div className="bg-darker/50 p-2 rounded-sm border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                            <Database size={12} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">{t.indexing}</span>
                        </div>
                        <div className="text-white font-mono text-sm">{stats.indexingOps.toLocaleString()} <span className="text-[10px] text-slate-500">{t.ops}</span></div>
                    </div>

                    <div className="bg-darker/50 p-2 rounded-sm border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                            <MessageSquare size={12} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">{t.chat}</span>
                        </div>
                        <div className="text-white font-mono text-sm">{stats.chatTokens.toLocaleString()} <span className="text-[10px] text-slate-500">{t.tokens}</span></div>
                    </div>
                </div>

                {isNearLimit && !isAtLimit && (
                    <div className="mt-2 flex items-start gap-2 text-amber-400 bg-amber-900/10 p-2 border border-amber-900/30 rounded-sm">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <p className="text-xs">{t.nearLimitReached}</p>
                    </div>
                )}

                {isAtLimit && (
                    <div className="mt-2 flex items-start gap-2 text-red-400 bg-red-900/10 p-2 border border-red-900/30 rounded-sm">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <p className="text-xs">{t.limitReached}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
