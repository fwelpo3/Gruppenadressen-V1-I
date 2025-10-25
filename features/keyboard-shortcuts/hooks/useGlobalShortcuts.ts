import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useProjectContext } from '../../../context/ProjectContext';
import { useToast } from '../../../context/ToastContext';

interface UseGlobalShortcutsProps {
    setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSettingsTab: React.Dispatch<React.SetStateAction<any>>;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isChatOpen: boolean;
}

export const useGlobalShortcuts = ({
    setIsSettingsOpen,
    setSettingsTab,
    setIsChatOpen,
    isChatOpen,
}: UseGlobalShortcutsProps) => {
    const {
        project,
        setProject,
        handleDownloadCsv,
        handleResetProject,
        handleAddArea,
        selectedRoomIds,
        setSelectedRoomIds,
        handleUndo,
        handleRedo,
    } = useProjectContext();

    const { showToast } = useToast();
    const [isCtrlMPressed, setIsCtrlMPressed] = useState(false);
    const ctrlMTimeoutRef = useRef<number | null>(null);

    const allRoomIds = useMemo(() => project.areas.flatMap(a => a.rooms.map(r => r.id)), [project.areas]);

    useEffect(() => {
        const isInputFocused = (target: HTMLElement) => {
            return target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.closest('[role="dialog"]');
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isChatOpen) { e.preventDefault(); setIsChatOpen(false); }
                else if (selectedRoomIds.length > 0) {
                    e.preventDefault();
                    setSelectedRoomIds([]);
                    showToast("Auswahl aufgehoben.");
                }
            }

            const modifier = e.ctrlKey || e.metaKey;

            if (isCtrlMPressed) {
                e.preventDefault(); 
                switch (e.key.toLowerCase()) {
                    case 'm':
                        setProject(p => ({ ...p, areas: p.areas.map(area => ({ ...area, isExpanded: true, rooms: area.rooms.map(room => ({ ...room, isExpanded: true })) })) }));
                        showToast("Alle Bereiche und Räume ausgeklappt.");
                        break;
                    case 'l':
                        setProject(p => ({ ...p, areas: p.areas.map(area => ({ ...area, isExpanded: false, rooms: area.rooms.map(room => ({ ...room, isExpanded: false })) })) }));
                        showToast("Alle Bereiche und Räume eingeklappt.");
                        break;
                    case 'o':
                         setProject(p => ({ ...p, areas: p.areas.map(area => ({ ...area, isExpanded: true, rooms: area.rooms.map(room => ({ ...room, isExpanded: false })) })) }));
                        showToast("Alle Räume eingeklappt.");
                        break;
                    default: break;
                }
                if (ctrlMTimeoutRef.current) {
                    clearTimeout(ctrlMTimeoutRef.current);
                    ctrlMTimeoutRef.current = null;
                }
                setIsCtrlMPressed(false);
                return;
            }

            if (e.key === '?' && !modifier && !e.shiftKey && !e.altKey) {
                if(isInputFocused(e.target as HTMLElement)) return;
                e.preventDefault();
                setSettingsTab('shortcuts');
                setIsSettingsOpen(true);
            }

            if (!modifier) return;

            switch (e.key.toLowerCase()) {
                 case 'z':
                    if (!isInputFocused(e.target as HTMLElement)) {
                        e.preventDefault();
                        handleUndo();
                    }
                    break;
                case 'y':
                    if (!isInputFocused(e.target as HTMLElement)) {
                        e.preventDefault();
                        handleRedo();
                    }
                    break;
                case 'a':
                    if (!isInputFocused(e.target as HTMLElement)) {
                        e.preventDefault();
                        if (selectedRoomIds.length > 0 && selectedRoomIds.length === allRoomIds.length) {
                            setSelectedRoomIds([]);
                            showToast("Auswahl aufgehoben.");
                        } else {
                            setSelectedRoomIds(allRoomIds);
                            showToast(`${allRoomIds.length} Räume ausgewählt.`);
                        }
                    }
                    break;
                case 'e':
                    if (!isInputFocused(e.target as HTMLElement)) {
                      e.preventDefault();
                      setIsChatOpen(p => !p);
                    }
                    break;
                case 'g': e.preventDefault(); if (project.areas.length > 0) handleDownloadCsv(); break;
                case 's': e.preventDefault(); if (e.altKey) { setIsSettingsOpen(p => !p); } else { showToast("Projekt automatisch gespeichert!"); } break;
                case 'r': if (e.shiftKey) { e.preventDefault(); handleResetProject(); } break;
                case 'b': e.preventDefault(); handleAddArea(); break;
                case 'k': e.preventDefault(); setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, compactMode: !p.viewOptions.compactMode } })); break;
                case 'm':
                    if(isInputFocused(e.target as HTMLElement)) return;
                    if (!e.altKey && !e.shiftKey) {
                        e.preventDefault();
                        setIsCtrlMPressed(true);
                        showToast("Struktur-Falten: Drücke M (auf), L (zu) oder O (Räume zu)");
                        if (ctrlMTimeoutRef.current) clearTimeout(ctrlMTimeoutRef.current);
                        ctrlMTimeoutRef.current = window.setTimeout(() => setIsCtrlMPressed(false), 3000);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        project, setProject, handleDownloadCsv, handleResetProject, handleAddArea, 
        setIsSettingsOpen, showToast, isCtrlMPressed, allRoomIds, selectedRoomIds, 
        setSelectedRoomIds, isChatOpen, handleUndo, handleRedo, setSettingsTab, setIsChatOpen
    ]);
};
