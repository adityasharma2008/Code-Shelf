import React, { useState, useEffect } from 'react';
import { gamificationService } from '../services/gamificationService';
import { authService } from '../services/authService';
import { CodingGameChallenge } from '../types';
import { 
  Flame, CheckCircle2, XCircle, Play, ArrowRight, RotateCcw, 
  Sparkles, Award, Lock, X, HelpCircle, Code2, MoveUp, MoveDown, Check
} from 'lucide-react';

interface DailyCodingGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onRequestAuth: (reason: string) => void;
}

export const DailyCodingGameModal: React.FC<DailyCodingGameModalProps> = ({
  isOpen,
  onClose,
  onToast,
  onRequestAuth
}) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [challenge, setChallenge] = useState<CodingGameChallenge>(() => gamificationService.getTodayChallenge());
  const [isCompletedToday, setIsCompletedToday] = useState(() => gamificationService.isDailyGameCompletedToday());

  // Interactive Game State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // For code assembly game
  const [assembledOrder, setAssembledOrder] = useState<string[]>([]);

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(authService.getCurrentUser());
      setIsCompletedToday(gamificationService.isDailyGameCompletedToday());
    };
    window.addEventListener('codeshelf_auth_changed', handleAuth);
    return () => window.removeEventListener('codeshelf_auth_changed', handleAuth);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const c = gamificationService.getTodayChallenge();
      setChallenge(c);
      setIsCompletedToday(gamificationService.isDailyGameCompletedToday());
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsCorrect(false);

      if (c.type === 'code_assembly' && c.scrambledLines) {
        setAssembledOrder([...c.scrambledLines]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Move line up in code assembly
  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    setAssembledOrder(prev => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx - 1];
      arr[idx - 1] = temp;
      return arr;
    });
  };

  // Move line down in code assembly
  const handleMoveDown = (idx: number) => {
    if (idx === assembledOrder.length - 1) return;
    setAssembledOrder(prev => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
      return arr;
    });
  };

  const handleSubmit = () => {
    if (!currentUser) {
      onRequestAuth('Please sign in with Google to play and claim your daily coding streak!');
      return;
    }

    if (challenge.type === 'code_assembly') {
      // Check if assembled lines match correct order
      const correctLines = challenge.correctOrder!.map(idx => challenge.scrambledLines![idx]);
      const matches = assembledOrder.every((line, i) => line === correctLines[i]);
      setIsCorrect(matches);
      setIsSubmitted(true);

      if (matches) {
        const res = gamificationService.completeDailyGame(challenge.id);
        if (res.alreadyCompletedToday) {
          onToast('Great job! You had already secured your streak for today.');
        } else {
          onToast(`🔥 Streak advanced to ${res.newStreak} day(s)! +${res.xpEarned} Points awarded!`);
        }
        setIsCompletedToday(true);
      }
      return;
    }

    if (selectedOption === null) return;

    const matches = selectedOption === challenge.correctAnswerIndex;
    setIsCorrect(matches);
    setIsSubmitted(true);

    if (matches) {
      const res = gamificationService.completeDailyGame(challenge.id);
      if (res.alreadyCompletedToday) {
        onToast('Great job! You had already secured your streak for today.');
      } else {
        onToast(`🔥 Streak advanced to ${res.newStreak} day(s)! +${res.xpEarned} Points awarded!`);
      }
      setIsCompletedToday(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 to-amber-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
              <Flame className="w-5 h-5 fill-orange-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Daily Coding Challenge</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                  {challenge.language}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Solve today's puzzle to earn <span className="font-semibold text-orange-600">+{challenge.pointsReward} XP</span> and build your coding streak!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Sign In Alert Banner if guest */}
          {!currentUser && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You must sign in to save your daily streak and earn points.</span>
              </div>
              <button
                type="button"
                onClick={() => onRequestAuth('Sign in with Google to maintain your daily streak!')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Already Completed Status Banner */}
          {isCompletedToday && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You have already completed today's challenge and your streak is safe! You can continue practicing.</span>
            </div>
          )}

          {/* Challenge Prompt */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{challenge.title}</span>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {challenge.difficulty}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {challenge.prompt}
            </p>
          </div>

          {/* Code Snippet Box */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-100 text-xs font-mono p-4 leading-relaxed shadow-inner overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Source Code</span>
              </span>
              <span>{challenge.language}</span>
            </div>
            <pre className="whitespace-pre">{challenge.codeSnippet}</pre>
          </div>

          {/* Interactive Input or Options */}
          {challenge.type === 'code_assembly' ? (
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">
                Arrange lines in correct logical execution order:
              </span>
              <div className="space-y-1.5">
                {assembledOrder.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  >
                    <span className="truncate mr-2">{line}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0 || isSubmitted}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === assembledOrder.length - 1 || isSubmitted}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">
                Choose the correct answer:
              </span>
              <div className="space-y-2">
                {challenge.options?.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const showResult = isSubmitted;
                  const isThisCorrect = idx === challenge.correctAnswerIndex;

                  let style = 'bg-white border-slate-200 hover:border-slate-300 text-slate-700';
                  if (isSelected && !showResult) {
                    style = 'bg-blue-50 border-blue-500 text-blue-900 font-medium ring-1 ring-blue-500';
                  } else if (showResult) {
                    if (isThisCorrect) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isThisCorrect) {
                      style = 'bg-rose-50 border-rose-500 text-rose-900 font-medium';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 cursor-pointer ${style}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1">{opt}</span>
                      {showResult && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showResult && isSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explanation if submitted */}
          {isSubmitted && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
              isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct! +{challenge.pointsReward} XP</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Not quite right. Try again tomorrow!</span>
                  </>
                )}
              </div>
              <p>{challenge.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            {isCompletedToday ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Streak Counted for Today
              </span>
            ) : (
              <span>Only solving increments streak</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={challenge.type !== 'code_assembly' && selectedOption === null}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <span>Submit Solution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
