import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Language, ExecutionResult } from '../types';
import { LANGUAGES } from '../data/languages';
import { CodeEditor } from '../components/CodeEditor';
import { TerminalPanel } from '../components/TerminalPanel';
import { runInteractiveCode, getLanguageDefaultResult } from '../services/codeRunner';
import { gamificationService } from '../services/gamificationService';
import { Play, RotateCcw, Terminal } from 'lucide-react';

interface PlaygroundViewProps {
  onToast: (msg: string) => void;
  onOpenSubmit: (initialCode?: string, initialLang?: Language) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({ onToast, onOpenSubmit: _onOpenSubmit }) => {
  const [selectedLang, setSelectedLang] = useState<Language>('cpp');
  const [code, setCode] = useState<string>(LANGUAGES.cpp.sampleBoilerplate);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [liveOutput, setLiveOutput] = useState<string>('');
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const [inputPromptLabel, setInputPromptLabel] = useState<string>('cin');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(() => getLanguageDefaultResult('cpp'));

  const inputResolverRef = useRef<((val: string) => void) | null>(null);
  const abortRef = useRef<boolean>(false);

  // Detect interactive input syntax (cin, getline, scanf, prompt, input)
  const hasInteractiveInput = useMemo(() => {
    return Boolean(
      code.match(/(?:std::)?cin\s*>>|getline\s*\(\s*(?:std::)?cin|scanf\s*\(|\bprompt\s*\(|\binput\s*\(/)
    );
  }, [code]);

  const handleLanguageChange = (lang: Language) => {
    setSelectedLang(lang);
    setCode(LANGUAGES[lang].sampleBoilerplate);
    setLiveOutput('');
    setIsWaitingForInput(false);
    setExecutionResult(getLanguageDefaultResult(lang));
  };

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsWaitingForInput(false);
    setLiveOutput('');
    abortRef.current = false;

    try {
      const res = await runInteractiveCode(selectedLang, code, {
        initialStdin: '',
        onOutput: (output) => {
          setLiveOutput(output);
        },
        onPromptInput: async (promptContext, varName) => {
          return new Promise<string>((resolve) => {
            inputResolverRef.current = resolve;
            setIsWaitingForInput(true);
            const label = varName || (promptContext ? promptContext.trim() : 'cin / prompt()');
            setInputPromptLabel(label);
          });
        },
        onStatusChange: (status, message) => {
          if (status === 'waiting_for_input') {
            setIsWaitingForInput(true);
            if (message) setInputPromptLabel(message);
          } else if (status === 'running') {
            setIsWaitingForInput(false);
          }
        },
        isAborted: () => abortRef.current
      });

      setExecutionResult(res);
      gamificationService.recordAction('run_code', { language: selectedLang });
    } catch (err: any) {
      setExecutionResult({
        stdout: '',
        stderr: err?.message || String(err),
        executionTimeMs: 0,
        status: 'error'
      });
    } finally {
      setIsRunning(false);
      setIsWaitingForInput(false);
      inputResolverRef.current = null;
    }
  }, [isRunning, selectedLang, code]);

  const handleInputSubmit = (val: string) => {
    if (inputResolverRef.current) {
      inputResolverRef.current(val);
      inputResolverRef.current = null;
      setIsWaitingForInput(false);
    }
  };

  const handleStopExecution = () => {
    abortRef.current = true;
    if (inputResolverRef.current) {
      inputResolverRef.current('');
      inputResolverRef.current = null;
    }
    setIsRunning(false);
    setIsWaitingForInput(false);
    onToast('Execution stopped');
  };

  // Global listener for Ctrl+Enter (or Cmd+Enter)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleRun]);

  const handleResetToTemplate = () => {
    setCode(LANGUAGES[selectedLang].sampleBoilerplate);
    setLiveOutput('');
    setIsWaitingForInput(false);
    setExecutionResult(getLanguageDefaultResult(selectedLang));
    onToast(`Reset to standard ${LANGUAGES[selectedLang].name} template`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Playground Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>INTERACTIVE ONLINE COMPILER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Multi-Language Code Runner
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Write, compile, and execute code interactively. When standard input like <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs">cin &gt;&gt;</code> or <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs">prompt()</code> is encountered, execution pauses and resumes after you submit your input.
          </p>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {Object.values(LANGUAGES).map((lang) => {
          const isSelected = selectedLang === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>

      {/* Code Editor */}
      <div className="space-y-4">
        <CodeEditor
          code={code}
          onChange={setCode}
          language={selectedLang}
          minHeight="380px"
          maxHeight="520px"
          onRun={handleRun}
        />

        {/* Interactive Terminal Panel */}
        <TerminalPanel
          result={executionResult}
          isRunning={isRunning}
          onRun={handleRun}
          onReset={handleResetToTemplate}
          resetLabel="Reset Boilerplate"
          onClear={() => {
            setExecutionResult(null);
            setLiveOutput('');
          }}
          language={selectedLang}
          isWaitingForInput={isWaitingForInput}
          inputPromptLabel={inputPromptLabel}
          onInputSubmit={handleInputSubmit}
          onStopExecution={handleStopExecution}
          liveOutput={liveOutput}
        />
      </div>
    </div>
  );
};
