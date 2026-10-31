import React, { useMemo } from 'react';
import { parseAnsi } from '../utils/ansi';

interface AnsiOutputProps {
  text: string;
  defaultColor?: string;
  className?: string;
}

export const AnsiOutput: React.FC<AnsiOutputProps> = ({
  text,
  defaultColor,
  className = ''
}) => {
  const spans = useMemo(() => parseAnsi(text, defaultColor), [text, defaultColor]);

  if (!spans || spans.length === 0) {
    return null;
  }

  return (
    <span className={className}>
      {spans.map((span, idx) => {
        const textDecorations: string[] = [];
        if (span.underline) textDecorations.push('underline');
        if (span.strikethrough) textDecorations.push('line-through');

        const style: React.CSSProperties = {
          color: span.fgColor,
          backgroundColor: span.bgColor,
          fontWeight: span.bold ? 700 : undefined,
          opacity: span.dim ? 0.65 : undefined,
          fontStyle: span.italic ? 'italic' : undefined,
          textDecoration: textDecorations.length > 0 ? textDecorations.join(' ') : undefined,
        };

        return (
          <span key={idx} style={style}>
            {span.text}
          </span>
        );
      })}
    </span>
  );
};
