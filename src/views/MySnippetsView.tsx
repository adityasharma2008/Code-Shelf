import React, { useMemo, useState, useEffect } from 'react';
import { Snippet } from '../types';
import { authService } from '../services/authService';
import { snippetStorage } from '../services/snippetStorage';
import { SnippetCard } from '../components/SnippetCard';
import { FolderCode, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MySnippetsViewProps {
  snippets: Snippet[];
  onToast: (msg: string) => void;
  onOpenSubmit: () => void;
}

export const MySnippetsView: React.FC<MySnippetsViewProps> = ({
  snippets,
  onToast,
  onOpenSubmit
}) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('codeshelf_auth_changed', handleAuthChange);
    return () => window.removeEventListener('codeshelf_auth_changed', handleAuthChange);
  }, []);

  const mySnippets = useMemo(() => {
    return snippets.filter(s => {
      if (!s) return false;
      return snippetStorage.canDeleteSnippet(s);
    });
  }, [snippets, currentUser]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <FolderCode className="w-3.5 h-3.5" />
            <span>MY SUBMISSIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Published Snippets
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Code snippets and algorithms you have published to the CodeShelf repository.
          </p>
        </div>

        <button
          onClick={onOpenSubmit}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Code</span>
        </button>
      </div>

      {mySnippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mySnippets.map((snippet) => (
            <SnippetCard
              key={snippet?.id}
              snippet={snippet}
              onToast={onToast}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-xl bg-white border border-slate-200 shadow-xs max-w-lg mx-auto p-6">
          <FolderCode className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-900">No published snippets yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Share an algorithm, utility function, or SQL query with fellow developers worldwide.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Browse Library
            </Link>
            <button
              onClick={onOpenSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit First Code</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
