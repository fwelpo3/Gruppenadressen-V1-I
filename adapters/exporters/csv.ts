import { ExportRow } from '../../domain';

const formatDpt = (dpt: string): string => {
    if (!dpt) return '';
    const parts = dpt.split('.');
    if (parts.length < 2) return dpt;
    // ETS erwartet DPST-x-y statt DPT x.yyy
    return `DPST-${parts[0]}-${parts[1]}`;
}


export const generateCsv = (rows: ExportRow[]): string => {
    if (rows.length === 0) return '';
    
    const header = ['Main', 'Middle', 'Sub', 'Main', 'Middle', 'Sub', 'Central', 'Unfiltered', 'Description', 'DatapointType', 'Security'].map(v => `"${v}"`).join(';');
    
    const csvRows = rows.map(row => {
        const line = {
            mainName: '', middleName: '', subName: '',
            mainNum: '', middleNum: '', subNum: '',
            central: '', unfiltered: '', description: '',
            dpt: '', security: 'Auto'
        };

        if (row.level === 'main') {
            line.mainName = row.name;
            line.mainNum = String(row.mainGroup);
        } else if (row.level === 'middle') {
            line.middleName = row.name;
            line.mainNum = String(row.mainGroup);
            line.middleNum = String(row.middleGroup);
        } else if (row.level === 'ga') {
            line.mainNum = String(row.mainGroup);
            line.middleNum = String(row.middleGroup ?? '');
            line.subNum = String(row.sub ?? '');
            
            // Für alle 'ga'-Level-Zeilen geht der Name in die 'Sub'-Spalte (C)
            line.subName = row.name;

            // Die 'Description'-Spalte (I) wird vorerst leer gelassen
            line.description = '';

            // DPT nur für tatsächliche Gruppenadressen formatieren, nicht für Trennzeichen
            if (!row.name.startsWith('---') && row.name !== '-') {
                line.dpt = formatDpt(row.dpt || '');
            }
        }
        
        const values = [line.mainName, line.middleName, line.subName, line.mainNum, line.middleNum, line.subNum, line.central, line.unfiltered, line.description, line.dpt, line.security];
        return values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';');
    }).join('\n');
    
    // Fügt eine UTF-8-BOM hinzu, um sicherzustellen, dass Excel die Datei mit der richtigen Kodierung für Sonderzeichen öffnet.
    return '\uFEFF' + header + '\n' + csvRows;
};