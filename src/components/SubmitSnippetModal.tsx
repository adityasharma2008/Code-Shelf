import React, { useState, useEffect } from 'react';
import { Snippet, Language, Difficulty, CategoryTag, ExecutionResult, ActiveTeamSession } from '../types';
import { LANGUAGES, DIFFICULTY_LEVELS, CATEGORIES } from '../data/languages';
import { CodeEditor } from './CodeEditor';
import { snippetStorage } from '../services/snippetStorage';
import { authService } from '../services/authService';
import { teamService } from '../services/teamService';
import { runCode } from '../services/codeRunner';
import { X, Upload, AlertCircle, Info, Play, User as UserIcon, Users, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnsiOutput } from './AnsiOutput';
import { gamificationService } from '../services/gamificationService';

interface SubmitSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (snippet: Snippet) => void;
  onRequestAuth: (message: string) => void;
  onOpenTeam?: (tab?: 'join' | 'create' | 'active') => void;
}

export const SubmitSnippetModal: React.FC<SubmitSnippetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onRequestAuth,
  onOpenTeam
}) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [category, setCategory] = useState<CategoryTag>('DSA');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Guest name prompt state
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);
  const [guestDisplayName, setGuestDisplayName] = useState(() => localStorage.getItem('codeshelf_guest_name') || '');
  const [guestNameError, setGuestNameError] = useState<string | null>(null);

  // Test run state inside modal
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<ExecutionResult | null>(null);

  const [limitStatus, setLimitStatus] = useState(() => authService.getGuestLimitStatus());
  const [activeTeam, setActiveTeam] = useState<ActiveTeamSession | null>(() => teamService.getActiveTeam());

  useEffect(() => {
    const updateLimit = () => {
      setLimitStatus(authService.getGuestLimitStatus());
      setActiveTeam(teamService.getActiveTeam());
    };
    updateLimit();
    window.addEventListener('codeshelf_auth_changed', updateLimit);
    window.addEventListener('codeshelf_snippets_updated', updateLimit);
    window.addEventListener('codeshelf_team_changed', updateLimit as EventListener);
    return () => {
      window.removeEventListener('codeshelf_auth_changed', updateLimit);
      window.removeEventListener('codeshelf_snippets_updated', updateLimit);
      window.removeEventListener('codeshelf_team_changed', updateLimit as EventListener);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setTestResult(null);
  };

  const handleTestRun = async () => {
    if (isRunningTest || !code.trim()) return;
    setIsRunningTest(true);
    try {
      const res = await runCode(language, code);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        stdout: '',
        stderr: err?.message || String(err),
        executionTimeMs: 0,
        status: 'error'
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter or Cmd + Enter to trigger Run Code
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleTestRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, language, code, isRunningTest]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a descriptive snippet title.');
      return;
    }
    if (!description.trim()) {
      setError('Please explain what this code snippet does.');
      return;
    }
    if (!code.trim()) {
      setError('Source code cannot be empty.');
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      // Unauthenticated (guest) user: prompt with quick modal for Display Name
      setShowGuestNameModal(true);
      return;
    }

    performSave();
  };

  const handleGuestSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = guestDisplayName.trim();
    if (!trimmed) {
      setGuestNameError('Please enter a display name to attribute your code.');
      return;
    }
    setGuestNameError(null);
    localStorage.setItem('codeshelf_guest_name', trimmed);
    setShowGuestNameModal(false);
    performSave(trimmed);
  };

  const performSave = (guestName?: string) => {
    const tags = tagInput
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const langName = (LANGUAGES as any)[language]?.name || language;
    const result = snippetStorage.saveSnippet({
      title,
      description,
      language,
      difficulty,
      category,
      tags: tags.length > 0 ? tags : [langName, category],
      code,
      guestAuthorName: guestName
    });

    if (!result.success) {
      if (result.requireAuth) {
        onClose();
        onRequestAuth(result.error || 'Please sign in to publish more code snippets.');
        return;
      }
      setError(result.error || 'Failed to submit code.');
      return;
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored
    }

    // Award XP and achievements for uploading code
    gamificationService.recordAction('upload_snippet', { language });

    // Reset form state for next submission
    setTitle('');
    setDescription('');
    setTagInput('');
    setCode('');
    setTestResult(null);
    setError(null);

    onClose();
    if (result.snippet) {
      onSuccess(result.snippet);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      {/* Modal Dialog with controlled max-height preventing viewport clipping at 100% zoom */}
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-900 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
                <Upload className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Submit Code to Library
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Publish an algorithm, SQL query, or utility pattern to the community repository.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body with smooth scrolling */}
        <form 
          id="submit-snippet-form" 
          onSubmit={handleSubmit} 
          className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4"
        >
          {/* Active Team Workspace Banner (Unlocks unlimited submissions) */}
          {activeTeam ? (
            <div className="py-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Team Workspace: <strong className="font-semibold text-emerald-900">{activeTeam.teamName}</strong>
                  <span className="text-emerald-700 font-normal"> (as {activeTeam.memberName})</span>
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200/80 text-emerald-800">
                    Unlimited Active
                  </span>
                </span>
              </div>
              {onOpenTeam && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTeam('active');
                  }}
                  className="text-emerald-700 hover:text-emerald-900 hover:underline font-medium text-[11px] cursor-pointer text-left sm:text-right"
                >
                  Manage Team
                </button>
              )}
            </div>
          ) : limitStatus.isGuest ? (
            <div className="py-2.5 px-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Guest Device: <span className="font-semibold text-blue-800">Remaining Submissions: {limitStatus.remaining}/{limitStatus.maxLimit}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {onOpenTeam && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTeam('join');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                    title="Upload unlimited code with a Team ID and PIN"
                  >
                    <Users className="w-3 h-3" />
                    <span>Join Team Workspace</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestAuth('Sign in to unlock unlimited code submissions.');
                  }}
                  className="text-blue-700 hover:text-blue-900 hover:underline font-medium text-[11px] cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>
          ) : null}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Snippet Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Simple Multiplication Table"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {Object.values(LANGUAGES).map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {DIFFICULTY_LEVELS.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryTag)}
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {CATEGORIES.filter(c => c.id !== 'All').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Briefly describe what this snippet does, time complexity, or usage instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Basics, Loops, Math"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Source Code Editor with controlled height: height: 220px, min-h-[200px] */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Source Code <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTestRun}
                  disabled={isRunningTest}
                  title="Test Run Code (Ctrl + Enter)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md font-medium transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-blue-600 text-blue-600" />
                  <span>{isRunningTest ? 'Testing...' : 'Test Run'}</span>
                  <span className="hidden sm:inline-block text-[10px] text-blue-600 font-mono">
                    Ctrl+↵
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCode((LANGUAGES as any)[language]?.sampleBoilerplate || '')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  title="Optionally populate with starter code"
                >
                  Load Starter Template
                </button>
              </div>
            </div>

            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              minHeight="220px"
              maxHeight="250px"
              onRun={handleTestRun}
            />

            {/* Test Run Output Preview */}
            {testResult && (
              <div className="mt-2.5 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono border border-slate-700 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 pb-1 border-b border-slate-800">
                  <span className={`flex items-center gap-1.5 font-semibold ${testResult.status === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {testResult.status === 'error' ? '⚠ Execution Error' : '✓ Execution Output'} ({testResult.executionTimeMs}ms)
                  </span>
                  <button
                    type="button"
                    onClick={() => setTestResult(null)}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer hover:underline text-[11px]"
                  >
                    Dismiss
                  </button>
                </div>
                <pre className="max-h-24 overflow-y-auto whitespace-pre-wrap text-slate-200 font-mono text-[11px] leading-relaxed">
                  {testResult.stdout ? (
                    <AnsiOutput text={testResult.stdout} defaultColor="#34d399" />
                  ) : testResult.stderr ? (
                    <AnsiOutput text={testResult.stderr} defaultColor="#fca5a5" />
                  ) : (
                    'Code executed successfully with no output.'
                  )}
                </pre>
              </div>
            )}
          </div>
        </form>

        {/* Sticky/Fixed Modal Footer at the bottom: Never hidden or cut off */}
        <div className="sticky bottom-0 bg-white py-3 px-5 sm:px-6 border-t border-slate-200 mt-auto flex items-center justify-between z-10 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono text-slate-600">
              Ctrl + Enter
            </kbd>
            <span>runs code</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="submit-snippet-form"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Display Name Prompt Modal */}
      {showGuestNameModal && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setShowGuestNameModal(false);
          }}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Enter Display Name
                </h3>
                <p className="text-xs text-slate-500">
                  Submitting as a Guest contributor
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Choose a display name so others can recognize your contributions. Your snippet will appear in the library with your entered name and an explicit <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Guest</span> badge.
            </p>

            <form onSubmit={handleGuestSubmit}>
              <div className="space-y-1.5 mb-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Your Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={guestDisplayName}
                  onChange={(e) => {
                    setGuestDisplayName(e.target.value);
                    if (guestNameError) setGuestNameError(null);
                  }}
                  placeholder="e.g. Alex M, DevCoder, Sarah"
                  maxLength={40}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 bg-white"
                />
                {guestNameError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{guestNameError}</span>
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Submissions are remembered on this device and can be deleted anytime to recover slots.</span>
                <span className="font-semibold text-blue-700 whitespace-nowrap font-mono">Remaining: {limitStatus.remaining}/{limitStatus.maxLimit}</span>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGuestNameModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                >
                  Back to Editor
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish as Guest</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
