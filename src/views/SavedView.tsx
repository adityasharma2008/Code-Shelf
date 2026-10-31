import React, { useMemo } from 'react';
import { Snippet } from '../types';
import { snippetStorage } from '../services/snippetStorage';
import { authService } from '../services/authService';
import { SnippetCard } from '../components/SnippetCard';
import { Bookmark, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SavedViewProps {
  snippets: Snippet[];
  onToast: (msg: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({ snippets, onToast }) => {
  const currentUser = authService.getCurrentUser();

  const bookmarkedSnippets = useMemo(() => {
    const bookmarkIds = snippetStorage.getUserBookmarks();
    return snippets.filter(s => s && bookmarkIds.has(s.id));
  }, [snippets]);

  if (!currentUser) {
    return (
      <div className="space-y-6 pb-12">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Bookmark className="w-3.5 h-3.5 fill-blue-600" />
            <span>PERSONAL COLLECTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bookmarked Snippets
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Quickly access your saved algorithms, queries, and utilities.
          </p>
        </div>

        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 shadow-xs max-w-lg mx-auto p-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Sign in to Access Bookmarks</h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please sign in with Google to download files or save bookmarks!
          </p>
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('codeshelf_require_auth', {
                  detail: { message: 'Please sign in with Google to download files or save bookmarks!' }
                })
              )
            }
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <Bookmark className="w-3.5 h-3.5 fill-blue-600" />
          <span>PERSONAL COLLECTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Bookmarked Snippets
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Quickly access your saved algorithms, queries, and utilities.
        </p>
      </div>

      {bookmarkedSnippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarkedSnippets.map((snippet) => (
            <SnippetCard
              key={snippet?.id}
              snippet={snippet}
              onToast={onToast}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-xl bg-white border border-slate-200 shadow-xs max-w-lg mx-auto p-6">
          <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-900">No bookmarked snippets yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any snippet card in the library to save it here for fast reference.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Library</span>
          </Link>
        </div>
      )}
    </div>
  );
};
