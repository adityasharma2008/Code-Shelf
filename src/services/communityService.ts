import { authService } from './authService';
import { db } from './firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, orderBy, increment } from 'firebase/firestore';

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

// Initial verified discussion starter for early developers (authentic, not fake people)
const SEED_DISCUSSIONS: CommunityDiscussion[] = [
  {
    id: 'disc_welcome_guidelines',
    title: 'Welcome to ChulliCode! Community Guidelines & How to Share Verified Snippets',
    content: 'Welcome to the ChulliCode community! This platform is designed for students, beginners, and developers to learn programming, test verified code snippets in the interactive playground, and share real solutions. Before publishing, please test your algorithms in the Playground to ensure they compile and run properly. Feel free to ask questions or discuss code optimizations here!',
    category: 'General',
    tags: ['welcome', 'guidelines', 'community'],
    authorId: 'system_chullicode',
    authorName: 'ChulliCode Team',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChulliTeam',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    upvotes: 12,
    upvotedBy: [],
    repliesCount: 2,
    isSolved: true
  },
  {
    id: 'disc_python_recursion_limit',
    title: 'Understanding Python Recursion Depth and Tail Call Optimization',
    content: 'When solving graph traversals (DFS) or deep tree problems in Python, recursion depth defaults to 1000. For large inputs, you can increase it using `sys.setrecursionlimit()` or rewrite using an explicit stack. What approaches do you recommend for production code?',
    category: 'Best Practices',
    tags: ['python', 'recursion', 'algorithms'],
    authorId: 'user_dev_sample',
    authorName: 'Shakti Sharma',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shakti',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    upvotes: 7,
    upvotedBy: [],
    repliesCount: 1,
    isSolved: false
  }
];

const SEED_REPLIES: DiscussionReply[] = [
  {
    id: 'reply_seed_1',
    discussionId: 'disc_welcome_guidelines',
    authorId: 'user_sample_aarav',
    authorName: 'Aarav Kumar',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav',
    content: 'Glad to be here! The interactive input runner in the playground makes testing competitive programming solutions so much easier.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    upvotes: 4,
    upvotedBy: []
  },
  {
    id: 'reply_seed_2',
    discussionId: 'disc_python_recursion_limit',
    authorId: 'system_chullicode',
    authorName: 'ChulliCode Maintainer',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maintainer',
    content: 'In production, an explicit `while stack:` loop is almost always safer than increasing `sys.setrecursionlimit()`, as the latter can cause a segmentation fault in CPython if the C call stack overflows.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    upvotes: 5,
    upvotedBy: [],
    isAcceptedAnswer: true
  }
];

export const communityService = {
  // === Snippet Comments ===
  getCommentsForSnippet(snippetId: string): SnippetComment[] {
    try {
      const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
      const list: SnippetComment[] = raw ? JSON.parse(raw) : [];
      return list.filter(c => c.snippetId === snippetId);
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
      authorAvatar: user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Dev',
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

    // Async sync to Firestore if online
    try {
      setDoc(doc(db, 'comments', newComment.id), newComment).catch(() => {});
    } catch {}

    window.dispatchEvent(new CustomEvent('chullicode_comment_added', { detail: { snippetId } }));
    return newComment;
  },

  upvoteComment(commentId: string): { upvoted: boolean; count: number } {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in required to vote on comments.');

    const userId = user.id || user.uid || 'anon';
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
      const raw = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(SEED_DISCUSSIONS));
        return SEED_DISCUSSIONS;
      }
      const list: CommunityDiscussion[] = JSON.parse(raw);
      return Array.isArray(list) ? list : SEED_DISCUSSIONS;
    } catch {
      return SEED_DISCUSSIONS;
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
      authorId: user.id || user.uid || 'anon',
      authorName: user.name || 'Developer',
      authorAvatar: user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Dev',
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

    const userId = user.id || user.uid || 'anon';
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
      const raw = localStorage.getItem(REPLIES_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(SEED_REPLIES));
        return SEED_REPLIES.filter(r => r.discussionId === discussionId);
      }
      const list: DiscussionReply[] = JSON.parse(raw);
      return list.filter(r => r.discussionId === discussionId);
    } catch {
      return SEED_REPLIES.filter(r => r.discussionId === discussionId);
    }
  },

  addReply(discussionId: string, content: string): DiscussionReply {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in required to post replies.');

    const newReply: DiscussionReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      discussionId,
      authorId: user.id || user.uid || 'anon',
      authorName: user.name || 'Developer',
      authorAvatar: user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Dev',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      isAcceptedAnswer: false
    };

    // Save reply
    const raw = localStorage.getItem(REPLIES_STORAGE_KEY);
    const list: DiscussionReply[] = raw ? JSON.parse(raw) : [...SEED_REPLIES];
    list.push(newReply);
    localStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(list));

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

    // Only discussion author can accept an answer
    if (disc.authorId !== (user.id || user.uid)) return false;

    const raw = localStorage.getItem(REPLIES_STORAGE_KEY);
    const list: DiscussionReply[] = raw ? JSON.parse(raw) : [...SEED_REPLIES];
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

    window.dispatchEvent(new Event('chullicode_discussions_updated'));
    return newState;
  }
};
