import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Snippet, ExecutionResult } from '../types';
import { snippetStorage } from '../services/snippetStorage';
import { authService } from '../services/authService';
import { gamificationService } from '../services/gamificationService';
import { LANGUAGES } from '../data/languages';
import { CodeEditor } from '../components/CodeEditor';
import { TerminalPanel } from '../components/TerminalPanel';
import { runInteractiveCode } from '../services/codeRunner';
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Download, 
  Heart, 
  Bookmark, 
  Copy, 
  Check, 
  Eye, 
  Share2, 
  FileCode2,
  Trash2,
  SmilePlus,
  Flag,
  Lock,
  Unlock,
  Edit3,
  Save,
  Sparkles
} from 'lucide-react';

interface SnippetDetailViewProps {
  onToast: (msg: string) => void;
  onOpenReport?: (config: {
    type: 'snippet';
    snippetId: string;
    snippetTitle: string;
    snippetLanguage: string;
  }) => void;
  onRequestAuth?: (reason: string) => void;
}

export const SnippetDetailView: React.FC<SnippetDetailViewProps> = ({ onToast, onOpenReport, onRequestAuth }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // All state hooks declared unconditionally at top level
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [editableCode, setEditableCode] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSavingCode, setIsSavingCode] = useState<boolean>(false);

  // Interactive Execution & Online-GDB Input State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const [inputPromptLabel, setInputPromptLabel] = useState<string>('');
  const [liveOutput, setLiveOutput] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const inputResolverRef = React.useRef<((val: string) => void) | null>(null);
  const abortRef = React.useRef<boolean>(false);

  const [reactions, setReactions] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(`codeself_reactions_${id}`);
      return saved ? JSON.parse(saved) : { rocket: 5, bulb: 8, soap: 4, book: 6 };
    } catch {
      return { rocket: 5, bulb: 8, soap: 4, book: 6 };
    }
  });
  const [myReactions, setMyReactions] = useState<{ [key: string]: boolean }>({});

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Sync canDelete status dynamically
  useEffect(() => {
    setCanDelete(snippetStorage.canDeleteSnippet(snippet));
    const handleAuthChange = () => {
      setCanDelete(snippetStorage.canDeleteSnippet(snippet));
    };
    window.addEventListener('codeshelf_auth_changed', handleAuthChange);
    return () => window.removeEventListener('codeshelf_auth_changed', handleAuthChange);
  }, [snippet]);

  // Load snippet data hook
  useEffect(() => {
    if (!id) return;
    const loadSnippet = () => {
      const found = snippetStorage.getSnippetById(id);
      if (found) {
        setSnippet(found);
        setEditableCode(found.code);
        setIsLiked(snippetStorage.isLiked(found.id));
        setLikeCount(found.likes || 0);
        setIsBookmarked(snippetStorage.isBookmarked(found.id));
        snippetStorage.recordView(found.id);
      } else {
        setSnippet(null);
      }
    };

    loadSnippet();
    window.addEventListener('codeshelf_snippets_updated', loadSnippet);
    return () => window.removeEventListener('codeshelf_snippets_updated', loadSnippet);
  }, [id]);

  // Code execution callback hook using real-time interactive runner
  const handleRun = useCallback(async () => {
    if (isRunning || !snippet) return;
    setIsRunning(true);
    setIsWaitingForInput(false);
    setLiveOutput('');
    setExecutionResult(null);
    abortRef.current = false;

    try {
      const result = await runInteractiveCode(snippet.language, editableCode, {
        initialStdin: '',
        onOutput: (output) => {
          setLiveOutput(output);
        },
        onPromptInput: async (promptContext, varName) => {
          return new Promise<string>((resolve) => {
            inputResolverRef.current = resolve;
            setIsWaitingForInput(true);
            const label = varName || (promptContext ? promptContext.trim() : 'Input value (cin / prompt)');
            setInputPromptLabel(label);
          });
        },
        onStatusChange: (status, message) => {
          if (status === 'waiting_for_input') {
            setIsWaitingForInput(true);
            if (message) setInputPromptLabel(message);
          } else if (status === 'running') {
            setIsWaitingForInput(false);
          }
        },
        isAborted: () => abortRef.current
      });

      setExecutionResult(result);
      gamificationService.recordAction('run_code', { language: snippet.language });
    } catch (err: any) {
      setExecutionResult({
        stdout: '',
        stderr: err?.message || String(err),
        executionTimeMs: 0,
        status: 'error'
      });
    } finally {
      setIsRunning(false);
      setIsWaitingForInput(false);
      inputResolverRef.current = null;
    }
  }, [isRunning, snippet, editableCode]);

  const handleInputSubmit = (val: string) => {
    if (inputResolverRef.current) {
      inputResolverRef.current(val);
      inputResolverRef.current = null;
      setIsWaitingForInput(false);
    }
  };

  const handleStopExecution = () => {
    abortRef.current = true;
    if (inputResolverRef.current) {
      inputResolverRef.current('');
      inputResolverRef.current = null;
    }
    setIsRunning(false);
    setIsWaitingForInput(false);
    onToast('Execution stopped');
  };

  // Save modified code either as an update (if creator) or as a new fork in user profile
  const handleSaveEditedCode = () => {
    if (!snippet) return;
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      const msg = 'Please sign in first to save this code to your account!';
      onToast(msg);
      if (onRequestAuth) {
        onRequestAuth(msg);
      } else {
        window.dispatchEvent(
          new CustomEvent('codeshelf_require_auth', { detail: { message: msg } })
        );
      }
      return;
    }

    setIsSavingCode(true);
    const isOwner = snippet.userId === currentUser.id || 
      (snippet.authorEmail && snippet.authorEmail.toLowerCase() === currentUser.email.toLowerCase());

    if (isOwner) {
      snippetStorage.updateSnippet(snippet.id, {
        code: editableCode
      });
      setSnippet(prev => prev ? { ...prev, code: editableCode } : null);
      setIsEditMode(false);
      setIsSavingCode(false);
      onToast('Snippet code updated successfully!');
    } else {
      const res = snippetStorage.saveSnippet({
        title: `${snippet.title} (My Fork)`,
        description: `Customized version of "${snippet.title}". Original code by ${snippet.author?.name || 'Community'}.`,
        language: snippet.language,
        difficulty: snippet.difficulty,
        category: snippet.category,
        tags: [...(snippet.tags || []), 'fork'],
        code: editableCode,
        isPrivate: true
      });

      setIsSavingCode(false);
      if (res.success && res.snippet) {
        setIsEditMode(false);
        onToast(`Saved copy "${snippet.title} (My Fork)" to your profile!`);
        navigate(`/snippet/${res.snippet.id}`);
      } else {
        onToast(res.error || 'Failed to save code copy.');
      }
    }
  };

  // Global Ctrl + Enter listener hook
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleRun]);

  // Event handlers
  const handleReset = () => {
    if (!snippet) return;
    setEditableCode(snippet.code);
    setExecutionResult(null);
    onToast('Reset code to original snippet source.');
  };

  const handleLike = () => {
    if (!snippet) return;
    const res = snippetStorage.toggleLike(snippet.id);
    setIsLiked(res.liked);
    setLikeCount(res.newCount);
    if (res.liked) {
      gamificationService.recordAction('like_snippet');
      onToast('Snippet upvoted! +10 XP');
    } else {
      onToast('Upvote removed');
    }
  };

  const handleBookmark = () => {
    if (!snippet) return;
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      const msg = 'Please sign in with Google to download files or save bookmarks!';
      onToast(msg);
      window.dispatchEvent(
        new CustomEvent('codeshelf_require_auth', { detail: { message: msg } })
      );
      return;
    }

    const newState = snippetStorage.toggleBookmark(snippet.id);
    setIsBookmarked(newState);
    if (newState) {
      gamificationService.recordAction('bookmark_snippet');
      onToast('Saved to bookmarks! +10 XP');
    } else {
      onToast('Removed from bookmarks');
    }
  };

  const handleReaction = (type: string, label: string) => {
    setReactions(prev => {
      const count = (prev[type] || 0) + (myReactions[type] ? -1 : 1);
      const updated = { ...prev, [type]: Math.max(0, count) };
      localStorage.setItem(`codeself_reactions_${id}`, JSON.stringify(updated));
      return updated;
    });
    const willBeActive = !myReactions[type];
    setMyReactions(prev => ({ ...prev, [type]: willBeActive }));
    if (willBeActive) {
      gamificationService.recordAction('add_reaction');
      onToast(`Reacted with ${label}! +12 XP`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    onToast('Copied code to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!snippet) return;
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      const msg = 'Please sign in with Google to download files or save bookmarks!';
      onToast(msg);
      window.dispatchEvent(
        new CustomEvent('codeshelf_require_auth', { detail: { message: msg } })
      );
      return;
    }

    const langMeta = LANGUAGES[snippet.language] || LANGUAGES.python;
    snippetStorage.downloadSnippetFile({
      ...snippet,
      code: editableCode
    });
    onToast(`Downloaded ${snippet.title}.${langMeta.extension}`);
  };

  const handleShare = () => {
    if (!snippet) return;
    if (navigator.share) {
      navigator.share({
        title: snippet.title,
        text: snippet.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onToast('Snippet link copied to clipboard!');
    }
  };

  const handleReport = () => {
    if (!snippet) return;
    if (onOpenReport) {
      onOpenReport({
        type: 'snippet',
        snippetId: snippet.id,
        snippetTitle: snippet.title,
        snippetLanguage: snippet.language
      });
    } else {
      window.dispatchEvent(
        new CustomEvent('codeself_open_report', {
          detail: {
            type: 'snippet',
            snippetId: snippet.id,
            snippetTitle: snippet.title,
            snippetLanguage: snippet.language
          }
        })
      );
    }
  };

  const handleDeleteClick = () => {
    if (!snippet) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!snippet) return;
    setShowDeleteModal(false);
    const success = snippetStorage.deleteSnippet(snippet.id);
    if (success) {
      onToast(`Deleted "${snippet.title}"`);
      navigate('/');
    } else {
      onToast('Failed to delete snippet.');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Safe unconditional hook boundary: ALL hooks above, conditional returns below
  if (!snippet) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <FileCode2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Snippet Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The requested snippet could not be located or may have been removed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Snippet Library</span>
        </button>
      </div>
    );
  }

  const langMeta = LANGUAGES[snippet.language] || LANGUAGES.python;

  const formattedDate = new Date(snippet.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with Breadcrumbs & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Library</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className={`font-medium ${langMeta.color}`}>{langMeta.name}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{snippet.title}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer ${
              isLiked
                ? 'bg-rose-50 border-rose-200 text-rose-600 font-medium'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span className="tabular-nums font-mono">{likeCount}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            title={isBookmarked ? 'Bookmarked' : 'Save Bookmark'}
            className={`p-2 text-xs rounded-xl border transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            title={`Download .${langMeta.extension}`}
            className="p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Share snippet link"
            className="p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Report Code Snippet */}
          <button
            onClick={handleReport}
            title="Report this snippet (broken code, malicious, plagiarism)"
            className="p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          {/* Delete (Own Snippet Only) */}
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              title="Delete your snippet"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Snippet Header Information */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            {/* Metadata line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className={`font-semibold ${langMeta.color}`}>{langMeta.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-700 font-medium">{snippet.category}</span>
              <span className="text-slate-300">·</span>
              <span
                className={
                  snippet.difficulty === 'Beginner'
                    ? 'text-emerald-600 font-medium'
                    : snippet.difficulty === 'Intermediate'
                    ? 'text-amber-600 font-medium'
                    : 'text-rose-600 font-medium'
                }
              >
                {snippet.difficulty} Level
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-400 font-mono tabular-nums">
                <Eye className="w-3.5 h-3.5" />
                {snippet.views || 0} views
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {snippet.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {snippet.description}
            </p>

            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
                {snippet.tags.map((tag, idx) => (
                  <span key={idx} className="text-slate-500 font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive Community Reactions (Visitor & Learner Engagement) */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                <SmilePlus className="w-3.5 h-3.5 text-slate-400" />
                <span>Reactions:</span>
              </span>

              {[
                { type: 'rocket', emoji: '🚀', label: 'Blazing Fast', count: reactions.rocket || 0 },
                { type: 'bulb', emoji: '💡', label: 'Clever Logic', count: reactions.bulb || 0 },
                { type: 'soap', emoji: '🧼', label: 'Clean Code', count: reactions.soap || 0 },
                { type: 'book', emoji: '📚', label: 'Helpful', count: reactions.book || 0 },
              ].map(r => {
                const isActive = myReactions[r.type];
                return (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => handleReaction(r.type, r.label)}
                    title={r.label}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? 'bg-blue-50 border border-blue-300 text-blue-700 font-semibold shadow-2xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span className="text-[11px] font-mono tabular-nums">{r.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author Card Box */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs shrink-0 self-start">
            {snippet.author?.avatar ? (
              <img
                src={snippet.author.avatar}
                alt={snippet.author.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                {snippet.author?.name?.[0] || 'G'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <span>{snippet.author?.name || 'Guest'}</span>
                {snippet.teamName ? (
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold border border-indigo-200">
                    Team: {snippet.teamName}
                  </span>
                ) : (snippet.isGuest || snippet.author?.role === 'Guest' || snippet.author?.isGuest || !snippet.userId) ? (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                    Guest
                  </span>
                ) : snippet.author?.isVerified ? (
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-200">Admin</span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-normal">
                    {snippet.author?.role || 'Contributor'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {snippet.uploadedByMember ? `Uploaded by ${snippet.uploadedByMember}` : `@${snippet.author?.username}`}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Published {formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Execution Engine Section */}
      <div className="space-y-4">
        {/* Editor Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            {!isEditMode ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-xs">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Protected Code (Read-Only)</span>
                </span>
                <span className="text-slate-400 hidden sm:inline">· Click "Edit / Fork Code" to modify or save your version</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-semibold border border-amber-200 text-xs animate-pulse">
                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Editor Unlocked (Edit Mode)</span>
                </span>
                <span className="text-slate-500 hidden sm:inline">· You can modify and save to your account</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isEditMode ? (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit / Fork Code</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditableCode(snippet.code);
                    setIsEditMode(false);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSavingCode}
                  onClick={handleSaveEditedCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingCode ? 'Saving...' : 'Save to My Account'}</span>
                </button>
              </div>
            )}

            {editableCode !== snippet.code && !isEditMode && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleRun}
              disabled={isRunning}
              title="Run Code (Ctrl + Enter)"
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Code</span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-700 font-mono text-blue-100">
                    Ctrl+↵
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Editor with strict readOnly prop when not in Edit Mode */}
        <CodeEditor
          code={editableCode}
          onChange={setEditableCode}
          language={snippet.language}
          readOnly={!isEditMode}
          minHeight="380px"
          maxHeight="520px"
          onRun={handleRun}
        />

        {/* Live Interactive Terminal Panel with cin / prompt() support */}
        <TerminalPanel
          result={executionResult}
          isRunning={isRunning}
          isWaitingForInput={isWaitingForInput}
          inputPromptLabel={inputPromptLabel}
          onInputSubmit={handleInputSubmit}
          onStopExecution={handleStopExecution}
          liveOutput={liveOutput}
          onRun={handleRun}
          onReset={editableCode !== snippet.code ? handleReset : undefined}
          resetLabel="Reset Code"
          onClear={() => {
            setExecutionResult(null);
            setLiveOutput('');
          }}
          language={snippet.language}
        />
      </div>

      {/* Visual Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-slate-900 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Delete Code Snippet
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete this code snippet?
            </p>
            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 truncate">
              {snippet?.title}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              This action cannot be undone and will permanently remove it from CodeShelf.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Delete Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
