import React from 'react';
import { AiAnalysisFinding } from '../../../../domain';
import { InfoIcon, WarningIcon, LightbulbIcon, WandIcon } from '../../../../shared/ui/icons';

export const FindingCard: React.FC<{
    finding: AiAnalysisFinding;
    onProposeFix: (finding: AiAnalysisFinding) => void;
    isFixing: boolean;
}> = ({ finding, onProposeFix, isFixing }) => {
    const icons = {
        info: <InfoIcon className="text-blue-400" />,
        warning: <WarningIcon className="text-yellow-400" />,
        suggestion: <LightbulbIcon className="text-green-400" />,
    };
    const severityClasses = {
        info: 'border-blue-700/60 bg-blue-900/20',
        warning: 'border-yellow-700/60 bg-yellow-900/20',
        suggestion: 'border-green-700/60 bg-green-900/20',
    };

    return (
        <div className={`p-3 rounded-lg border ${severityClasses[finding.severity]}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{icons[finding.severity]}</div>
                <div className="flex-grow">
                    <h5 className="font-semibold text-slate-200">{finding.title}</h5>
                    {finding.context && <p className="text-xs text-slate-400 font-mono bg-slate-700/50 inline-block px-1.5 py-0.5 rounded my-1">{finding.context}</p>}
                    <p className="text-sm text-slate-300">{finding.description}</p>
                    {finding.isActionable && (
                        <div className="mt-2 text-right">
                             <button
                                onClick={() => onProposeFix(finding)}
                                disabled={isFixing}
                                className="inline-flex items-center gap-2 text-xs font-semibold bg-sky-600/50 text-sky-300 px-3 py-1.5 rounded-md hover:bg-sky-600 hover:text-white transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                <WandIcon size={4} />
                                Änderung vorschlagen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
