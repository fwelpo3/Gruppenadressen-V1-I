import React from 'react';
import { MicrophoneIcon, MicrophoneOffIcon, RobotIcon } from '../../../shared/ui/icons';
import { VoiceStatus } from '../hooks/useAiVoice';

interface VoiceButtonProps {
  status: VoiceStatus;
  onClick: () => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ status, onClick }) => {
  const getButtonContent = () => {
    switch (status) {
      case 'listening':
        return (
          <>
            <MicrophoneIcon className="text-red-400" />
            <span className="absolute inset-0 h-full w-full rounded-full bg-red-400/50 animate-ping"></span>
          </>
        );
      case 'speaking':
        return <RobotIcon className="text-sky-400 animate-pulse" />;
      case 'connecting':
         return <div className="w-5 h-5 border-2 border-slate-400 border-t-sky-400 rounded-full animate-spin"></div>;
      case 'error':
        return <MicrophoneOffIcon className="text-yellow-400" />;
      case 'idle':
      default:
        return <MicrophoneIcon className="text-slate-300" />;
    }
  };

  const getTitle = () => {
     switch (status) {
      case 'listening':
        return "Zuhören... (Klicken zum Beenden)";
      case 'speaking':
        return "KI spricht... (Klicken zum Beenden)";
       case 'connecting':
         return "Verbinden...";
      case 'error':
        return "Fehler bei der Verbindung (Klicken zum Wiederholen)";
      case 'idle':
      default:
        return "Sprach-Chat starten";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
      title={getTitle()}
      aria-label={getTitle()}
    >
      {getButtonContent()}
    </button>
  );
};
