
import React from 'react';
import { ChatBubbleIcon, RobotIcon, MicrophoneIcon } from '../../../shared/ui/icons';
import { VoiceStatus } from '../hooks/useAiVoice';

interface ChatButtonProps {
    onClick: () => void;
    isAgentRunning?: boolean;
    voiceStatus: VoiceStatus;
    isChatOpen: boolean;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isAgentRunning, voiceStatus, isChatOpen }) => {
    const isVoiceActive = voiceStatus !== 'idle' && voiceStatus !== 'error';

    const getIcon = () => {
        if (isVoiceActive && !isChatOpen) {
             return (
                <div className="relative">
                    <MicrophoneIcon size={8} className={voiceStatus === 'listening' ? 'text-red-400' : 'text-sky-300'} />
                    {voiceStatus === 'listening' && (
                         <span className="absolute inset-0 h-full w-full rounded-full bg-red-400/50 animate-ping"></span>
                    )}
                </div>
            );
        }
        if (isAgentRunning) {
            return (
                <div className="relative">
                    <RobotIcon size={8} className="animate-spin" style={{ animationDuration: '2s' }} />
                    <span className="absolute inset-0 h-full w-full rounded-full bg-sky-400/50 animate-ping"></span>
                </div>
            );
        }
        return <ChatBubbleIcon size={8} />;
    };

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-sky-600 text-white rounded-full p-4 shadow-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-transform hover:scale-110 z-30"
            aria-label="KI-Projekt-Chat öffnen/schließen"
            title="KI-Projekt-Chat öffnen (Ctrl + E)"
        >
            {getIcon()}
        </button>
    );
};