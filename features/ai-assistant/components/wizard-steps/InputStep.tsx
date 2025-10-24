import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from '../../../../shared/ui/icons';

export const InputStep: React.FC<{ onGenerate: (text: string, file: File | null) => void }> = ({ onGenerate }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = () => {
        if (text.trim() || file) {
            onGenerate(text, file);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <h3 className="text-xl font-bold text-sky-400">Wie sieht Ihr Projekt aus?</h3>
            <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-slate-300 mb-2">
                    Beschreiben Sie Ihr Projekt
                </label>
                <textarea
                    id="project-description"
                    rows={8}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="z.B. Erstelle ein Projekt für ein Einfamilienhaus. Im Erdgeschoss gibt es ein großes Wohn/Esszimmer, eine Küche und einen Flur. Das Obergeschoss hat ein Schlafzimmer, ein Bad und ein Kinderzimmer. Das Wohnzimmer soll dimmbare Lichter und Jalousien haben."
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-md p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
            </div>
            <div className="text-center text-slate-400 font-semibold">ODER</div>
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">
                    Laden Sie einen Grundriss hoch (optional)
                </label>
                <div 
                    className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-sky-500 hover:bg-slate-700/50 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                    {preview ? (
                        <img src={preview} alt="Grundriss-Vorschau" className="max-h-32 mx-auto rounded-md" />
                    ) : (
                        <p className="text-slate-400">Klicken oder hierher ziehen, um eine Bilddatei (PNG, JPG) hochzuladen.</p>
                    )}
                </div>
            </div>
             <div className="mt-auto">
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim() && !file}
                    className="w-full flex items-center justify-center gap-3 bg-sky-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <SparklesIcon /> Vorschlag generieren
                </button>
            </div>
        </div>
    );
};
