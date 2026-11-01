import React, { useState, useEffect } from 'react';
import { Snippet } from '../types';
import { LANGUAGES } from '../data/languages';
import { snippetStorage } from '../services/snippetStorage';
import { authService } from '../services/authService';
import { Heart, Bookmark, Download, Copy, Check, Eye, ChevronRight, Trash2, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SnippetCardProps {
  snippet: Snippet;
  onToast?: (message: string) => void;
  onDelete?: (id: string) => void;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onToast, onDelete }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(() => snippetStorage.isLiked(snippet?.id));
  const [likeCount, setLikeCount] = useState(snippet?.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(() => snippetStorage.isBookmarked(snippet?.id));
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [canDelete, setCanDelete] = useState(() => snippetStorage.canDeleteSnippet(snippet));
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const langMeta = LANGUAGES[snippet?.language] || LANGUAGES.python;

  useEffect(() => {
    const updateCanDelete = () => {
      setCanDelete(snippetStorage.canDeleteSnippet(snippet));
    };
    updateCanDelete();
    window.addEventListener('codeshelf_auth_changed', updateCanDelete);
    window.addEventListener('codeshelf_snippets_updated', updateCanDelete);
    return () => {
      window.removeEventListener('codeshelf_auth_changed', updateCanDelete);
      window.removeEventListener('codeshelf_snippets_updated', updateCanDelete);
    };
  }, [snippet]);

  const handleShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/snippet/${snippet.id}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    if (onToast) onToast('Shareable snippet link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    const success = snippetStorage.deleteSnippet(snippet.id);
    if (success) {
      setIsDeleted(true);
      if (onToast) {
        onToast(`Deleted "${snippet.title}"`);
      }
      if (onDelete) {
        onDelete(snippet.id);
      }
    } else {
      if (onToast) onToast('Failed to delete snippet. Permission denied.');
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = snippetStorage.toggleLike(snippet?.id);
    setIsLiked(result.liked);
    setLikeCount(result.newCount);
    if (onToast) onToast(result.liked ? 'Added to upvoted snippets' : 'Upvote removed');
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      const msg = 'Please sign in with Google to download files or save bookmarks!';
      if (onToast) onToast(msg);
      window.dispatchEvent(
        new CustomEvent('codeshelf_require_auth', { detail: { message: msg } })
      );
      return;
    }

    const newState = snippetStorage.toggleBookmark(snippet?.id);
    setIsBookmarked(newState);
    if (onToast) onToast(newState ? 'Saved to bookmarks' : 'Removed from bookmarks');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!snippet?.code) return;
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    if (onToast) onToast(`Copied ${snippet.title} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      const msg = 'Please sign in with Google to download files or save bookmarks!';
      if (onToast) onToast(msg);
      window.dispatchEvent(
        new CustomEvent('codeshelf_require_auth', { detail: { message: msg } })
      );
      return;
    }

    snippetStorage.downloadSnippetFile(snippet);
    if (onToast) onToast(`Downloaded ${snippet.title}.${langMeta.extension}`);
  };

  if (isDeleted) {
    return null;
  }

  // Preview first 5 lines of code
  const codeLines = (snippet?.code || '').split('\n').slice(0, 5).join('\n');

  return (
    <div
      onClick={() => navigate(`/snippet/${snippet?.id}`)}
      className="group relative flex flex-col bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-5 transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md text-left"
    >
      {/* Top Header Row: Clean unboxed metadata discipline */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {langMeta.name}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {snippet?.category || 'General'}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span
            className={
              snippet?.difficulty === 'Beginner'
                ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                : snippet?.difficulty === 'Intermediate'
                ? 'text-amber-700 dark:text-amber-400 font-medium'
                : 'text-rose-700 dark:text-rose-400 font-medium'
            }
          >
            {snippet?.difficulty}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleShareLink}
            title="Copy shareable link"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            title={`Download .${langMeta.extension}`}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleBookmark}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark snippet'}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isBookmarked ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
          </button>
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              title="Delete snippet"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Snippet Title & Description */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {snippet?.title}
        </h3>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {snippet?.description}
        </p>
      </div>

      {/* Code Preview Strip */}
      <div className="relative my-2 p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] leading-5 text-slate-200 overflow-hidden select-none">
        <pre className="overflow-hidden font-mono">{codeLines}</pre>
        <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
      </div>

      {/* Tags row */}
      {snippet?.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3 text-[11px] text-slate-500 dark:text-slate-400">
          {snippet.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="font-mono">
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="text-slate-400 text-[10px]">+{snippet.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: Author, views, like counter, and run affordance */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          {snippet?.author?.avatar ? (
            <img
              src={snippet.author.avatar}
              alt={snippet.author.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
              {snippet?.author?.name?.[0]?.toUpperCase() || 'G'}
            </div>
          )}
          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[95px] text-xs font-medium">
            {snippet?.author?.name || 'Guest'}
          </span>
          {snippet?.teamName ? (
            <span 
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0"
              title={`Uploaded under team "${snippet.teamName}" by ${snippet.uploadedByMember || snippet.author?.name}`}
            >
              Team: {snippet.teamName}
            </span>
          ) : (snippet?.isGuest || snippet?.author?.role === 'Guest' || snippet?.author?.isGuest || !snippet?.userId) ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
              Guest
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {/* View count */}
          <div className="flex items-center gap-1 text-slate-400" title={`${snippet?.views || 0} views`}>
            <Eye className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums text-[11px]">{snippet?.views || 0}</span>
          </div>

          {/* Like button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              isLiked ? 'text-rose-600 font-semibold' : 'text-slate-400 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
            <span className="font-mono tabular-nums text-[11px]">{likeCount}</span>
          </button>

          {/* Run Code affordance (Classic Blue) */}
          <div className="flex items-center gap-1 text-blue-600 group-hover:translate-x-0.5 transition-transform font-medium text-[11px]">
            <span>Run</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Visual Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
          }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmDelete();
                }}
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
