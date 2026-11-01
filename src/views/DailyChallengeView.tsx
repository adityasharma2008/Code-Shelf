import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamificationService, LevelInfo } from '../services/gamificationService';
import { authService } from '../services/authService';
import { CodingGameChallenge, Language, UserStats } from '../types';
import { 
  Flame, ShieldCheck, Trophy, Sparkles, CheckCircle2, XCircle, 
  ArrowLeft, ArrowRight, Play, RotateCcw, Lock, Award, BookOpen, 
  HelpCircle, Code2, MoveUp, MoveDown, Check, Zap, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyChallengeViewProps {
  onToast: (msg: string) => void;
  onRequestAuth: (reason: string) => void;
  onOpenQuiz: (language: Language) => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  onToast,
  onRequestAuth,
  onOpenQuiz
}) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [stats, setStats] = useState<UserStats | null>(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() => gamificationService.getLevelInfo());
  const [isCompletedToday, setIsCompletedToday] = useState(() => gamificationService.isDailyGameCompletedToday());
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Active Challenge in View
  const [allChallenges, setAllChallenges] = useState<CodingGameChallenge[]>(() => gamificationService.getAllTodayChallenges());
  const [activeChallengeId, setActiveChallengeId] = useState<string>('');
  
  // Interactive Answering State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [assembledOrder, setAssembledOrder] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>('');

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

  // Filter challenges by selected language
  const filteredChallenges = selectedLanguage === 'all'
    ? allChallenges
    : allChallenges.filter(c => c.language.toLowerCase() === selectedLanguage.toLowerCase());

  // Set default active challenge
  useEffect(() => {
    if (filteredChallenges.length > 0) {
      const exists = filteredChallenges.some(c => c.id === activeChallengeId);
      if (!exists) {
        const next = filteredChallenges[0];
        setActiveChallengeId(next.id);
        resetStateForChallenge(next);
      }
    }
  }, [selectedLanguage, filteredChallenges, activeChallengeId]);

  const currentChallenge = allChallenges.find(c => c.id === activeChallengeId) || filteredChallenges[0] || allChallenges[0];

  const resetStateForChallenge = (c: CodingGameChallenge) => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    setExplanation('');
    if (c.type === 'code_assembly' && c.scrambledLines) {
      setAssembledOrder([...c.scrambledLines]);
    } else {
      setAssembledOrder([]);
    }
  };

  const handleSelectChallenge = (c: CodingGameChallenge) => {
    setActiveChallengeId(c.id);
    resetStateForChallenge(c);
  };

  // Move line up in code assembly
  const handleMoveUp = (index: number) => {
    if (index <= 0 || isSubmitted) return;
    setAssembledOrder(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move line down in code assembly
  const handleMoveDown = (index: number) => {
    if (index >= assembledOrder.length - 1 || isSubmitted) return;
    setAssembledOrder(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSubmitSolution = () => {
    if (!currentUser) {
      onRequestAuth('Sign in with Google to submit solutions, keep your streak, and earn XP!');
      return;
    }

    if (!currentChallenge) return;

    let correct = false;
    if (currentChallenge.type === 'code_assembly') {
      if (currentChallenge.correctOrder && currentChallenge.scrambledLines) {
        const currentIndices = assembledOrder.map(line => currentChallenge.scrambledLines!.indexOf(line));
        correct = currentIndices.every((val, idx) => val === currentChallenge.correctOrder![idx]);
      }
    } else {
      if (selectedOption === null) {
        onToast('Please select an option before submitting.');
        return;
      }
      correct = selectedOption === currentChallenge.correctAnswerIndex;
    }

    setIsSubmitted(true);
    setIsCorrect(correct);
    setExplanation(currentChallenge.explanation);

    if (correct) {
      const res = gamificationService.completeDailyGame(currentChallenge.id);
      if (res.success) {
        if (!res.alreadyCompletedToday) {
          onToast(`🎉 Correct! +${res.xpEarned} XP awarded! Streak is now ${res.newStreak} day(s)! 🔥`);
        } else {
          onToast(`🎉 Great job! Correct solution! Streak is safe for today.`);
        }
      }
    } else {
      onToast('Incorrect answer. Review the explanation or try again!');
    }
  };

  const quizLanguages: { lang: Language; name: string; icon: string; desc: string }[] = [
    { lang: 'python', name: 'Python', icon: '🐍', desc: 'Slicing, decorators, generators & OOP' },
    { lang: 'cpp', name: 'C++', icon: '⚡', desc: 'Pointers, templates, STL & RAII memory' },
    { lang: 'sql', name: 'SQL', icon: '🗄️', desc: 'Joins, window functions & aggregations' },
    { lang: 'javascript', name: 'JavaScript', icon: '📜', desc: 'Closures, event loop, promises & ES6' },
    { lang: 'typescript', name: 'TypeScript', icon: '🔷', desc: 'Generics, union narrowing & utility types' },
    { lang: 'java', name: 'Java', icon: '☕', desc: 'JVM, memory model, concurrency & collections' },
    { lang: 'csharp', name: 'C#', icon: '🎯', desc: 'LINQ, async/await, structs & delegates' },
    { lang: 'php', name: 'PHP', icon: '🐘', desc: 'Modern PHP 8+, namespaces & type systems' },
    { lang: 'html_css', name: 'HTML & CSS', icon: '🎨', desc: 'Flexbox, Grid, semantic HTML & box model' }
  ];

  const languageFilters = [
    { id: 'all', label: 'All Languages' },
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'sql', label: 'SQL' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'java', label: 'Java' },
    { id: 'typescript', label: 'TypeScript' }
  ];

  const currentStreak = stats?.currentStreak ?? 0;
  const streakSavers = stats?.streakSavers ?? 2;
  const todayDateStr = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Snippet Library</span>
          </Link>

          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Learning Hub</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>{todayDateStr}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Daily Coding Challenge & Certification Hub
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Solve today's coding puzzle or complete a 10-question language quiz to maintain your daily streak, preserve your streak savers, and level up your developer rank.
              </p>
            </div>

            {/* Streak & Protection Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 min-w-[130px] text-center">
                <div className="flex items-center justify-center gap-1 text-orange-600 font-extrabold text-2xl font-mono">
                  <Flame className="w-6 h-6 fill-orange-500" />
                  <span>{currentStreak}d</span>
                </div>
                <div className="text-[11px] font-semibold text-orange-800 mt-0.5">Active Streak</div>
              </div>

              <div 
                className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 min-w-[150px] text-center"
                title="If you miss 1 day, a Streak Saver automatically protects your streak. Miss 2 days and the streak resets to 0."
              >
                <div className="flex items-center justify-center gap-1.5 text-teal-700 font-extrabold text-2xl font-mono">
                  <ShieldCheck className="w-6 h-6 text-teal-600" />
                  <span>{streakSavers}</span>
                </div>
                <div className="text-[11px] font-semibold text-teal-800 mt-0.5">Streak Savers</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 min-w-[130px] text-center">
                <div className="flex items-center justify-center gap-1 text-blue-700 font-extrabold text-2xl font-mono">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Lv.{levelInfo.level}</span>
                </div>
                <div className="text-[11px] font-semibold text-blue-800 mt-0.5">{stats?.xp ?? 0} Total XP</div>
              </div>
            </div>
          </div>

          {/* Daily Status Alert */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCompletedToday ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
              <span className="font-medium text-slate-700">
                Today's Streak Status:
              </span>
              <span className={`font-semibold ${isCompletedToday ? 'text-emerald-700' : 'text-orange-700'}`}>
                {isCompletedToday 
                  ? 'Streak Safe! You have solved today’s puzzle.' 
                  : 'Pending — solve any puzzle below or take a 10-Q quiz to advance your streak.'}
              </span>
            </div>

            {!currentUser && (
              <button
                type="button"
                onClick={() => onRequestAuth('Sign in with Google to save streaks and earn badges.')}
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in to record your streak</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Interactive Coding Puzzle */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <span>Today's Multi-Language Coding Puzzles</span>
              </h2>
              <p className="text-xs text-slate-500">
                Switch between languages below to inspect bugs, predict execution outputs, or assemble logic.
              </p>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {languageFilters.map(filter => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedLanguage(filter.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedLanguage === filter.id
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Puzzle List / Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filteredChallenges.map((c) => {
              const isCurrent = c.id === currentChallenge.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectChallenge(c)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono text-slate-400 mr-1.5">[{c.language}]</span>
                  <span>{c.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Challenge Card */}
          {currentChallenge && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Card Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                      {currentChallenge.language}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      currentChallenge.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentChallenge.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {currentChallenge.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
                      {currentChallenge.type === 'bug_spotter' ? 'Bug Spotter' : currentChallenge.type === 'output_predictor' ? 'Predict Output' : 'Code Assembly'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {currentChallenge.title}
                  </h3>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs shrink-0 self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>+{currentChallenge.pointsReward || 50} XP</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">
                    {currentChallenge.prompt}
                  </h4>

                  {/* Code Block */}
                  {currentChallenge.codeSnippet && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner">
                      <pre className="leading-relaxed">
                        <code>{currentChallenge.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Multiple Choice Options */}
                {currentChallenge.options && currentChallenge.options.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Choose the correct answer:
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentChallenge.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        let optStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';

                        if (isSubmitted) {
                          if (idx === currentChallenge.correctAnswerIndex) {
                            optStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-500/20 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            optStyle = 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-500/20';
                          } else {
                            optStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                          }
                        } else if (isSelected) {
                          optStyle = 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 font-semibold';
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => setSelectedOption(idx)}
                            className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{opt}</span>
                            {isSubmitted && idx === currentChallenge.correctAnswerIndex && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                            {isSubmitted && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Code Assembly Drag/Reorder */}
                {currentChallenge.type === 'code_assembly' && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Reorder the lines using the arrow buttons into the correct logical program:
                    </label>
                    <div className="space-y-1.5 font-mono text-xs">
                      {assembledOrder.map((line, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-900 text-slate-200 border border-slate-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 font-mono w-5 text-right">{idx + 1}</span>
                            <span className="text-emerald-400">{line}</span>
                          </div>
                          {!isSubmitted && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveUp(idx)}
                                disabled={idx === 0}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                title="Move line up"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(idx)}
                                disabled={idx === assembledOrder.length - 1}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                title="Move line down"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation Feedback Card */}
                {isSubmitted && (
                  <div className={`p-4 rounded-xl border ${
                    isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold">
                          {isCorrect ? 'Correct Solution!' : 'Incorrect Attempt'}
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90">
                          {explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => resetStateForChallenge(currentChallenge)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <div className="flex items-center gap-3">
                    {!isSubmitted ? (
                      <button
                        type="button"
                        onClick={handleSubmitSolution}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Submit Solution</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = (allChallenges.findIndex(c => c.id === currentChallenge.id) + 1) % allChallenges.length;
                          handleSelectChallenge(allChallenges[nextIdx]);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Next Coding Puzzle</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: 10-Question Language Certification Quizzes */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Language Certification & Skill Assessment Quizzes (10 Questions Each)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Each 10-question quiz awards language skill points and advances your daily streak. Score 7/10 or higher to earn certification points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizLanguages.map((item) => {
              const quizRecord = stats?.quizzesCompleted?.[item.lang];
              const points = stats?.languagePoints?.[item.lang] ?? 0;

              return (
                <div
                  key={item.lang}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-blue-300 transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-[11px] font-mono text-purple-600 font-semibold">
                            {points} Skill Points
                          </span>
                        </div>
                      </div>

                      {quizRecord && (
                        <div className="text-right">
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            quizRecord.score >= 7 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {quizRecord.score}/{quizRecord.total}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenQuiz(item.lang)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{quizRecord ? 'Retake 10-Q Quiz' : 'Start 10-Q Certification Quiz'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
