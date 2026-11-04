import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gamificationService, LevelInfo } from '../services/gamificationService';
import { authService } from '../services/authService';
import { getTodayAlgorithmicChallenge, AlgorithmicChallenge } from '../data/dailyChallengesData';
import { evaluateDailyChallenge, ChallengeEvaluationResult } from '../services/challengeRunner';
import { CodeEditor } from '../components/CodeEditor';
import { Language, UserStats } from '../types';
import { 
  Flame, ShieldCheck, Trophy, Sparkles, CheckCircle2, XCircle, 
  ArrowLeft, Play, RotateCcw, Lock, Award, BookOpen, 
  HelpCircle, Code2, Check, Zap, Star, Clock, AlertTriangle,
  ChevronRight, Terminal, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyChallengeViewProps {
  onToast: (msg: string) => void;
  onRequestAuth: (reason: string) => void;
  onOpenQuiz?: (language: Language) => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  onToast,
  onRequestAuth
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [stats, setStats] = useState<UserStats | null>(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() => gamificationService.getLevelInfo());
  const [isCompletedToday, setIsCompletedToday] = useState(() => gamificationService.isDailyGameCompletedToday());

  // Deterministic daily challenge
  const { challenge, dateStr } = getTodayAlgorithmicChallenge();
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'typescript' | 'python' | 'cpp'>('javascript');
  
  // Code editor state
  const [code, setCode] = useState<string>(() => {
    const tmpl = challenge.starterTemplates.javascript;
    return tmpl ? tmpl.code : '';
  });

  // Test execution state
  const [activeTab, setActiveTab] = useState<string>('description');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<ChallengeEvaluationResult | null>(null);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(authService.getCurrentUser());
      setStats(gamificationService.getStats());
      setLevelInfo(gamificationService.getLevelInfo());
      setIsCompletedToday(gamificationService.isDailyGameCompletedToday());
    };

    window.addEventListener('codeself_gamification_updated', handleUpdate);
    window.addEventListener('codeshelf_auth_changed', handleUpdate);

    return () => {
      window.removeEventListener('codeself_gamification_updated', handleUpdate);
      window.removeEventListener('codeshelf_auth_changed', handleUpdate);
    };
  }, []);

  // Update starter code when language changes
  const handleLanguageChange = (lang: 'javascript' | 'typescript' | 'python' | 'cpp') => {
    setSelectedLanguage(lang);
    const tmpl = challenge.starterTemplates[lang] || challenge.starterTemplates.javascript;
    setCode(tmpl.code);
    setEvalResult(null);
  };

  const handleResetCode = () => {
    const tmpl = challenge.starterTemplates[selectedLanguage] || challenge.starterTemplates.javascript;
    setCode(tmpl.code);
    setEvalResult(null);
    onToast('Reset code to starter template.');
  };

  // Run tests without submitting for daily streak
  const handleRunTests = async () => {
    setIsRunningTests(true);
    setActiveTab('testcases');
    try {
      const res = await evaluateDailyChallenge(challenge, selectedLanguage, code);
      setEvalResult(res);
      setHasAttempted(true);
      if (res.allPassed) {
        onToast(`All ${res.totalCount} test cases passed! Click "Submit Solution" to lock in your daily streak.`);
      } else {
        onToast(`${res.passedCount}/${res.totalCount} test cases passed. Review details below.`);
      }
    } catch (err: any) {
      onToast(`Execution error: ${err?.message || 'Check syntax'}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Run tests & submit for daily streak
  const handleSubmitSolution = async () => {
    if (!currentUser) {
      onRequestAuth('Sign in with Google to submit solutions, keep your streak, and earn XP!');
      return;
    }

    setIsRunningTests(true);
    setActiveTab('testcases');
    try {
      const res = await evaluateDailyChallenge(challenge, selectedLanguage, code);
      setEvalResult(res);
      setHasAttempted(true);

      if (!res.allPassed) {
        onToast(`Cannot submit yet: ${res.passedCount}/${res.totalCount} test cases passed. Fix issues to complete.`);
        return;
      }

      // Record daily challenge completion in gamification service
      const outcome = gamificationService.completeDailyGame(challenge.id);
      setIsCompletedToday(true);

      if (outcome.alreadyCompletedToday) {
        onToast(`Correct solution! Today's daily challenge was already marked complete. Streak: ${outcome.newStreak}d.`);
      } else {
        onToast(`Daily Challenge Solved! +${outcome.xpEarned} XP awarded. Daily Streak: ${outcome.newStreak} days!`);
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    } catch (err: any) {
      onToast(`Evaluation error: ${err?.message || 'Check syntax'}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Banner Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Return to Home Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Daily Coding Challenge
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {dateStr}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>{challenge.title}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  challenge.difficulty === 'Easy'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : challenge.difficulty === 'Medium'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {challenge.difficulty}
              </span>
            </h1>
          </div>
        </div>

        {/* Streak & Completion Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-2xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>Streak:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">
              {stats?.currentStreak ?? 0} days
            </span>
          </div>

          {isCompletedToday ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Completed Today</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Pending Today's Solution</span>
            </div>
          )}
        </div>
      </div>

      {/* Completion Banner if completed today */}
      {isCompletedToday && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                You've solved today's daily coding challenge!
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                Your daily streak is preserved at {stats?.currentStreak ?? 1} days. You can continue testing code freely; next challenge unlocks at midnight.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline text-xs font-mono font-bold text-emerald-800 dark:text-emerald-200 bg-white/80 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-700">
            +50 XP Claimed
          </span>
        </div>
      )}

      {/* Main Split Grid: Left Problem & Tests / Right Monaco Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Problem Details & Test Cases Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'description'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('testcases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'testcases'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Test Cases</span>
              {evalResult && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    evalResult.allPassed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {evalResult.passedCount}/{evalResult.totalCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Problem Description */}
          {activeTab === 'description' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-xs text-xs">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Category:
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {challenge.category}
                </span>
                {challenge.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium text-[10px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Problem Statement */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                  Problem Statement
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {challenge.problemStatement}
                </p>
              </div>

              {/* Examples */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Examples
                </h3>
                {challenge.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-1.5 font-mono text-xs"
                  >
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Example {idx + 1}:
                    </p>
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 dark:text-slate-500">Input: </span>
                      <span className="text-slate-800 dark:text-slate-200">{ex.input}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 dark:text-slate-500">Output: </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Explanation: </span>
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                  Constraints
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  {challenge.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Test Cases */}
          {activeTab === 'testcases' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Test Case Results
                </h3>
                {evalResult && (
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    Time: {evalResult.overallTimeMs}ms
                  </span>
                )}
              </div>

              {/* Test Case Selectors */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {challenge.testCases.map((tc, idx) => {
                  const tcRes = evalResult?.results.find(r => r.id === tc.id);
                  return (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setSelectedTestCaseIndex(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedTestCaseIndex === idx
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tcRes ? (
                        tcRes.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        )
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      )}
                      <span>Case {idx + 1}</span>
                      {tc.isHidden && (
                        <span className="text-[9px] uppercase px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Hidden
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Test Case Detail */}
              {challenge.testCases[selectedTestCaseIndex] && (() => {
                const tc = challenge.testCases[selectedTestCaseIndex];
                const res = evalResult?.results.find(r => r.id === tc.id);

                return (
                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                          Input
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                          {tc.inputDescription}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                          Expected Output
                        </span>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          {tc.expectedDescription}
                        </p>
                      </div>

                      {res && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                            Actual Output
                          </span>
                          <p
                            className={`mt-0.5 font-bold ${
                              res.passed
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {res.actualDescription}
                          </p>
                          {res.errorMessage && (
                            <p className="text-rose-500 text-[11px] mt-1 font-sans">
                              Error: {res.errorMessage}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Executed in {res.executionTimeMs}ms
                          </span>
                        </div>
                      )}
                    </div>

                    {evalResult?.syntaxError && (
                      <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-rose-700 dark:text-rose-300 text-xs">
                        <span className="font-bold block">Compilation / Syntax Error:</span>
                        <p className="font-mono text-[11px] mt-1">{evalResult.syntaxError}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Execution Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Editor Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-xs">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Language:
              </span>
              <div className="flex items-center gap-1">
                {(['javascript', 'typescript', 'python', 'cpp'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetCode}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title="Reset Code Template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Monaco Editor Container */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-slate-900">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'python' : selectedLanguage === 'typescript' ? 'typescript' : 'javascript'}
              minHeight="460px"
            />
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {evalResult ? (
                evalResult.allPassed ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All test cases passed! Ready for submission.</span>
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>{evalResult.passedCount}/{evalResult.totalCount} passed. Fix failures.</span>
                  </span>
                )
              ) : (
                <span>Run test cases to verify logic before submission.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                {isRunningTests ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-blue-500" />}
                <span>Run Tests</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitSolution}
                disabled={isRunningTests}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Submit Solution</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
