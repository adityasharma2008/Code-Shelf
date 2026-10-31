import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../data/languages';
import { Check, Copy, Code2, Maximize2, Minimize2, Wand2, Palette, ChevronDown } from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import { registerMonacoThemes, EDITOR_THEMES, DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from '../utils/monacoThemes';

interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  language: Language;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  theme?: 'dark' | 'light';
  onRun?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  readOnly = false,
  minHeight = '350px',
  maxHeight,
  theme = 'light',
  onRun
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useMonaco, setUseMonaco] = useState(true);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (theme === 'dark') return DEFAULT_DARK_THEME;
    const saved = localStorage.getItem('codeself_editor_theme');
    if (saved && EDITOR_THEMES.some(t => t.id === saved)) return saved;
    return DEFAULT_LIGHT_THEME;
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const monacoInstanceRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync theme when parent theme prop changes
  useEffect(() => {
    if (theme === 'dark' && !activeTheme.includes('dark')) {
      setActiveTheme(DEFAULT_DARK_THEME);
      if (monacoInstanceRef.current) {
        try { monacoInstanceRef.current.editor.setTheme(DEFAULT_DARK_THEME); } catch {}
      }
    } else if (theme === 'light' && activeTheme.includes('dark')) {
      setActiveTheme(DEFAULT_LIGHT_THEME);
      if (monacoInstanceRef.current) {
        try { monacoInstanceRef.current.editor.setTheme(DEFAULT_LIGHT_THEME); } catch {}
      }
    }
  }, [theme]);

  // Close theme dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (themeId: string) => {
    setActiveTheme(themeId);
    localStorage.setItem('codeself_editor_theme', themeId);
    setShowThemeMenu(false);
    if (monacoInstanceRef.current) {
      try {
        monacoInstanceRef.current.editor.setTheme(themeId);
      } catch {}
    }
  };

  // Wheel event propagation handler for seamless scroll chaining to main window
  const handleWheelChaining = (e: WheelEvent) => {
    if (isFullscreen) return;
    if (!e.deltaY) return;

    // Prevent double dispatch for the same wheel event
    if ((e as any).__codeshelf_wheel_handled__) return;

    let isAtTop = false;
    let isAtBottom = false;

    if (editorRef.current) {
      const editor = editorRef.current;
      const scrollTop = editor.getScrollTop();
      const scrollHeight = editor.getScrollHeight();
      const layout = editor.getLayoutInfo();
      const clientHeight = layout ? layout.height : 0;

      isAtTop = scrollTop <= 2;
      // Bottom edge reached or entire code fits without scrolling
      isAtBottom = (scrollTop + clientHeight >= scrollHeight - 4) || (scrollHeight <= clientHeight + 4);
    } else if (textareaRef.current) {
      const ta = textareaRef.current;
      isAtTop = ta.scrollTop <= 2;
      isAtBottom = (ta.scrollTop + ta.clientHeight >= ta.scrollHeight - 4) || (ta.scrollHeight <= ta.clientHeight + 4);
    }

    // When scrolling up at the top edge, or scrolling down at the bottom edge, chain to main window
    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
      (e as any).__codeshelf_wheel_handled__ = true;
      window.scrollBy({
        top: e.deltaY,
        behavior: 'auto'
      });
    }
  };

  // Attach container wheel listener to ensure scroll chaining propagates to main window
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      handleWheelChaining(e);
    };

    container.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [isFullscreen]);

  // Fallback editor state (smart autocomplete & line numbering)
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);
  const [cursorWord, setCursorWord] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 40, left: 60 });

  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const currentMeta = LANGUAGES[language] || LANGUAGES.python;
  const monacoLang = mapToMonacoLanguage(language);
  const effectiveMinHeight = minHeight || '220px';

  // Fallback if Monaco takes more than 2.5 seconds to load from CDN
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!monacoLoaded) {
        setUseMonaco(false);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [monacoLoaded]);

  // Window resize handler to maintain Monaco full layout
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        try {
          editorRef.current.layout();
        } catch {}
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function mapToMonacoLanguage(lang: Language): string {
    switch (lang) {
      case 'cpp': return 'cpp';
      case 'python': return 'python';
      case 'sql': return 'sql';
      case 'javascript': return 'javascript';
      case 'typescript': return 'typescript';
      case 'java': return 'java';
      case 'csharp': return 'csharp';
      case 'php': return 'php';
      case 'html_css': return 'html';
      default: return 'plaintext';
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatCode = () => {
    if (editorRef.current && useMonaco && monacoLoaded) {
      try {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
        return;
      } catch {
        // Fall back to clean format algorithm
      }
    }

    // Clean formatting algorithm
    const lines = (code || '').split('\n');
    let indentLevel = 0;
    const indentStr = '    ';
    const formattedLines: string[] = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        formattedLines.push('');
        continue;
      }

      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      formattedLines.push(indentStr.repeat(indentLevel) + trimmed);

      if (
        trimmed.endsWith('{') ||
        trimmed.endsWith(':') ||
        (trimmed.endsWith('(') && !trimmed.startsWith('('))
      ) {
        indentLevel++;
      }
    }

    const formatted = formattedLines.join('\n');
    if (onChange) onChange(formatted);
  };

  const handleBeforeMount = (monaco: any) => {
    monacoInstanceRef.current = monaco;
    registerMonacoThemes(monaco);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoInstanceRef.current = monaco;
    setMonacoLoaded(true);

    // Register custom high-readability themes and apply selected theme
    registerMonacoThemes(monaco);
    try {
      monaco.editor.setTheme(activeTheme);
    } catch {}

    // Immediate and staged layout recalculations to guarantee full height without 20px squish
    setTimeout(() => {
      try { editor.layout(); } catch {}
    }, 40);
    setTimeout(() => {
      try { editor.layout(); } catch {}
    }, 150);
    setTimeout(() => {
      try { editor.layout(); } catch {}
    }, 500);

    // Register rich intellisense keywords for current language
    try {
      const keywords = currentMeta.keywords;
      monaco.languages.registerCompletionItemProvider(monacoLang, {
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestionsList = keywords.map(kw => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range: range,
            detail: `${currentMeta.name} Keyword / Syntax`
          }));

          return { suggestions: suggestionsList };
        }
      });
    } catch {
      // Ignored if already registered
    }

    // Attach wheel listener to Monaco's inner DOM node to guarantee scroll chaining to window
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('wheel', (e: WheelEvent) => {
        handleWheelChaining(e);
      }, { passive: true });
    }

    // Shortcut: Ctrl+Enter or Cmd+Enter to run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunRef.current) {
        onRunRef.current();
      }
    });
  };

  // Resilient fallback keyboard handling (auto-brackets, tab, smart autocomplete)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    // Autocomplete navigation
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(suggestions[activeSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Ctrl+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (onRunRef.current) {
        e.preventDefault();
        onRunRef.current();
        return;
      }
    }

    // Tab key indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const updated = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
      if (onChange) onChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
      }, 0);
      return;
    }

    // Auto-closing brackets & quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };

    if (pairs[e.key]) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      const updated = value.substring(0, selectionStart) + e.key + closeChar + value.substring(selectionEnd);
      if (onChange) onChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
      return;
    }
  };

  const handleFallbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (onChange) onChange(val);

    // Calculate current typing word for autocomplete
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = val.slice(0, pos);
    const match = textBefore.match(/([a-zA-Z_#][a-zA-Z0-9_]*)$/);

    if (match && match[1].length >= 1) {
      const word = match[1].toLowerCase();
      setCursorWord(match[1]);
      const filtered = currentMeta.keywords.filter(k =>
        k.toLowerCase().startsWith(word) && k.toLowerCase() !== word
      );

      if (filtered.length > 0) {
        setSuggestions(filtered.slice(0, 7));
        setActiveSuggestionIdx(0);
        setShowSuggestions(true);
        // Position relative to cursor
        const lines = textBefore.split('\n');
        const lineNum = lines.length;
        const colNum = lines[lines.length - 1].length;
        setPopupPos({
          top: Math.min(lineNum * 24 + 16, 280),
          left: Math.min(colNum * 8.5 + 48, 360)
        });
        return;
      }
    }
    setShowSuggestions(false);
  };

  const insertSuggestion = (word: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, value } = textarea;
    const beforeWord = value.slice(0, selectionStart - cursorWord.length);
    const afterWord = value.slice(selectionStart);
    const updated = beforeWord + word + afterWord;
    if (onChange) onChange(updated);
    setShowSuggestions(false);
    setTimeout(() => {
      const newPos = beforeWord.length + word.length;
      textarea.selectionStart = textarea.selectionEnd = newPos;
      textarea.focus();
    }, 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lineCount = (code || '').split('\n').length;
  const isDarkActive = activeTheme.includes('dark') || activeTheme === 'one-dark';

  return (
    <div
      ref={containerRef}
      className={`relative border rounded-xl shadow-xs transition-all duration-200 w-full overscroll-auto ${
        isDarkActive ? 'border-slate-800 bg-[#0d1117]' : 'border-slate-200 bg-white'
      } ${isFullscreen ? 'fixed inset-4 z-50 rounded-none shadow-2xl' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: effectiveMinHeight,
        maxHeight: isFullscreen ? undefined : maxHeight,
        height: isFullscreen ? 'calc(100vh - 32px)' : (maxHeight || effectiveMinHeight)
      }}
    >
      {/* Editor Control Header with Mac-Style Control Dots and Theme Switcher */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b text-xs select-none shrink-0 rounded-t-xl ${
        isDarkActive ? 'bg-[#161b22] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2.5">
          {/* Classic Mac-style Red, Yellow, Green Window Control Dots */}
          <div className="flex items-center gap-1.5 mr-2" aria-label="Window Controls">
            <span
              className="w-3 h-3 rounded-full bg-[#EF4444] border border-[#DC2626]/40 inline-block shadow-2xs hover:opacity-80 transition-opacity"
              title="Close"
            />
            <span
              className="w-3 h-3 rounded-full bg-[#F59E0B] border border-[#D97706]/40 inline-block shadow-2xs hover:opacity-80 transition-opacity"
              title="Minimize"
            />
            <span
              className="w-3 h-3 rounded-full bg-[#10B981] border border-[#059669]/40 inline-block shadow-2xs hover:opacity-80 transition-opacity"
              title="Expand"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <Code2 className="w-3.5 h-3.5 text-blue-500" />
            <span className={`font-semibold ${isDarkActive ? 'text-slate-100' : 'text-slate-900'}`}>{currentMeta.name}</span>
            <span className="text-slate-400">.{currentMeta.extension}</span>
          </div>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400 font-mono tabular-nums">{lineCount} lines</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Syntax Highlighting Theme Selector */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Syntax Highlighting Theme"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-md transition-colors font-medium cursor-pointer ${
                isDarkActive
                  ? 'text-slate-200 bg-[#21262d] hover:bg-[#30363d] border-slate-700'
                  : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Palette className="w-3 h-3 text-blue-500" />
              <span className="hidden sm:inline">Theme:</span>
              <span className="font-semibold truncate max-w-[100px]">
                {EDITOR_THEMES.find(t => t.id === activeTheme)?.name.replace('CodeSelf ', '') || 'Theme'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showThemeMenu && (
              <div
                className={`absolute right-0 top-full mt-1.5 w-48 rounded-lg shadow-xl border py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 ${
                  isDarkActive
                    ? 'bg-[#161b22] border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200/40 mb-1">
                  Syntax Themes
                </div>
                {EDITOR_THEMES.map(th => {
                  const isSelected = th.id === activeTheme;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => handleSelectTheme(th.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? isDarkActive
                            ? 'bg-blue-900/40 text-blue-300 font-semibold'
                            : 'bg-blue-50 text-blue-700 font-semibold'
                          : isDarkActive
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: th.badgeColor }}
                        />
                        <span>{th.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleFormatCode}
              title="Format Indentation"
              className={`flex items-center gap-1 px-2.5 py-1 border rounded-md transition-colors font-medium cursor-pointer ${
                isDarkActive
                  ? 'text-slate-200 bg-[#21262d] hover:bg-[#30363d] border-slate-700'
                  : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Wand2 className="w-3 h-3 text-blue-500" />
              <span>Format</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy Code to Clipboard"
            className={`flex items-center gap-1 px-2.5 py-1 border rounded-md transition-colors font-medium cursor-pointer ${
              isDarkActive
                ? 'text-slate-200 bg-[#21262d] hover:bg-[#30363d] border-slate-700'
                : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
            className={`p-1 border rounded-md transition-colors cursor-pointer ${
              isDarkActive
                ? 'text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] border-slate-700'
                : 'text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border-slate-200'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body: Full-height flex-grow layout filling the entire container */}
      <div 
        className={`relative w-full font-mono text-sm leading-relaxed overflow-hidden ${
          isDarkActive ? 'bg-[#0d1117]' : 'bg-white'
        }`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: effectiveMinHeight,
          height: '100%'
        }}
      >
        {useMonaco ? (
          <div 
            className="relative w-full h-full"
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: effectiveMinHeight,
              height: '100%'
            }}
          >
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              theme={activeTheme}
              beforeMount={handleBeforeMount}
              onChange={(val) => onChange && onChange(val || '')}
              onMount={handleEditorDidMount}
              loading={
                <div className="flex items-center justify-center h-48 gap-3 text-slate-500 text-xs">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading code editor...</span>
                </div>
              }
              options={{
                readOnly: readOnly,
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
                fontLigatures: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                lineNumbersMinChars: 3,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'all',
                suggestOnTriggerCharacters: true,
                fixedOverflowWidgets: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: true },
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                  useShadows: false,
                  alwaysConsumeMouseWheel: false
                },
                quickSuggestions: { other: true, comments: false, strings: true }
              }}
            />
          </div>
        ) : (
          /* High-Performance Fallback IDE with Full-Height Line Numbers & Natural Scrolling */
          <div 
            className="w-full h-full relative bg-white"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              minHeight: effectiveMinHeight,
              height: '100%'
            }}
          >
            {/* Line numbers gutter synchronized on scroll */}
            <div 
              ref={gutterRef}
              className="select-none py-4 px-3 bg-slate-50 border-r border-slate-200 text-right text-slate-400 font-mono text-xs tabular-nums overflow-hidden shrink-0"
              style={{ width: '50px', minHeight: effectiveMinHeight }}
            >
              {Array.from({ length: Math.max(lineCount, 25) }).map((_, idx) => (
                <div key={idx} className="h-6 leading-6">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Code input text area: flex-1 expanding vertically to fill entire white area */}
            <div 
              className="relative w-full h-full"
              style={{
                display: 'flex',
                flex: 1,
                minHeight: effectiveMinHeight,
                height: '100%'
              }}
            >
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleFallbackChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                onWheel={(e) => handleWheelChaining(e.nativeEvent)}
                readOnly={readOnly}
                spellCheck={false}
                className="w-full h-full p-4 bg-white text-slate-900 font-mono text-xs sm:text-sm leading-6 resize-none outline-none whitespace-pre overflow-auto focus:ring-0"
                style={{
                  minHeight: effectiveMinHeight,
                  height: '100%',
                  flex: 1,
                  tabSize: 4
                }}
              />

              {/* Dynamic IntelliSense popup */}
              {showSuggestions && suggestions.length > 0 && !readOnly && (
                <div
                  className="absolute z-30 bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden py-1 w-52"
                  style={{ top: popupPos.top, left: popupPos.left }}
                >
                  <div className="px-2.5 py-1 text-[10px] text-slate-500 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="font-semibold text-blue-600">Smart IntelliSense</span>
                    <span>Tab/Enter</span>
                  </div>
                  {suggestions.map((item, idx) => (
                    <div
                      key={item}
                      onClick={() => insertSuggestion(item)}
                      className={`px-3 py-1.5 cursor-pointer text-xs flex items-center justify-between ${
                        idx === activeSuggestionIdx
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-mono">{item}</span>
                      <span className="text-[10px] opacity-70">keyword</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Hotkey Hint */}
      {!readOnly && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 rounded-b-xl shrink-0">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[10px]">Ctrl+Enter</kbd> to run</span>
            <span>·</span>
            <span>IntelliSense enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <span>UTF-8</span>
            <span>·</span>
            <span>Spaces: 4</span>
          </div>
        </div>
      )}
    </div>
  );
};
