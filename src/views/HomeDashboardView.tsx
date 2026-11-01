import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Snippet, User } from '../types';
import { authService } from '../services/authService';
import { gamificationService, LevelInfo } from '../services/gamificationService';
import { snippetStorage } from '../services/snippetStorage';
import { communityService, CommunityDiscussion } from '../services/communityService';
import { LANGUAGES } from '../data/languages';
import { 
  Play, BookOpen, Flame, ShieldCheck, Trophy, Sparkles, 
  ArrowRight, Code2, Plus, Bookmark, MessageSquare, 
  CheckCircle2, Compass, Layers, Terminal, ChevronRight,
  ExternalLink, FileCode2
} from 'lucide-react';

interface HomeDashboardViewProps {
  snippets: Snippet[];
  onOpenSubmit: () => void;
  onRequestAuth: (reason: string) => void;
  onToast: (msg: string) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  snippets,
  onOpenSubmit,
  onRequestAuth,
  onToast
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [stats, setStats] = useState(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() => gamificationService.getLevelInfo());
  const [isChallengeCompletedToday, setIsChallengeCompletedToday] = useState(() => gamificationService.isDailyGameCompletedToday());
  const [todayChallenge, setTodayChallenge] = useState(() => gamificationService.getTodayChallenge());
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>(() => communityService.getAllDiscussions().slice(0, 3));

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(authService.getCurrentUser());
      setStats(gamificationService.getStats());
      setLevelInfo(gamificationService.getLevelInfo());
      setIsChallengeCompletedToday(gamificationService.isDailyGameCompletedToday());
      setTodayChallenge(gamificationService.getTodayChallenge());
      setDiscussions(communityService.getAllDiscussions().slice(0, 3));
    };

    window.addEventListener('codeshelf_auth_changed', handleUpdate);
    window.addEventListener('codeshelf_snippets_updated', handleUpdate);
    window.addEventListener('codeself_gamification_updated', handleUpdate);
    window.addEventListener('chullicode_discussions_updated', handleUpdate);

    return () => {
      window.removeEventListener('codeshelf_auth_changed', handleUpdate);
      window.removeEventListener('codeshelf_snippets_updated', handleUpdate);
      window.removeEventListener('codeself_gamification_updated', handleUpdate);
      window.removeEventListener('chullicode_discussions_updated', handleUpdate);
    };
  }, []);

  // User's private bookmarks & own submissions
  const userBookmarks = currentUser 
    ? snippets.filter(s => snippetStorage.isBookmarked(s.id)).slice(0, 4)
    : [];

  const userSubmissions = currentUser
    ? snippets.filter(s => s.userId === currentUser.id || (s.authorEmail && s.authorEmail.toLowerCase() === currentUser.email.toLowerCase())).slice(0, 4)
    : [];

  const recentExploreSnippets = snippets.slice(0, 5);

  const completedLessonsCount = stats?.completedLessons?.length ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const streakSavers = stats?.streakSavers ?? 2;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 py-7 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-7">

        {/* Linear/GitHub-style Dashboard Welcome Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  ChulliCode Dashboard
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500">
                  {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Welcome, Developer'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentUser ? `Ready to continue building, ${currentUser.name.split(' ')[0]}?` : 'Learn by building. Share by helping. Grow together.'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Explore verified code snippets across 9 languages, sharpen your programming fundamentals, solve daily puzzles, and contribute to the community.
              </p>
            </div>

            {/* Quick Stats or Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {currentUser ? (
                <>
                  <Link
                    to="/challenges"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs font-semibold hover:bg-orange-100 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{currentStreak}d Streak</span>
                  </Link>

                  <Link
                    to="/challenges"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-xs font-semibold hover:bg-teal-100 transition-colors"
                    title="Streak Savers shield your streak if you miss 1 day"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{streakSavers} Savers</span>
                  </Link>

                  <button
                    type="button"
                    onClick={onOpenSubmit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Code</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRequestAuth('Sign in with Google to track coding streaks and build your portfolio.')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In with Google
                  </button>
                  <Link
                    to="/explore"
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Explore Code
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Priority 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (2 Cols wide on desktop): Core Interactive Hubs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hub 1: Continue Learning Track */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Structured Learning Tracks
                  </h2>
                </div>
                <Link
                  to="/learn"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  <span>Open Learning Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Python Fundamentals & Algorithmic Thinking
                    </span>
                    <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.2 rounded">
                      Beginner Track
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Learn variables, control flow, functions, lists, and time complexity with interactive practice and knowledge checks.
                  </p>
                </div>

                <Link
                  to="/learn"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{completedLessonsCount > 0 ? 'Resume Lessons' : 'Start Learning'}</span>
                </Link>
              </div>

              {/* Languages Quick-Jump Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { lang: 'python', name: 'Python', icon: '🐍' },
                  { lang: 'cpp', name: 'C++', icon: '⚡' },
                  { lang: 'sql', name: 'SQL', icon: '🗄️' },
                  { lang: 'javascript', name: 'JavaScript', icon: '📜' }
                ].map((item) => (
                  <Link
                    key={item.lang}
                    to="/learn"
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-xl flex items-center gap-2 text-xs transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Hub 2: Recent Verified Snippets (Explore Code Feed) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Explore Code Snippets
                  </h2>
                </div>
                <Link
                  to="/explore"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  <span>View All in Repository</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentExploreSnippets.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {recentExploreSnippets.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/snippet/${s.id}`)}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 uppercase text-[11px]">
                            {LANGUAGES[s.language]?.name || s.language}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-slate-500 text-[11px]">
                            {s.category}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-slate-400 text-[11px] font-mono">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                          {s.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                          {s.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-slate-400 text-xs font-mono">
                        <span title="Views">👁 {s.views || 0}</span>
                        <span title="Helpful likes">♥ {s.likes || 0}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No snippets found in library yet.</p>
                  <p className="mt-1">Be the first to upload and share an algorithm!</p>
                  <button
                    type="button"
                    onClick={onOpenSubmit}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs"
                  >
                    Submit First Snippet
                  </button>
                </div>
              )}
            </div>

            {/* Hub 3: Developer Community Discussions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Community Questions & Solutions
                  </h2>
                </div>
                <Link
                  to="/community"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  <span>Join Community</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {discussions.map((d) => (
                  <Link
                    key={d.id}
                    to="/community"
                    className="block p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {d.category}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {d.repliesCount} replies · {d.upvotes} upvotes
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {d.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (1 Col wide): Daily Challenge, Bookmarks, and Shortcuts */}
          <div className="space-y-6">

            {/* Daily Challenge Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-orange-500" />
                  <span>Daily Coding Challenge</span>
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isChallengeCompletedToday 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400' 
                    : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400'
                }`}>
                  {isChallengeCompletedToday ? 'Streak Safe ✓' : '+50 XP'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                  [{todayChallenge.language}] {todayChallenge.difficulty}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {todayChallenge.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {todayChallenge.prompt}
                </p>
              </div>

              <Link
                to="/challenges"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>{isChallengeCompletedToday ? 'Practice More Puzzles' : 'Solve Today’s Challenge'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Playground Quick Launch */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Interactive Compiler Playground
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Test algorithms, inspect stdin/stdout, and run multi-language code directly in your browser.
              </p>
              <Link
                to="/playground"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open Playground</span>
              </Link>
            </div>

            {/* User Bookmarks (Private to User) */}
            {currentUser && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                    <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Bookmarks</span>
                  </div>
                  <Link
                    to="/saved"
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View All ({userBookmarks.length})
                  </Link>
                </div>

                {userBookmarks.length > 0 ? (
                  <div className="space-y-1.5">
                    {userBookmarks.map((b) => (
                      <Link
                        key={b.id}
                        to={`/snippet/${b.id}`}
                        className="block p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {b.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {LANGUAGES[b.language]?.name || b.language}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-2">
                    No bookmarks yet. Save useful code while browsing to find it later.
                  </p>
                )}
              </div>
            )}

            {/* Developer Portfolio Quick Card */}
            {currentUser && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                    Developer Portfolio
                  </h3>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Rank: Level {levelInfo.level}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{stats?.xp ?? 0} XP</span>
                </div>
                <Link
                  to="/profile"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  <span>Edit Profile & Portfolio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
