import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authService, GoogleAccountProfile } from '../services/authService';
import { Check, ShieldCheck, ArrowRight, Loader2, User as UserIcon, Plus, Mail } from 'lucide-react';

export const GooglePopupView: React.FC = () => {
  const [savedAccounts, setSavedAccounts] = useState<GoogleAccountProfile[]>(() =>
    authService.getSavedGoogleAccounts()
  );
  const [isAddingNew, setIsAddingNew] = useState(() => authService.getSavedGoogleAccounts().length === 0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize GIS One Tap / button inside popup if available
  useEffect(() => {
    try {
      const google = (window as any).google;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (google?.accounts?.id && clientId) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              try {
                const user = authService.loginWithGoogleCredential(response.credential);
                completeAuth(user);
              } catch (err: any) {
                setError(err?.message || 'Google verification failed.');
              }
            }
          }
        });
        const btnContainer = document.getElementById('gis-popup-btn');
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 360,
            text: 'continue_with'
          });
        }
      }
    } catch (e) {
      console.warn('GIS initialization inside popup:', e);
    }
  }, []);

  const completeAuth = (userProfile: User) => {
    setIsSigningIn(true);
    setStatusText(`Connecting to ${userProfile.email}...`);

    setTimeout(() => {
      // Send message to opener window
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage(
            {
              type: 'GOOGLE_AUTH_SUCCESS',
              user: userProfile
            },
            window.location.origin
          );
        } catch (err) {
          console.error('Error posting message to window.opener', err);
        }
      }

      // Also persist to localStorage for cross-tab sync
      try {
        localStorage.setItem('codeshelf_current_user', JSON.stringify(userProfile));
        window.dispatchEvent(new Event('codeshelf_auth_changed'));
      } catch {}

      setStatusText('Authentication complete. Closing window...');
      setTimeout(() => {
        window.close();
      }, 350);
    }, 500);
  };

  const handleSelectAccount = (account: GoogleAccountProfile) => {
    setError(null);
    const userProfile = authService.loginWithGoogleProfile({
      name: account.name,
      email: account.email,
      avatar: account.avatar
    });
    completeAuth(userProfile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const userProfile = authService.loginWithGoogleProfile({
      name: cleanName,
      email: cleanEmail
    });
    completeAuth(userProfile);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex flex-col justify-between p-4 sm:p-6 font-sans text-slate-800 antialiased selection:bg-blue-100">
      <div className="w-full max-w-[440px] mx-auto my-auto bg-white rounded-3xl shadow-lg border border-slate-200/80 p-8 sm:p-10 transition-all">
        {/* Google Iconic Logo */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-600">Google Accounts</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-normal text-slate-900 tracking-tight">
          Sign in with Google
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          to continue to <span className="font-semibold text-slate-900">CodeSelf</span>
        </p>

        {/* Active Signing In State */}
        {isSigningIn ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-800">{statusText}</p>
            <p className="text-xs text-slate-500">Communicating with CodeShelf...</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {/* GIS native button container if supported */}
            <div id="gis-popup-btn" className="flex justify-center empty:hidden mb-2"></div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* List of previously signed-in accounts on this device (if any) */}
            {savedAccounts.length > 0 && !isAddingNew && (
              <div className="space-y-2">
                {savedAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100/80 transition-colors border border-slate-200 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                      />
                      <div>
                        <div className="font-medium text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{acc.name}</span>
                        </div>
                        <div className="text-xs text-slate-500">{acc.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full mt-2 flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors border border-dashed border-slate-300 text-left text-slate-700 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Use another Google account</span>
                </button>
              </div>
            )}

            {/* Account entry form */}
            {isAddingNew && (
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Google Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      autoFocus
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {savedAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-300"
                    >
                      Back to accounts
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Google Permissions / Privacy Disclosure */}
            <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              <p>
                To continue, Google will share your verified name, email address, and profile
                picture with CodeShelf. See CodeShelf&apos;s Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Standard Google Footer */}
      <div className="max-w-[440px] w-full mx-auto flex items-center justify-between text-[11px] text-slate-500 px-2">
        <span>English (United States)</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-800 transition-colors">Help</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms</a>
        </div>
      </div>
    </div>
  );
};
