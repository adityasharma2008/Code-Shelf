import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Snippet, User } from '../types';
import { authService } from '../services/authService';
import { gamificationService, LevelInfo } from '../services/gamificationService';
import { snippetStorage } from '../services/snippetStorage';
import { communityService, CommunityDiscussion } from '../services/communityService';
import { learningService } from '../services/learningService';
import { 
  Play, BookOpen, Flame, ShieldCheck, Trophy, Sparkles, 
  ArrowRight, Code2, Plus, Bookmark, MessageSquare, 
  CheckCircle2, Compass, Layers, Terminal, ChevronRight,
  Clock, Zap, Check, Lock, Search
} from 'lucide-react';
import { getTodayAlgorithmicChallenge } from '../data/dailyChallengesData';

interface HomeDashboardViewProps {
  snippets: Snippet[];
  onOpenSubmit: () => void;
  onRequestAuth: (reason: string) => void;
  onToast: (msg: string) => void;
  globalSearchQuery?: string;
  onClearSearch?: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  snippets,
  onOpenSubmit,
  onRequestAuth,
  onToast,
  globalSearchQuery,
  onClearSearch
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [stats, setStats] = useState(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() => gamificationService.getLevelInfo());
  const [isChallengeCompletedToday, setIsChallengeCompletedToday] = useState(() => gamificationService.isDailyGameCompletedToday());
  const [todayChallenge, setTodayChallenge] = useState(() => getTodayAlgorithmicChallenge().challenge);
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>(() => communityService.getAllDiscussions().slice(0, 3));
  const [activeTrackId, setActiveTrackId] = useState<string | undefined>(() => learningService.getActiveTrackId());

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(authService.getCurrentUser());
      setStats(gamificationService.getStats());
      setLevelInfo(gamificationService.getLevelInfo());
      setIsChallengeCompletedToday(gamificationService.isDailyGameCompletedToday());
      setTodayChallenge(getTodayAlgorithmicChallenge().challenge);
      setDiscussions(communityService.getAllDiscussions().slice(0, 3));
      setActiveTrackId(learningService.getActiveTrackId());
    };

    window.addEventListener('codeshelf_auth_changed', handleUpdate);
    window.addEventListener('codeshelf_snippets_updated', handleUpdate);
    window.addEventListener('codeself_gamification_updated', handleUpdate);
    window.addEventListener('chullicode_discussions_updated', handleUpdate);
    window.addEventListener('chullicode_learning_progress_updated', handleUpdate);

    return () => {
      window.removeEventListener('codeshelf_auth_changed', handleUpdate);
      window.removeEventListener('codeshelf_snippets_updated', handleUpdate);
      window.removeEventListener('codeself_gamification_updated', handleUpdate);
      window.removeEventListener('chullicode_discussions_updated', handleUpdate);
      window.removeEventListener('chullicode_learning_progress_updated', handleUpdate);
    };
  }, []);

  const activeTrack = activeTrackId ? learningService.getTrackById(activeTrackId) : undefined;
  const activeTrackStats = activeTrackId ? learningService.getTrackProgressStats(activeTrackId) : null;

  // Real bookmarks from current user
  const userBookmarks = currentUser 
    ? snippets.filter(s => snippetStorage.isBookmarked(s.id)).slice(0, 3)
    : [];

  // Real user submissions
  const userSubmissions = currentUser
    ? snippets.filter(s => s.userId === currentUser.id || (s.authorEmail && s.authorEmail.toLowerCase() === currentUser.email.toLowerCase())).slice(0, 3)
    : [];

  const recentRepositorySnippets = snippets.slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar */}
      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              ChulliCode Developer Workspace
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">
              {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Welcome, Developer'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentUser 
              ? `Ready to continue building, ${currentUser.name.split(' ')[0]}?`
              : 'Learn by building. Share by helping. Grow together.'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Explore verified algorithms, master structured programming tracks, test code in the playground, and solve today's challenge.
          </p>
        </div>

        {/* User Stats Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-orange-500 font-bold">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>{stats?.currentStreak ?? 0}d Streak</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="text-amber-600 dark:text-amber-400 font-bold">
              <span>{stats?.xp ?? 0} XP</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="text-blue-600 dark:text-blue-400 font-bold">
              <span>Lv.{levelInfo.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Learning Progress & Challenges (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Continue Learning or Choose Course */}
          {activeTrack ? (
            <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Your Active Learning Track
                  </span>
                </div>
                <Link
                  to="/learn"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Track</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{activeTrack.name} Curriculum</h3>
                    <span className="text-xs text-slate-500">{activeTrack.tagline}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {activeTrackStats?.percent}% Completed
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${activeTrackStats?.percent || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {activeTrackStats?.completed} of {activeTrackStats?.total} interactive lessons completed
                  </span>
                  <Link
                    to="/learn"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
                  >
                    <span>Resume Learning</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Start Your Learning Journey
                  </span>
                </div>
                <Link
                  to="/learn"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Explore All 10 Tracks</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You haven't activated a course yet. Choose a structured programming track from the Learning Hub to learn step-by-step with interactive coding labs and quizzes.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { name: 'Python', id: 'track_python' },
                  { name: 'C++', id: 'track_cpp' },
                  { name: 'Java', id: 'track_java' },
                  { name: 'JavaScript', id: 'track_javascript' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      learningService.setActiveTrack(item.id);
                      navigate('/learn');
                    }}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-xl text-left text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-blue-600 block font-normal">Start Track →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Today's Coding Challenge */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Today's Coding Challenge
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800">
                +50 XP & Streak Shield
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{todayChallenge.title}</h3>
                  <span className="text-xs text-slate-500">{todayChallenge.category} · {todayChallenge.testCases.length} Test Cases</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {todayChallenge.difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                {isChallengeCompletedToday ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed Today! Streak Preserved</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Unsolved today</span>
                )}

                <Link
                  to="/challenges/daily"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  <span>{isChallengeCompletedToday ? 'Review Solution' : 'Solve Challenge'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Section 3: Recent Verified Repository Snippets */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Community Code Snippets
                </span>
              </div>
              <Link
                to="/explore"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Browse All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {globalSearchQuery && (
              <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">
                    Filtering by &ldquo;<strong className="font-semibold">{globalSearchQuery}</strong>&rdquo; ({snippets.length} matching {snippets.length === 1 ? 'snippet' : 'snippets'})
                  </span>
                </div>
                {onClearSearch && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="ml-3 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}

            {recentRepositorySnippets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No snippets published yet. Share your first code snippet.
                </p>
                <button
                  type="button"
                  onClick={onOpenSubmit}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Submit Code
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {recentRepositorySnippets.map(snippet => (
                  <Link
                    key={snippet.id}
                    to={`/snippet/${snippet.id}`}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                          {snippet.title}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded uppercase">
                          {snippet.language}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        By {snippet.author?.name || 'Developer'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 shrink-0 font-mono text-[11px]">
                      <span>{snippet.likes} likes</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions, Bookmarks, Community (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Quick Workspace Actions
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/playground"
                className="p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Terminal className="w-4 h-4 text-blue-500" />
                <span>Playground</span>
              </Link>

              <button
                type="button"
                onClick={onOpenSubmit}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-left"
              >
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Submit Code</span>
              </button>

              <Link
                to="/community"
                className="p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Discussions</span>
              </Link>

              <Link
                to="/saved"
                className="p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Bookmarks</span>
              </Link>
            </div>
          </div>

          {/* Bookmarked Code Section */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Bookmarked Code
                </span>
              </div>
              <Link
                to="/saved"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </Link>
            </div>

            {userBookmarks.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                Your bookmarks will appear here when you save useful code.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {userBookmarks.map(b => (
                  <Link
                    key={b.id}
                    to={`/snippet/${b.id}`}
                    className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{b.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{b.language}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Technical Discussions */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Discussions
                </span>
              </div>
              <Link
                to="/community"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Join Chat
              </Link>
            </div>

            {discussions.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                No discussions yet. Start the first conversation.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {discussions.map(d => (
                  <Link
                    key={d.id}
                    to="/community"
                    className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{d.title}</span>
                      <span className="text-[10px] text-slate-400">By {d.authorName} · {d.repliesCount} replies</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded shrink-0">
                      {d.category}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
