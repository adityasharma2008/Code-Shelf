import { Snippet, Language, Difficulty, CategoryTag } from '../types';
import { LANGUAGES } from '../data/languages';
import { authService } from './authService';
import { firebaseService } from './firebase';
import { teamService } from './teamService';

const SNIPPETS_STORAGE_KEY = 'codeshelf_snippets_store';
const LIKES_STORAGE_KEY = 'codeshelf_user_likes';
const BOOKMARKS_STORAGE_KEY = 'codeshelf_user_bookmarks';
const VIEWED_STORAGE_KEY = 'codeshelf_session_views';
const GUEST_SNIPPETS_KEY = 'guest_snippets';
const GUEST_SNIPPET_IDS_KEY = 'guestSnippetIds';
const LOCAL_GUEST_SNIPPETS_KEY = 'localGuestSnippets';
const LEGACY_GUEST_SNIPPET_IDS_KEY = 'myGuestSnippetIds';

/**
 * Returns all snippet IDs created on this browser device by guest or owner,
 * dynamically synced with active stored snippets.
 */
export function getGuestSnippetIds(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_SNIPPETS_KEY);
    if (!raw) return [];
    const list: string[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    const validIds = list.filter(id => typeof id === 'string' && id.trim().length > 0);

    // Cross-reference with active stored snippets to guarantee guest quota recovers on deletions
    const storedSnippetsRaw = localStorage.getItem(SNIPPETS_STORAGE_KEY);
    if (storedSnippetsRaw) {
      try {
        const storedSnippets = JSON.parse(storedSnippetsRaw);
        if (Array.isArray(storedSnippets)) {
          const activeSnippetIds = new Set(storedSnippets.map((s: any) => s?.id));
          const activeGuestIds = validIds.filter(id => activeSnippetIds.has(id));
          if (activeGuestIds.length !== list.length) {
            localStorage.setItem(GUEST_SNIPPETS_KEY, JSON.stringify(activeGuestIds));
            localStorage.setItem(GUEST_SNIPPET_IDS_KEY, JSON.stringify(activeGuestIds));
          }
          return activeGuestIds;
        }
      } catch {}
    }

    return validIds;
  } catch {
    return [];
  }
}

/**
 * Saves a snippet ID to browser localStorage guest_snippets and guestSnippetIds
 */
export function saveGuestSnippetId(id: string): void {
  try {
    const arr = getGuestSnippetIds();
    if (!arr.includes(id)) {
      arr.push(id);
    }
    localStorage.setItem(GUEST_SNIPPETS_KEY, JSON.stringify(arr));
    localStorage.setItem(GUEST_SNIPPET_IDS_KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event('codeshelf_auth_changed'));
    window.dispatchEvent(new Event('codeshelf_snippets_updated'));
  } catch {}
}

/**
 * Purges a snippet ID from browser localStorage guest_snippets and recovers guest submission quota
 */
export function removeGuestSnippetId(id: string): void {
  try {
    const arr = getGuestSnippetIds().filter(existingId => existingId !== id);
    localStorage.setItem(GUEST_SNIPPETS_KEY, JSON.stringify(arr));
    localStorage.setItem(GUEST_SNIPPET_IDS_KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event('codeshelf_auth_changed'));
    window.dispatchEvent(new Event('codeshelf_snippets_updated'));
  } catch {}
}

export const snippetStorage = {
  getAllSnippets(): Snippet[] {
    try {
      const stored = localStorage.getItem(SNIPPETS_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed: Snippet[] = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      // Filter out only old mock seed IDs
      const mockIds = new Set([
        'py-lru-cache',
        'sql-window-salary-analytics',
        'cpp-dijkstra-shortest-path',
        'js-debounce-throttle',
        'ts-builder-pattern',
        'java-producer-consumer',
        'csharp-linq-aggregation',
        'php-password-hashing',
        'html-css-developer-terminal',
        'cpp-stl-custom-comparator'
      ]);

      const realSnippets = parsed
        .filter(s => {
          if (!s || !s.id || !s.title || !s.code) return false;
          if (mockIds.has(s.id)) return false;
          return true;
        })
        .map(s => {
          // Clean up any old mock placeholder authors
          if (!s.author || !s.author?.name || s.author?.name === 'Community Developer') {
            return {
              ...s,
              author: {
                name: 'Guest',
                username: 'guest',
                avatar: '',
                role: 'Guest' as const,
                isGuest: true,
                isVerified: false
              }
            };
          }
          return s;
        });

      return realSnippets;
    } catch {
      return [];
    }
  },

  getSnippetById(id: string): Snippet | null {
    if (!id) return null;
    const all = this.getAllSnippets();
    return all.find(s => s?.id === id) || null;
  },

  saveSnippet(data: {
    title: string;
    description: string;
    language: Language;
    difficulty: Difficulty;
    category: CategoryTag;
    tags: string[];
    code: string;
    sampleOutput?: string;
    guestAuthorName?: string;
    isPrivate?: boolean;
  }): { success: boolean; snippet?: Snippet; error?: string; requireAuth?: boolean } {
    const activeTeam = teamService.getActiveTeam();
    const limitStatus = authService.getGuestLimitStatus();

    // Guest quota is bypassed if member is in an active Team Workspace
    if (!activeTeam && limitStatus.isGuest && !limitStatus.canUpload) {
      return {
        success: false,
        error: `Guest limit reached (${limitStatus.maxLimit}/${limitStatus.maxLimit} submissions). Join a Team Workspace or sign in to submit unlimited snippets!`,
        requireAuth: true
      };
    }

    const currentUser = authService.getCurrentUser();
    const guestStoredName = (localStorage.getItem('codeshelf_guest_name') || '').trim();
    const resolvedContributorName = (
      (activeTeam ? activeTeam.memberName : '') ||
      data.guestAuthorName ||
      guestStoredName ||
      (currentUser ? currentUser.name : 'Guest')
    ).trim();
    const isTeamUpload = Boolean(activeTeam);
    const isPrivate = Boolean(data.isPrivate);
    
    // Attribution:
    // If uploaded under a Team Workspace:
    // - Uploaded on behalf of the Team Creator (teamOwnerId / teamOwnerEmail)
    // - Display author name is the team contributor's name
    // - Unlocks unlimited submissions for the guest member
    const newSnippet: Snippet = {
      id: 'snip_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title: data.title.trim(),
      description: data.description.trim(),
      language: data.language,
      difficulty: data.difficulty,
      category: data.category,
      tags: data.tags.filter(Boolean).map(t => t.trim()),
      code: data.code,
      sampleOutput: data.sampleOutput,
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0,
      bookmarksCount: 0,
      isCommunitySubmitted: true,
      isPrivate: isPrivate,
      visibility: isPrivate ? 'private' : 'public',
      teamId: activeTeam?.teamId,
      teamName: activeTeam?.teamName,
      teamOwnerId: activeTeam?.teamOwnerId,
      teamOwnerEmail: activeTeam?.teamOwnerEmail,
      uploadedByMember: isTeamUpload ? resolvedContributorName : undefined,
      isTeamSnippet: isTeamUpload,
      userId: isTeamUpload ? activeTeam!.teamOwnerId : (currentUser?.id || currentUser?.uid),
      userEmail: isTeamUpload ? activeTeam!.teamOwnerEmail : currentUser?.email,
      authorEmail: isTeamUpload ? activeTeam!.teamOwnerEmail : currentUser?.email,
      authorId: isTeamUpload ? activeTeam!.teamOwnerId : (currentUser?.id || currentUser?.uid),
      isGuest: !currentUser && !isTeamUpload,
      author: isTeamUpload
        ? {
            name: resolvedContributorName,
            username: (resolvedContributorName || 'member').toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 24),
            avatar: currentUser?.avatar || '',
            email: activeTeam!.teamOwnerEmail,
            userId: activeTeam!.teamOwnerId,
            role: 'Member',
            isGuest: false,
            isVerified: false
          }
        : currentUser
        ? {
            name: currentUser.name || currentUser.email.split('@')[0],
            username: currentUser.email.split('@')[0],
            avatar: currentUser.avatar,
            email: currentUser.email,
            userId: currentUser.id || currentUser.uid,
            role: 'Contributor',
            isGuest: false,
            isVerified: false
          }
        : {
            name: resolvedContributorName,
            username: (resolvedContributorName || 'guest').toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 24),
            avatar: '',
            role: 'Guest',
            isGuest: true,
            isVerified: false
          }
    };

    const all = this.getAllSnippets();
    const updated = [newSnippet, ...all];
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));

    // Save into localStorage array named guest_snippets and guestSnippetIds for local device management
    if (!currentUser || isTeamUpload) {
      saveGuestSnippetId(newSnippet.id);
    }

    // Increment team snippet counter
    if (activeTeam?.teamId) {
      teamService.recordSnippetUploaded(activeTeam.teamId).catch(() => {});
    }

    // Sync to Cloud Firestore
    if (currentUser?.id || currentUser?.uid || isTeamUpload) {
      firebaseService.saveSnippet(newSnippet).catch(err => {
        console.warn('Firestore cloud sync pending or offline:', err);
      });
    }

    window.dispatchEvent(new Event('codeshelf_snippets_updated'));
    window.dispatchEvent(new CustomEvent('codeshelf_snippet_created', { detail: { snippet: newSnippet } }));
    return { success: true, snippet: newSnippet };
  },

  updateSnippet(snippetId: string, partial: Partial<Snippet>): boolean {
    if (!snippetId) return false;
    const all = this.getAllSnippets();
    const index = all.findIndex(s => s.id === snippetId);
    if (index === -1) return false;

    const existing = all[index];
    const updated: Snippet = {
      ...existing,
      ...partial,
      id: existing.id // preserve ID
    };

    all[index] = updated;
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(all));

    const currentUser = authService.getCurrentUser();
    if (currentUser && (currentUser.id || currentUser.uid)) {
      firebaseService.saveSnippet(updated).catch(err => {
        console.warn('Firestore update sync error:', err);
      });
    }

    window.dispatchEvent(new Event('codeshelf_snippets_updated'));
    return true;
  },

  toggleSnippetVisibility(snippetId: string): { success: boolean; isPrivate: boolean } {
    if (!snippetId) return { success: false, isPrivate: false };
    const all = this.getAllSnippets();
    const target = all.find(s => s.id === snippetId);
    if (!target) return { success: false, isPrivate: false };

    const newIsPrivate = !target.isPrivate;
    this.updateSnippet(snippetId, {
      isPrivate: newIsPrivate,
      visibility: newIsPrivate ? 'private' : 'public'
    });

    return { success: true, isPrivate: newIsPrivate };
  },

  /**
   * Evaluates if the current user (authenticated or guest) is authorized to delete a snippet.
   */
  canDeleteSnippet(snippet: Snippet | null | undefined): boolean {
    if (!snippet) return false;

    const guestIds = getGuestSnippetIds();
    const currentUser = authService.getCurrentUser();

    // 1. Creator on this device can delete their snippet
    if (guestIds.includes(snippet.id)) {
      return true;
    }

    if (currentUser) {
      const userEmail = (currentUser.email || '').toLowerCase().trim();
      const currentUid = (currentUser.id || currentUser.uid || '').trim();

      const authorEmail = (
        snippet.authorEmail ||
        snippet.userEmail ||
        snippet.author?.email ||
        ''
      ).toLowerCase().trim();

      const authorId = (
        snippet.userId ||
        snippet.authorId ||
        snippet.author?.userId ||
        ''
      ).trim();

      // Team Owner can delete any snippet uploaded under their team
      if (snippet.teamOwnerEmail && snippet.teamOwnerEmail.toLowerCase().trim() === userEmail) {
        return true;
      }
      if (snippet.teamOwnerId && snippet.teamOwnerId.trim() === currentUid) {
        return true;
      }

      // 1. Check if snippet.authorEmail matches the logged-in user's email
      const emailMatches = Boolean(userEmail && authorEmail && userEmail === authorEmail);

      // 2. Check if snippet.userId === currentUser.uid or matches owner ID
      const idMatches = Boolean(
        currentUid && authorId && (
          currentUid === authorId ||
          (currentUser.uid && (snippet.userId === currentUser.uid || snippet.authorId === currentUser.uid)) ||
          (currentUser.id && (snippet.userId === currentUser.id || snippet.authorId === currentUser.id))
        )
      );

      // Logged-in user can only delete if their email or uid strictly matches
      return emailMatches || idMatches;
    } else {
      // Guest User Rule:
      // Show Delete button ONLY IF snippet ID exists in guest_snippets local storage
      const isLocalCreator = guestIds.includes(snippet.id);
      if (!isLocalCreator) {
        return false;
      }

      // Guests must NEVER see delete buttons on user-authenticated snippets
      const snippetAuthorEmail = (
        snippet.authorEmail ||
        snippet.userEmail ||
        snippet.author?.email ||
        ''
      ).trim();

      const snippetUserId = (
        snippet.userId ||
        snippet.authorId ||
        snippet.author?.userId ||
        ''
      ).trim();

      if (snippetAuthorEmail) {
        return false;
      }
      if (snippetUserId && !snippet.isGuest && snippet.author?.role !== 'Guest') {
        return false;
      }

      return true;
    }
  },

  deleteSnippet(snippetId: string): boolean {
    if (!snippetId) return false;
    const all = this.getAllSnippets();
    const target = all.find(s => s.id === snippetId);
    if (!target) return false;

    if (!this.canDeleteSnippet(target)) {
      return false;
    }

    const updated = all.filter(s => s.id !== snippetId);
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));

    // Instantly purge from guestSnippetIds local storage
    removeGuestSnippetId(snippetId);

    // Sync deletion to Cloud Firestore only if user is logged in and not a guest snippet
    const currentUser = authService.getCurrentUser();
    if (currentUser && !target.isGuest && (currentUser.id || currentUser.uid)) {
      firebaseService.deleteSnippet(snippetId).catch(err => {
        console.warn('Firestore cloud deletion pending or offline:', err);
      });
    }

    // Clean up associated bookmarks and likes
    try {
      const bookmarks = this.getUserBookmarks();
      if (bookmarks.has(snippetId)) {
        bookmarks.delete(snippetId);
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(bookmarks)));
      }
      const likes = this.getUserLikes();
      if (likes.has(snippetId)) {
        likes.delete(snippetId);
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likes)));
      }
    } catch {}

    window.dispatchEvent(new Event('codeshelf_snippets_updated'));
    window.dispatchEvent(new CustomEvent('codeshelf_snippet_deleted', { detail: { id: snippetId } }));
    return true;
  },

  getUserLikes(): Set<string> {
    try {
      const data = localStorage.getItem(LIKES_STORAGE_KEY);
      return new Set(data ? JSON.parse(data) : []);
    } catch {
      return new Set();
    }
  },

  isLiked(id: string): boolean {
    if (!id) return false;
    return this.getUserLikes().has(id);
  },

  toggleLike(id: string, forceLike?: boolean): { liked: boolean; newCount: number } {
    if (!id) return { liked: false, newCount: 0 };
    const likes = this.getUserLikes();
    const isCurrentlyLiked = likes.has(id);
    const shouldLike = forceLike !== undefined ? forceLike : !isCurrentlyLiked;

    if (shouldLike) {
      likes.add(id);
    } else {
      likes.delete(id);
    }
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likes)));

    // Update snippet likes count in store
    const all = this.getAllSnippets();
    let updatedCount = 0;
    const updated = all.map(s => {
      if (s?.id === id) {
        const delta = shouldLike ? 1 : -1;
        const count = Math.max(0, (s.likes || 0) + delta);
        updatedCount = count;
        return { ...s, likes: count };
      }
      return s;
    });

    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('codeshelf_snippets_updated'));

    // Sync like delta with Firestore
    firebaseService.updateLikes(id, shouldLike ? 1 : -1).catch(() => {});

    return { liked: shouldLike, newCount: updatedCount };
  },

  getUserBookmarks(): Set<string> {
    try {
      const data = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return new Set(data ? JSON.parse(data) : []);
    } catch {
      return new Set();
    }
  },

  isBookmarked(id: string): boolean {
    if (!id) return false;
    return this.getUserBookmarks().has(id);
  },

  toggleBookmark(id: string): boolean {
    if (!id) return false;
    const bookmarks = this.getUserBookmarks();
    const isCurrentlyBookmarked = bookmarks.has(id);
    const newState = !isCurrentlyBookmarked;

    if (newState) {
      bookmarks.add(id);
    } else {
      bookmarks.delete(id);
    }
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(bookmarks)));

    // Update snippet bookmarksCount in store
    const all = this.getAllSnippets();
    const updated = all.map(s => {
      if (s?.id === id) {
        const delta = newState ? 1 : -1;
        return { ...s, bookmarksCount: Math.max(0, (s.bookmarksCount || 0) + delta) };
      }
      return s;
    });

    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('codeshelf_snippets_updated'));

    // Sync bookmark delta with Firestore
    firebaseService.updateBookmarks(id, newState ? 1 : -1).catch(() => {});

    return newState;
  },

  recordView(id: string): void {
    if (!id) return;
    try {
      const viewed = new Set(JSON.parse(sessionStorage.getItem(VIEWED_STORAGE_KEY) || '[]'));
      if (viewed.has(id)) return;

      viewed.add(id);
      sessionStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(Array.from(viewed)));

      const all = this.getAllSnippets();
      const updated = all.map(s => {
        if (s?.id === id) {
          return { ...s, views: (s.views || 0) + 1 };
        }
        return s;
      });
      localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(updated));

      // Sync view increment with Firestore
      firebaseService.updateViews(id).catch(() => {});
    } catch {
      // Session storage disabled/full fallback
    }
  },

  /**
   * Merges real-time Firestore snippets into local state cache
   */
  syncFromCloud(cloudSnippets: Snippet[]): Snippet[] {
    if (!Array.isArray(cloudSnippets) || cloudSnippets.length === 0) {
      return this.getAllSnippets();
    }
    const local = this.getAllSnippets();
    const map = new Map<string, Snippet>();
    local.forEach(s => map.set(s.id, s));
    cloudSnippets.forEach(s => map.set(s.id, s));
    const merged = Array.from(map.values());
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('codeshelf_snippets_updated'));
    return merged;
  },

  downloadSnippetFile(snippet: Snippet): void {
    if (!snippet) return;
    const meta = LANGUAGES[snippet.language] || LANGUAGES.python;
    const filename = `${snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${meta.extension}`;
    const blob = new Blob([snippet.code], { type: meta.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
