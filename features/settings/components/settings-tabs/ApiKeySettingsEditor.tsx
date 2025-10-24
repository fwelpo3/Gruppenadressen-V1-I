import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '../../../../shared/ui/icons';

interface ApiKeySettingsEditorProps {
    apiKey: string;
    onApiKeyChange: (newKey: string) => void;
}

export const ApiKeySettingsEditor: React.FC<ApiKeySettingsEditorProps> = ({ apiKey, onApiKeyChange }) => {
    const [isKeyVisible, setIsKeyVisible] = useState(false);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-sky-400">Gemini API-Schlüssel</h3>
            <div className="p-4 bg-yellow-900/40 border border-yellow-700/60 rounded-lg text-yellow-200 text-sm space-y-2">
                <p className="font-bold text-base">Sicherheitswarnung</p>
                <p>
                    Ihr API-Schlüssel wird unsicher im lokalen Speicher Ihres Browsers gespeichert. Dies ist nur für Testzwecke gedacht.
                    Verwenden Sie einen API-Schlüssel mit eingeschränkten Berechtigungen und geben Sie ihn niemals an Dritte weiter oder checken Sie ihn in ein öffentliches Repository ein.
                </p>
            </div>
            <div>
                <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-400 mb-1">
                    Ihr API-Schlüssel
                </label>
                <div className="flex items-center gap-2">
                    <input
                        id="api-key-input"
                        type={isKeyVisible ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        placeholder="Fügen Sie Ihren Gemini API-Schlüssel hier ein"
                        className="flex-grow w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                    />
                    <button onClick={() => setIsKeyVisible(!isKeyVisible)} className="p-2 text-slate-400 hover:text-white rounded-md bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        {isKeyVisible ? <EyeSlashIcon size={5} /> : <EyeIcon size={5} />}
                    </button>
                </div>
            </div>
        </div>
    );
};