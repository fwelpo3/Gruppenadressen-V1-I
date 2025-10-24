
import React from 'react';
import { ChatBubbleIcon, RobotIcon } from '../../../shared/ui/icons';

interface ChatButtonProps {
    onClick: () => void;
    isAgentRunning?: boolean;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isAgentRunning }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-sky-600 text-white rounded-full p-4 shadow-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-transform hover:scale-110 z-30"
            aria-label="KI-Projekt-Chat öffnen"
            title="KI-Projekt-Chat öffnen (Ctrl + E)"
        >
            {isAgentRunning ? (
                <div className="relative">
                    <RobotIcon size={8} className="animate-spin" style={{ animationDuration: '2s' }} />
                    <span className="absolute inset-0 h-full w-full rounded-full bg-sky-400/50 animate-ping"></span>
                </div>
            ) : (
                <ChatBubbleIcon size={8} />
            )}
        </button>
    );
};
