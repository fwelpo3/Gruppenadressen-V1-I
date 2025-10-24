import React from 'react';
import { useProjectContext } from '../context/ProjectContext';

export const PreviewPanel: React.FC = () => {
    const { exportRows } = useProjectContext();
    
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg flex flex-col flex-grow min-h-0">
            <h2 className="text-lg font-semibold text-slate-200 p-4 border-b border-slate-700">
                Vorschau der Gruppenadressen
            </h2>
            <div className="flex-grow overflow-y-auto overscroll-contain custom-scrollbar">
                <table className="w-full text-sm text-left font-mono">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-3 py-2">Adresse</th>
                            <th scope="col" className="px-3 py-2">Name</th>
                            <th scope="col" className="px-3 py-2">DPT</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        {exportRows.length > 0 ? (
                            exportRows.map((row, index) => {
                                const address = `${row.mainGroup}${(row.middleGroup ?? '') !== '' ? '/'+row.middleGroup : ''}${(row.sub ?? '') !== '' ? '/'+row.sub : ''}`;
                                
                                if (row.level === 'main') {
                                    return (
                                        <tr key={index} className="bg-slate-700 font-bold">
                                            <td className="px-3 py-2 text-sky-300">{row.mainGroup}</td>
                                            <td colSpan={2} className="px-3 py-2 text-sky-300">{row.name}</td>
                                        </tr>
                                    );
                                }
                                if (row.level === 'middle') {
                                     return (
                                        <tr key={index} className="bg-slate-700/60">
                                            <td className="px-3 py-1.5 pl-6 text-slate-400">{address}</td>
                                            <td colSpan={2} className="px-3 py-1.5 text-sky-400">{row.name}</td>
                                        </tr>
                                    );
                                }
                                // GA row
                                return (
                                    <tr key={address + '-' + index} className="border-b border-slate-700/50 hover:bg-slate-800/40">
                                        <td className="px-3 py-1.5 pl-12 text-slate-400 whitespace-nowrap">{address}</td>
                                        <td className={`px-3 py-1.5 whitespace-nowrap ${row.name.startsWith('---') ? 'text-slate-500' : ''}`}>{row.name}</td>
                                        <td className="px-3 py-1.5 text-amber-400 whitespace-nowrap">{row.dpt}</td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-slate-400 font-sans">
                                    Keine Gruppenadressen zum Anzeigen.
                                    <br />
                                    <span className="text-xs">Beginnen Sie mit der Erstellung Ihrer Projektstruktur.</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
