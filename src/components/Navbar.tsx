import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ActiveTeamSession } from '../types';
import { authService } from '../services/authService';
import { teamService } from '../services/teamService';
import { 
  Plus, Bookmark, Code2, LogIn, LogOut, FolderCode, 
  Users, Flame, Trophy, ShieldAlert, Flag, Sparkles, 
  User as UserIcon, Sun, Moon, Menu, X, BookOpen, 
  Terminal, MessageSquare, Compass, ShieldCheck, Settings, Search
} from 'lucide-react';
import { CodeSelfLogo } from './CodeSelfLogo';
import { gamificationService } from '../services/gamificationService';
import { reportService } from '../services/reportService';
import { useTheme } from '../utils/theme';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenSubmit: () => void;
  onOpenAuth: () => void;
  onOpenTeam: (tab?: 'join' | 'create' | 'active') => void;
  onOpenAchievements?: () => void;
  onOpenDailyGame?: () => void;
  onOpenReport?: (config?: { type: 'website' | 'snippet'; snippetId?: string; snippetTitle?: string; snippetLanguage?: string }) => void;
  onOpenAdminReports?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery = '',
  onSearchChange,
  onOpenSubmit,
  onOpenAuth,
  onOpenTeam,
  onOpenAchievements,
  onOpenDailyGame,
  onOpenReport,
  onOpenAdminReports
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [activeTeam, setActiveTeam] = useState<ActiveTeamSession | null>(() => teamService.getActiveTeam());
  const [userStats, setUserStats] = useState(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState(() => gamificationService.getLevelInfo());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Focus search input on '/' or 'Ctrl+K' / 'Cmd+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || (activeEl as HTMLElement)?.isContentEditable;
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchInputChange = (value: string) => {
    onSearchChange?.(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!['/', '/explore', '/saved', '/my-snippets'].includes(location.pathname)) {
        navigate('/explore');
      }
    } else if (e.key === 'Escape') {
      onSearchChange?.('');
      searchInputRef.current?.blur();
    }
  };

  const handleOpenSignOutModal = () => {
    setIsUserMenuOpen(false);
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    authService.logout();
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore Code' },
    { to: '/learn', label: 'Learn' },
    { to: '/playground', label: 'Playground' },
    { to: '/community', label: 'Community' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-900 dark:text-white whitespace-nowrap shrink-0 group py-1"
          >
            <CodeSelfLogo className="w-8 h-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                ChulliCode
              </span>
              <span className="text-[11px] font-medium tracking-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Powered by Chulli Tech
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap transition-colors py-1 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400' 
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Search Input (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2 sm:mx-4">
          <div className="relative w-full flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search code by title, tag, language..."
              className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden lg:inline-flex items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 absolute right-2 pointer-events-none">
                /
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Theme Toggle (Sun/Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Daily Streak Indicator */}
          <Link
            to="/challenges/daily"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/90 dark:border-amber-800 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0 group"
            title={`Daily Streak: ${userStats?.currentStreak ?? 0} days • Level ${levelInfo.level} • Click to play Today's Daily Coding Challenge`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-orange-600 dark:text-orange-400">{userStats?.currentStreak ?? 0}d</span>
            <span className="text-amber-300 dark:text-amber-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline font-mono font-medium text-amber-800 dark:text-amber-300">Lv.{levelInfo.level}</span>
          </Link>

          {/* Admin Control Center Trigger */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 group"
              title="Admin Control Center"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-bold">Admin</span>
              {pendingReportsCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingReportsCount}
                </span>
              )}
            </Link>
          )}

          {/* Workspace Button for Guests */}
          {!currentUser && (
            <button
              type="button"
              onClick={() => onOpenTeam('join')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Team Workspace"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Workspace</span>
            </button>
          )}

          {/* Primary Submit Code Button */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
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
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate hidden md:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                    <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      <span>Level {levelInfo.level} ({userStats?.xp ?? 0} XP)</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-snippets"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <FolderCode className="w-4 h-4 text-indigo-500" />
                      <span>My Submissions</span>
                    </Link>

                    <Link
                      to="/saved"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span>Saved Bookmarks</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleOpenSignOutModal}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-left cursor-pointer font-medium"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150 text-xs">
          {/* Mobile Global Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search code by title, tag, language..."
              className="w-full pl-8.5 pr-8 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`p-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`p-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 ${
                  location.pathname === '/admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Control</span>
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400">Appearance Theme:</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowSignOutModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to sign out of ChulliCode? Your published snippets remain safe in the community repository.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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
