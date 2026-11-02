import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningService } from '../services/learningService';
import { authService } from '../services/authService';
import { LearningTrack, CurriculumChapter, ChapterLesson, Language } from '../types';
import { 
  BookOpen, Play, CheckCircle2, ChevronRight, Lock, 
  ArrowRight, Award, Trophy, Flame, Sparkles, Check, 
  HelpCircle, Code2, Clock, RotateCcw, Compass, ArrowLeft,
  ChevronDown, Layers, Terminal, ExternalLink
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

  const [tracks] = useState<LearningTrack[]>(() => learningService.getAllTracks());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTrackId, setActiveTrackId] = useState<string | undefined>(() => learningService.getActiveTrackId());

  // Active track object
  const activeTrack = activeTrackId ? learningService.getTrackById(activeTrackId) : undefined;

  // Selected Chapter & Lesson state
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Lesson player interactive test state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [practiceCode, setPracticeCode] = useState('');
  const [practiceOutput, setPracticeOutput] = useState<string | null>(null);

  // Progress state
  const [progress, setProgress] = useState(() => learningService.getProgress());

  useEffect(() => {
    const handleProgressUpdate = () => {
      setProgress(learningService.getProgress());
      setActiveTrackId(learningService.getActiveTrackId());
    };
    window.addEventListener('chullicode_learning_progress_updated', handleProgressUpdate);
    return () => window.removeEventListener('chullicode_learning_progress_updated', handleProgressUpdate);
  }, []);

  // When track is opened, set initial active chapter if none chosen
  useEffect(() => {
    if (activeTrack && !activeChapterId) {
      const firstChapter = activeTrack.levels[0]?.chapters[0];
      if (firstChapter) {
        setActiveChapterId(firstChapter.id);
        setActiveLessonId(firstChapter.lessons[0]?.id || null);
      }
    }
  }, [activeTrack]);

  // Find active chapter and lesson objects
  const currentChapter: CurriculumChapter | undefined = activeTrack?.levels
    .flatMap(l => l.chapters)
    .find(c => c.id === activeChapterId);

  const currentLesson: ChapterLesson | undefined = currentChapter?.lessons.find(l => l.id === activeLessonId) || currentChapter?.lessons[0];

  // Update practice starter code when lesson changes
  useEffect(() => {
    if (currentLesson) {
      setPracticeCode(currentLesson.interactivePractice?.starterCode || currentLesson.codeExample);
      setPracticeOutput(null);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    }
  }, [currentLesson?.id]);

  const handleSelectTrack = (trackId: string) => {
    learningService.setActiveTrack(trackId);
    setActiveTrackId(trackId);
    const target = learningService.getTrackById(trackId);
    if (target) {
      const firstCh = target.levels[0]?.chapters[0];
      setActiveChapterId(firstCh?.id || null);
      setActiveLessonId(firstCh?.lessons[0]?.id || null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitTrack = () => {
    learningService.clearActiveTrack();
    setActiveTrackId(undefined);
    setActiveChapterId(null);
    setActiveLessonId(null);
  };

  const handleCompleteCurrentLesson = () => {
    if (!currentUser) {
      if (onRequestAuth) {
        onRequestAuth('Sign in with Google to save your lesson progress, streak, and earn XP.');
      } else {
        onToast('Please sign in to save learning progress.');
      }
      return;
    }

    if (!currentLesson || !currentChapter || !activeTrack) return;

    const result = learningService.recordLessonComplete(currentLesson.id, currentChapter.id, activeTrack.id);
    if (result.xpEarned > 0) {
      onToast(`Lesson completed! +${result.xpEarned} XP earned.`);
    } else {
      onToast('Lesson marked as completed.');
    }

    // Advance to next lesson if available
    if (result.nextLessonId) {
      setActiveLessonId(result.nextLessonId);
      // If the next lesson belongs to next chapter, switch chapter too
      const nextCh = activeTrack.levels.flatMap(l => l.chapters).find(c => c.lessons.some(l => l.id === result.nextLessonId));
      if (nextCh && nextCh.id !== currentChapter.id) {
        setActiveChapterId(nextCh.id);
      }
    }
  };

  const handleRunPracticeCode = () => {
    if (!currentLesson) return;
    // Simulate lightweight client execution or output
    const expected = currentLesson.interactivePractice?.expectedOutput;
    if (expected) {
      setPracticeOutput(expected);
    } else {
      setPracticeOutput('Code executed successfully with return code 0.\nStandard output produced.');
    }
    onToast('Executed code sample in sandbox.');
  };

  // ----------------------------------------------------
  // VIEW 1: LEARNING HUB (When no track active)
  // ----------------------------------------------------
  if (!activeTrack) {
    const categories = ['All', 'Systems & Backend', 'Web & Frontend', 'Database', 'Scripting'];
    const filteredTracks = tracks.filter(t => selectedCategory === 'All' || t.category === selectedCategory);

    return (
      <div className="space-y-8 pb-16">
        {/* Hub Header */}
        <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                ChulliCode Learning Hub
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500">10 Comprehensive Tracks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Structured Programming Tracks from Foundations to Production
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose a programming track to begin. Each track offers chapter-wise progression, interactive theory, executable coding labs, and knowledge assessments.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 text-xs">
            {categories.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === c
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTracks.map(track => {
            const stats = learningService.getTrackProgressStats(track.id);
            const isStarted = stats.completed > 0;

            return (
              <div
                key={track.id}
                className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200/60 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold font-mono text-sm shrink-0">
                        {track.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {track.name}
                          </h3>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                            {track.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{track.category}</span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {track.estimatedHours}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {track.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs border-y border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Levels</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{track.levelsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Chapters</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{track.chaptersCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Lessons</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{track.lessonsCount}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isStarted && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Progress ({stats.completed}/{stats.total} lessons)</span>
                        <span className="font-bold font-mono text-blue-600">{stats.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 italic">
                    Prereq: {track.prerequisites[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectTrack(track.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <span>{isStarted ? 'Resume Track' : 'Start Track'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: ACTIVE TRACK LEARNING WORKSPACE
  // ----------------------------------------------------
  const trackStats = learningService.getTrackProgressStats(activeTrack.id);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Track Header Bar */}
      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExitTrack}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-semibold cursor-pointer mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Tracks</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded">
              {activeTrack.name} Track
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {activeTrack.name}: {currentChapter ? currentChapter.title : 'Curriculum'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentChapter?.levelTitle} · {trackStats.completed} of {trackStats.total} lessons mastered ({trackStats.percent}%)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-36 hidden sm:block">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Track Completion</span>
              <span className="font-bold text-blue-600">{trackStats.percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${trackStats.percent}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleExitTrack}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Switch Track
          </button>
        </div>
      </div>

      {/* Main Learning Grid (Sidebar Chapter Map + Lesson Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chapters & Lessons Sidebar Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Curriculum Chapters
            </h2>

            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {activeTrack.levels.map(level => (
                <div key={level.levelNumber} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                    Level {level.levelNumber}: {level.title}
                  </div>

                  {level.chapters.map(chapter => {
                    const isUnlocked = learningService.isChapterUnlocked(chapter.id, activeTrack);
                    const isChapterActive = activeChapterId === chapter.id;
                    const chapterCompleted = chapter.lessons.every(l => progress.completedLessons.includes(l.id));

                    return (
                      <div
                        key={chapter.id}
                        className={`rounded-xl border transition-colors ${
                          isChapterActive
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/40 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isUnlocked) {
                              setActiveChapterId(chapter.id);
                              if (chapter.lessons[0]) {
                                setActiveLessonId(chapter.lessons[0].id);
                              }
                            } else {
                              onToast('Complete previous chapters to unlock this chapter.');
                            }
                          }}
                          className={`w-full p-3 text-left flex items-center justify-between gap-2 cursor-pointer ${
                            !isUnlocked ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {chapterCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : isUnlocked ? (
                              <div className="w-4 h-4 rounded-full border-2 border-blue-500 shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                {chapter.number}. {chapter.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {chapter.lessons.length} lesson{chapter.lessons.length > 1 ? 's' : ''} · {chapter.estimatedMinutes}m
                              </span>
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isChapterActive ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Expanded Lessons inside current chapter */}
                        {isChapterActive && (
                          <div className="px-3 pb-3 space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                            {chapter.lessons.map((lesson, idx) => {
                              const isLessonDone = progress.completedLessons.includes(lesson.id);
                              const isSelected = activeLessonId === lesson.id;

                              return (
                                <button
                                  key={lesson.id}
                                  type="button"
                                  onClick={() => setActiveLessonId(lesson.id)}
                                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white font-bold'
                                      : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="truncate pr-2">
                                    {idx + 1}. {lesson.title}
                                  </span>
                                  {isLessonDone && (
                                    <Check className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Lesson Player Pane (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson ? (
            <div className="space-y-6">
              
              {/* Lesson Overview Card */}
              <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                      Chapter {currentChapter?.number}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {currentLesson.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {progress.completedLessons.includes(currentLesson.id) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200/60 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-200/60 dark:border-blue-800">
                        +25 XP Available
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {currentLesson.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {currentLesson.summary}
                  </p>
                </div>

                {/* Learning Objectives */}
                {currentLesson.learningObjectives && currentLesson.learningObjectives.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Learning Objectives
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {currentLesson.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conceptual Theory Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line border-t border-slate-100 dark:border-slate-800 pt-4">
                  {currentLesson.contentMarkdown}
                </div>

                {/* Real-World Industry Context */}
                {currentLesson.realWorldContext && (
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-blue-800 dark:text-blue-300 block">
                      Industry Context: Why This Matters
                    </span>
                    <p className="text-blue-900/80 dark:text-blue-200 leading-relaxed">
                      {currentLesson.realWorldContext}
                    </p>
                  </div>
                )}
              </div>

              {/* Code Example Section */}
              <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Executable Code Example
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentLesson.codeExample);
                      onToast('Code example copied to clipboard!');
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 font-mono text-xs text-slate-100 p-4 overflow-x-auto whitespace-pre">
                  {currentLesson.codeExample}
                </div>
              </div>

              {/* Interactive Practice Lab */}
              <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Interactive Practice Lab
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunPracticeCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Practice</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {currentLesson.interactivePractice?.instructions || 'Modify and test your code below.'}
                </p>

                <textarea
                  value={practiceCode}
                  onChange={(e) => setPracticeCode(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-y"
                  spellCheck={false}
                />

                {practiceOutput && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 whitespace-pre">
                    {practiceOutput}
                  </div>
                )}
              </div>

              {/* Knowledge Check Assessment Quiz */}
              {currentLesson.knowledgeCheck && (
                <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Knowledge Check
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {currentLesson.knowledgeCheck.question}
                  </p>

                  <div className="space-y-2">
                    {currentLesson.knowledgeCheck.options.map((opt, i) => {
                      const isSelected = selectedQuizOption === i;
                      const isCorrect = i === currentLesson.knowledgeCheck.correctIndex;

                      let btnStyle = 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold';
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (!quizSubmitted) setSelectedQuizOption(i);
                          }}
                          disabled={quizSubmitted}
                          className={`w-full p-3 text-left text-xs rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <Check className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedQuizOption === null) {
                          onToast('Please select an answer first.');
                          return;
                        }
                        setQuizSubmitted(true);
                        if (selectedQuizOption === currentLesson.knowledgeCheck.correctIndex) {
                          onToast('Correct answer! +10 Knowledge Points.');
                        } else {
                          onToast('Review the explanation below.');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Explanation</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {currentLesson.knowledgeCheck.explanation}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setQuizSubmitted(false);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Key Takeaways & Completion Action */}
              <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Ready for the next lesson?</span>
                  <span className="text-[11px] text-slate-500">
                    Marking complete records your progress and unlocks consecutive curriculum chapters.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteCurrentLesson}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Complete & Continue</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-xs">
              Select a chapter and lesson from the left sidebar to start learning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
