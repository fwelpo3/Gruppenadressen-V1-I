
import React from 'react';
import { SparklesIcon, BrainCircuitIcon, WandIcon, CheckCircleIcon, RobotIcon } from '../../../shared/ui/icons';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    isLoading?: boolean;
}

interface ChatMessageProps {
    message: Message;
}

// Helper function to parse and render structured agent messages
const renderFormattedAgentMessage = (text: string) => {
    const sections: React.ReactNode[] = [];
    const regex = /\*\*(Gedanke|Aktion|Ergebnis|Agent gestartet mit Ziel):\*\*\s*([\s\S]*?)(?=\*\*|$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add any text before the current match
        if (match.index > lastIndex) {
            sections.push(<p key={`text-${lastIndex}`} className="whitespace-pre-wrap">{text.substring(lastIndex, match.index)}</p>);
        }

        const key = match[1].trim();
        const value = match[2].trim();
        lastIndex = match.index + match[0].length;

        switch (key) {
            case 'Agent gestartet mit Ziel':
                sections.push(
                    <div key={key} className="p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 font-semibold text-sky-300">
                            <RobotIcon size={5} />
                            <span>Agent Gestartet</span>
                        </div>
                        <p className="mt-1 pl-7 text-xs text-slate-300 whitespace-pre-wrap">{value}</p>
                    </div>
                );
                break;
            case 'Gedanke':
                sections.push(
                     <details key={key} className="p-2 bg-slate-800/50 rounded-lg cursor-pointer">
                        <summary className="flex items-center gap-2 font-semibold text-sky-300 list-none -m-2 p-2">
                             <BrainCircuitIcon size={5} />
                            <span>Gedanke</span>
                        </summary>
                        <p className="mt-2 pl-7 text-xs text-slate-400 italic whitespace-pre-wrap">{value}</p>
                    </details>
                );
                break;
            case 'Aktion':
                 sections.push(
                    <div key={key} className="p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 font-semibold text-sky-300">
                            <WandIcon size={5} />
                            <span>Aktion</span>
                        </div>
                        <p className="mt-1 pl-7 text-sm text-slate-200 font-mono bg-black/30 p-2 rounded-md whitespace-pre-wrap">{value}</p>
                    </div>
                );
                break;
            case 'Ergebnis':
                sections.push(
                    <div key={key} className="p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 font-semibold text-green-400">
                           <CheckCircleIcon size={5} />
                           <span>Ergebnis</span>
                        </div>
                        <p className="mt-1 pl-7 text-sm text-slate-300 whitespace-pre-wrap">{value}</p>
                    </div>
                );
                break;
            default:
                sections.push(<p key={key}>{`${key}: ${value}`}</p>);
        }
    }
    
    // Add any remaining text after the last match
    if (lastIndex < text.length) {
        sections.push(<p key={`text-${lastIndex}`} className="whitespace-pre-wrap">{text.substring(lastIndex)}</p>);
    }

    // If any sections were found, wrap them. Otherwise, return plain text.
    return sections.length > 0 ? <div className="space-y-2">{sections}</div> : <p className="whitespace-pre-wrap">{text}</p>;
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.sender === 'user';

    const isAgentMessage = !isUser && /\*\*(Gedanke|Aktion|Ergebnis|Agent gestartet mit Ziel):\*\*/.test(message.text);

    return (
        <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-sky-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                    <SparklesIcon size={5} className="text-sky-300" />
                </div>
            )}
            <div
                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl text-white ${
                    isUser ? 'bg-sky-700 rounded-br-none' : 'bg-slate-700 rounded-bl-none'
                }`}
            >
                {message.isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                ) : (
                    <div className="text-sm">
                        {isAgentMessage ? renderFormattedAgentMessage(message.text) : <p className="whitespace-pre-wrap">{message.text}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};
