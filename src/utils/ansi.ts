/**
 * Comprehensive ANSI Escape Code Parser & Formatter for Terminal Output
 * Supports 16 standard ANSI colors, high-intensity/bright variants,
 * 256-color palette, 24-bit TrueColor (RGB), and text attributes
 * (bold, dim, italic, underline, strikethrough, inverse).
 */

export interface AnsiSpan {
  text: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fgColor?: string;
  bgColor?: string;
}

// Optimized ANSI palette tailored for dark terminal environments (#0d1117 / slate-950)
const ANSI_FOREGROUND_COLORS: Record<number, string> = {
  30: '#64748b', // Black / Dark Slate (visible on dark)
  31: '#f87171', // Red
  32: '#4ade80', // Green
  33: '#facc15', // Yellow
  34: '#60a5fa', // Blue
  35: '#c084fc', // Magenta / Purple
  36: '#38bdf8', // Cyan
  37: '#e2e8f0', // White
  90: '#94a3b8', // Bright Black / Gray
  91: '#fca5a5', // Bright Red
  92: '#86efac', // Bright Green
  93: '#fde047', // Bright Yellow
  94: '#93c5fd', // Bright Blue
  95: '#d8b4fe', // Bright Magenta
  96: '#67e8f9', // Bright Cyan
  97: '#ffffff', // Bright White
};

const ANSI_BACKGROUND_COLORS: Record<number, string> = {
  40: '#1e293b', // Black background
  41: '#7f1d1d', // Red background
  42: '#14532d', // Green background
  43: '#713f12', // Yellow background
  44: '#1e3a8a', // Blue background
  45: '#581c87', // Magenta background
  46: '#164e63', // Cyan background
  47: '#475569', // White background
  100: '#334155', // Bright Black background
  101: '#991b1b', // Bright Red background
  102: '#166534', // Bright Green background
  103: '#854d0e', // Bright Yellow background
  104: '#1e40af', // Bright Blue background
  105: '#6b21a8', // Bright Magenta background
  106: '#155e75', // Bright Cyan background
  107: '#64748b', // Bright White background
};

/**
 * Resolve a 256-color palette index (0-255) to a CSS color string
 */
export function get256Color(n: number): string {
  if (isNaN(n) || n < 0 || n > 255) return '#ffffff';

  // 0-7: standard colors, 8-15: bright colors
  if (n < 8) {
    return ANSI_FOREGROUND_COLORS[30 + n] || '#e2e8f0';
  }
  if (n < 16) {
    return ANSI_FOREGROUND_COLORS[90 + (n - 8)] || '#ffffff';
  }

  // 16-231: 6x6x6 color cube
  if (n <= 231) {
    const idx = n - 16;
    const rIdx = Math.floor(idx / 36);
    const gIdx = Math.floor((idx % 36) / 6);
    const bIdx = idx % 6;
    const steps = [0, 95, 135, 175, 215, 255];
    return `rgb(${steps[rIdx]}, ${steps[gIdx]}, ${steps[bIdx]})`;
  }

  // 232-255: Grayscale ramp (24 shades)
  const gray = 8 + (n - 232) * 10;
  return `rgb(${gray}, ${gray}, ${gray})`;
}

/**
 * Strip all ANSI escape sequences from a string (useful for clipboard copy & length calculation)
 */
export function stripAnsi(str: string): string {
  if (!str) return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]|\x1b\([a-zA-Z]|\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '');
}

/**
 * Parse a raw string containing ANSI escape sequences into an array of styled text spans
 */
export function parseAnsi(input: string, defaultFgColor?: string): AnsiSpan[] {
  if (!input) return [];

  // Fast-path: if string contains no escape characters at all, return single span
  if (!input.includes('\x1b') && !input.includes('\u001b')) {
    return [{ text: input, fgColor: defaultFgColor }];
  }

  const spans: AnsiSpan[] = [];

  // Current style state
  let bold = false;
  let dim = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;
  let inverse = false;
  let fgColor: string | undefined = undefined;
  let bgColor: string | undefined = undefined;

  // Regex matching ANSI escape sequences:
  // - SGR (Select Graphic Rendition): \x1b[ ... m
  // - Other CSI (Control Sequence Introducer): \x1b[ ... [A-Za-z]
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\x1b\[([0-9;]*)([a-zA-Z])/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ansiRegex.exec(input)) !== null) {
    const textChunk = input.substring(lastIndex, match.index);
    if (textChunk) {
      const resolvedFg = inverse ? (bgColor || '#0d1117') : (fgColor || defaultFgColor);
      const resolvedBg = inverse ? (fgColor || defaultFgColor || '#e2e8f0') : bgColor;

      spans.push({
        text: textChunk,
        bold: bold || undefined,
        dim: dim || undefined,
        italic: italic || undefined,
        underline: underline || undefined,
        strikethrough: strikethrough || undefined,
        fgColor: resolvedFg,
        bgColor: resolvedBg,
      });
    }

    lastIndex = match.index + match[0].length;
    const command = match[2];
    const rawParams = match[1];

    // Only 'm' commands affect graphic rendition (colors, styles)
    if (command === 'm') {
      const codes = rawParams
        ? rawParams.split(';').map(n => parseInt(n, 10)).filter(n => !isNaN(n))
        : [0];

      if (codes.length === 0) codes.push(0);

      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];

        if (code === 0) {
          // Reset all attributes
          bold = false;
          dim = false;
          italic = false;
          underline = false;
          strikethrough = false;
          inverse = false;
          fgColor = undefined;
          bgColor = undefined;
        } else if (code === 1) {
          bold = true;
        } else if (code === 2) {
          dim = true;
        } else if (code === 3) {
          italic = true;
        } else if (code === 4) {
          underline = true;
        } else if (code === 7) {
          inverse = true;
        } else if (code === 9) {
          strikethrough = true;
        } else if (code === 21) {
          bold = false;
        } else if (code === 22) {
          bold = false;
          dim = false;
        } else if (code === 23) {
          italic = false;
        } else if (code === 24) {
          underline = false;
        } else if (code === 27) {
          inverse = false;
        } else if (code === 29) {
          strikethrough = false;
        } else if (code >= 30 && code <= 37) {
          // Standard foreground color
          fgColor = ANSI_FOREGROUND_COLORS[code];
        } else if (code === 38) {
          // Extended foreground: 38;5;N (256-color) or 38;2;R;G;B (TrueColor RGB)
          if (codes[i + 1] === 5 && i + 2 < codes.length) {
            fgColor = get256Color(codes[i + 2]);
            i += 2;
          } else if (codes[i + 1] === 2 && i + 4 < codes.length) {
            const r = codes[i + 2];
            const g = codes[i + 3];
            const b = codes[i + 4];
            fgColor = `rgb(${r}, ${g}, ${b})`;
            i += 4;
          }
        } else if (code === 39) {
          // Default foreground color
          fgColor = undefined;
        } else if (code >= 40 && code <= 47) {
          // Standard background color
          bgColor = ANSI_BACKGROUND_COLORS[code];
        } else if (code === 48) {
          // Extended background: 48;5;N or 48;2;R;G;B
          if (codes[i + 1] === 5 && i + 2 < codes.length) {
            bgColor = get256Color(codes[i + 2]);
            i += 2;
          } else if (codes[i + 1] === 2 && i + 4 < codes.length) {
            const r = codes[i + 2];
            const g = codes[i + 3];
            const b = codes[i + 4];
            bgColor = `rgb(${r}, ${g}, ${b})`;
            i += 4;
          }
        } else if (code === 49) {
          // Default background color
          bgColor = undefined;
        } else if (code >= 90 && code <= 97) {
          // High-intensity bright foreground color
          fgColor = ANSI_FOREGROUND_COLORS[code];
        } else if (code >= 100 && code <= 107) {
          // High-intensity bright background color
          bgColor = ANSI_BACKGROUND_COLORS[code];
        }
      }
    }
  }

  // Any remaining text after the final escape sequence
  if (lastIndex < input.length) {
    const trailingChunk = input.substring(lastIndex);
    const resolvedFg = inverse ? (bgColor || '#0d1117') : (fgColor || defaultFgColor);
    const resolvedBg = inverse ? (fgColor || defaultFgColor || '#e2e8f0') : bgColor;

    spans.push({
      text: trailingChunk,
      bold: bold || undefined,
      dim: dim || undefined,
      italic: italic || undefined,
      underline: underline || undefined,
      strikethrough: strikethrough || undefined,
      fgColor: resolvedFg,
      bgColor: resolvedBg,
    });
  }

  return spans;
}
