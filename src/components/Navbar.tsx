import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ActiveTeamSession } from '../types';
import { authService } from '../services/authService';
import { teamService } from '../services/teamService';
import { Plus, Bookmark, Code2, LogIn, LogOut, FolderCode, Users, Flame, Trophy, ShieldAlert, Flag, Sparkles, User as UserIcon } from 'lucide-react';
import { CodeSelfLogo } from './CodeSelfLogo';
import { gamificationService } from '../services/gamificationService';
import { reportService } from '../services/reportService';

interface NavbarProps {
  onOpenSubmit: () => void;
  onOpenAuth: () => void;
  onOpenTeam: (tab?: 'join' | 'create' | 'active') => void;
  onOpenAchievements?: () => void;
  onOpenDailyGame?: () => void;
  onOpenReport?: (config?: { type: 'website' | 'snippet'; snippetId?: string; snippetTitle?: string; snippetLanguage?: string }) => void;
  onOpenAdminReports?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmit,
  onOpenAuth,
  onOpenTeam,
  onOpenAchievements,
  onOpenDailyGame,
  onOpenReport,
  onOpenAdminReports
}) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [activeTeam, setActiveTeam] = useState<ActiveTeamSession | null>(() => teamService.getActiveTeam());
  const [userStats, setUserStats] = useState(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState(() => gamificationService.getLevelInfo());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(() => reportService.getPendingCount());
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.email?.toLowerCase() === 'shakti14112008@gmail.com';

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
      setActiveTeam(teamService.getActiveTeam());
    };

    const handleTeamChange = (e: any) => {
      setActiveTeam(e?.detail?.session ?? teamService.getActiveTeam());
    };

    const handleGamificationChange = () => {
      setUserStats(gamificationService.getStats());
      setLevelInfo(gamificationService.getLevelInfo());
    };

    const handleReportsUpdate = () => {
      setPendingReportsCount(reportService.getPendingCount());
    };

    window.addEventListener('codeshelf_auth_changed', handleAuthChange);
    window.addEventListener('codeshelf_snippets_updated', handleAuthChange);
    window.addEventListener('codeshelf_team_changed', handleTeamChange as EventListener);
    window.addEventListener('codeself_gamification_updated', handleGamificationChange);
    window.addEventListener('codeself_level_up', handleGamificationChange);
    window.addEventListener('codeself_reports_updated', handleReportsUpdate);

    return () => {
      window.removeEventListener('codeshelf_auth_changed', handleAuthChange);
      window.removeEventListener('codeshelf_snippets_updated', handleAuthChange);
      window.removeEventListener('codeshelf_team_changed', handleTeamChange as EventListener);
      window.removeEventListener('codeself_gamification_updated', handleGamificationChange);
      window.removeEventListener('codeshelf_level_up', handleGamificationChange);
      window.removeEventListener('codeself_reports_updated', handleReportsUpdate);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenSignOutModal = () => {
    setIsUserMenuOpen(false);
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    authService.logout();
  };

  const navLinks = [
    { to: '/', label: 'Library' },
    { to: '/learn', label: 'Learn' },
    { to: '/playground', label: 'Playground' },
    { to: '/saved', label: 'Bookmarks' },
    { to: '/my-snippets', label: 'My Submissions' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-slate-900 whitespace-nowrap shrink-0 group py-1"
        >
          <CodeSelfLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              CodeSelf
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 mt-1 hidden sm:block">
              Powered by <span className="font-semibold text-blue-600">ChulliTech</span>
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Auto-adapting to screen width) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Rewards & Daily Streak Button */}
          {onOpenAchievements && (
            <button
              type="button"
              onClick={onOpenAchievements}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0 group"
              title={`Level ${levelInfo.level}: ${levelInfo.title} • ${userStats?.xp ?? 0} XP • Click to open Rewards & Daily Quests`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-orange-600">{userStats?.currentStreak ?? 0}d</span>
              <span className="text-amber-300 hidden md:inline">|</span>
              <span className="hidden md:inline font-mono font-medium text-amber-800">Lv.{levelInfo.level}</span>
            </button>
          )}

          {/* Admin Reports Panel Trigger (Adaptive icon badge) */}
          {isAdmin && onOpenAdminReports && (
            <button
              type="button"
              onClick={onOpenAdminReports}
              className="relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Admin Reports Management"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden 2xl:inline">Admin Reports</span>
              {pendingReportsCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingReportsCount}
                </span>
              )}
            </button>
          )}

          {/* Daily Challenge Quick Button (Desktop only, otherwise in menu) */}
          {currentUser && onOpenDailyGame && (
            <button
              type="button"
              onClick={onOpenDailyGame}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Play Today's Coding Puzzle (+50 XP)"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Daily Puzzle</span>
            </button>
          )}

          {/* Team Workspace Button: EXCLUSIVELY for Guest Users (Hidden when signed in) */}
          {!currentUser && (
            <button
              type="button"
              onClick={() => onOpenTeam('join')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Join with Team ID & PIN or Create a Workspace"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Workspace</span>
            </button>
          )}

          {/* Submit Code Button (Classic Blue, responsive label) */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Submit Code</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* User Profile or Sign-in button */}
          {currentUser ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 py-1 px-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
                title={`${currentUser.name} (${currentUser.email})`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-100"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden 2xl:inline-block text-xs font-medium text-slate-800 max-w-[95px] truncate">
                  {currentUser.name}
                </span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate flex-1">
                        <p className="font-semibold text-slate-900 truncate text-sm">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Role: {currentUser.isVerified ? 'Admin' : (currentUser.role || 'Contributor')}
                        </p>
                      </div>
                    </div>
                    {currentUser.provider === 'google' && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>Google Account Connected</span>
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    {/* My Profile Page Option */}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>My Profile & Settings</span>
                    </Link>

                    <Link
                      to="/my-snippets"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <FolderCode className="w-4 h-4 text-slate-400" />
                      <span>My Submissions</span>
                    </Link>

                    <Link
                      to="/saved"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>Bookmarked Snippets</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenTeam('create');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Workspace / Teams</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenDailyGame) onOpenDailyGame();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Daily Coding Challenge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenReport) onOpenReport({ type: 'website' });
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                    >
                      <Flag className="w-4 h-4 text-slate-400" />
                      <span>Report Website / Bug</span>
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenAdminReports) onOpenAdminReports();
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-rose-700 bg-rose-50/50 hover:bg-rose-50 transition-colors text-left cursor-pointer font-medium"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>Admin Reports Dashboard</span>
                        </div>
                        {pendingReportsCount > 0 && (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                            {pendingReportsCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleOpenSignOutModal}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowSignOutModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-slate-900 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <LogOut className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Sign Out
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to sign out?
            </p>
            {currentUser && (
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate font-medium">{currentUser.email}</span>
              </div>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              You can sign back in anytime to submit unlimited snippets and access your bookmarks.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
