import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Snippet, Language, Difficulty } from '../types';
import { LANGUAGES, DIFFICULTY_LEVELS, CATEGORIES } from '../data/languages';
import { SnippetCard } from '../components/SnippetCard';
import { Search, ArrowUpDown, X, Plus, Code2, RotateCcw, FileCode2, Tag, Flame, Trophy } from 'lucide-react';
import { gamificationService } from '../services/gamificationService';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');
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

        // Search text matching
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
        {/* Clean Header Strip */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 shadow-xs text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            CodeShelf Developer Repository
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            A community code library where developers can browse, search, test, run, and publish verified code snippets across multiple languages.
          </p>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
            <p className="text-base font-semibold text-slate-800">
              No snippets published yet. Be the first to share your code!
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Publish an algorithm, data structure, SQL query, or utility function to get started.
            </p>
            <button
              onClick={onOpenSubmit}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs cursor-pointer"
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
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Community Code Library
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Search, run, and explore community-contributed code snippets across 9 languages.
            </p>
          </div>

          <button
            onClick={onOpenSubmit}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Code</span>
          </button>
        </div>

        {/* Clean Summary Stats Strip */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">{snippets.length}</span> Published Snippets
          </div>
          <span>·</span>
          <div>
            <span className="font-semibold text-slate-900">9</span> Supported Languages & SQL
          </div>
          <span>·</span>
          <div>
            <span className="font-semibold text-blue-600">Free In-Browser Runner</span> (Pyodide & sql.js)
          </div>
        </div>
      </div>

      {/* Gamification & Daily Engagement Strip */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-amber-50/60 border border-blue-200/60 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
            <Flame className="w-5 h-5 fill-orange-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                Daily Coding Streak: {userStats?.currentStreak ?? 0} Day{(userStats?.currentStreak ?? 0) === 1 ? '' : 's'} 🔥
              </span>
              <span className="font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded text-[11px]">
                Level {levelInfo.level}: {levelInfo.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Solve today's coding puzzle to advance your streak & earn +50 XP! Streak only counts when you solve real code.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onOpenDailyGame) {
                onOpenDailyGame();
              } else {
                window.dispatchEvent(new CustomEvent('codeself_open_daily_game'));
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>Play Daily Challenge</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('codeself_open_achievements'));
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-2xs hover:border-slate-400 transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by snippet title, keyword, algorithm, or author..."
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-9 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Real-time search auto-suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-98 duration-100">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Search Suggestions
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs hover:bg-blue-50/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.type === 'title' ? (
                        <FileCode2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : item.type === 'language' ? (
                        <Code2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate">
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
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 outline-none cursor-pointer font-medium"
              >
                <option value="recent">Recently Added</option>
                <option value="popular">Most Popular</option>
                <option value="views">Most Viewed</option>
              </select>
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
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Row 3: Category & Difficulty Sub-filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                  ? 'bg-slate-200 text-slate-900 font-medium'
                  : 'text-slate-500 hover:text-slate-800'
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
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {diff.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-2 text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Snippet Grid or Search Empty State */}
      {filteredSnippets.length > 0 ? (
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
        <div className="py-16 px-6 text-center rounded-2xl bg-white border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No matching snippets found
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            {searchQuery.trim()
              ? `We couldn't find any code snippets matching "${searchQuery}". Try adjusting your keywords or clearing active filters.`
              : 'No code snippets match the selected language, difficulty, or category filters.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters & Search</span>
            </button>
            <button
              onClick={onOpenSubmit}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Submit Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
