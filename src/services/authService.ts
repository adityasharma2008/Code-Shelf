import { User } from '../types';
import { firebaseService } from './firebase';

const USER_STORAGE_KEY = 'codeshelf_current_user';
const GUEST_COUNT_KEY = 'codeshelf_guest_upload_count';
const REGISTERED_USERS_KEY = 'codeshelf_registered_users';
const GOOGLE_ACCOUNTS_KEY = 'codeshelf_google_saved_accounts';
const MAX_GUEST_UPLOADS = 5;

export interface StoredRegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: string;
}

export interface GoogleAccountProfile {
  name: string;
  email: string;
  avatar: string;
}

// Dispatch custom event to notify components of auth changes
function notifyAuthChange() {
  window.dispatchEvent(new Event('codeshelf_auth_changed'));
}

export const authService = {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  getGuestUploadCount(): number {
    try {
      const data = localStorage.getItem('guest_snippets');
      if (!data) return 0;
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return 0;
      const valid = parsed.filter(id => typeof id === 'string' && id.trim().length > 0);

      // Dynamically cross-reference with active stored snippets in localStorage
      const storedSnippetsRaw = localStorage.getItem('codeshelf_snippets');
      if (storedSnippetsRaw) {
        try {
          const storedSnippets = JSON.parse(storedSnippetsRaw);
          if (Array.isArray(storedSnippets)) {
            const activeIds = new Set(storedSnippets.map((s: any) => s?.id));
            const activeGuestIds = valid.filter(id => activeIds.has(id));
            if (activeGuestIds.length !== parsed.length) {
              localStorage.setItem('guest_snippets', JSON.stringify(activeGuestIds));
              localStorage.setItem('guestSnippetIds', JSON.stringify(activeGuestIds));
            }
            return activeGuestIds.length;
          }
        } catch {}
      }

      return valid.length;
    } catch {
      return 0;
    }
  },

  getGuestLimitStatus(): {
    isGuest: boolean;
    canUpload: boolean;
    currentCount: number;
    maxLimit: number;
    remaining: number;
  } {
    const user = this.getCurrentUser();
    if (user) {
      return {
        isGuest: false,
        canUpload: true,
        currentCount: 0,
        maxLimit: 5,
        remaining: Infinity
      };
    }

    // Dynamic Remaining Counter: MAX_LIMIT (5) - guest_snippets.length
    const currentCount = this.getGuestUploadCount();
    const maxLimit = 5;
    const remaining = Math.max(0, maxLimit - currentCount);
    return {
      isGuest: true,
      canUpload: remaining > 0,
      currentCount,
      maxLimit,
      remaining
    };
  },

  incrementGuestUploadCount(): number {
    notifyAuthChange();
    return this.getGuestUploadCount();
  },

  resetGuestUploadCount(): void {
    localStorage.removeItem('guest_snippets');
    notifyAuthChange();
  },

  /**
   * Retrieves saved Google accounts for the Account Chooser.
   * Strictly returns only real accounts saved by the user on this browser (no fake defaults).
   */
  getSavedGoogleAccounts(): GoogleAccountProfile[] {
    try {
      const stored = localStorage.getItem(GOOGLE_ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy/mock accounts
          const cleaned = parsed.filter(
            (a: any) =>
              a &&
              a.email &&
              a.email !== 'krish.sharma@gmail.com' &&
              a.email !== 'developer@gmail.com' &&
              a.email !== 'shakti14112008@gmail.com'
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {}

    return [];
  },

  saveGoogleAccountProfile(profile: GoogleAccountProfile): void {
    try {
      const list = this.getSavedGoogleAccounts();
      const cleanEmail = profile.email.toLowerCase().trim();
      if (
        cleanEmail === 'krish.sharma@gmail.com' ||
        cleanEmail === 'developer@gmail.com' ||
        cleanEmail === 'shakti14112008@gmail.com'
      ) {
        return;
      }
      const filtered = list.filter(a => a.email.toLowerCase().trim() !== cleanEmail);
      filtered.unshift({
        name: profile.name.trim(),
        email: cleanEmail,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`
      });
      localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(filtered.slice(0, 5)));
    } catch {}
  },

  /**
   * Log in using a verified Google profile.
   * Stores clean session data in localStorage without placeholder overrides.
   */
  loginWithGoogleProfile(profile: { id?: string; name: string; email: string; avatar?: string }): User {
    const cleanEmail = profile.email.trim().toLowerCase();
    const cleanName = profile.name.trim() || cleanEmail.split('@')[0];
    const avatar =
      profile.avatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`;

    const user: User = {
      id: profile.id || 'usr_g_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      email: cleanEmail,
      avatar,
      provider: 'google',
      createdAt: new Date().toISOString()
    };

    // Save profile for future fast account choosing
    this.saveGoogleAccountProfile({
      name: cleanName,
      email: cleanEmail,
      avatar
    });

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    notifyAuthChange();
    return user;
  },

  /**
   * Decodes a Google Identity Services JWT credential token and logs the user in
   */
  loginWithGoogleCredential(credentialToken: string): User {
    try {
      const base64Url = credentialToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return this.loginWithGoogleProfile({
        id: payload.sub,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        email: payload.email,
        avatar: payload.picture
      });
    } catch (err) {
      console.error('Failed to parse Google credential token', err);
      throw new Error('Failed to verify Google token.');
    }
  },

  /**
   * Triggers authentic Google OAuth sign-in via Firebase Auth popup.
   * If Firebase popup is blocked in sandbox iframe, falls back to popup window chooser.
   */
  async triggerGooglePopupLogin(): Promise<User> {
    try {
      const user = await firebaseService.signInWithGoogle();
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      this.saveGoogleAccountProfile({
        name: user.name,
        email: user.email,
        avatar: user.avatar
      });
      notifyAuthChange();
      return user;
    } catch (fbErr: any) {
      if (fbErr?.message?.includes('cancelled')) {
        throw fbErr;
      }
      // If Firebase popup was blocked or failed in sandbox iframe, attempt popup window helper
      return new Promise((resolve, reject) => {
        const width = 480;
        const height = 620;
        const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
        const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

        const popup = window.open(
          '/auth/google/popup',
          'Google_Account_Chooser',
          `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup || popup.closed) {
          reject(
            new Error(
              'Google Sign-In popup was blocked by your browser. Please allow popups or use the direct sign-in option.'
            )
          );
          return;
        }

        let isResolved = false;

        const cleanup = () => {
          window.removeEventListener('message', handleMessage);
          window.removeEventListener('storage', handleStorage);
          clearInterval(timer);
        };

        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.user) {
            if (!isResolved) {
              isResolved = true;
              cleanup();
              const u = event.data.user;
              authService.loginWithGoogleProfile(u);
              resolve(u);
            }
          }
        };

        const handleStorage = (e: StorageEvent) => {
          if (e.key === USER_STORAGE_KEY && e.newValue) {
            try {
              const u = JSON.parse(e.newValue);
              if (!isResolved && u?.provider === 'google') {
                isResolved = true;
                cleanup();
                resolve(u);
              }
            } catch {}
          }
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            setTimeout(() => {
              if (!isResolved) {
                const current = authService.getCurrentUser();
                if (current && current.provider === 'google') {
                  isResolved = true;
                  cleanup();
                  resolve(current);
                } else {
                  cleanup();
                  reject(new Error('Sign in was cancelled or closed.'));
                }
              }
            }, 300);
          }
        }, 500);
      });
    }
  },

  /**
   * Helper for Google login by name and email
   */
  loginWithGoogle(email: string, name: string): Promise<User> {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return Promise.reject(new Error('Please enter a valid Google email address.'));
    }
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const user = this.loginWithGoogleProfile({ email: cleanEmail, name: cleanName });
    return Promise.resolve(user);
  },

  /**
   * Get all registered accounts stored in localStorage
   */
  getRegisteredUsers(): StoredRegisteredUser[] {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Strict Create Account: validates name, email format, non-blank password,
   * checks for duplicates, and persists credentials in localStorage.
   */
  signUpWithEmail(name: string, email: string, password: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPassword = password.trim();

    if (!cleanName || cleanName.length < 2) {
      return Promise.reject(new Error('Please enter your full developer name (at least 2 characters).'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return Promise.reject(new Error('Please enter a valid email address.'));
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return Promise.reject(new Error('Password must be at least 4 characters long and cannot be blank.'));
    }

    const registered = this.getRegisteredUsers();
    const existing = registered.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return Promise.reject(new Error('An account with this email already exists. Please sign in instead.'));
    }

    const newUser: StoredRegisteredUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`,
      createdAt: new Date().toISOString()
    };

    registered.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));

    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      provider: 'email',
      createdAt: newUser.createdAt
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    notifyAuthChange();
    return Promise.resolve(sessionUser);
  },

  /**
   * Strict Sign In: validates email, verifies password matches stored credentials,
   * prevents blank or fake logins.
   */
  signInWithEmail(email: string, password: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return Promise.reject(new Error('Please enter a valid email address.'));
    }

    if (!cleanPassword) {
      return Promise.reject(new Error('Password is required and cannot be blank.'));
    }

    const registered = this.getRegisteredUsers();
    const found = registered.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return Promise.reject(
        new Error('No account found with this email. Please check your email or click "Create Account".')
      );
    }

    if (found.password !== cleanPassword) {
      return Promise.reject(new Error('Incorrect password. Please verify your password and try again.'));
    }

    const sessionUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      avatar: found.avatar,
      provider: 'email',
      createdAt: found.createdAt
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    notifyAuthChange();
    return Promise.resolve(sessionUser);
  },

  /**
   * Generic login helper maintained for backwards compatibility
   */
  loginWithEmail(email: string, name?: string): Promise<User> {
    if (name) {
      return this.signUpWithEmail(name, email, 'default123').catch(() =>
        this.signInWithEmail(email, 'default123')
      );
    }
    return this.signInWithEmail(email, '');
  },

  logout(): void {
    try {
      firebaseService.signOut().catch(() => {});
    } catch {}
    localStorage.removeItem(USER_STORAGE_KEY);
    notifyAuthChange();
  },

  /**
   * Update profile information for the current user
   */
  updateUserProfile(updates: Partial<User>): User {
    const current = this.getCurrentUser();
    if (!current) {
      throw new Error('No user is currently signed in.');
    }

    const updatedUser: User = {
      ...current,
      ...updates,
      // Preserve critical immutable identifiers
      id: current.id,
      email: current.email,
      provider: current.provider,
      createdAt: current.createdAt
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

    // If user registered with email, sync in registered users list
    try {
      const registered = this.getRegisteredUsers();
      const idx = registered.findIndex(u => u.id === current.id || u.email.toLowerCase() === current.email.toLowerCase());
      if (idx !== -1) {
        if (updates.name) registered[idx].name = updates.name;
        if (updates.avatar) registered[idx].avatar = updates.avatar;
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));
      }
    } catch {}

    notifyAuthChange();
    return updatedUser;
  }
};

