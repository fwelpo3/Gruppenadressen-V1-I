import React from 'react';

export const ShortcutHelp: React.FC = () => (
    <div>
        <h3 className="text-lg font-bold text-sky-400 mb-4">Tastaturkürzel</h3>
        <p className="text-sm text-slate-400 mb-6">
            Verwenden Sie diese Tastenkombinationen, um Ihren Arbeitsablauf zu beschleunigen.
            Auf macOS wird <kbd>Cmd</kbd> anstelle von <kbd>Ctrl</kbd> verwendet.
        </p>
        <div className="space-y-4 text-sm">
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Aktion rückgängig machen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>Z</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Aktion wiederherstellen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>Y</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg mt-6 border-t border-slate-700 pt-4">
                <span className="text-slate-300">Struktur alles ausklappen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>M</kbd>, dann <kbd>M</kbd>
                </div>
            </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Struktur alles einklappen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>M</kbd>, dann <kbd>L</kbd>
                </div>
            </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Räume einklappen (Definitionen)</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>M</kbd>, dann <kbd>O</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg mt-6 border-t border-slate-700 pt-4">
                <span className="text-slate-300">KI-Projekt-Chat öffnen/schließen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>E</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Exporte generieren</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>G</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Neuen Bereich hinzufügen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>B</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Projekt zurücksetzen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Einstellungen öffnen/schließen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>S</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Kompakt-Modus umschalten</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>
                </div>
            </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Shortcut-Hilfe anzeigen</span>
                <kbd>?</kbd>
            </div>
        </div>
    </div>
);