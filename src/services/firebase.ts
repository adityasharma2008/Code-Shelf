import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Snippet, User } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Enforce account selection prompt for Google OAuth
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

// Validate connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Standardized error handling according to Firebase integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Convert Firestore doc to clean Snippet model
function sanitizeSnippetDoc(data: any): Snippet {
  return {
    id: data.id,
    title: data.title || 'Untitled Snippet',
    description: data.description || '',
    language: data.language || 'python',
    difficulty: data.difficulty || 'Intermediate',
    category: data.category || 'Algorithms',
    tags: Array.isArray(data.tags) ? data.tags : [],
    code: data.code || '',
    sampleOutput: data.sampleOutput || '',
    createdAt: data.createdAt || new Date().toISOString(),
    likes: typeof data.likes === 'number' ? data.likes : 0,
    views: typeof data.views === 'number' ? data.views : 0,
    bookmarksCount: typeof data.bookmarksCount === 'number' ? data.bookmarksCount : 0,
    isCommunitySubmitted: data.isCommunitySubmitted !== false,
    userId: data.userId || undefined,
    userEmail: data.userEmail || undefined,
    author: data.author || {
      name: 'Guest',
      username: 'guest',
      avatar: '',
      isVerified: false,
      role: 'Member'
    }
  };
}

export const firebaseService = {
  /**
   * Authentic Google Sign-In with Firebase Popup
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      const cleanUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Developer',
        email: fbUser.email || '',
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(fbUser.email || fbUser.uid)}`,
        provider: 'google',
        role: 'Contributor',
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      // Upsert user profile document in Firestore
      try {
        const userRef = doc(db, 'users', fbUser.uid);
        await setDoc(
          userRef,
          {
            id: fbUser.uid,
            name: cleanUser.name,
            email: cleanUser.email,
            avatar: cleanUser.avatar,
            role: cleanUser.role,
            createdAt: cleanUser.createdAt
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Note: user profile save caught', err);
      }

      return cleanUser;
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        throw new Error('Google sign-in popup was cancelled.');
      }
      throw error;
    }
  },

  /**
   * Signs out of Firebase
   */
  async signOut(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Listen to Firebase auth state changes
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Fetch all snippets from Firestore
   */
  async fetchSnippets(): Promise<Snippet[]> {
    const path = 'snippets';
    try {
      const q = query(collection(db, path), where('isCommunitySubmitted', '==', true));
      const snapshot = await getDocs(q);
      const list: Snippet[] = [];
      snapshot.forEach(docSnap => {
        list.push(sanitizeSnippetDoc(docSnap.data()));
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  /**
   * Realtime subscription to public snippets
   */
  subscribeSnippets(callback: (snippets: Snippet[]) => void): () => void {
    const path = 'snippets';
    const q = query(collection(db, path), where('isCommunitySubmitted', '==', true));
    return onSnapshot(
      q,
      snapshot => {
        const list: Snippet[] = [];
        snapshot.forEach(docSnap => {
          list.push(sanitizeSnippetDoc(docSnap.data()));
        });
        callback(list);
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  /**
   * Save or upload snippet to Firestore
   */
  async saveSnippet(snippet: Snippet): Promise<void> {
    if (!auth.currentUser) {
      // Unauthenticated sessions are local-only and do not have Firestore write access
      return;
    }
    const path = `snippets/${snippet.id}`;
    try {
      const docRef = doc(db, 'snippets', snippet.id);
      const payload: Record<string, any> = {
        id: snippet.id,
        title: snippet.title,
        description: snippet.description || '',
        language: snippet.language,
        difficulty: snippet.difficulty || 'Intermediate',
        category: snippet.category || 'Algorithms',
        tags: snippet.tags || [],
        code: snippet.code,
        sampleOutput: snippet.sampleOutput || '',
        createdAt: snippet.createdAt || new Date().toISOString(),
        likes: snippet.likes || 0,
        views: snippet.views || 0,
        bookmarksCount: snippet.bookmarksCount || 0,
        isCommunitySubmitted: true
      };

      if (snippet.userId) payload.userId = snippet.userId;
      if (snippet.userEmail) payload.userEmail = snippet.userEmail;
      if (snippet.author) payload.author = snippet.author;

      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  /**
   * Update snippet content in Firestore
   */
  async updateSnippetContent(
    snippetId: string,
    updates: Partial<Snippet>
  ): Promise<void> {
    if (!auth.currentUser) {
      return;
    }
    const path = `snippets/${snippetId}`;
    try {
      const docRef = doc(db, 'snippets', snippetId);
      const payload: Record<string, any> = {};
      const allowedFields = [
        'title',
        'description',
        'language',
        'difficulty',
        'category',
        'tags',
        'code',
        'sampleOutput'
      ] as const;

      allowedFields.forEach(field => {
        if (field in updates) {
          payload[field] = (updates as any)[field];
        }
      });

      await updateDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Delete snippet from Firestore
   */
  async deleteSnippet(snippetId: string): Promise<void> {
    if (!auth.currentUser) {
      // Unauthenticated sessions do not have Firestore permissions; skip cloud delete
      return;
    }
    const path = `snippets/${snippetId}`;
    try {
      const docRef = doc(db, 'snippets', snippetId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  /**
   * Increment/decrement likes
   */
  async updateLikes(snippetId: string, delta: number): Promise<void> {
    const path = `snippets/${snippetId}`;
    try {
      const docRef = doc(db, 'snippets', snippetId);
      await updateDoc(docRef, {
        likes: increment(delta)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Increment views
   */
  async updateViews(snippetId: string): Promise<void> {
    const path = `snippets/${snippetId}`;
    try {
      const docRef = doc(db, 'snippets', snippetId);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Increment/decrement bookmarks
   */
  async updateBookmarks(snippetId: string, delta: number): Promise<void> {
    const path = `snippets/${snippetId}`;
    try {
      const docRef = doc(db, 'snippets', snippetId);
      await updateDoc(docRef, {
        bookmarksCount: increment(delta)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
