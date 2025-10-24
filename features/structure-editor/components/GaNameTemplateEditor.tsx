
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { generateGaName } from '../../../domain';
import { useProjectContext } from '../../../context/ProjectContext';
import { CloseIcon, WandIcon, TextareaIcon, ChipsIcon } from '../../../shared/ui/icons';

type TemplatePart = { id: string; type: 'placeholder' | 'custom'; value: string; };
type EditorMode = 'chips' | 'textarea';

const stringToParts = (template: string): TemplatePart[] => {
    if (!template) return [];
    // Regex, die Platzhalter {key} oder {key:padding} als Trennzeichen verwendet und sie im Ergebnis behält.
    const regex = /(\{[\w.:]+\})/;
    return template.split(regex).filter(Boolean).map(part => {
        const isPlaceholder = regex.test(part);
        return {
            id: `part-${Math.random()}`,
            type: isPlaceholder ? 'placeholder' : 'custom',
            value: isPlaceholder ? part.slice(1, -1) : part,
        };
    });
};

const partsToString = (parts: TemplatePart[]): string => {
    return parts.map(part => {
        if (part.type === 'placeholder') {
            return `{${part.value}}`;
        }
        return part.value;
    }).join('');
};

const placeholders = [
    { key: 'area.name', desc: 'Name des Bereichs (z.B. Erdgeschoss)' },
    { key: 'area.abbr', desc: 'Kürzel des Bereichs (z.B. EG)' },
    { key: 'room.name', desc: 'Name des Raumes (z.B. Wohnzimmer)' },
    { key: 'room.index', desc: 'Nummer des Raumes im Bereich (z.B. 1)' },
    { key: 'room.index:2', desc: 'Nummer des Raumes, 2-stellig (z.B. 01)' },
    { key: 'device.label', desc: 'Label des Geräts (z.B. L/LD)' },
    { key: 'device.desc', desc: 'Beschreibung des Geräts (z.B. Licht)' },
    { key: 'instance.index', desc: 'Nummer der Funktion im Raum (z.B. 1)' },
    { key: 'instance.index:2', desc: 'Nummer der Funktion, 2-stellig (z.B. 01)' },
    { key: 'function.name', desc: 'Name der Unterfunktion (z.B. Schalten)' },
];

export const GaNameTemplateEditor: React.FC<{ isSettingsPanel?: boolean }> = ({ isSettingsPanel = false }) => {
    const { project, setProject } = useProjectContext();
    const templateString = project.viewOptions.gaNameTemplate;
    const editorId = `ga-name-template-editor-${isSettingsPanel ? 'settings' : 'main'}`;
    
    const [parts, setParts] = useState(() => stringToParts(templateString));
    const [editorMode, setEditorMode] = useState<EditorMode>('chips');
    const lastPropString = useRef(templateString);

    // This effect handles updates coming FROM the parent/context (e.g., undo/redo, project load, textarea edit).
    useEffect(() => {
        if (templateString !== lastPropString.current) {
            setParts(stringToParts(templateString));
            lastPropString.current = templateString;
        }
    }, [templateString]);

    const updateTemplateFromParts = (newParts: TemplatePart[]) => {
        setParts(newParts);
        const newTemplateString = partsToString(newParts);
        lastPropString.current = newTemplateString;
        setProject(p => ({
            ...p, viewOptions: { ...p.viewOptions, gaNameTemplate: newTemplateString }
        }));
    };

    const updateTemplateFromString = (newTemplateString: string) => {
        lastPropString.current = newTemplateString;
         setProject(p => ({
            ...p, viewOptions: { ...p.viewOptions, gaNameTemplate: newTemplateString }
        }));
    };
    
    // Drag & Drop State
    const [draggedPartIndex, setDraggedPartIndex] = useState<number | null>(null);
    const [draggedPlaceholder, setDraggedPlaceholder] = useState<string | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const handleDragStartPart = (e: React.DragEvent, index: number) => {
        setDraggedPartIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragStartPlaceholder = (e: React.DragEvent, key: string) => {
        setDraggedPlaceholder(key);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (editorMode !== 'chips' || !editorRef.current) return;
    
        const rect = editorRef.current.getBoundingClientRect();
        const children = Array.from(editorRef.current.children).filter(c => c.id.startsWith('part-'));
        
        let newDropIndex = children.length;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            const childRect = child.getBoundingClientRect();
            const midpoint = childRect.left - rect.left + child.offsetWidth / 2;
            if (e.clientX - rect.left < midpoint) {
                newDropIndex = i;
                break;
            }
        }
    
        if (draggedPartIndex !== null) {
            if (newDropIndex === draggedPartIndex || newDropIndex === draggedPartIndex + 1) {
                 setDropIndex(null);
                 return;
            }
            if (newDropIndex > draggedPartIndex) {
                newDropIndex--;
            }
        }
        
        setDropIndex(newDropIndex);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (dropIndex === null) return;

        let newParts = [...parts];

        if (draggedPartIndex !== null) { // Re-ordering existing part
            const [movedPart] = newParts.splice(draggedPartIndex, 1);
            newParts.splice(dropIndex, 0, movedPart);
        } else if (draggedPlaceholder !== null) { // Adding new placeholder
            const newPart: TemplatePart = {
                id: `part-${Math.random()}`,
                type: 'placeholder',
                value: draggedPlaceholder,
            };
            newParts.splice(dropIndex, 0, newPart);
        }
        
        updateTemplateFromParts(newParts);
        handleDragEnd();
    };

    const handleDragEnd = () => {
        setDraggedPartIndex(null);
        setDraggedPlaceholder(null);
        setDropIndex(null);
    };

    const handleAddCustomPart = () => {
        const newPart: TemplatePart = { id: `part-${Math.random()}`, type: 'custom', value: ' ' };
        updateTemplateFromParts([...parts, newPart]);
    };
    
    const handleRemovePart = (index: number) => {
        updateTemplateFromParts(parts.filter((_, i) => i !== index));
    };

    const handlePartValueChange = (index: number, newValue: string) => {
        const newParts = [...parts];
        const partToUpdate = { ...newParts[index] };

        const placeholderMatch = newValue.trim().match(/^\{([\w.:]+)\}$/);
        if (placeholderMatch && placeholders.some(p => p.key === placeholderMatch[1])) {
            partToUpdate.type = 'placeholder';
            partToUpdate.value = placeholderMatch[1];
        } else {
            partToUpdate.type = 'custom';
            partToUpdate.value = newValue;
        }
        
        newParts[index] = partToUpdate;
        updateTemplateFromParts(newParts);
    };
    
    const handleSwitchPartType = (index: number) => {
        const newParts = [...parts];
        const part = { ...newParts[index] };
        part.type = part.type === 'placeholder' ? 'custom' : 'placeholder';
        part.value = part.type === 'placeholder' ? 'area.name' : (part.value.includes('{') ? ' ' : `{${part.value}}`);
        newParts[index] = part;
        updateTemplateFromParts(newParts);
    };

    const previewName = useMemo(() => {
        const previewData = {
            area: { name: 'Erdgeschoss', abbreviation: 'EG', mainGroup: 1, id: 'a1', rooms: [] },
            room: { name: 'Wohnzimmer', id: 'r1', functionInstances: [] },
            roomIndex: 0,
            instance: {
                id: 'i1', type: 'light',
                configSnapshot: project.deviceConfig['light'] || { label: 'L', description: 'Licht', middleGroup: 0, functions: [] }
            },
            instanceIndex: 0,
            functionName: 'Schalten'
        };
        try {
            return generateGaName(templateString, previewData as any);
        } catch (e) { return "Fehler in der Vorlage"; }
    }, [templateString, project.deviceConfig]);

    const containerClasses = isSettingsPanel ? "space-y-4" : "space-y-4 p-4";

    return (
        <div className={containerClasses} id={editorId}>
            <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-slate-200">Benennung der Gruppenadressen</h3>
                 <button 
                    onClick={() => setEditorMode(prev => prev === 'chips' ? 'textarea' : 'chips')}
                    className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-sky-400 rounded-md"
                    title={editorMode === 'chips' ? 'Text-Ansicht' : 'Baustein-Ansicht'}
                 >
                    {editorMode === 'chips' ? <TextareaIcon /> : <ChipsIcon />}
                 </button>
            </div>
            <p className="text-sm text-slate-400 -mt-2">
                Bauen Sie Ihre Vorlage, indem Sie Platzhalter und Textbausteine per Drag & Drop anordnen.
            </p>
            
            {editorMode === 'chips' ? (
                <div
                    ref={editorRef}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragLeave={() => setDropIndex(null)}
                    className="flex flex-wrap items-center gap-1 p-2 bg-slate-900/50 border border-slate-600 rounded-md min-h-[4rem] w-full"
                >
                    {parts.map((part, index) => (
                        <React.Fragment key={part.id}>
                            {dropIndex === index && <div className="template-builder-drop-indicator" />}
                            <div
                                id={`part-${part.id}`}
                                draggable
                                onDragStart={(e) => handleDragStartPart(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`template-part-chip relative group flex items-center rounded transition-all duration-150 ${draggedPartIndex === index ? 'dragging' : ''}`}
                            >
                                {part.type === 'placeholder' ? (
                                    <span className="bg-slate-700 text-sky-300 px-2 py-1.5 rounded font-mono text-sm cursor-grab">
                                        {`{${part.value}}`}
                                    </span>
                                ) : (
                                    <input
                                        type="text"
                                        value={part.value}
                                        onChange={(e) => handlePartValueChange(index, e.target.value)}
                                        style={{ width: `${Math.max(4, part.value.length + 2)}ch` }}
                                        className="bg-slate-800 border border-slate-600 focus:border-sky-500 rounded px-2 py-1.5 text-center text-sm focus:outline-none"
                                    />
                                )}
                                <div className="absolute -top-3 -right-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-600 rounded-full shadow-lg">
                                    <button onClick={() => handleSwitchPartType(index)} className="p-1 text-slate-300 hover:text-sky-400" title="Typ wechseln"><WandIcon size={3} /></button>
                                    <button onClick={() => handleRemovePart(index)} className="p-1 text-slate-300 hover:text-red-400" title="Entfernen"><CloseIcon size={3}/></button>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                    {dropIndex === parts.length && <div className="template-builder-drop-indicator" />}
                </div>
            ) : (
                 <textarea
                    value={templateString}
                    onChange={(e) => updateTemplateFromString(e.target.value)}
                    className="w-full ga-template-textarea"
                    rows={3}
                    placeholder="Geben Sie hier Ihre Namensvorlage ein, z.B. {area.abbr} {room.name} - {function.name}"
                />
            )}


            <div>
                 <p className="text-xs text-slate-400">Vorschau:</p>
                <p className="mt-1 p-2 bg-slate-900/50 rounded text-sm text-sky-300 font-mono min-h-[2.5rem] flex items-center">
                    {previewName}
                </p>
            </div>

            <div>
                 <p className="text-xs text-slate-400 mb-2">Verfügbare Bausteine:</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleAddCustomPart}
                        disabled={editorMode !== 'chips'}
                        className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + Textfeld
                    </button>
                    <div className="border-l border-slate-600 mx-2"></div>
                    {placeholders.map(p =>
                        <kbd
                            key={p.key}
                            title={p.desc}
                            draggable={editorMode === 'chips'}
                            onDragStart={(e) => handleDragStartPlaceholder(e, p.key)}
                            onDragEnd={handleDragEnd}
                            className={`transition-opacity ${draggedPlaceholder === p.key ? 'opacity-40' : ''} ${editorMode === 'chips' ? 'cursor-grab' : 'cursor-not-allowed'}`}
                        >
                            {`{${p.key}}`}
                        </kbd>
                    )}
                </div>
            </div>
        </div>
    );
};