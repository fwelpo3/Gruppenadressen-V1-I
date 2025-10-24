
import React, { useState, useRef } from 'react';
import { useProjectContext } from '../../../../context/ProjectContext';
import { useAiCsvImporter } from '../../../ai-assistant/hooks/useAiCsvImporter';
import { downloadFile } from '../../../../shared/utils/files';
import { ConfirmationModal } from '../../../../shared/ui/ConfirmationModal';
import { Project, AiProjectSuggestion } from '../../../../domain';

export const ProjectDataEditor: React.FC = () => {
    const { project, handleReplaceProject, handleApplyAiSuggestion } = useProjectContext();
    const { isLoading, error, importProjectFromCsv } = useAiCsvImporter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string; onConfirm: () => void; body: React.ReactNode; confirmText: string; } | null>(null);

    const jsonImportRef = useRef<HTMLInputElement>(null);
    const csvImportRef = useRef<HTMLInputElement>(null);

    const handleExportJson = () => {
        try {
            const jsonString = JSON.stringify(project, null, 2);
            const safeProjectName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'knx_projekt';
            downloadFile(jsonString, `${safeProjectName}.json`, 'application/json;charset=utf-8;');
        } catch (err) {
            alert('Fehler beim Exportieren des Projekts.');
            console.error(err);
        }
    };

    const handleJsonFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedProject = JSON.parse(event.target?.result as string) as Project;
                // Basic validation
                if (importedProject && Array.isArray(importedProject.areas) && importedProject.deviceConfig) {
                    setModalContent({
                        title: "Projekt importieren",
                        body: (
                            <p>Möchten Sie das aktuelle Projekt wirklich durch den Inhalt der Datei <strong>{file.name}</strong> ersetzen? Alle nicht gespeicherten Änderungen gehen verloren.</p>
                        ),
                        confirmText: "Projekt ersetzen",
                        onConfirm: () => handleReplaceProject(importedProject)
                    });
                    setIsModalOpen(true);
                } else {
                    throw new Error("Die Datei hat kein gültiges Projektformat.");
                }
            } catch (err: any) {
                alert(`Fehler beim Importieren der Datei: ${err.message}`);
            } finally {
                if (jsonImportRef.current) jsonImportRef.current.value = ""; // Reset file input
            }
        };
        reader.readAsText(file);
    };
    
    const handleCsvFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csvContent = event.target?.result as string;
                const suggestion = await importProjectFromCsv(csvContent);
                if (suggestion) {
                     setModalContent({
                        title: "Struktur aus CSV importieren",
                        body: (
                            <p>Die KI hat eine Projektstruktur aus <strong>{file.name}</strong> extrahiert. Möchten Sie die erkannten Bereiche und Räume zu Ihrem aktuellen Projekt hinzufügen?</p>
                        ),
                        confirmText: "Struktur hinzufügen",
                        onConfirm: () => handleApplyAiSuggestion(suggestion)
                    });
                    setIsModalOpen(true);
                }
            } catch(err) {
                // error is already handled and displayed by the hook
            } finally {
                 if (csvImportRef.current) csvImportRef.current.value = ""; // Reset file input
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-sky-400 mb-2">Projekt Exportieren</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Sichern Sie Ihr gesamtes Projekt als JSON-Datei. Diese Datei enthält alle Bereiche, Räume, Funktionen und Konfigurationen.
                </p>
                <button
                    onClick={handleExportJson}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 transition-colors"
                >
                    Projekt exportieren (JSON)
                </button>
            </div>

            <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-sky-400 mb-2">Projekt Importieren</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Laden Sie ein komplettes Projekt aus einer JSON-Datei. <strong className="text-yellow-400">Achtung:</strong> Dies ersetzt Ihr aktuelles Projekt vollständig.
                </p>
                <input type="file" accept=".json" ref={jsonImportRef} onChange={handleJsonFileSelected} className="hidden" />
                <button
                    onClick={() => jsonImportRef.current?.click()}
                    className="bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500 transition-colors"
                >
                    Projekt importieren (JSON)
                </button>
            </div>
            
            <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-sky-400 mb-2">Intelligenter CSV-Import</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Importieren Sie eine aus ETS exportierte Gruppenadressen-Liste (.csv). Die KI analysiert die Datei und versucht, daraus automatisch eine Projektstruktur zu erstellen und zu Ihrem Projekt hinzuzufügen.
                </p>
                 <input type="file" accept=".csv" ref={csvImportRef} onChange={handleCsvFileSelected} className="hidden" />
                <button
                    onClick={() => csvImportRef.current?.click()}
                    disabled={isLoading}
                    className="bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500 transition-colors disabled:bg-slate-500 disabled:cursor-wait"
                >
                    {isLoading ? 'Analysiere CSV...' : 'GA-Liste importieren (CSV)'}
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {modalContent && (
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={modalContent.onConfirm}
                    title={modalContent.title}
                    confirmText={modalContent.confirmText}
                >
                    {modalContent.body}
                </ConfirmationModal>
            )}
        </div>
    );
};
