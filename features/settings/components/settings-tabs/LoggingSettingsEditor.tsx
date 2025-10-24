
import React from 'react';
import { useLogging, LogEntry } from '../../../../context/LoggingContext';
import { useToast } from '../../../../context/ToastContext';

const LogLevelBadge: React.FC<{ level: LogEntry['level'] }> = ({ level }) => {
    const colors = {
        info: 'bg-sky-500/20 text-sky-300',
        warn: 'bg-yellow-500/20 text-yellow-300',
        error: 'bg-red-500/20 text-red-300',
        debug: 'bg-slate-500/20 text-slate-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[level]}`}>
            {level.toUpperCase()}
        </span>
    );
};

export const LoggingSettingsEditor: React.FC = () => {
    const { isLoggingEnabled, logs, enableLogging, disableLogging, clearLogs } = useLogging();
    const { showToast } = useToast();

    const handleCopyToClipboard = () => {
        const logText = logs.map(log => 
            `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}` +
            (log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : '')
        ).join('\n\n');
        
        navigator.clipboard.writeText(logText).then(() => {
            showToast('Logs in die Zwischenablage kopiert!');
        }, (err) => {
            showToast('Kopieren fehlgeschlagen!');
            console.error('Could not copy logs to clipboard: ', err);
        });
    };

    return (
        <div className="space-y-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-sky-400">App-Logs</h3>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                    <label htmlFor="logging-toggle" className="font-medium text-slate-300 cursor-pointer select-none">
                        Logging aktivieren
                    </label>
                    <p className="text-xs text-slate-400 mt-1">Zeichnet detaillierte Aktionen zur Fehlerbehebung auf.</p>
                </div>
                <button
                    id="logging-toggle" role="switch" aria-checked={isLoggingEnabled}
                    onClick={() => isLoggingEnabled ? disableLogging() : enableLogging()}
                    className={`${isLoggingEnabled ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                >
                    <span className={`${isLoggingEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            <div className="flex gap-2">
                <button onClick={clearLogs} className="flex-1 bg-slate-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-slate-500">
                    Logs löschen
                </button>
                 <button onClick={handleCopyToClipboard} className="flex-1 bg-slate-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-slate-500">
                    In Zwischenablage kopieren
                </button>
            </div>
            <div className="flex-grow bg-slate-900/50 p-3 rounded-lg border border-slate-700 font-mono text-xs overflow-y-auto custom-scrollbar min-h-[200px]">
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Keine Logs aufgezeichnet. Aktivieren Sie das Logging, um zu beginnen.
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="border-b border-slate-700/50 py-2">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500">{log.timestamp.toLocaleTimeString()}</span>
                                <LogLevelBadge level={log.level} />
                                <span className="text-slate-300 flex-grow">{log.message}</span>
                            </div>
                            {log.data && (
                                <details className="mt-1">
                                    <summary className="cursor-pointer text-slate-500 text-[10px] uppercase tracking-wider">Details</summary>
                                    <pre className="text-sky-300 bg-black/30 p-2 rounded mt-1 overflow-x-auto">
                                        {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
