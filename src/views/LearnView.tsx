import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSES } from '../data/courses';
import { LANGUAGE_QUIZZES } from '../data/quizzes';
import { LANGUAGES } from '../data/languages';
import { CourseTrack, Lesson, Language } from '../types';
import { gamificationService } from '../services/gamificationService';
import { authService } from '../services/authService';
import { 
  BookOpen, Play, CheckCircle2, ChevronRight, Award, Trophy, 
  Flame, Sparkles, Check, ArrowRight, Code2, HelpCircle, Lightbulb, Clock
} from 'lucide-react';

interface LearnViewProps {
  onToast: (msg: string) => void;
  onRequestAuth?: (reason: string) => void;
  onOpenQuiz?: (language: Language) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  onToast,
  onRequestAuth,
  onOpenQuiz
}) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [activeCourseId, setActiveCourseId] = useState<string>(COURSES[0].id);
  const [activeLessonId, setActiveLessonId] = useState<string>(COURSES[0].modules[0].lessons[0].id);

  // Gamification stats
  const [stats, setStats] = useState(() => gamificationService.getStats());
  const [languagePoints, setLanguagePoints] = useState(() => gamificationService.getLanguagePoints());

  // Interactive inline question state for current lesson
  const [inlineAnswerSelected, setInlineAnswerSelected] = useState<number | null>(null);
  const [inlineSubmitted, setInlineSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const handleGamification = () => {
      setStats(gamificationService.getStats());
      setLanguagePoints(gamificationService.getLanguagePoints());
    };

    window.addEventListener('codeself_gamification_updated', handleGamification);
    return () => {
      window.removeEventListener('codeself_gamification_updated', handleGamification);
    };
  }, []);

  const activeCourse = COURSES.find((c) => c.id === activeCourseId) || COURSES[0];

  // Flatten lessons for current course to find active lesson and handle next/prev
  const allLessonsInCourse: { lesson: Lesson; moduleTitle: string }[] = [];
  activeCourse.modules.forEach((mod) => {
    mod.lessons.forEach((l) => {
      allLessonsInCourse.push({ lesson: l, moduleTitle: mod.title });
    });
  });

  const activeLessonIndex = allLessonsInCourse.findIndex((item) => item.lesson.id === activeLessonId);
  const currentLessonItem = allLessonsInCourse[activeLessonIndex >= 0 ? activeLessonIndex : 0];
  const currentLesson = currentLessonItem?.lesson || activeCourse.modules[0].lessons[0];

  // Reset practice question state when lesson changes
  useEffect(() => {
    setInlineAnswerSelected(null);
    setInlineSubmitted(false);
  }, [activeLessonId]);

  const completedLessonIds = stats?.completedLessons || [];
  const isCurrentLessonCompleted = completedLessonIds.includes(currentLesson.id);

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const target = COURSES.find((c) => c.id === courseId);
    if (target && target.modules[0]?.lessons[0]) {
      setActiveLessonId(target.modules[0].lessons[0].id);
    }
  };

  const handleMarkComplete = () => {
    if (!currentUser) {
      if (onRequestAuth) {
        onRequestAuth('Sign in to track course completion and earn skill mastery points');
      } else {
        onToast('Please sign in to track completed lessons.');
      }
      return;
    }

    const res = gamificationService.recordLessonCompletion(currentLesson.id, activeCourse.language);
    if (res.xpEarned > 0) {
      onToast(`Lesson completed! +${res.xpEarned} XP & +20 ${LANGUAGES[activeCourse.language]?.name || ''} Points!`);
    } else {
      onToast('Lesson marked as completed.');
    }
  };

  const handleRunInPlayground = (code: string, language: Language) => {
    // Navigate to playground with preloaded code state in session
    sessionStorage.setItem('codeself_playground_code', code);
    sessionStorage.setItem('codeself_playground_lang', language);
    navigate('/playground');
  };

  const handleLaunchQuiz = () => {
    if (onOpenQuiz) {
      onOpenQuiz(activeCourse.language);
    } else {
      window.dispatchEvent(
        new CustomEvent('codeself_open_quiz', { detail: { language: activeCourse.language } })
      );
    }
  };

  // Calculate course completion progress
  const courseLessonsTotal = allLessonsInCourse.length;
  const courseLessonsDone = allLessonsInCourse.filter((item) =>
    completedLessonIds.includes(item.lesson.id)
  ).length;
  const courseProgressPercent = courseLessonsTotal > 0 ? Math.round((courseLessonsDone / courseLessonsTotal) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Hero Learning Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Structured Coding Curriculum & Interactive Labs</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Master Developer Fundamentals & Real-World Code
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Step-by-step programming tracks from beginner syntax to professional algorithms.
            Run live code directly in our built-in playground, test your comprehension with interactive checks,
            and earn certified skill points on 10-question comprehensive quizzes.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-white font-mono">{completedLessonIds.length}</strong> Lessons Completed
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white font-mono">
                  {Object.values(languagePoints).reduce((acc, v) => acc + (v || 0), 0)}
                </strong> Language Points
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>
                <strong className="text-white font-mono">{stats?.currentStreak ?? 0}d</strong> Streak
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Language Course Tracks Selector Bar */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Select Programming Track
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {COURSES.length} Comprehensive Tracks Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COURSES.map((course) => {
            const isSelected = course.id === activeCourseId;
            const lang = LANGUAGES[course.language] || { name: course.language, color: 'text-slate-700 dark:text-slate-300' };
            const pts = languagePoints[course.language] || 0;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => handleSelectCourse(course.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-xs font-bold ${lang.color}`}>
                      {lang.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {course.title.replace(' Mastery from Scratch', '')}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{course.modules.reduce((a, m) => a + m.lessons.length, 0)} Lessons</span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{pts} pts</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Course Curriculum & Lesson Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modules & Lessons Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeCourse.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{activeCourse.tagline}</p>
            </div>
          </div>

          {/* Track Progress Indicator */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Track Progress</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{courseProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${courseProgressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {courseLessonsDone} of {courseLessonsTotal} lessons completed
            </p>
          </div>

          {/* Module List Accordion */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {activeCourse.modules.map((module) => (
              <div key={module.id} className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider px-1">
                  {module.title}
                </p>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isSelected = lesson.id === activeLessonId;
                    const isDone = completedLessonIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                            : isDone
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            />
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isSelected ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        <span
                          className={`text-[10px] shrink-0 font-mono ${
                            isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Certification Quiz CTA */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLaunchQuiz}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer group"
            >
              <Award className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Take 10-Question Certification Quiz</span>
            </button>
          </div>
        </div>

        {/* Right Column: Active Lesson Reader & Interactive Lab (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Lesson Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {currentLessonItem?.moduleTitle || activeCourse.title}
              </span>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentLesson.duration}
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+25 XP Completion</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentLesson.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentLesson.summary}
            </p>
          </div>

          {/* Formatted Theory & Concept Markdown Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
            {currentLesson.contentMarkdown.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 pt-1">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('```')) {
                const lines = paragraph.split('\n');
                const codeOnly = lines.slice(1, -1).join('\n');
                return (
                  <div key={idx} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-x-auto shadow-inner">
                    <pre>{codeOnly}</pre>
                  </div>
                );
              }
              return (
                <p key={idx} className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Live Code Lab Box with Run in Playground Button */}
          {currentLesson.codeExample && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Interactive Code Sample ({LANGUAGES[activeCourse.language]?.name})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunInPlayground(currentLesson.codeExample!, activeCourse.language)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run in Playground</span>
                </button>
              </div>

              <div className="p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                <pre className="text-emerald-400 whitespace-pre">{currentLesson.codeExample}</pre>
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Key Concepts & Takeaways</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200 pl-5 list-disc">
                {currentLesson.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Checkpoint / Practice Check Question */}
          {currentLesson.practiceCheck && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Quick Comprehension Check</span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                {currentLesson.practiceCheck.question}
              </p>

              <div className="space-y-2">
                {currentLesson.practiceCheck.options.map((opt, idx) => {
                  const isSelected = inlineAnswerSelected === idx;
                  const isCorrect = idx === currentLesson.practiceCheck!.correctIndex;

                  let style = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400';
                  if (inlineSubmitted) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300 font-semibold';
                    } else {
                      style = 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500';
                    }
                  } else if (isSelected) {
                    style = 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 font-medium';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={inlineSubmitted}
                      onClick={() => setInlineAnswerSelected(idx)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                      {inlineSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!inlineSubmitted ? (
                <button
                  type="button"
                  disabled={inlineAnswerSelected === null}
                  onClick={() => setInlineSubmitted(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Check Answer
                </button>
              ) : (
                <div className="text-xs p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
                    {inlineAnswerSelected === currentLesson.practiceCheck.correctIndex
                      ? '🎯 Spot on!'
                      : '💡 Review:'}
                  </p>
                  <p>{currentLesson.practiceCheck.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Footer: Mark Complete, Next Lesson & Certification Quiz */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkComplete}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isCurrentLessonCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isCurrentLessonCompleted ? 'Lesson Completed ✓' : 'Mark as Complete (+25 XP)'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeLessonIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveLessonId(allLessonsInCourse[activeLessonIndex - 1].lesson.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Previous
                </button>
              )}

              {activeLessonIndex < allLessonsInCourse.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveLessonId(allLessonsInCourse[activeLessonIndex + 1].lesson.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunchQuiz}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Start Certification Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
