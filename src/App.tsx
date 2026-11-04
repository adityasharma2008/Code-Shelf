import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Snippet, Language } from './types';
import { snippetStorage } from './services/snippetStorage';
import { firebaseService } from './services/firebase';
import { authService } from './services/authService';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { SubmitSnippetModal } from './components/SubmitSnippetModal';
import { TeamWorkspaceModal } from './components/TeamWorkspaceModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CodeSelfLogo } from './components/CodeSelfLogo';
import { AchievementsModal } from './components/AchievementsModal';
import { DailyCodingGameModal } from './components/DailyCodingGameModal';
import { LanguageQuizModal } from './components/LanguageQuizModal';
import { ReportModal } from './components/ReportModal';
import { AdminReportsModal } from './components/AdminReportsModal';
import { ReportType } from './types';

import { LibraryView } from './views/LibraryView';
import { HomeDashboardView } from './views/HomeDashboardView';
import { CommunityView } from './views/CommunityView';
import { LearnView } from './views/LearnView';
import { SnippetDetailView } from './views/SnippetDetailView';
import { PlaygroundView } from './views/PlaygroundView';
import { SavedView } from './views/SavedView';
import { MySnippetsView } from './views/MySnippetsView';
import { ProfileView } from './views/ProfileView';
import { DailyChallengeView } from './views/DailyChallengeView';
import { GooglePopupView } from './views/GooglePopupView';
import { AdminControlCenterView } from './views/AdminControlCenterView';
import { useLocation } from 'react-router-dom';
import { getInitialTheme, applyTheme } from './utils/theme';

export function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // App-level state (starts empty or with real user submissions)
  const [snippets, setSnippets] = useState<Snippet[]>(() => snippetStorage.getAllSnippets());
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global search filtering across snippet title, language, tags, author, category, description
  const filteredSnippets = React.useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return snippets;
    return snippets.filter(s => {
      if (!s) return false;
      const titleMatch = (s.title || '').toLowerCase().includes(q);
      const langMatch = (s.language || '').toLowerCase().includes(q);
      const tagsMatch = Array.isArray(s.tags) && s.tags.some(t => (t || '').toLowerCase().includes(q));
      const descMatch = (s.description || '').toLowerCase().includes(q);
      const authorMatch = (s.author?.name || '').toLowerCase().includes(q);
      const catMatch = (s.category || '').toLowerCase().includes(q);
      return titleMatch || langMatch || tagsMatch || descMatch || authorMatch || catMatch;
    });
  }, [snippets, globalSearchQuery]);

  // Modals
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [teamModalTab, setTeamModalTab] = useState<'join' | 'create' | 'active'>('join');
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizLanguage, setQuizLanguage] = useState<Language>('python');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAdminReportsOpen, setIsAdminReportsOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<{
    type: ReportType;
    snippetId?: string;
    snippetTitle?: string;
    snippetLanguage?: string;
  }>({ type: 'website' });

  // Initialize user's preferred light or dark theme
  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  // Sync snippets when updated in storage or when authentication state changes
  useEffect(() => {
    const handleSnippetsUpdated = () => {
      setSnippets([...snippetStorage.getAllSnippets()]);
    };

    const handleOpenAchievements = () => setIsAchievementsOpen(true);
    const handleOpenDailyGame = () => setIsGameOpen(true);
    const handleOpenReportEvent = (e: any) => {
      if (e?.detail) {
        setReportConfig(e.detail);
      } else {
        setReportConfig({ type: 'website' });
      }
      setIsReportOpen(true);
    };
    const handleOpenAdminReports = () => setIsAdminReportsOpen(true);
    const handleStreakSaved = () => {
      showToast('🛡️ Streak Saver Activated! Missed 1 day was automatically protected by your shield.');
    };
    const handleStreakBroken = () => {
      showToast('⚠️ Streak Reset! Inactivity for 2+ consecutive days reset your streak counter.');
    };
    const handleOpenQuizEvent = (e: any) => {
      if (e?.detail?.language) {
        setQuizLanguage(e.detail.language);
      }
      setIsQuizOpen(true);
    };

    window.addEventListener('codeshelf_snippets_updated', handleSnippetsUpdated);
    window.addEventListener('codeshelf_snippet_deleted', handleSnippetsUpdated);
    window.addEventListener('codeshelf_auth_changed', handleSnippetsUpdated);
    window.addEventListener('codeself_open_achievements', handleOpenAchievements);
    window.addEventListener('codeself_open_daily_game', handleOpenDailyGame);
    window.addEventListener('codeself_open_quiz', handleOpenQuizEvent as EventListener);
    window.addEventListener('codeself_open_report', handleOpenReportEvent as EventListener);
    window.addEventListener('codeself_open_admin_reports', handleOpenAdminReports);
    window.addEventListener('codeself_streak_saved', handleStreakSaved);
    window.addEventListener('codeself_streak_broken', handleStreakBroken);

    return () => {
      window.removeEventListener('codeshelf_snippets_updated', handleSnippetsUpdated);
      window.removeEventListener('codeshelf_snippet_deleted', handleSnippetsUpdated);
      window.removeEventListener('codeshelf_auth_changed', handleSnippetsUpdated);
      window.removeEventListener('codeself_open_achievements', handleOpenAchievements);
      window.removeEventListener('codeself_open_daily_game', handleOpenDailyGame);
      window.removeEventListener('codeself_open_quiz', handleOpenQuizEvent as EventListener);
      window.removeEventListener('codeself_open_report', handleOpenReportEvent as EventListener);
      window.removeEventListener('codeself_open_admin_reports', handleOpenAdminReports);
      window.removeEventListener('codeself_streak_saved', handleStreakSaved);
      window.removeEventListener('codeself_streak_broken', handleStreakBroken);
    };
  }, []);

  // Realtime subscription to Firebase Cloud Firestore snippets
  useEffect(() => {
    try {
      const unsubscribe = firebaseService.subscribeSnippets(cloudSnippets => {
        if (Array.isArray(cloudSnippets) && cloudSnippets.length > 0) {
          snippetStorage.syncFromCloud(cloudSnippets);
        }
      });
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.warn('Firebase realtime subscription initialization:', err);
    }
  }, []);

  // Sync Firebase authenticated session across reloads
  useEffect(() => {
    try {
      const unsubscribe = firebaseService.onAuthStateChange(fbUser => {
        if (fbUser) {
          const current = authService.getCurrentUser();
          if (!current || current.id !== fbUser.uid) {
            authService.loginWithGoogleProfile({
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Developer',
              email: fbUser.email || '',
              avatar: fbUser.photoURL || undefined
            });
          }
        }
      });
      return () => {
        unsubscribe();
      };
    } catch {}
  }, []);

  // Listen for global auth prompts (e.g. guest trying to download or bookmark)
  useEffect(() => {
    const handleRequireAuth = (e: any) => {
      const msg = e?.detail?.message || 'Please sign in with Google to download files or save bookmarks!';
      setAuthReason(msg);
      setIsAuthOpen(true);
    };

    window.addEventListener('codeshelf_require_auth', handleRequireAuth);
    return () => window.removeEventListener('codeshelf_require_auth', handleRequireAuth);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleOpenAuth = (reason?: string) => {
    setAuthReason(reason);
    setIsAuthOpen(true);
  };

  const handleSnippetCreated = (newSnippet: Snippet) => {
    // 1. Immediately update main snippets state array so new card renders instantly
    setSnippets(prev => {
      const filtered = (prev || []).filter(s => s?.id !== newSnippet.id);
      return [newSnippet, ...filtered];
    });

    showToast(`Published "${newSnippet.title}" to CodeShelf!`);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Google OAuth popup route (runs isolated in browser popup without layout chrome)
  if (location.pathname === '/auth/google/popup') {
    return <GooglePopupView />;
  }

  // Dedicated full-page Admin Control Center route (runs with its own full-page layout, sidebar, header, and dashboard)
  if (location.pathname.startsWith('/admin')) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
        <AdminControlCenterView onToast={showToast} />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-[#F8FAFC] font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        searchQuery={globalSearchQuery}
        onSearchChange={setGlobalSearchQuery}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenAuth={() => handleOpenAuth()}
        onOpenTeam={(tab) => {
          setTeamModalTab(tab || 'join');
          setIsTeamOpen(true);
        }}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenDailyGame={() => navigate('/challenges/daily')}
        onOpenReport={(cfg) => {
          setReportConfig(cfg || { type: 'website' });
          setIsReportOpen(true);
        }}
        onOpenAdminReports={() => setIsAdminReportsOpen(true)}
      />

      {/* Main Container with Full Viewport Coverage */}
      <main className="flex-1 w-full bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-200">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <ErrorBoundary>
            <Routes>
              <Route
                path="/"
                element={
                  <HomeDashboardView
                    snippets={filteredSnippets}
                    globalSearchQuery={globalSearchQuery}
                    onClearSearch={() => setGlobalSearchQuery('')}
                    onOpenSubmit={() => setIsSubmitOpen(true)}
                    onRequestAuth={(r) => handleOpenAuth(r)}
                    onToast={showToast}
                  />
                }
              />
              <Route
                path="/challenges/daily"
                element={
                  <DailyChallengeView
                    onToast={showToast}
                    onRequestAuth={(r) => handleOpenAuth(r)}
                    onOpenQuiz={(lang) => {
                      setQuizLanguage(lang);
                      setIsQuizOpen(true);
                    }}
                  />
                }
              />
            <Route
              path="/explore"
              element={
                <LibraryView
                  snippets={snippets}
                  searchQuery={globalSearchQuery}
                  onSearchChange={setGlobalSearchQuery}
                  onToast={showToast}
                  onOpenSubmit={() => setIsSubmitOpen(true)}
                  onOpenDailyGame={() => navigate('/challenges')}
                />
              }
            />
            <Route
              path="/community"
              element={
                <CommunityView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                />
              }
            />
            <Route
              path="/learn"
              element={
                <LearnView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                  onOpenQuiz={(l) => {
                    setQuizLanguage(l);
                    setIsQuizOpen(true);
                  }}
                />
              }
            />
            <Route
              path="/snippet/:id"
              element={
                <SnippetDetailView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                  onOpenReport={(cfg) => {
                    setReportConfig(cfg);
                    setIsReportOpen(true);
                  }}
                />
              }
            />
            <Route
              path="/playground"
              element={
                <PlaygroundView
                  onToast={showToast}
                  onOpenSubmit={() => setIsSubmitOpen(true)}
                />
              }
            />
            <Route
              path="/saved"
              element={<SavedView snippets={filteredSnippets} onToast={showToast} />}
            />
            <Route
              path="/my-snippets"
              element={
                <MySnippetsView
                  snippets={filteredSnippets}
                  onToast={showToast}
                  onOpenSubmit={() => setIsSubmitOpen(true)}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfileView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                />
              }
            />
            <Route
              path="/u/:userId"
              element={
                <ProfileView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                />
              }
            />
            <Route
              path="/challenges/daily"
              element={
                <DailyChallengeView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                  onOpenQuiz={(lang) => {
                    setQuizLanguage(lang);
                    setIsQuizOpen(true);
                  }}
                />
              }
            />
            <Route
              path="/challenges"
              element={
                <DailyChallengeView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                  onOpenQuiz={(lang) => {
                    setQuizLanguage(lang);
                    setIsQuizOpen(true);
                  }}
                />
              }
            />
            <Route
              path="/daily-challenge"
              element={
                <DailyChallengeView
                  onToast={showToast}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                  onOpenQuiz={(lang) => {
                    setQuizLanguage(lang);
                    setIsQuizOpen(true);
                  }}
                />
              }
            />
            {/* Fallback route */}
            <Route
              path="*"
              element={
                <HomeDashboardView
                  snippets={snippets}
                  onOpenSubmit={() => setIsSubmitOpen(true)}
                  onRequestAuth={(r) => handleOpenAuth(r)}
                  onToast={showToast}
                />
              }
            />
          </Routes>
        </ErrorBoundary>
      </div>
    </main>

    {/* Clean Professional Footer with Exact Branding */}
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 text-xs transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          {/* Brand & Subtitle */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <div className="flex items-center gap-2.5">
              <CodeSelfLogo className="w-6 h-6 shrink-0" />
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                ChulliCode
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Powered by Chulli Groups
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mt-0.5">
              Empowering beginner developers and students with code repositories, step-by-step interactive curricula, and daily algorithmic challenges.
            </p>
          </div>

          {/* Navigation & Legal Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2.5 text-xs font-medium">
            <Link to="/explore" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link to="/community" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Community Guidelines
            </Link>
            <button
              type="button"
              onClick={() => showToast('ChulliCode Privacy Policy: User data is strictly protected. Real user actions only.')}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => showToast('ChulliCode Terms of Service: Collaborative and educational code sharing platform.')}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => showToast('Contact support: shakti14112008@gmail.com')}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => {
                setReportConfig({ type: 'website' });
                setIsReportOpen(true);
              }}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Report a Bug
            </button>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} ChulliCode. All rights reserved.</p>
          <p className="font-mono">Built for authentic developers · Zero fabricated data</p>
        </div>
      </div>
    </footer>

      {/* Global Modals */}
      <SubmitSnippetModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={handleSnippetCreated}
        onRequestAuth={(reason) => handleOpenAuth(reason)}
        onOpenTeam={(tab) => {
          setTeamModalTab(tab || 'join');
          setIsTeamOpen(true);
        }}
      />

      <TeamWorkspaceModal
        isOpen={isTeamOpen}
        onClose={() => setIsTeamOpen(false)}
        onRequestAuth={(reason) => handleOpenAuth(reason)}
        onToast={showToast}
        initialTab={teamModalTab}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        reasonMessage={authReason}
        onSuccess={() => showToast('Successfully signed in!')}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        onToast={showToast}
        onRequestAuth={(reason) => handleOpenAuth(reason)}
        onOpenDailyGame={() => {
          setIsAchievementsOpen(false);
          setIsGameOpen(true);
        }}
      />

      <DailyCodingGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        onToast={showToast}
        onRequestAuth={(reason) => handleOpenAuth(reason)}
      />

      <LanguageQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        initialLanguage={quizLanguage}
        onToast={showToast}
        onRequestAuth={(reason) => handleOpenAuth(reason)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onToast={showToast}
        reportType={reportConfig.type}
        snippetId={reportConfig.snippetId}
        snippetTitle={reportConfig.snippetTitle}
        snippetLanguage={reportConfig.snippetLanguage}
      />

      <AdminReportsModal
        isOpen={isAdminReportsOpen}
        onClose={() => setIsAdminReportsOpen(false)}
        onToast={showToast}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
