import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Snippet, Language, Difficulty } from '../types';
import { LANGUAGES, DIFFICULTY_LEVELS, CATEGORIES } from '../data/languages';
import { SnippetCard } from '../components/SnippetCard';
import { 
  Search, ArrowUpDown, X, Plus, Code2, RotateCcw, 
  FileCode2, Tag, Flame, Trophy, LayoutGrid, List, 
  Eye, Heart, Bookmark, ChevronRight, Share2, Copy, Check
} from 'lucide-react';
import { gamificationService } from '../services/gamificationService';
import { snippetStorage } from '../services/snippetStorage';
import { useNavigate, Link } from 'react-router-dom';

interface LibraryViewProps {
  snippets: Snippet[];
  onToast: (msg: string) => void;
  onOpenSubmit: () => void;
  onOpenDailyGame?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  snippets,
  onToast,
  onOpenSubmit,
  onOpenDailyGame
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views' | 'bookmarks'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userStats, setUserStats] = useState(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState(() => gamificationService.getLevelInfo());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGamification = () => {
      setUserStats(gamificationService.getStats());
      setLevelInfo(gamificationService.getLevelInfo());
    };
    window.addEventListener('codeself_gamification_updated', handleGamification);
    window.addEventListener('codeself_level_up', handleGamification);
    return () => {
      window.removeEventListener('codeself_gamification_updated', handleGamification);
      window.removeEventListener('codeself_level_up', handleGamification);
    };
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear any active search or filters when a snippet is submitted so the newly added card is instantly revealed
  useEffect(() => {
    const handleSnippetCreated = () => {
      setSearchQuery('');
      setSelectedLanguage('all');
      setSelectedCategory('All');
      setSelectedDifficulty('all');
      setSortBy('recent');
      setShowSuggestions(false);
    };

    window.addEventListener('codeshelf_snippet_created', handleSnippetCreated);
    return () => window.removeEventListener('codeshelf_snippet_created', handleSnippetCreated);
  }, []);

  // Compute real-time suggestions
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const list: Array<{
      type: 'title' | 'language' | 'category';
      label: string;
      sublabel?: string;
      action: () => void;
    }> = [];

    // 1. Snippets with matching titles
    const matchingSnippets = snippets.filter(s =>
      s.title?.toLowerCase().includes(q)
    ).slice(0, 3);

    matchingSnippets.forEach(s => {
      list.push({
        type: 'title',
        label: s.title,
        sublabel: `${LANGUAGES[s.language]?.name || s.language} · ${s.category}`,
        action: () => {
          setSearchQuery(s.title);
          setShowSuggestions(false);
        }
      });
    });

    // 2. Matching languages
    Object.values(LANGUAGES).forEach(lang => {
      if (lang.name.toLowerCase().includes(q) || lang.id.toLowerCase().includes(q)) {
        const count = snippets.filter(s => s.language === lang.id).length;
        list.push({
          type: 'language',
          label: `Language: ${lang.name}`,
          sublabel: `${count} published`,
          action: () => {
            setSelectedLanguage(lang.id);
            setSearchQuery('');
            setShowSuggestions(false);
          }
        });
      }
    });

    // 3. Matching categories
    CATEGORIES.forEach(cat => {
      if (cat.label.toLowerCase().includes(q) || cat.id.toLowerCase().includes(q)) {
        list.push({
          type: 'category',
          label: `Category: ${cat.label}`,
          action: () => {
            setSelectedCategory(cat.id);
            setSearchQuery('');
            setShowSuggestions(false);
          }
        });
      }
    });

    return list.slice(0, 5);
  }, [searchQuery, snippets]);

  const filteredSnippets = useMemo(() => {
    return snippets
      .filter((s) => {
        if (!s) return false;
        // Hide private snippets from public library
        if (s.isPrivate || s.visibility === 'private') return false;

        // Search text matching across title, description, author, tags, and code
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (s.title || '').toLowerCase().includes(q);
          const matchDesc = (s.description || '').toLowerCase().includes(q);
          const matchAuthor = (s.author?.name || '').toLowerCase().includes(q);
          const matchTags = (s.tags || []).some(t => (t || '').toLowerCase().includes(q));
          const matchCode = (s.code || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchAuthor && !matchTags && !matchCode) {
            return false;
          }
        }

        // Language matching
        if (selectedLanguage !== 'all' && s.language !== selectedLanguage) {
          return false;
        }

        // Category matching
        if (selectedCategory !== 'All' && s.category !== selectedCategory) {
          return false;
        }

        // Difficulty matching
        if (selectedDifficulty !== 'all' && s.difficulty !== selectedDifficulty) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.likes || 0) - (a.likes || 0);
        }
        if (sortBy === 'views') {
          return (b.views || 0) - (a.views || 0);
        }
        if (sortBy === 'bookmarks') {
          return (b.bookmarksCount || 0) - (a.bookmarksCount || 0);
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [snippets, searchQuery, selectedLanguage, selectedCategory, selectedDifficulty, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedCategory('All');
    setSelectedDifficulty('all');
    setShowSuggestions(false);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedLanguage !== 'all' ||
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'all';

  // Overall database empty state (0 snippets published yet)
  if (!snippets || snippets.length === 0) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xs text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            ChulliCode Explore Code Repository
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            A developer community repository where programmers can browse, search, test, run, and publish verified code snippets across multiple languages.
          </p>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No snippets published yet. Be the first to share your code!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Publish an algorithm, data structure, SQL query, or utility function to get started.
            </p>
            <button
              onClick={onOpenSubmit}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Code</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Minimalist Documentation Hub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Explore Code Repository
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500">
                Verified Multi-Language Snippets
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Browse Community Code
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Search, inspect, copy, and run community-contributed code algorithms across 9 programming languages.
            </p>
          </div>

          <button
            onClick={onOpenSubmit}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Code</span>
          </button>
        </div>

        {/* Clean Summary Stats Strip */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">{snippets.length}</span> Published Snippets
          </div>
          <span>·</span>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">9</span> Programming Languages & SQL
          </div>
          <span>·</span>
          <div>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Interactive Execution</span> (Pyodide & sql.js)
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Row 1: Search & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, tags, author, or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Real-time search auto-suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-30 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-98 duration-100">
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Search Suggestions
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs hover:bg-blue-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.type === 'title' ? (
                        <FileCode2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : item.type === 'language' ? (
                        <Code2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 truncate">
                        {item.label}
                      </span>
                    </div>
                    {item.sublabel && (
                      <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                        {item.sublabel}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 dark:text-slate-100 outline-none cursor-pointer font-medium text-xs"
              >
                <option value="recent">Recently Added</option>
                <option value="popular">Most Popular</option>
                <option value="views">Most Viewed</option>
                <option value="bookmarks">Most Bookmarked</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Compact List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Languages Filter Pills (Classic Blue when active) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedLanguage === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Languages
          </button>
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedLanguage === lang.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Row 3: Category & Difficulty Sub-filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-1 text-[11px]">Difficulty:</span>
            <button
              onClick={() => setSelectedDifficulty('all')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                selectedDifficulty === 'all'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            {DIFFICULTY_LEVELS.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  selectedDifficulty === diff.id
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {diff.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-2 text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Snippet Display: Grid or Compact List View */}
      {filteredSnippets.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet?.id}
                snippet={snippet}
                onToast={onToast}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
            {filteredSnippets.map((s) => {
              const langMeta = LANGUAGES[s.language] || LANGUAGES.python;
              const isLiked = snippetStorage.isLiked(s.id);
              const isBookmarked = snippetStorage.isBookmarked(s.id);

              return (
                <div
                  key={s.id}
                  onClick={() => navigate(`/snippet/${s.id}`)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                        {langMeta.name}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {s.category}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className={
                        s.difficulty === 'Beginner' ? 'text-emerald-600' : s.difficulty === 'Intermediate' ? 'text-amber-600' : 'text-rose-600'
                      }>
                        {s.difficulty}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        By {s.author?.name || 'Guest'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {s.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {s.description}
                    </p>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span title="Views">👁 {s.views || 0}</span>
                    <span title="Likes" className={isLiked ? 'text-rose-600 font-semibold' : ''}>
                      ♥ {s.likes || 0}
                    </span>
                    <span title="Bookmarks" className={isBookmarked ? 'text-blue-600 font-semibold' : ''}>
                      ★ {s.bookmarksCount || 0}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/snippet/${s.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      <span>View & Run</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : snippets.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No snippets published yet. Share your first code snippet.
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Be the first to share your code with the community. Publish an algorithm, data structure, or utility function.
          </p>
          <div className="mt-5">
            <button
              onClick={onOpenSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Code</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No matching snippets found
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {searchQuery.trim()
              ? `We couldn't find any code snippets matching "${searchQuery}". Try adjusting your keywords or clearing active filters.`
              : 'No code snippets match the selected language, difficulty, or category filters.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters & Search</span>
            </button>
            <button
              onClick={onOpenSubmit}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Submit Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
