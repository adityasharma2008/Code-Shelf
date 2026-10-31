/**
 * Custom High-Readability Monaco Editor Syntax Highlighting Themes
 * Engineered specifically for multi-language clarity (C++, Python, SQL, JS, TS, Java, C#, PHP, HTML/CSS)
 */

export interface EditorThemeOption {
  id: string;
  name: string;
  type: 'light' | 'dark';
  badgeColor: string;
}

export const EDITOR_THEMES: EditorThemeOption[] = [
  { id: 'codeself-light', name: 'CodeSelf Pro Light', type: 'light', badgeColor: '#2563eb' },
  { id: 'codeself-dark', name: 'CodeSelf Pro Dark', type: 'dark', badgeColor: '#38bdf8' },
  { id: 'github-light', name: 'GitHub Classic', type: 'light', badgeColor: '#0969da' },
  { id: 'one-dark', name: 'One Dark Pro', type: 'dark', badgeColor: '#61afef' }
];

export const DEFAULT_LIGHT_THEME = 'codeself-light';
export const DEFAULT_DARK_THEME = 'codeself-dark';

/**
 * Register custom high-contrast, beautiful syntax highlighting themes with Monaco
 */
export function registerMonacoThemes(monaco: any) {
  if (!monaco || !monaco.editor) return;

  // 1. CodeSelf Pro Light - High readability, vibrant tokens, crisp contrast
  try {
    monaco.editor.defineTheme('codeself-light', {
      base: 'vs',
      inherit: true,
      rules: [
        // Comments
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'comment.line', foreground: '64748b', fontStyle: 'italic' },
        { token: 'comment.block', foreground: '64748b', fontStyle: 'italic' },
        { token: 'comment.doc', foreground: '475569', fontStyle: 'italic' },

        // Keywords & Control flow
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'c026d3', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: '475569' },
        { token: 'keyword.sql', foreground: '4f46e5', fontStyle: 'bold' },

        // Types, Classes & Interfaces
        { token: 'type', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'type.identifier', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'storage.type', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'class', foreground: '0369a1', fontStyle: 'bold' },
        { token: 'interface', foreground: '0369a1', fontStyle: 'bold' },
        { token: 'struct', foreground: '0369a1', fontStyle: 'bold' },

        // Functions & Methods
        { token: 'function', foreground: '2563eb' },
        { token: 'entity.name.function', foreground: '2563eb' },
        { token: 'support.function', foreground: '2563eb' },

        // Strings & Text
        { token: 'string', foreground: '16a34a' },
        { token: 'string.escape', foreground: '0d9488', fontStyle: 'bold' },
        { token: 'string.regex', foreground: '0891b2' },

        // Numbers & Constants
        { token: 'number', foreground: 'ea580c' },
        { token: 'number.hex', foreground: 'ea580c' },
        { token: 'number.float', foreground: 'ea580c' },
        { token: 'constant', foreground: 'db2777' },
        { token: 'constant.language', foreground: 'db2777', fontStyle: 'bold' },
        { token: 'constant.numeric', foreground: 'ea580c' },

        // Identifiers & Variables
        { token: 'identifier', foreground: '0f172a' },
        { token: 'variable', foreground: '1e293b' },
        { token: 'variable.predefined', foreground: '7c3aed' },
        { token: 'variable.parameter', foreground: '334155' },

        // Delimiters & Operators
        { token: 'delimiter', foreground: '334155' },
        { token: 'delimiter.bracket', foreground: '475569' },
        { token: 'operator', foreground: '475569' },

        // HTML & Web
        { token: 'tag', foreground: '2563eb', fontStyle: 'bold' },
        { token: 'tag.id', foreground: '7c3aed' },
        { token: 'tag.class', foreground: '0284c7' },
        { token: 'attribute.name', foreground: '7c3aed' },
        { token: 'attribute.value', foreground: '16a34a' },
        { token: 'metatag', foreground: '0284c7' },

        // Preprocessor (C/C++)
        { token: 'meta.preprocessor', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'meta.preprocessor.string', foreground: '16a34a' },
        { token: 'annotation', foreground: 'b45309' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editor.lineHighlightBackground': '#f8fafc',
        'editor.lineHighlightBorder': '#e2e8f0',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#2563eb',
        'editorCursor.foreground': '#2563eb',
        'editor.selectionBackground': '#bfdbfe70',
        'editor.inactiveSelectionBackground': '#e2e8f080',
        'editor.selectionHighlightBackground': '#dbeafe80',
        'editorIndentGuide.background': '#f1f5f9',
        'editorIndentGuide.activeBackground': '#cbd5e1',
        'editorBracketMatch.background': '#dbeafe80',
        'editorBracketMatch.border': '#3b82f6',
        'editorGutter.background': '#ffffff',
        'editorWidget.background': '#ffffff',
        'editorWidget.border': '#cbd5e1',
        'editorSuggestWidget.background': '#ffffff',
        'editorSuggestWidget.border': '#cbd5e1',
        'editorSuggestWidget.selectedBackground': '#eff6ff',
      }
    });
  } catch {}

  // 2. CodeSelf Pro Dark - Deep dark background with high-contrast glowing syntax
  try {
    monaco.editor.defineTheme('codeself-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Comments
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'comment.line', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'comment.block', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'comment.doc', foreground: 'cbd5e1', fontStyle: 'italic' },

        // Keywords & Control flow
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'f472b6', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: '94a3b8' },
        { token: 'keyword.sql', foreground: '818cf8', fontStyle: 'bold' },

        // Types, Classes & Interfaces
        { token: 'type', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'type.identifier', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'storage.type', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'class', foreground: '7dd3fc', fontStyle: 'bold' },
        { token: 'interface', foreground: '7dd3fc', fontStyle: 'bold' },

        // Functions & Methods
        { token: 'function', foreground: '60a5fa' },
        { token: 'entity.name.function', foreground: '60a5fa' },
        { token: 'support.function', foreground: '60a5fa' },

        // Strings & Text
        { token: 'string', foreground: '4ade80' },
        { token: 'string.escape', foreground: '2dd4bf', fontStyle: 'bold' },
        { token: 'string.regex', foreground: '67e8f9' },

        // Numbers & Constants
        { token: 'number', foreground: 'fb923c' },
        { token: 'number.hex', foreground: 'fb923c' },
        { token: 'constant', foreground: 'f43f5e' },
        { token: 'constant.language', foreground: 'f43f5e', fontStyle: 'bold' },
        { token: 'constant.numeric', foreground: 'fb923c' },

        // Identifiers & Variables
        { token: 'identifier', foreground: 'f8fafc' },
        { token: 'variable', foreground: 'e2e8f0' },
        { token: 'variable.predefined', foreground: 'c084fc' },
        { token: 'variable.parameter', foreground: 'cbd5e1' },

        // Delimiters & Operators
        { token: 'delimiter', foreground: 'cbd5e1' },
        { token: 'delimiter.bracket', foreground: '94a3b8' },
        { token: 'operator', foreground: 'cbd5e1' },

        // HTML & Web
        { token: 'tag', foreground: '60a5fa', fontStyle: 'bold' },
        { token: 'tag.id', foreground: 'c084fc' },
        { token: 'tag.class', foreground: '38bdf8' },
        { token: 'attribute.name', foreground: 'c084fc' },
        { token: 'attribute.value', foreground: '4ade80' },
        { token: 'metatag', foreground: '38bdf8' },

        // Preprocessor (C/C++)
        { token: 'meta.preprocessor', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'meta.preprocessor.string', foreground: '4ade80' },
        { token: 'annotation', foreground: 'fde047' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#161b22',
        'editor.lineHighlightBorder': '#30363d',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#1e40af60',
        'editor.inactiveSelectionBackground': '#33415550',
        'editor.selectionHighlightBackground': '#1e3a8a40',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#475569',
        'editorBracketMatch.background': '#1e3a8a80',
        'editorBracketMatch.border': '#38bdf8',
        'editorGutter.background': '#0d1117',
        'editorWidget.background': '#161b22',
        'editorWidget.border': '#30363d',
        'editorSuggestWidget.background': '#161b22',
        'editorSuggestWidget.border': '#30363d',
        'editorSuggestWidget.selectedBackground': '#1f2937',
      }
    });
  } catch {}

  // 3. GitHub Classic Light Theme
  try {
    monaco.editor.defineTheme('github-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'cf222e', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'cf222e', fontStyle: 'bold' },
        { token: 'type', foreground: '953800' },
        { token: 'function', foreground: '8250df' },
        { token: 'string', foreground: '0a3069' },
        { token: 'number', foreground: '0550ae' },
        { token: 'constant', foreground: '0550ae' },
        { token: 'variable', foreground: '24292f' },
        { token: 'tag', foreground: '116329' },
        { token: 'attribute.name', foreground: '0550ae' },
        { token: 'attribute.value', foreground: '0a3069' }
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#24292f',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editorLineNumber.foreground': '#8c959f',
        'editorLineNumber.activeForeground': '#24292f',
        'editorCursor.foreground': '#0969da',
        'editor.selectionBackground': '#addcff80',
        'editorIndentGuide.background': '#eaeef2',
        'editorGutter.background': '#ffffff',
      }
    });
  } catch {}

  // 4. One Dark Pro Theme
  try {
    monaco.editor.defineTheme('one-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'c678dd', fontStyle: 'bold' },
        { token: 'type', foreground: 'e5c07b' },
        { token: 'function', foreground: '61afef' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'constant', foreground: 'd19a66' },
        { token: 'variable', foreground: 'e06c75' },
        { token: 'tag', foreground: 'e06c75' },
        { token: 'attribute.name', foreground: 'd19a66' },
        { token: 'attribute.value', foreground: '98c379' }
      ],
      colors: {
        'editor.background': '#282c34',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#2c313a',
        'editorLineNumber.foreground': '#4b5263',
        'editorLineNumber.activeForeground': '#abb2bf',
        'editorCursor.foreground': '#528bff',
        'editor.selectionBackground': '#3e4451',
        'editorIndentGuide.background': '#3b4048',
        'editorGutter.background': '#282c34',
      }
    });
  } catch {}
}
