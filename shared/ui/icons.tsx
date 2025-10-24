

import React from 'react';

// FIX: Add `style` property to allow inline styling of icons.
interface IconProps {
    className?: string;
    size?: number; // Tailwind size unit, e.g., 4, 5, 6
    style?: React.CSSProperties;
}

// FIX: Accept and pass down the `style` prop to the SVG element.
const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({ children, className, size = 5, style }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${className || ''} h-${size} w-${size}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
        style={style}>
        {children}
    </svg>
);

export const AddIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </Icon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Icon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </Icon>
);

export const GenerateIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </Icon>
);

export const ResetIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.12-4.97" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 15a9 9 0 01-14.12 4.97" />
    </Icon>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
);

export const WarningIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </Icon>
);

export const LightbulbIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </Icon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </Icon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </Icon>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </Icon>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </Icon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${props.className || ''} h-${props.size || 5} w-${props.size || 5}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

export const WandIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${props.className || ''} h-${props.size || 5} w-${props.size || 5}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 15l-2.25-2.25 5.09-5.091a2.25 2.25 0 011.591-.659zM9.75 3.104l4.94 4.94a2.25 2.25 0 01-1.591 3.851L9.75 10.5M9.75 3.104l-4.94 4.94a2.25 2.25 0 001.591 3.851l4.286-1.714M17.25 10.5l-4.94-4.94a2.25 2.25 0 00-3.851 1.591l1.714 4.286m5.077 5.077a2.25 2.25 0 003.851-1.591l-1.714-4.286m-5.077 5.077l-4.94 4.94a2.25 2.25 0 003.851-1.591L12 17.25m5.077 5.077l4.94 4.94a2.25 2.25 0 00-1.591-3.851L17.25 18M9.75 21a2.25 2.25 0 002.25-2.25v-5.714a2.25 2.25 0 00-1.591-.659L5.25 15l-2.25 2.25 5.091 5.09a2.25 2.25 0 001.659.66z" />
    </svg>
);


export const EyeIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
    </Icon>
);

export const EyeSlashIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19 12 19c.996 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 2.662 10.065 6.838a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
    </Icon>
);

export const ChatBubbleIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </Icon>
);

export const PaperclipIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </Icon>
);

export const RobotIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.785A11.95 11.95 0 0112 3c2.348 0 4.543.863 6.215 2.285M18 8.25a11.953 11.953 0 01-6 12.75c-2.348 0-4.543-.863-6.215-2.285M18 8.25A11.953 11.953 0 0012 3C9.652 3 7.457 3.863 5.785 5.285M6 15.75A11.953 11.953 0 0112 21c2.348 0 4.543-.863 6.215-2.285m-1.42 0a3 3 0 01-4.242 0M6.343 15.75a3 3 0 00-4.243 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.364 6.636a.75.75 0 011.06 0l.071.071a.75.75 0 010 1.06l-.07.07a.75.75 0 01-1.062 0l-.071-.07a.75.75 0 010-1.062l.07-.07zM8.636 17.364a.75.75 0 01-1.06 0l-.071-.071a.75.75 0 010-1.06l.07-.07a.75.75 0 011.062 0l.071.07a.75.75 0 010 1.062l-.07.07z" />
    </Icon>
);

export const StopIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </Icon>
);

export const BrainCircuitIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${props.className || ''} h-${props.size || 5} w-${props.size || 5}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75v-.01c0-.414.336-.75.75-.75Zm0-13.5a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75V6c0-.414.336-.75.75-.75ZM7.5 12a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75v-.01c0-.414.336-.75.75-.75Zm9 0a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75v-.01c0-.414.336-.75.75-.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.08 19.5v-2.125a3.375 3.375 0 0 0-3.375-3.375h-1.5A3.375 3.375 0 0 0 6.83 17.375v2.125m10.158-9.333-2.125 2.125a3.375 3.375 0 0 1-4.773 0l-2.125-2.125m8.908-1.5a3.375 3.375 0 0 0-4.773 0l-2.125 2.125m6.898 6.898a3.375 3.375 0 0 1 0-4.773l2.125-2.125m-1.414-1.414-2.125 2.125a3.375 3.375 0 0 0 0 4.773l2.125 2.125" />
    </svg>
);


export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
);

export const TextareaIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </Icon>
);

export const ChipsIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h4V4H4v4zm6 0h4V4h-4v4zm6 0h4V4h-4v4zM4 14h4v-4H4v4zm6 0h4v-4h-4v4zm6 0h4v-4h-4v4zM4 20h4v-4H4v4zm6 0h4v-4h-4v4zm6 0h4v-4h-4v4z" />
    </Icon>
);