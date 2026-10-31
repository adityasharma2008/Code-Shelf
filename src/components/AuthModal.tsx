import React, { useState, useEffect } from 'react';
import { authService, GoogleAccountProfile } from '../services/authService';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, ArrowLeft, Plus, ExternalLink } from 'lucide-react';
import { CodeSelfLogo } from './CodeSelfLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reasonMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reasonMessage
}) => {
  const [viewMode, setViewMode] = useState<'main' | 'google-direct'>('main');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Email form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Direct Google form state (fallback if popup blocked)
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [savedGoogleAccounts, setSavedGoogleAccounts] = useState<GoogleAccountProfile[]>(() =>
    authService.getSavedGoogleAccounts()
  );

  useEffect(() => {
    if (isOpen) {
      setSavedGoogleAccounts(authService.getSavedGoogleAccounts());
      setError(null);
    }
  }, [isOpen]);

  // Try to mount Google Identity Services One Tap / Button if client ID exists
  useEffect(() => {
    if (!isOpen) return;
    try {
      const google = (window as any).google;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (google?.accounts?.id && clientId) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              try {
                authService.loginWithGoogleCredential(response.credential);
                onClose();
                if (onSuccess) onSuccess();
              } catch (err: any) {
                setError(err?.message || 'Google sign-in verification failed.');
              }
            }
          }
        });
        const container = document.getElementById('gis-modal-btn');
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with'
          });
        }
      }
    } catch {}
  }, [isOpen, viewMode]);

  if (!isOpen) return null;

  const handleGoogleSignInClick = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authService.triggerGooglePopupLogin();
      setIsLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsLoading(false);
      // If popup was blocked by sandbox / browser, seamlessly switch to direct Google account chooser
      if (err?.message?.includes('blocked') || err?.message?.includes('popup')) {
        setViewMode('google-direct');
        setError('Popup was blocked by your browser. Please select or enter your Google account below:');
      } else if (err?.message && !err.message.includes('cancelled')) {
        setError(err.message);
      }
    }
  };

  const handleSelectSavedGoogleAccount = (acc: GoogleAccountProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      authService.loginWithGoogleProfile({
        name: acc.name,
        email: acc.email,
        avatar: acc.avatar
      });
      setIsLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to sign in with Google account.');
    }
  };

  const handleDirectGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = googleEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please provide a valid Google email address.');
      return;
    }

    const cleanName = googleName.trim() || cleanEmail.split('@')[0];
    try {
      authService.loginWithGoogleProfile({
        name: cleanName,
        email: cleanEmail
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        if (!name.trim()) {
          setError('Please provide your developer display name.');
          setIsLoading(false);
          return;
        }
        await authService.signUpWithEmail(name, cleanEmail, password);
      } else {
        await authService.signInWithEmail(cleanEmail, password);
      }

      setIsLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {viewMode === 'main' ? (
          <div>
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <CodeSelfLogo className="w-8 h-8 shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                    Sign In to CodeSelf
                  </h2>
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">
                    Powered by <span className="font-semibold text-blue-600">ChulliTech</span>
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {reasonMessage || 'Unlock unlimited code submissions, downloads, and bookmarks.'}
              </p>
            </div>

            {/* Reason Alert Banner */}
            {reasonMessage && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block">{reasonMessage}</span>
                  <span className="text-amber-700">Please sign in to access download and bookmarking features.</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs leading-relaxed">
                {error}
              </div>
            )}

            {/* GIS Container (if available) */}
            <div id="gis-modal-btn" className="flex justify-center empty:hidden mb-3"></div>

            {/* Continue with Google button (standard OAuth popup) */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-medium text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{isLoading ? 'Opening Google Sign-In...' : 'Continue with Google'}</span>
              </button>

              <div className="relative my-4 text-center text-xs text-slate-400">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-slate-500 font-medium">
                  Or continue with email
                </span>
              </div>

              {/* Email Tab switcher */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-3 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setActiveTab('login');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setActiveTab('signup');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Developer Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Alex Carter"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="developer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isLoading
                    ? 'Processing...'
                    : activeTab === 'login'
                    ? 'Sign In with Email'
                    : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Direct Google Account Sign-In View */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode('main');
                }}
                className="p-1 -ml-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <h3 className="text-base font-semibold text-slate-900">
                  Google Account Sign In
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Enter your Google Account email to securely connect to CodeShelf.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            {savedGoogleAccounts.length > 0 && (
              <div className="space-y-2 mb-4">
                <span className="text-xs font-medium text-slate-600 block">Previously Used Accounts</span>
                {savedGoogleAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSavedGoogleAccount(acc)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {acc.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleDirectGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.name@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('main')}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Sign In with Google
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
