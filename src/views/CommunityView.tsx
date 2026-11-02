import React, { useState, useEffect } from 'react';
import { communityService, CommunityDiscussion, DiscussionReply } from '../services/communityService';
import { authService } from '../services/authService';
import { 
  MessageSquare, ThumbsUp, CheckCircle2, Search, Plus, 
  Tag, Filter, ArrowRight, CornerDownRight, X, Send, 
  HelpCircle, Sparkles, Check, Lock, Code2, Share2, BookOpen
} from 'lucide-react';

interface CommunityViewProps {
  onToast: (msg: string) => void;
  onRequestAuth: (reason: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ onToast, onRequestAuth }) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>(() => communityService.getAllDiscussions());
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSolved, setFilterSolved] = useState<'all' | 'solved' | 'unsolved'>('all');

  // New Discussion Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityDiscussion['category']>('Help & Debugging');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // Active Discussion Reader state
  const [activeDiscussion, setActiveDiscussion] = useState<CommunityDiscussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(authService.getCurrentUser());
      setDiscussions(communityService.getAllDiscussions());
      if (activeDiscussion) {
        setReplies(communityService.getRepliesForDiscussion(activeDiscussion.id));
      }
    };

    window.addEventListener('chullicode_discussions_updated', handleUpdate);
    window.addEventListener('codeshelf_auth_changed', handleUpdate);
    return () => {
      window.removeEventListener('chullicode_discussions_updated', handleUpdate);
      window.removeEventListener('codeshelf_auth_changed', handleUpdate);
    };
  }, [activeDiscussion]);

  // Load replies when a discussion is selected
  const handleOpenDiscussion = (d: CommunityDiscussion) => {
    setActiveDiscussion(d);
    setReplies(communityService.getRepliesForDiscussion(d.id));
  };

  const handleUpvoteDiscussion = (e: React.MouseEvent, discId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequestAuth('Sign in with Google to upvote discussions and support fellow developers.');
      return;
    }
    try {
      const res = communityService.upvoteDiscussion(discId);
      onToast(res.upvoted ? 'Upvoted discussion!' : 'Removed upvote');
    } catch (err: any) {
      onToast(err.message || 'Failed to upvote');
    }
  };

  const handleCreateDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequestAuth('Sign in with Google to start a new discussion.');
      return;
    }

    if (newTitle.trim().length < 5) {
      onToast('Discussion title must be at least 5 characters long.');
      return;
    }

    if (newContent.trim().length < 15) {
      onToast('Please describe your question or topic in at least 15 characters.');
      return;
    }

    const tags = newTags
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const created = communityService.createDiscussion({
      title: newTitle,
      content: newContent,
      category: newCategory,
      tags
    });

    onToast('Discussion posted to community!');
    setIsCreateOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    handleOpenDiscussion(created);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequestAuth('Sign in with Google to reply to this discussion.');
      return;
    }

    if (!activeDiscussion || replyInput.trim().length < 3) {
      onToast('Reply must be at least 3 characters.');
      return;
    }

    setIsSubmittingReply(true);
    try {
      communityService.addReply(activeDiscussion.id, replyInput);
      setReplyInput('');
      onToast('Reply posted successfully!');
    } catch (err: any) {
      onToast(err.message || 'Failed to post reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleToggleAccept = (replyId: string) => {
    if (!activeDiscussion) return;
    const isNowAccepted = communityService.toggleAcceptAnswer(activeDiscussion.id, replyId);
    onToast(isNowAccepted ? 'Marked as accepted answer!' : 'Unmarked accepted answer');
  };

  // Filtered discussions
  const filteredDiscussions = discussions.filter(d => {
    if (activeCategory !== 'All' && d.category !== activeCategory) return false;
    if (filterSolved === 'solved' && !d.isSolved) return false;
    if (filterSolved === 'unsolved' && d.isSolved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchContent = d.content.toLowerCase().includes(q);
      const matchTag = d.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }

    return true;
  });

  const categories = ['All', 'Help & Debugging', 'Best Practices', 'Show & Tell', 'General'];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Clean Header Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold text-xs uppercase tracking-wider font-mono">
                  Developer Community
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500">
                  Learn by building. Share by helping. Grow together.
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Technical Discussions & Questions
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Ask coding questions, share solutions, get peer code reviews, and collaborate with student developers across programming languages.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  onRequestAuth('Sign in with Google to start a new discussion.');
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer self-start md:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Ask a Question</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search discussions by topic, tag, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Discussions List */}
        <div className="space-y-3">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((d) => (
              <div
                key={d.id}
                onClick={() => handleOpenDiscussion(d)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {d.category}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {d.authorName}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                      {d.isSolved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solved</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {d.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {d.content}
                    </p>

                    {d.tags && d.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {d.tags.map(t => (
                          <span
                            key={t}
                            className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Counters */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => handleUpvoteDiscussion(e, d.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        currentUser && d.upvotedBy.includes(currentUser.id || currentUser.uid || '')
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                      title="Upvote discussion"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{d.upvotes}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{d.repliesCount || 0} replies</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery ? 'No matching discussions found' : 'No discussions yet. Start the first conversation.'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {searchQuery ? `No topics match "${searchQuery}". Try different keywords.` : 'Ask questions, discuss algorithms, share optimizations, or get debugging help from real developers.'}
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      onRequestAuth('Sign in with Google to start community discussions and ask questions.');
                    } else {
                      setIsCreateOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Discussion</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Discussion Details Modal / Drawer */}
      {activeDiscussion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveDiscussion(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white my-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="space-y-1.5 min-w-0 pr-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {activeDiscussion.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    By {activeDiscussion.authorName}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(activeDiscussion.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {activeDiscussion.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveDiscussion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* Discussion Content */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
                {activeDiscussion.content}
              </div>

              {/* Tags */}
              {activeDiscussion.tags && activeDiscussion.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeDiscussion.tags.map(t => (
                    <span
                      key={t}
                      className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Replies Header */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Responses & Solutions ({replies.length})</span>
                </h3>

                {/* Replies List */}
                <div className="space-y-3">
                  {replies.length > 0 ? (
                    replies.map((reply) => {
                      const isAuthorOfDiscussion = currentUser && (currentUser.id || currentUser.uid) === activeDiscussion.authorId;

                      return (
                        <div
                          key={reply.id}
                          className={`p-4 rounded-xl border text-xs sm:text-sm transition-all ${
                            reply.isAcceptedAnswer
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-500/20'
                              : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={reply.authorAvatar}
                                alt={reply.authorName}
                                className="w-6 h-6 rounded-full border border-slate-300"
                              />
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {reply.authorName}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {reply.isAcceptedAnswer && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                                <Check className="w-3.5 h-3.5" />
                                <span>Accepted Answer</span>
                              </span>
                            )}
                          </div>

                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap pl-8">
                            {reply.content}
                          </p>

                          {isAuthorOfDiscussion && (
                            <div className="pl-8 pt-2.5 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleAccept(reply.id)}
                                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{reply.isAcceptedAnswer ? 'Unmark Accepted' : 'Mark as Accepted Answer'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      No replies yet. Share your insights to help solve this topic!
                    </p>
                  )}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Write a Response
                </label>
                <textarea
                  rows={3}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={currentUser ? "Explain the solution, provide code advice, or ask clarifying questions..." : "Sign in to post a response..."}
                  disabled={!currentUser || isSubmittingReply}
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />

                <div className="flex items-center justify-between mt-2.5">
                  <div className="text-[11px] text-slate-500">
                    Be helpful and follow community guidelines.
                  </div>

                  {currentUser ? (
                    <button
                      type="submit"
                      disabled={isSubmittingReply || replyInput.trim().length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReply ? 'Posting...' : 'Post Reply'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRequestAuth('Sign in with Google to post your response.')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Reply</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Start Discussion Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-white my-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Start a New Discussion
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Help & Debugging">Help & Debugging</option>
                  <option value="Best Practices">Best Practices</option>
                  <option value="Show & Tell">Show & Tell</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to optimize Dijkstra algorithm in C++ for sparse graphs?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Details & Code Context
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your question, provide code blocks, expected vs actual behavior, or topic details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. cpp, algorithms, graph, optimization"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
