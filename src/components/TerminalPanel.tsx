import React, { useState, useRef, useEffect } from 'react';
import { ExecutionResult } from '../types';
import { Terminal, Clock, CheckCircle2, AlertCircle, Table2, Eye, Trash2, Copy, Check, ChevronDown, ChevronUp, Square, Play, RotateCcw } from 'lucide-react';
import { AnsiOutput } from './AnsiOutput';
import { stripAnsi } from '../utils/ansi';

interface TerminalPanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  onClear?: () => void;
  language?: string;
  // Interactive execution props (Online GDB Style)
  isWaitingForInput?: boolean;
  inputPromptLabel?: string;
  onInputSubmit?: (val: string) => void;
  onStopExecution?: () => void;
  liveOutput?: string;
  onRun?: () => void;
  onReset?: () => void;
  resetLabel?: string;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  result,
  isRunning,
  onClear,
  language: _language,
  isWaitingForInput = false,
  inputPromptLabel,
  onInputSubmit,
  onStopExecution,
  liveOutput = '',
  onRun,
  onReset,
  resetLabel = 'Reset'
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'table' | 'preview'>('console');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [terminalInputValue, setTerminalInputValue] = useState('');
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  const hasTable = Boolean(result?.tabularData && result.tabularData.columns?.length > 0);
  const hasPreview = Boolean(result?.htmlPreview);

  useEffect(() => {
    if (hasTable) {
      setActiveTab('table');
    } else if (hasPreview) {
      setActiveTab('preview');
    } else {
      setActiveTab('console');
    }
  }, [result?.tabularData, result?.htmlPreview]);

  // Automatically focus input when program pauses for user input
  useEffect(() => {
    if (isWaitingForInput) {
      setTerminalInputValue('');
      setTimeout(() => {
        terminalInputRef.current?.focus();
      }, 50);
    }
  }, [isWaitingForInput]);

  // Auto-scroll terminal to bottom as new output or prompt arrives
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [liveOutput, result?.stdout, isWaitingForInput]);

  const handleCopyOutput = () => {
    const textToCopy = liveOutput || result?.stdout || result?.stderr || '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(stripAnsi(textToCopy));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTerminalInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitInput();
    } else if (e.key === 'Escape' && onStopExecution) {
      e.preventDefault();
      onStopExecution();
    }
  };

  const handleSubmitInput = () => {
    if (!onInputSubmit) return;
    onInputSubmit(terminalInputValue);
    setTerminalInputValue('');
  };

  const displayStdout = isRunning ? liveOutput : (result?.stdout || liveOutput);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Interactive Terminal</span>
          </div>

          {/* Status indicators */}
          {isRunning ? (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                <span>Running program...</span>
              </div>

              {onStopExecution && (
                <button
                  type="button"
                  onClick={onStopExecution}
                  className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-sans font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                  title="Stop / terminate program execution"
                >
                  <Square className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          ) : result ? (
            <div className="flex items-center gap-3 font-mono text-[11px]">
              {result.status === 'success' ? (
                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exit 0 (Success)</span>
                </div>
              ) : result.status === 'idle' ? (
                <span className="text-slate-500 font-medium">Stopped</span>
              ) : (
                <div className="flex items-center gap-1 text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Compilation Error</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" />
                <span className="tabular-nums">{result.executionTimeMs} ms</span>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px]">Ready</span>
          )}
        </div>

        {/* Tab switcher & actions */}
        <div className="flex items-center gap-2">
          {/* Reset Template Button */}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title={resetLabel || 'Reset Boilerplate'}
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">{resetLabel || 'Reset Boilerplate'}</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}

          {/* Run Code Button */}
          {onRun && (
            <button
              type="button"
              onClick={onRun}
              disabled={isRunning}
              title="Run Code (Ctrl + Enter)"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>Run Code</span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-700 font-mono text-blue-100">
                    Ctrl+↵
                  </span>
                </>
              )}
            </button>
          )}

          {(hasTable || hasPreview) && (
            <div className="flex items-center p-0.5 bg-slate-200 rounded-md mr-1">
              <button
                onClick={() => setActiveTab('console')}
                className={`px-2.5 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                  activeTab === 'console' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Console
              </button>
              {hasTable && (
                <button
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                    activeTab === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Table2 className="w-3 h-3 text-blue-600" />
                  <span>SQL Table</span>
                </button>
              )}
              {hasPreview && (
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                    activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3 h-3 text-blue-600" />
                  <span>Render View</span>
                </button>
              )}
            </div>
          )}

          {(displayStdout || result?.stderr) && (
            <button
              onClick={handleCopyOutput}
              title="Copy Output"
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {onClear && (
            <button
              onClick={onClear}
              title="Clear Console"
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Console' : 'Collapse Console'}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      {!isCollapsed && (
        <div
          ref={terminalScrollRef}
          onClick={() => {
            if (isWaitingForInput) {
              terminalInputRef.current?.focus();
            }
          }}
          className={`relative min-h-[170px] max-h-[380px] overflow-auto p-4 font-mono text-xs leading-relaxed bg-[#0d1117] text-slate-100 flex flex-col justify-between ${
            isWaitingForInput ? 'cursor-text' : ''
          }`}
        >
          {activeTab === 'table' && hasTable && result?.tabularData ? (
            /* SQL Tabular View */
            <div className="overflow-x-auto rounded border border-slate-700 bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                    <th className="py-2 px-3 text-[11px] font-semibold text-slate-400 border-r border-slate-700 w-10 text-center">#</th>
                    {result.tabularData.columns.map((col, idx) => (
                      <th key={idx} className="py-2 px-3 font-semibold text-slate-200 border-r border-slate-700 last:border-r-0">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {result.tabularData.values.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-2 px-3 text-[11px] text-slate-500 border-r border-slate-700 text-center tabular-nums">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="py-2 px-3 text-slate-200 border-r border-slate-700 last:border-r-0 font-mono">
                          {cell === null ? <span className="text-slate-500 italic">NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-1.5 bg-slate-800/60 text-[11px] text-slate-400 border-t border-slate-700">
                {result.tabularData.values.length} row(s) returned
              </div>
            </div>
          ) : activeTab === 'preview' && hasPreview && result?.htmlPreview ? (
            /* Isolated Sandboxed HTML View */
            <div className="w-full h-64 bg-white rounded-lg overflow-hidden border border-slate-700">
              <iframe
                title="Code Preview"
                srcDoc={result.htmlPreview}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            /* Standard Live Stdout, Stderr, and Interactive Input Console */
            <div className="flex-1 font-mono text-xs leading-relaxed">
              {!isRunning && !result && !displayStdout ? (
                <div className="py-8 text-center text-slate-400 font-sans">
                  <p>Click <span className="text-blue-400 font-semibold">"Run Code"</span> above or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">Ctrl+Enter</kbd> to execute.</p>
                  <p className="text-[11px] text-slate-500 mt-1.5">Interactive compiler supports standard input streams and output</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-mono text-xs break-words select-text">
                  {displayStdout && (
                    <AnsiOutput
                      text={displayStdout}
                      defaultColor="#34d399"
                      className="leading-relaxed"
                    />
                  )}

                  {/* Inline interactive input: cursor blinks directly at the prompt without any separate box */}
                  {isWaitingForInput && (
                    <span className="inline-flex items-center align-baseline">
                      <input
                        ref={terminalInputRef}
                        type="text"
                        value={terminalInputValue}
                        onChange={(e) => setTerminalInputValue(e.target.value)}
                        onKeyDown={handleTerminalInputKeyDown}
                        className="bg-transparent border-0 outline-none text-emerald-300 font-mono text-xs p-0 m-0 inline-block align-baseline focus:ring-0 shadow-none caret-emerald-400"
                        style={{
                          width: `${Math.max(terminalInputValue.length + 1, 1.5)}ch`,
                          minWidth: '1.5ch'
                        }}
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                    </span>
                  )}

                  {isRunning && !displayStdout && !isWaitingForInput && (
                    <div className="flex items-center gap-2 py-3 text-slate-400 text-xs font-sans">
                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Initializing runtime & compiling...</span>
                    </div>
                  )}

                  {result?.stderr && (
                    <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-lg whitespace-pre-wrap font-mono text-xs mt-3 shadow-inner">
                      <div className="font-semibold text-rose-400 mb-1.5 flex items-center gap-1.5 font-sans text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Compiler Error / Diagnostic:</span>
                      </div>
                      <AnsiOutput
                        text={result.stderr}
                        defaultColor="#fca5a5"
                        className="leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
