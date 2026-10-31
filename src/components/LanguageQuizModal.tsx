import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Award, Sparkles, ChevronRight, RotateCcw, Flame, Trophy, BookOpen, Code2 } from 'lucide-react';
import { Language, QuizQuestion } from '../types';
import { LANGUAGE_QUIZZES } from '../data/quizzes';
import { LANGUAGES } from '../data/languages';
import { gamificationService } from '../services/gamificationService';
import { authService } from '../services/authService';

interface LanguageQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: Language;
  onToast: (msg: string) => void;
  onRequestAuth?: (reason: string) => void;
}

export const LanguageQuizModal: React.FC<LanguageQuizModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'python',
  onToast,
  onRequestAuth
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number;
    langPointsEarned: number;
    newStreak: number;
    isPerfectScore: boolean;
  } | null>(null);

  const currentUser = authService.getCurrentUser();
  const quiz = LANGUAGE_QUIZZES[selectedLanguage] || LANGUAGE_QUIZZES.python;
  const currentQuestion: QuizQuestion = quiz.questions[currentIndex] || quiz.questions[0];
  const langMeta = LANGUAGES[selectedLanguage] || LANGUAGES.python;

  useEffect(() => {
    if (initialLanguage && LANGUAGE_QUIZZES[initialLanguage]) {
      setSelectedLanguage(initialLanguage);
      resetQuizState();
    }
  }, [initialLanguage, isOpen]);

  const resetQuizState = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setIsCompleted(false);
    setCompletionResult(null);
  };

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setIsCompleted(false);
    setCompletionResult(null);
  };

  if (!isOpen) return null;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: selectedOption }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Calculate score and complete
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      const ans = idx === currentIndex ? selectedOption : userAnswers[idx];
      if (ans === q.correctIndex) {
        correct += 1;
      }
    });

    if (currentUser) {
      const result = gamificationService.recordLanguageQuizCompletion(
        selectedLanguage,
        correct,
        quiz.questions.length
      );
      setCompletionResult(result);
      onToast(`Quiz completed! +${result.langPointsEarned} ${langMeta.name} Points & +${result.xpEarned} XP`);
    } else {
      setCompletionResult({
        xpEarned: 0,
        langPointsEarned: correct * 15,
        newStreak: 0,
        isPerfectScore: correct === quiz.questions.length
      });
      onToast(`Quiz finished! Score: ${correct}/${quiz.questions.length}`);
    }

    setIsCompleted(true);
  };

  // Score calculation for completion screen
  const calculateFinalScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });
    return correct;
  };

  const score = isCompleted ? calculateFinalScore() : 0;
  const percentage = Math.round((score / quiz.questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${langMeta.color} border border-slate-200 shadow-2xs`}>
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{quiz.languageName} 10-Question Mastery Quiz</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                  10 Qs • +15 pts/Q
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Earn real language points, level up skill mastery, and maintain your streak.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs Selector */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 overflow-x-auto flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Language:
          </span>
          {(Object.keys(LANGUAGE_QUIZZES) as Language[]).map((langKey) => {
            const isSelected = selectedLanguage === langKey;
            const meta = LANGUAGES[langKey] || { name: langKey };
            return (
              <button
                key={langKey}
                type="button"
                onClick={() => handleSelectLanguage(langKey)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {meta.name}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {!isCompleted ? (
            <>
              {/* Progress Bar & Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                      Question {currentIndex + 1} of {quiz.questions.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                      {currentQuestion.topic}
                    </span>
                    <span className="text-slate-400 font-normal">
                      • {currentQuestion.difficulty}
                    </span>
                  </div>

                  <span className="font-mono text-blue-600">
                    +{quiz.pointsPerCorrect} {quiz.languageName} Pts
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </p>

                {/* Code Snippet Box */}
                {currentQuestion.codeSnippet && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-900 text-slate-100 p-3.5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-inner">
                    <pre className="whitespace-pre">{currentQuestion.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select the correct answer:
                </label>

                {currentQuestion.options.map((option, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let optionStyle = 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/30';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                    } else if (isChosen && !isCorrect) {
                      optionStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-semibold ring-1 ring-rose-500';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isChosen) {
                    optionStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-medium ring-1 ring-blue-600';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isAnswerSubmitted && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswerSubmitted && isChosen && !isCorrect
                          ? 'bg-rose-600 text-white'
                          : isChosen
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>

                      <span className="flex-1 leading-relaxed font-mono text-xs sm:text-sm">
                        {option}
                      </span>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed animate-in fade-in duration-200 ${
                  selectedOption === currentQuestion.correctIndex
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/70 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {selectedOption === currentQuestion.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct! +15 {quiz.languageName} Points</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 mt-1 font-normal">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Quiz Completion View */
            <div className="py-6 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Trophy className="w-9 h-9 text-amber-500" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {quiz.languageName} Quiz Completed!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  You scored <span className="font-bold text-blue-600">{score}</span> out of{' '}
                  <span className="font-bold text-slate-800">{quiz.questions.length}</span> ({percentage}%)
                </p>
              </div>

              {/* Points & Rewards Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Language Points</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600 font-mono mt-1">
                    +{score * quiz.pointsPerCorrect}
                  </p>
                  <p className="text-[10px] text-slate-500">{quiz.languageName} Mastery</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase">XP Gained</p>
                  <p className="text-lg sm:text-xl font-bold text-amber-600 font-mono mt-1">
                    +{completionResult?.xpEarned || score * 10}
                  </p>
                  <p className="text-[10px] text-slate-500">Global Developer Level</p>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Coding Streak</p>
                  <div className="flex items-center justify-center gap-1 mt-1 text-orange-600 font-bold text-lg sm:text-xl font-mono">
                    <Flame className="w-4 h-4 fill-orange-500" />
                    <span>{completionResult?.newStreak || 1}d</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Active Developer</p>
                </div>
              </div>

              {!currentUser && (
                <div className="max-w-md mx-auto p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <p className="font-semibold">Sign in to save your points permanently!</p>
                  <p className="mt-0.5 text-slate-600">
                    Guest points are saved in temporary browser storage. Sign in with Google to showcase your skill points on your public profile.
                  </p>
                  {onRequestAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRequestAuth('Sign in to save quiz points and climb the developer leaderboard');
                      }}
                      className="mt-2.5 px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 cursor-pointer"
                    >
                      Sign In Now
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {!isCompleted ? (
            <>
              <button
                type="button"
                onClick={resetQuizState}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>

              <div className="flex items-center gap-2">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{currentIndex + 1 < quiz.questions.length ? 'Next Question' : 'View Results'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetQuizState}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
