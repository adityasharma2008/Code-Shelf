import { authService } from './authService';
import { db } from './firebase';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';

export interface SnippetComment {
  id: string;
  snippetId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  parentId?: string; // For replies
}

export interface CommunityDiscussion {
  id: string;
  title: string;
  content: string;
  category: 'Help & Debugging' | 'Best Practices' | 'Show & Tell' | 'General';
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  repliesCount: number;
  snippetId?: string;
  isSolved?: boolean;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  isAcceptedAnswer?: boolean;
}

const COMMENTS_STORAGE_KEY = 'chullicode_snippet_comments';
const DISCUSSIONS_STORAGE_KEY = 'chullicode_discussions';
const REPLIES_STORAGE_KEY = 'chullicode_discussion_replies';

// Known legacy seeded discussion and reply IDs to safely purge
const SEED_IDS = new Set([
  'disc_welcome_guidelines',
  'disc_python_recursion_limit',
  'reply_seed_1',
  'reply_seed_2'
]);

/**
 * Purges any legacy fake or automatically seeded discussions and replies
 * from localStorage so no fabricated user data remains.
 */
function purgeFakeSeedData() {
  try {
    // 1. Purge discussions
    const rawDisc = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
    if (rawDisc) {
      const parsed: CommunityDiscussion[] = JSON.parse(rawDisc);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(d => d && d.id && !SEED_IDS.has(d.id));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(cleaned));
        }
      }
    }

    // 2. Purge replies
    const rawReplies = localStorage.getItem(REPLIES_STORAGE_KEY);
    if (rawReplies) {
      const parsed: DiscussionReply[] = JSON.parse(rawReplies);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(r => r && r.id && !SEED_IDS.has(r.id) && !SEED_IDS.has(r.discussionId));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(cleaned));
        }
      }
    }
  } catch {}
}

// Run purge once at module import
purgeFakeSeedData();

export const communityService = {
  // === Snippet Comments ===
  getCommentsForSnippet(snippetId: string): SnippetComment[] {
    try {
      const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (!raw) return [];
      const list: SnippetComment[] = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list.filter(c => c && c.snippetId === snippetId && !SEED_IDS.has(c.id));
    } catch {
      return [];
    }
  },

  addComment(snippetId: string, content: string, parentId?: string): SnippetComment {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in required to post comments.');

    const newComment: SnippetComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      snippetId,
      authorId: user.id || user.uid || 'anon',
      authorName: user.name || 'Developer',
      authorAvatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || user.id)}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      parentId
    };

    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const list: SnippetComment[] = raw ? JSON.parse(raw) : [];
    list.push(newComment);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(list));

    // Async sync to Firestore if authenticated
    try {
      setDoc(doc(db, 'comments', newComment.id), newComment).catch(() => {});
    } catch {}

    window.dispatchEvent(new CustomEvent('chullicode_comment_added', { detail: { snippetId } }));
    return newComment;
  },

  upvoteComment(commentId: string): { upvoted: boolean; count: number } {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in required to vote on comments.');

    const userId = user.id || user.uid || '';
    if (!userId) return { upvoted: false, count: 0 };

    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const list: SnippetComment[] = raw ? JSON.parse(raw) : [];
    const target = list.find(c => c.id === commentId);

    if (!target) return { upvoted: false, count: 0 };

    const hasUpvoted = target.upvotedBy.includes(userId);
    if (hasUpvoted) {
      target.upvotedBy = target.upvotedBy.filter(id => id !== userId);
      target.upvotes = Math.max(0, target.upvotes - 1);
    } else {
      target.upvotedBy.push(userId);
      target.upvotes += 1;
    }

    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(list));

    try {
      updateDoc(doc(db, 'comments', commentId), {
        upvotes: target.upvotes,
        upvotedBy: target.upvotedBy
      }).catch(() => {});
    } catch {}

    return { upvoted: !hasUpvoted, count: target.upvotes };
  },

  // === Community Discussions ===
  getAllDiscussions(): CommunityDiscussion[] {
    try {
      purgeFakeSeedData();
      const raw = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
      if (!raw) return [];
      const list: CommunityDiscussion[] = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list.filter(d => d && d.id && !SEED_IDS.has(d.id));
    } catch {
      return [];
    }
  },

  createDiscussion(params: {
    title: string;
    content: string;
    category: CommunityDiscussion['category'];
    tags: string[];
    snippetId?: string;
  }): CommunityDiscussion {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in required to start discussions.');

    const newDisc: CommunityDiscussion = {
      id: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: params.title.trim(),
      content: params.content.trim(),
      category: params.category,
      tags: params.tags,
      authorId: user.id || user.uid || '',
      authorName: user.name || 'Developer',
      authorAvatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || user.id)}`,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      repliesCount: 0,
      snippetId: params.snippetId,
      isSolved: false
    };

    const list = this.getAllDiscussions();
    list.unshift(newDisc);
    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(list));

    try {
      setDoc(doc(db, 'discussions', newDisc.id), newDisc).catch(() => {});
    } catch {}

    window.dispatchEvent(new Event('chullicode_discussions_updated'));
    return newDisc;
  },

  upvoteDiscussion(discussionId: string): { upvoted: boolean; count: number } {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in required to vote on discussions.');

    const userId = user.id || user.uid || '';
    if (!userId) return { upvoted: false, count: 0 };

    const list = this.getAllDiscussions();
    const target = list.find(d => d.id === discussionId);
    if (!target) return { upvoted: false, count: 0 };

    const hasUpvoted = target.upvotedBy.includes(userId);
    if (hasUpvoted) {
      target.upvotedBy = target.upvotedBy.filter(id => id !== userId);
      target.upvotes = Math.max(0, target.upvotes - 1);
    } else {
      target.upvotedBy.push(userId);
      target.upvotes += 1;
    }

    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(list));

    try {
      updateDoc(doc(db, 'discussions', discussionId), {
        upvotes: target.upvotes,
        upvotedBy: target.upvotedBy
      }).catch(() => {});
    } catch {}

    window.dispatchEvent(new Event('chullicode_discussions_updated'));
    return { upvoted: !hasUpvoted, count: target.upvotes };
  },

  getRepliesForDiscussion(discussionId: string): DiscussionReply[] {
    try {
      purgeFakeSeedData();
      const raw = localStorage.getItem(REPLIES_STORAGE_KEY);
      if (!raw) return [];
      const list: DiscussionReply[] = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list.filter(r => r && r.discussionId === discussionId && !SEED_IDS.has(r.id));
    } catch {
      return [];
    }
  },

  addReply(discussionId: string, content: string): DiscussionReply {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in required to post replies.');

    const newReply: DiscussionReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      discussionId,
      authorId: user.id || user.uid || '',
      authorName: user.name || 'Developer',
      authorAvatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || user.id)}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      isAcceptedAnswer: false
    };

    // Save reply
    const raw = localStorage.getItem(REPLIES_STORAGE_KEY);
    const list: DiscussionReply[] = raw ? JSON.parse(raw) : [];
    const cleaned = list.filter(r => r && !SEED_IDS.has(r.id));
    cleaned.push(newReply);
    localStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(cleaned));

    // Update discussion reply count
    const discList = this.getAllDiscussions();
    const disc = discList.find(d => d.id === discussionId);
    if (disc) {
      disc.repliesCount = (disc.repliesCount || 0) + 1;
      localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(discList));
    }

    try {
      setDoc(doc(db, 'discussion_replies', newReply.id), newReply).catch(() => {});
      updateDoc(doc(db, 'discussions', discussionId), { repliesCount: increment(1) }).catch(() => {});
    } catch {}

    window.dispatchEvent(new Event('chullicode_discussions_updated'));
    return newReply;
  },

  toggleAcceptAnswer(discussionId: string, replyId: string): boolean {
    const user = authService.getCurrentUser();
    if (!user) return false;

    const discList = this.getAllDiscussions();
    const disc = discList.find(d => d.id === discussionId);
    if (!disc) return false;

    // Only the genuine discussion author or admin can accept an answer
    const currentUid = user.id || user.uid;
    if (disc.authorId !== currentUid && user.email?.toLowerCase() !== 'shakti14112008@gmail.com') {
      return false;
    }

    const raw = localStorage.getItem(REPLIES_STORAGE_KEY);
    const list: DiscussionReply[] = raw ? JSON.parse(raw) : [];
    const reply = list.find(r => r.id === replyId);
    if (!reply) return false;

    const newState = !reply.isAcceptedAnswer;
    list.forEach(r => {
      if (r.discussionId === discussionId) {
        r.isAcceptedAnswer = r.id === replyId ? newState : false;
      }
    });

    disc.isSolved = newState;
    localStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(discList));

    try {
      updateDoc(doc(db, 'discussion_replies', replyId), { isAcceptedAnswer: newState }).catch(() => {});
      updateDoc(doc(db, 'discussions', discussionId), { isSolved: newState }).catch(() => {});
    } catch {}

    window.dispatchEvent(new Event('chullicode_discussions_updated'));
    return newState;
  }
};
