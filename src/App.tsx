import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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
import { LearnView } from './views/LearnView';
import { SnippetDetailView } from './views/SnippetDetailView';
import { PlaygroundView } from './views/PlaygroundView';
import { SavedView } from './views/SavedView';
import { MySnippetsView } from './views/MySnippetsView';
import { ProfileView } from './views/ProfileView';
import { GooglePopupView } from './views/GooglePopupView';
import { useLocation } from 'react-router-dom';

export function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // App-level state (starts empty or with real user submissions)
  const [snippets, setSnippets] = useState<Snippet[]>(() => snippetStorage.getAllSnippets());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Default clean light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('codeshelf_theme', 'light');
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

    return () => {
      window.removeEventListener('codeshelf_snippets_updated', handleSnippetsUpdated);
      window.removeEventListener('codeshelf_snippet_deleted', handleSnippetsUpdated);
      window.removeEventListener('codeshelf_auth_changed', handleSnippetsUpdated);
      window.removeEventListener('codeself_open_achievements', handleOpenAchievements);
      window.removeEventListener('codeself_open_daily_game', handleOpenDailyGame);
      window.removeEventListener('codeself_open_quiz', handleOpenQuizEvent as EventListener);
      window.removeEventListener('codeself_open_report', handleOpenReportEvent as EventListener);
      window.removeEventListener('codeself_open_admin_reports', handleOpenAdminReports);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenAuth={() => handleOpenAuth()}
        onOpenTeam={(tab) => {
          setTeamModalTab(tab || 'join');
          setIsTeamOpen(true);
        }}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenDailyGame={() => setIsGameOpen(true)}
        onOpenReport={(cfg) => {
          setReportConfig(cfg || { type: 'website' });
          setIsReportOpen(true);
        }}
        onOpenAdminReports={() => setIsAdminReportsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={
                <LibraryView
                  snippets={snippets}
                  onToast={showToast}
                  onOpenSubmit={() => setIsSubmitOpen(true)}
                  onOpenDailyGame={() => setIsGameOpen(true)}
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
              element={<SavedView snippets={snippets} onToast={showToast} />}
            />
            <Route
              path="/my-snippets"
              element={
                <MySnippetsView
                  snippets={snippets}
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
            {/* Fallback route */}
            <Route
              path="*"
              element={
                <LibraryView
                  snippets={snippets}
                  onToast={showToast}
                  onOpenSubmit={() => setIsSubmitOpen(true)}
                  onOpenDailyGame={() => setIsGameOpen(true)}
                />
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Clean Corporate Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CodeSelfLogo className="w-5 h-5 shrink-0 opacity-90" />
            <span className="font-semibold text-slate-800">CodeSelf</span>
            <span className="text-slate-300">·</span>
            <span>Public Multi-Language Repository & Interactive Hub</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-slate-500">
            <button
              type="button"
              onClick={() => {
                setReportConfig({ type: 'website' });
                setIsReportOpen(true);
              }}
              className="text-slate-500 hover:text-slate-800 hover:underline transition-colors cursor-pointer"
            >
              Report Issue / Bug
            </button>
            <span className="text-slate-300">·</span>
            <span className="font-medium text-slate-700">
              Powered by <span className="font-semibold text-blue-600">Chulli Group</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono tabular-nums text-slate-400">© 2026 All rights reserved</span>
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
