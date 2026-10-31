import React from 'react';

interface CodeSelfLogoProps {
  className?: string;
  size?: number;
}

export const CodeSelfLogo: React.FC<CodeSelfLogoProps> = ({
  className = 'w-9 h-9',
  size
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="CodeSelf Logo"
    >
      <defs>
        {/* Deep rich cobalt-to-indigo gradient */}
        <linearGradient id="cs-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Vibrant cyan accent for terminal prompt */}
        <linearGradient id="cs-prompt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>

        {/* Subtle glow filter for the cursor node */}
        <filter id="cs-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Modern squircle badge container */}
      <rect width="40" height="40" rx="10" fill="url(#cs-bg-grad)" />

      {/* Subtle top inner border highlight */}
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="9.25"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />

      {/* Code bracket 'C' curve - represents Code, Compiler, and CodeSelf */}
      <path
        d="M 26 12.5 C 23.5 11 15 11 13 16 C 11.5 19.5 11.5 20.5 13 24 C 15 29 23.5 29 26 27.5"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="round"
        fill="none"
      />

      {/* Interactive terminal prompt chevron > */}
      <path
        d="M 17.5 16.5 L 22 20 L 17.5 23.5"
        stroke="url(#cs-prompt-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Active terminal prompt cursor _ */}
      <line
        x1="24"
        y1="23.5"
        x2="28"
        y2="23.5"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#cs-glow)"
      />
    </svg>
  );
};
