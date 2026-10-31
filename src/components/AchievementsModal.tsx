import React, { useState, useEffect } from 'react';
import { gamificationService, LevelInfo } from '../services/gamificationService';
import { authService } from '../services/authService';
import { Achievement, UserStats } from '../types';
import { 
  Trophy, Flame, Sparkles, CheckCircle2, Lock, Star, 
  X, Award, TrendingUp, Users, LogIn, Play, ArrowRight,
  UploadCloud, Heart, Bookmark, Globe, Crown, Terminal
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (msg: string) => void;
  onRequestAuth?: (reason: string) => void;
  onOpenDailyGame?: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  onToast: _onToast,
  onRequestAuth,
  onOpenDailyGame
}) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [stats, setStats] = useState<UserStats | null>(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() => gamificationService.getLevelInfo());
  const [achievements, setAchievements] = useState<Achievement[]>(() => gamificationService.getAchievements());
  const [isGameCompletedToday, setIsGameCompletedToday] = useState(() => gamificationService.isDailyGameCompletedToday());
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [filterCategory, setFilterCategory] = useState<'all' | 'creator' | 'learner' | 'community'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(authService.getCurrentUser());
      setStats(gamificationService.getStats());
      setLevelInfo(gamificationService.getLevelInfo());
      setAchievements(gamificationService.getAchievements());
      setIsGameCompletedToday(gamificationService.isDailyGameCompletedToday());
    };

    window.addEventListener('codeself_gamification_updated', handleUpdate);
    window.addEventListener('codeshelf_auth_changed', handleUpdate);

    return () => {
      window.removeEventListener('codeself_gamification_updated', handleUpdate);
      window.removeEventListener('codeshelf_auth_changed', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  // If user is NOT signed in, require authentication to view personal achievements/streak
  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-center text-slate-900 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4 shadow-sm">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Sign In Required
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Streaks, milestones, badges, and leaderboard rankings are exclusive to signed-in developers. Sign in with your Google account to track your real progress.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRequestAuth) onRequestAuth('Sign in with Google to view streaks, badges, and the leaderboard!');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStats = stats || {
    xp: 0,
    level: 1,
    currentStreak: 0,
    highestStreak: 0,
    snippetsUploaded: 0,
    codeRunsCount: 0,
    likesGiven: 0,
    bookmarksCount: 0
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const filteredAchievements = achievements.filter(a => {
    if (filterCategory === 'all') return true;
    return a.category === filterCategory;
  });

  const realLeaderboard = gamificationService.getRealLeaderboard();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'UploadCloud': return <UploadCloud className="w-5 h-5 text-blue-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Globe': return <Globe className="w-5 h-5 text-indigo-600" />;
      case 'Crown': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'Play': return <Play className="w-5 h-5 text-emerald-600" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-cyan-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Bookmark': return <Bookmark className="w-5 h-5 text-blue-500" />;
      default: return <Award className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner with User's Real Level & Streak */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                <Trophy className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Developer Rank & Achievements
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-blue-100">
                  <span className="font-semibold text-yellow-300">Level {levelInfo.level}:</span>
                  <span>{levelInfo.title}</span>
                  <span>·</span>
                  <span className="font-mono text-white font-semibold">{currentStats.xp} XP</span>
                </div>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/20 backdrop-blur-xs text-xs font-semibold">
              <Flame className={`w-4 h-4 ${currentStats.currentStreak > 0 ? 'text-orange-400 fill-orange-400' : 'text-slate-400'}`} />
              <span>{currentStats.currentStreak} Day Streak 🔥</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4 pt-3 border-t border-white/15">
            <div className="flex items-center justify-between text-[11px] text-blue-100 mb-1.5 font-mono">
              <span>Level Progress</span>
              <span>{levelInfo.progressPercent}% ({currentStats.xp} / {levelInfo.maxXP} XP)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-5 text-xs font-medium text-slate-600 gap-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Daily Streak & Stats</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'achievements'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Badges ({unlockedCount}/{achievements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tab 1: Overview & Daily Coding Challenge */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Daily Challenge Interactive Card */}
              <div className="p-4 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                      <Flame className="w-5 h-5 fill-orange-500 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">Today's Coding Challenge</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isGameCompletedToday ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {isGameCompletedToday ? 'Streak Safe ✓' : '+50 XP Available'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {isGameCompletedToday
                          ? "You've solved today's coding puzzle! Your streak is preserved for tomorrow."
                          : "Solve a quick 1-minute coding puzzle (bug hunt or output predictor) to advance your streak."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenDailyGame) onOpenDailyGame();
                    }}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{isGameCompletedToday ? 'Practice Again' : 'Play Today’s Challenge'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Real Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-lg font-bold font-mono text-slate-900">{currentStats.currentStreak}</div>
                  <div className="text-[11px] text-slate-500">Active Streak</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-lg font-bold font-mono text-blue-600">{currentStats.snippetsUploaded}</div>
                  <div className="text-[11px] text-slate-500">Snippets Uploaded</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-lg font-bold font-mono text-emerald-600">{currentStats.codeRunsCount}</div>
                  <div className="text-[11px] text-slate-500">Algorithms Executed</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-lg font-bold font-mono text-purple-600">{currentStats.xp}</div>
                  <div className="text-[11px] text-slate-500">Total XP Points</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Badges */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Badges' },
                  { id: 'creator', label: 'For Creators (अपलोडर)' },
                  { id: 'learner', label: 'For Learners (देखने वाले)' },
                  { id: 'community', label: 'Community' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      filterCategory === cat.id
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAchievements.map(ach => (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                      ach.unlocked
                        ? 'bg-white border-slate-200 shadow-xs ring-1 ring-emerald-500/10'
                        : 'bg-slate-50/70 border-slate-200/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        ach.unlocked ? 'bg-blue-50 border border-blue-100' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {ach.unlocked ? getIcon(ach.iconName) : <Lock className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{ach.title}</h4>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            ach.badgeTier === 'gold'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : ach.badgeTier === 'silver'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {ach.badgeTier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ach.description}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-2 flex-1 mr-3">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              ach.unlocked ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                          />
                        </div>
                        <span>{ach.progress}/{ach.maxProgress}</span>
                      </div>
                      <span className="font-semibold text-amber-600 shrink-0">+{ach.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Real Leaderboard (NO FAKE NAMES) */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Verified Contributors Leaderboard</h3>
                <p className="text-xs text-slate-500">
                  Rankings are strictly computed from real code contributions and completed challenges.
                </p>
              </div>

              {realLeaderboard.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                  <p className="font-semibold text-slate-700">No contributors on the leaderboard yet.</p>
                  <p className="mt-1">Publish a code snippet or solve today's challenge to take the #1 spot!</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {realLeaderboard.map((u) => (
                    <div
                      key={u.name}
                      className={`flex items-center justify-between p-3.5 text-xs transition-colors ${
                        u.isCurrent ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-center font-bold font-mono">
                          {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : `#${u.rank}`}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name[0] || 'D'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900">{u.name}</span>
                            {u.isCurrent && (
                              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">You</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{u.uploads} published snippet{u.uploads !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="font-bold text-blue-600 font-mono text-sm">
                        <span>{u.xp} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
