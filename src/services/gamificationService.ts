import { Achievement, DailyQuest, UserStats, CodingGameChallenge, Language } from '../types';
import { authService } from './authService';
import { snippetStorage } from './snippetStorage';
import confetti from 'canvas-confetti';

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  progressPercent: number;
  color: string;
}

export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Novice Coder', minXP: 0, maxXP: 300, color: 'text-slate-600' },
  { level: 2, title: 'Syntax Apprentice', minXP: 300, maxXP: 800, color: 'text-emerald-600' },
  { level: 3, title: 'Code Craftsman', minXP: 800, maxXP: 1800, color: 'text-blue-600' },
  { level: 4, title: 'Algorithm Artisan', minXP: 1800, maxXP: 3500, color: 'text-indigo-600' },
  { level: 5, title: 'Polyglot Specialist', minXP: 3500, maxXP: 6000, color: 'text-purple-600' },
  { level: 6, title: 'System Architect', minXP: 6000, maxXP: 10000, color: 'text-amber-600' },
  { level: 7, title: 'Core Engineer', minXP: 10000, maxXP: 16000, color: 'text-orange-600' },
  { level: 8, title: 'Principal Hacker', minXP: 16000, maxXP: 25000, color: 'text-rose-600' },
  { level: 9, title: 'Grandmaster Dev', minXP: 25000, maxXP: 40000, color: 'text-fuchsia-600' },
  { level: 10, title: 'Legendary Pioneer', minXP: 40000, maxXP: 75000, color: 'text-yellow-600' }
];

export const DAILY_CODING_CHALLENGES: CodingGameChallenge[] = [
  // C++ Challenges
  {
    id: 'game_cpp_boundary',
    type: 'bug_spotter',
    title: 'C++ Boundary Hunt',
    language: 'C++',
    difficulty: 'Easy',
    prompt: 'Identify the critical boundary bug in this C++ sum function that could cause undefined behavior or memory crash.',
    codeSnippet: `int sumArray(const int arr[], int n) {
    int total = 0;
    // Scan array elements
    for (int i = 0; i <= n; i++) {
        total += arr[i];
    }
    return total;
}`,
    options: [
      'Line 4: Loop condition i <= n causes an out-of-bounds read; should be i < n.',
      'Line 2: total is initialized to 0 instead of 1.',
      'Line 1: const int arr[] is invalid syntax in C++.',
      'Line 7: Missing return statement inside loop.'
    ],
    correctAnswerIndex: 0,
    explanation: 'In 0-indexed arrays with length n, valid indices are 0 to n - 1. Using i <= n accesses arr[n] which is out of bounds.',
    pointsReward: 50
  },
  {
    id: 'game_cpp_vector_capacity',
    type: 'output_predictor',
    title: 'C++ Vector Memory Growth',
    language: 'C++',
    difficulty: 'Medium',
    prompt: 'What does this C++ vector code print after reserving memory vs pushing back?',
    codeSnippet: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    v.reserve(10);
    v.push_back(1);
    v.push_back(2);
    std::cout << v.size() << " " << v.capacity() << std::endl;
    return 0;
}`,
    options: [
      '2 10',
      '10 10',
      '2 2',
      '10 2'
    ],
    correctAnswerIndex: 0,
    explanation: 'reserve(10) allocates capacity for 10 elements without changing the size (number of inserted elements), which is 2 after two push_back calls.',
    pointsReward: 50
  },

  // Python Challenges
  {
    id: 'game_python_comprehension',
    type: 'output_predictor',
    title: 'Python Filter & Map',
    language: 'Python',
    difficulty: 'Easy',
    prompt: 'Predict the exact console output of this Python list comprehension when executed.',
    codeSnippet: `numbers = [1, 2, 3, 4, 5, 6]
result = [x * 2 for x in numbers if x % 2 == 0]
print(result)`,
    options: [
      '[4, 8, 12]',
      '[2, 4, 6, 8, 10, 12]',
      '[2, 6, 10]',
      '[1, 3, 5]'
    ],
    correctAnswerIndex: 0,
    explanation: 'The if filter (x % 2 == 0) matches only even numbers [2, 4, 6]. Multiplying each by 2 produces [4, 8, 12].',
    pointsReward: 50
  },
  {
    id: 'game_python_mutable_defaults',
    type: 'bug_spotter',
    title: 'Python Default Argument Trap',
    language: 'Python',
    difficulty: 'Medium',
    prompt: 'Why does this Python function behave unexpectedly across multiple invocations?',
    codeSnippet: `def collect_data(item, bucket=[]):
    bucket.append(item)
    return bucket

print(collect_data("a"))
print(collect_data("b"))`,
    options: [
      'The default list argument bucket=[] is evaluated once at definition time and shared across calls.',
      'The function returns None instead of the list.',
      'bucket.append does not mutate in place.',
      'Python strings cannot be stored in lists.'
    ],
    correctAnswerIndex: 0,
    explanation: 'Default argument expressions in Python are evaluated once when the function is defined, making mutable defaults persist state across invocations.',
    pointsReward: 50
  },

  // SQL Challenges
  {
    id: 'game_sql_distinct',
    type: 'output_predictor',
    title: 'SQL Distinct Aggregation',
    language: 'SQL',
    difficulty: 'Easy',
    prompt: 'A company has 6 employees in Engineering (3), Marketing (2), and Design (1). What does this query return?',
    codeSnippet: `SELECT COUNT(DISTINCT department) AS dept_count 
FROM employees;`,
    options: [
      '3',
      '6',
      '1',
      'NULL'
    ],
    correctAnswerIndex: 0,
    explanation: 'COUNT(DISTINCT department) eliminates duplicates and counts unique department names: Engineering, Marketing, Design (3).',
    pointsReward: 50
  },
  {
    id: 'game_sql_join_nulls',
    type: 'output_predictor',
    title: 'SQL Left Join & NULL Filtering',
    language: 'SQL',
    difficulty: 'Medium',
    prompt: 'Given customers table (10 rows) and orders table (7 matching customers). How many rows does this query produce?',
    codeSnippet: `SELECT c.id
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;`,
    options: [
      '3',
      '7',
      '10',
      '0'
    ],
    correctAnswerIndex: 0,
    explanation: 'A LEFT JOIN followed by WHERE o.id IS NULL returns only customers who have placed zero orders: 10 - 7 = 3.',
    pointsReward: 50
  },

  // JavaScript Challenges
  {
    id: 'game_js_swap_assembly',
    type: 'code_assembly',
    title: 'JavaScript Reverse Logic',
    language: 'JavaScript',
    difficulty: 'Medium',
    prompt: 'Arrange the scrambled code statements into the correct logical order to reverse a string.',
    codeSnippet: `function reverseString(str) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}`,
    scrambledLines: [
      '    return reversed;',
      'function reverseString(str) {',
      '        reversed += str[i];',
      '    for (let i = str.length - 1; i >= 0; i--) {',
      "    let reversed = '';",
      '    }',
      '}'
    ],
    correctOrder: [1, 4, 3, 2, 5, 0, 6],
    explanation: 'The function first initializes the empty string, iterates backward from str.length - 1 down to 0, appends each character, and returns the result.',
    pointsReward: 50
  },
  {
    id: 'game_js_event_loop',
    type: 'output_predictor',
    title: 'JavaScript Event Loop Microtasks',
    language: 'JavaScript',
    difficulty: 'Medium',
    prompt: 'Predict the console output order for this asynchronous JavaScript snippet:',
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    options: [
      '1, 4, 3, 2',
      '1, 2, 3, 4',
      '1, 4, 2, 3',
      '1, 3, 4, 2'
    ],
    correctAnswerIndex: 0,
    explanation: 'Synchronous logs (1, 4) execute first. Microtasks (Promise.then -> 3) run before macrotasks (setTimeout -> 2), resulting in 1, 4, 3, 2.',
    pointsReward: 50
  },

  // Java Challenges
  {
    id: 'game_java_string_pool',
    type: 'output_predictor',
    title: 'Java String Pool Comparison',
    language: 'Java',
    difficulty: 'Easy',
    prompt: 'What does this Java snippet print when comparing literal strings vs explicit objects?',
    codeSnippet: `String s1 = "CodeSelf";
String s2 = "CodeSelf";
String s3 = new String("CodeSelf");
System.out.println((s1 == s2) + " " + (s1 == s3));`,
    options: [
      'true false',
      'true true',
      'false false',
      'false true'
    ],
    correctAnswerIndex: 0,
    explanation: 's1 and s2 refer to the same interned string in the String Pool (s1 == s2 is true). new String creates a distinct heap object, so s1 == s3 is false.',
    pointsReward: 50
  },

  // TypeScript Challenges
  {
    id: 'game_ts_generics',
    type: 'bug_spotter',
    title: 'TypeScript Type Narrowing',
    language: 'TypeScript',
    difficulty: 'Easy',
    prompt: 'Identify which line causes a TypeScript compiler type error:',
    codeSnippet: `type Result = { status: 'success'; data: string } | { status: 'error'; message: string };

function handle(res: Result) {
    if (res.status === 'success') {
        console.log(res.data);
    } else {
        console.log(res.data); // Line 8
    }
}`,
    options: [
      'Line 8: Property data does not exist on type { status: error; message: string }',
      'Line 1: Union types cannot use string literal discriminator',
      'Line 5: if statement does not narrow discriminated unions',
      'Line 3: Missing return type on function handle'
    ],
    correctAnswerIndex: 0,
    explanation: 'In the else branch, TypeScript discriminates Result to the error variant which only has message, not data.',
    pointsReward: 50
  }
];

class GamificationService {
  private getStorageKey(userId: string): string {
    return `codeself_stats_${userId}`;
  }

  /**
   * Get fresh stats for current signed-in user.
   * Auto-validates streaks and activates Streak Savers if exactly 1 day was missed.
   */
  public getStats(): UserStats | null {
    const user = authService.getCurrentUser();
    if (!user) return null;

    let stats: UserStats | null = null;
    try {
      const raw = localStorage.getItem(this.getStorageKey(user.id));
      if (raw) {
        stats = JSON.parse(raw);
      }
    } catch {}

    if (!stats) {
      // Clean initial stats starting at strictly 0 XP and 0 streak!
      // New users get 2 Streak Savers as a welcome protection shield!
      const initial: UserStats = {
        xp: 0,
        level: 1,
        currentStreak: 0,
        highestStreak: 0,
        lastActiveDate: '',
        snippetsUploaded: 0,
        codeRunsCount: 0,
        likesGiven: 0,
        bookmarksCount: 0,
        languagesRun: [],
        languagesUploaded: [],
        reactionsGiven: 0,
        unlockedAchievementIds: [],
        dailyQuestsDate: new Date().toISOString().slice(0, 10),
        claimedQuestIds: [],
        lastGameCompletedDate: '',
        languagePoints: {
          python: 0,
          sql: 0,
          cpp: 0,
          c: 0,
          java: 0,
          javascript: 0,
          typescript: 0,
          csharp: 0,
          php: 0,
          html_css: 0
        },
        completedLessons: [],
        quizzesCompleted: {},
        streakSavers: 2,
        streakSaversUsed: 0,
        streakBreaksCount: 0,
        challengesSolvedCount: 0
      };
      this.saveStats(initial);
      return initial;
    }

    // Ensure default fields for existing profiles
    if (stats.streakSavers === undefined) {
      stats.streakSavers = 2;
      stats.streakSaversUsed = 0;
      stats.streakBreaksCount = 0;
      stats.challengesSolvedCount = 0;
    }

    // Daily Streak Validation & Streak Saver Protection
    const today = new Date().toISOString().slice(0, 10);
    if (stats.lastGameCompletedDate && stats.lastGameCompletedDate !== today) {
      const lastTime = new Date(stats.lastGameCompletedDate).getTime();
      const todayTime = new Date(today).getTime();
      const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 2 && stats.currentStreak > 0) {
        // User missed exactly 1 day (yesterday)
        if (stats.streakSavers && stats.streakSavers > 0) {
          // Consume 1 Streak Saver shield!
          stats.streakSavers -= 1;
          stats.streakSaversUsed = (stats.streakSaversUsed || 0) + 1;
          // Set last completed date to yesterday so today's challenge can continue streak!
          const yesterday = new Date(todayTime - 86400000).toISOString().slice(0, 10);
          stats.lastGameCompletedDate = yesterday;
          this.saveStats(stats);
          window.dispatchEvent(
            new CustomEvent('codeself_streak_saved', {
              detail: { streak: stats.currentStreak, remainingSavers: stats.streakSavers }
            })
          );
        } else {
          // No streak saver left -> Streak breaks!
          stats.currentStreak = 0;
          stats.streakBreaksCount = (stats.streakBreaksCount || 0) + 1;
          this.saveStats(stats);
          window.dispatchEvent(
            new CustomEvent('codeself_streak_broken', {
              detail: { previousStreak: stats.highestStreak }
            })
          );
        }
      } else if (diffDays > 2 && stats.currentStreak > 0) {
        // Missed 2 or more consecutive days -> Streak breaks completely
        stats.currentStreak = 0;
        stats.streakBreaksCount = (stats.streakBreaksCount || 0) + 1;
        this.saveStats(stats);
        window.dispatchEvent(
          new CustomEvent('codeself_streak_broken', {
            detail: { previousStreak: stats.highestStreak }
          })
        );
      }
    }

    return stats;
  }

  private saveStats(stats: UserStats) {
    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      localStorage.setItem(this.getStorageKey(user.id), JSON.stringify(stats));
      window.dispatchEvent(new CustomEvent('codeself_gamification_updated', { detail: stats }));
    } catch {}
  }

  public getLevelInfo(): LevelInfo {
    const stats = this.getStats();
    const xp = stats ? stats.xp : 0;
    let current = LEVEL_THRESHOLDS[0];

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp >= LEVEL_THRESHOLDS[i].minXP) {
        current = LEVEL_THRESHOLDS[i];
      }
    }

    const range = current.maxXP - current.minXP;
    const progressWithin = Math.min(range, Math.max(0, xp - current.minXP));
    const progressPercent = Math.min(100, Math.round((progressWithin / range) * 100));

    return {
      level: current.level,
      title: current.title,
      minXP: current.minXP,
      maxXP: current.maxXP,
      progressPercent,
      color: current.color
    };
  }

  public isDailyGameCompletedToday(): boolean {
    const stats = this.getStats();
    if (!stats) return false;
    const today = new Date().toISOString().slice(0, 10);
    return stats.lastGameCompletedDate === today;
  }

  public getTodayChallenge(languageFilter?: string): CodingGameChallenge {
    const filtered = languageFilter && languageFilter !== 'all'
      ? DAILY_CODING_CHALLENGES.filter(c => c.language.toLowerCase() === languageFilter.toLowerCase())
      : DAILY_CODING_CHALLENGES;

    const list = filtered.length > 0 ? filtered : DAILY_CODING_CHALLENGES;
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % list.length;
    return list[idx];
  }

  public getAllTodayChallenges(): CodingGameChallenge[] {
    return DAILY_CODING_CHALLENGES;
  }

  /**
   * Complete a daily coding puzzle.
   * Advances daily streak and awards XP!
   */
  public completeDailyGame(challengeId: string): { success: boolean; xpEarned: number; newStreak: number; alreadyCompletedToday: boolean } {
    const user = authService.getCurrentUser();
    if (!user) {
      return { success: false, xpEarned: 0, newStreak: 0, alreadyCompletedToday: false };
    }

    const stats = this.getStats()!;
    const today = new Date().toISOString().slice(0, 10);

    if (stats.lastGameCompletedDate === today) {
      return {
        success: true,
        xpEarned: 0,
        newStreak: stats.currentStreak,
        alreadyCompletedToday: true
      };
    }

    // Calculate streak advancement
    const lastDate = stats.lastGameCompletedDate;
    if (!lastDate) {
      stats.currentStreak = 1;
    } else {
      const lastTime = new Date(lastDate).getTime();
      const todayTime = new Date(today).getTime();
      const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1;
      }
    }

    if (stats.currentStreak > stats.highestStreak) {
      stats.highestStreak = stats.currentStreak;
    }

    stats.lastGameCompletedDate = today;
    stats.lastActiveDate = today;
    stats.challengesSolvedCount = (stats.challengesSolvedCount || 0) + 1;

    const challenge = DAILY_CODING_CHALLENGES.find(c => c.id === challengeId) || DAILY_CODING_CHALLENGES[0];
    const xpReward = challenge.pointsReward || 50;

    stats.xp += xpReward;
    this.saveStats(stats);
    this.checkAchievements(stats);

    try {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 }
      });
    } catch {}

    return {
      success: true,
      xpEarned: xpReward,
      newStreak: stats.currentStreak,
      alreadyCompletedToday: false
    };
  }

  public getLanguagePoints(): Record<Language, number> {
    const stats = this.getStats();
    const defaults: Record<Language, number> = {
      python: 0,
      sql: 0,
      cpp: 0,
      c: 0,
      java: 0,
      javascript: 0,
      typescript: 0,
      csharp: 0,
      php: 0,
      html_css: 0
    };

    if (!stats || !stats.languagePoints) return defaults;
    return {
      ...defaults,
      ...stats.languagePoints
    };
  }

  public addXp(amount: number, language?: Language): void {
    const user = authService.getCurrentUser();
    if (!user) return;
    const stats = this.getStats();
    if (!stats) return;
    stats.xp += amount;
    if (language) {
      if (!stats.languagePoints) stats.languagePoints = {};
      stats.languagePoints[language] = (stats.languagePoints[language] || 0) + amount;
    }
    this.saveStats(stats);
    this.checkAchievements(stats);
  }

  public recordLanguageQuizCompletion(
    language: Language,
    correctCount: number,
    totalQuestions: number
  ): {
    xpEarned: number;
    langPointsEarned: number;
    newStreak: number;
    isPerfectScore: boolean;
  } {
    const user = authService.getCurrentUser();
    if (!user) {
      return { xpEarned: 0, langPointsEarned: 0, newStreak: 0, isPerfectScore: false };
    }

    const stats = this.getStats()!;
    if (!stats.languagePoints) stats.languagePoints = {};
    if (!stats.quizzesCompleted) stats.quizzesCompleted = {};

    const langPointsEarned = correctCount * 15;
    stats.languagePoints[language] = (stats.languagePoints[language] || 0) + langPointsEarned;

    let xpEarned = correctCount * 10;
    if (correctCount >= 7) {
      xpEarned += 50;
    }
    stats.xp += xpEarned;

    // Advance daily streak if not yet completed today
    const today = new Date().toISOString().slice(0, 10);
    if (stats.lastGameCompletedDate !== today && correctCount >= 1) {
      const lastDate = stats.lastGameCompletedDate;
      if (!lastDate) {
        stats.currentStreak = 1;
      } else {
        const lastTime = new Date(lastDate).getTime();
        const todayTime = new Date(today).getTime();
        const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));
        stats.currentStreak = diffDays === 1 ? stats.currentStreak + 1 : 1;
      }

      if (stats.currentStreak > stats.highestStreak) {
        stats.highestStreak = stats.currentStreak;
      }
      stats.lastGameCompletedDate = today;
    }

    stats.lastActiveDate = today;
    stats.quizzesCompleted[language] = {
      score: correctCount,
      total: totalQuestions,
      completedAt: new Date().toISOString()
    };

    this.saveStats(stats);
    this.checkAchievements(stats);

    if (correctCount >= 7) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    return {
      xpEarned,
      langPointsEarned,
      newStreak: stats.currentStreak,
      isPerfectScore: correctCount === totalQuestions
    };
  }

  public recordLessonCompletion(lessonId: string, language?: Language): { xpEarned: number } {
    const user = authService.getCurrentUser();
    if (!user) return { xpEarned: 0 };

    const stats = this.getStats()!;
    if (!stats.completedLessons) stats.completedLessons = [];

    if (stats.completedLessons.includes(lessonId)) {
      return { xpEarned: 0 };
    }

    stats.completedLessons.push(lessonId);
    stats.xp += 25;

    if (language) {
      if (!stats.languagePoints) stats.languagePoints = {};
      stats.languagePoints[language] = (stats.languagePoints[language] || 0) + 20;
    }

    this.saveStats(stats);
    this.checkAchievements(stats);

    return { xpEarned: 25 };
  }

  public recordAction(action: 'run_code' | 'upload_snippet' | 'like_snippet' | 'bookmark_snippet' | 'add_reaction', meta?: any) {
    const user = authService.getCurrentUser();
    if (!user) return;

    const stats = this.getStats()!;
    let xpGained = 0;

    switch (action) {
      case 'run_code':
        stats.codeRunsCount += 1;
        if (meta?.language && !stats.languagesRun.includes(meta.language)) {
          stats.languagesRun.push(meta.language);
          xpGained += 20;
        }
        xpGained += 5;
        break;

      case 'upload_snippet':
        stats.snippetsUploaded += 1;
        if (meta?.language && !stats.languagesUploaded.includes(meta.language)) {
          stats.languagesUploaded.push(meta.language);
          xpGained += 30;
        }
        xpGained += 50;
        break;

      case 'like_snippet':
        stats.likesGiven += 1;
        xpGained += 5;
        break;

      case 'bookmark_snippet':
        stats.bookmarksCount += 1;
        xpGained += 5;
        break;

      case 'add_reaction':
        stats.reactionsGiven += 1;
        xpGained += 5;
        break;
    }

    stats.xp += xpGained;
    this.saveStats(stats);
    this.checkAchievements(stats);
  }

  /**
   * 40+ Progression-Tiered Achievements & Badges (Clean English, Zero Placeholder/Slop)
   */
  public getAchievements(): Achievement[] {
    const stats = this.getStats();
    const s = stats || {
      snippetsUploaded: 0,
      codeRunsCount: 0,
      languagesRun: [],
      languagesUploaded: [],
      currentStreak: 0,
      highestStreak: 0,
      likesGiven: 0,
      bookmarksCount: 0,
      reactionsGiven: 0,
      completedLessons: [],
      quizzesCompleted: {},
      streakSaversUsed: 0,
      challengesSolvedCount: 0
    };

    const quizzesDoneCount = Object.keys(s.quizzesCompleted || {}).length;
    const lessonsDoneCount = (s.completedLessons || []).length;
    const perfectQuizzesCount = Object.values(s.quizzesCompleted || {}).filter((q: any) => q.score === q.total).length;
    const effectiveStreak = Math.max(s.currentStreak, s.highestStreak);

    return [
      // CATEGORY 1: CREATION & AUTHORSHIP (10 Badges)
      {
        id: 'creator_first_code',
        title: 'Hello World',
        description: 'Publish your very first code snippet to the community repository.',
        category: 'creator',
        xpReward: 50,
        iconName: 'UploadCloud',
        badgeTier: 'bronze',
        progress: Math.min(1, s.snippetsUploaded),
        maxProgress: 1,
        unlocked: s.snippetsUploaded >= 1
      },
      {
        id: 'creator_craftsman_3',
        title: 'Triple Threat',
        description: 'Publish 3 working code snippets across your developer profile.',
        category: 'creator',
        xpReward: 100,
        iconName: 'Sparkles',
        badgeTier: 'bronze',
        progress: Math.min(3, s.snippetsUploaded),
        maxProgress: 3,
        unlocked: s.snippetsUploaded >= 3
      },
      {
        id: 'creator_contributor_5',
        title: 'Repository Contributor',
        description: 'Publish 5 clean, verified code solutions for the community.',
        category: 'creator',
        xpReward: 150,
        iconName: 'Layers',
        badgeTier: 'silver',
        progress: Math.min(5, s.snippetsUploaded),
        maxProgress: 5,
        unlocked: s.snippetsUploaded >= 5
      },
      {
        id: 'creator_author_10',
        title: 'Prolific Author',
        description: 'Publish 10 code algorithms or utilities to establish your presence.',
        category: 'creator',
        xpReward: 250,
        iconName: 'Layers',
        badgeTier: 'silver',
        progress: Math.min(10, s.snippetsUploaded),
        maxProgress: 10,
        unlocked: s.snippetsUploaded >= 10
      },
      {
        id: 'creator_artisan_25',
        title: 'Artisan Developer',
        description: 'Publish 25 code snippets demonstrating consistent craftsmanship.',
        category: 'creator',
        xpReward: 500,
        iconName: 'Medal',
        badgeTier: 'gold',
        progress: Math.min(25, s.snippetsUploaded),
        maxProgress: 25,
        unlocked: s.snippetsUploaded >= 25
      },
      {
        id: 'creator_master_50',
        title: 'Master Architect',
        description: 'Publish 50 verified code snippets to achieve legendary repository status.',
        category: 'creator',
        xpReward: 1000,
        iconName: 'Crown',
        badgeTier: 'diamond',
        progress: Math.min(50, s.snippetsUploaded),
        maxProgress: 50,
        unlocked: s.snippetsUploaded >= 50
      },
      {
        id: 'creator_bilingual',
        title: 'Bilingual Coder',
        description: 'Publish code snippets in at least 2 distinct programming languages.',
        category: 'creator',
        xpReward: 100,
        iconName: 'Globe',
        badgeTier: 'bronze',
        progress: Math.min(2, s.languagesUploaded.length),
        maxProgress: 2,
        unlocked: s.languagesUploaded.length >= 2
      },
      {
        id: 'creator_polyglot_3',
        title: 'Polyglot Author',
        description: 'Publish code across 3 distinct programming language ecosystems.',
        category: 'creator',
        xpReward: 200,
        iconName: 'Globe',
        badgeTier: 'silver',
        progress: Math.min(3, s.languagesUploaded.length),
        maxProgress: 3,
        unlocked: s.languagesUploaded.length >= 3
      },
      {
        id: 'creator_omniglot_5',
        title: 'Omniglot Engineer',
        description: 'Publish snippets in 5 different programming languages.',
        category: 'creator',
        xpReward: 400,
        iconName: 'Globe',
        badgeTier: 'gold',
        progress: Math.min(5, s.languagesUploaded.length),
        maxProgress: 5,
        unlocked: s.languagesUploaded.length >= 5
      },
      {
        id: 'creator_fork_master',
        title: 'Code Remixer',
        description: 'Edit, customize, or fork a snippet to save your own copy.',
        category: 'creator',
        xpReward: 80,
        iconName: 'Cpu',
        badgeTier: 'bronze',
        progress: Math.min(1, s.snippetsUploaded > 0 ? 1 : 0),
        maxProgress: 1,
        unlocked: s.snippetsUploaded >= 1
      },

      // CATEGORY 2: EXECUTION & COMPILER (8 Badges)
      {
        id: 'learner_first_run',
        title: 'First Ignition',
        description: 'Execute your first code snippet in the interactive browser compiler.',
        category: 'learner',
        xpReward: 30,
        iconName: 'Play',
        badgeTier: 'bronze',
        progress: Math.min(1, s.codeRunsCount),
        maxProgress: 1,
        unlocked: s.codeRunsCount >= 1
      },
      {
        id: 'learner_runs_10',
        title: 'Console Explorer',
        description: 'Execute code 10 times across playground or library snippets.',
        category: 'learner',
        xpReward: 60,
        iconName: 'Terminal',
        badgeTier: 'bronze',
        progress: Math.min(10, s.codeRunsCount),
        maxProgress: 10,
        unlocked: s.codeRunsCount >= 10
      },
      {
        id: 'learner_runs_50',
        title: 'Test Pilot',
        description: 'Execute code 50 times in the interactive environment.',
        category: 'learner',
        xpReward: 150,
        iconName: 'Terminal',
        badgeTier: 'silver',
        progress: Math.min(50, s.codeRunsCount),
        maxProgress: 50,
        unlocked: s.codeRunsCount >= 50
      },
      {
        id: 'learner_runs_150',
        title: 'Execution Veteran',
        description: 'Run 150 code executions to stress-test your algorithms.',
        category: 'learner',
        xpReward: 300,
        iconName: 'Zap',
        badgeTier: 'gold',
        progress: Math.min(150, s.codeRunsCount),
        maxProgress: 150,
        unlocked: s.codeRunsCount >= 150
      },
      {
        id: 'learner_runs_500',
        title: 'Terminal Grandmaster',
        description: 'Execute 500 code scripts in the compiler across your journey.',
        category: 'learner',
        xpReward: 750,
        iconName: 'Crown',
        badgeTier: 'diamond',
        progress: Math.min(50, s.codeRunsCount),
        maxProgress: 500,
        unlocked: s.codeRunsCount >= 500
      },
      {
        id: 'learner_langs_3',
        title: 'Multi-Runtime Explorer',
        description: 'Execute code in at least 3 different programming languages.',
        category: 'learner',
        xpReward: 80,
        iconName: 'Cpu',
        badgeTier: 'bronze',
        progress: Math.min(3, s.languagesRun.length),
        maxProgress: 3,
        unlocked: s.languagesRun.length >= 3
      },
      {
        id: 'learner_langs_6',
        title: 'Cross-Language Specialist',
        description: 'Execute code in 6 different languages in the playground.',
        category: 'learner',
        xpReward: 180,
        iconName: 'Cpu',
        badgeTier: 'silver',
        progress: Math.min(6, s.languagesRun.length),
        maxProgress: 6,
        unlocked: s.languagesRun.length >= 6
      },
      {
        id: 'learner_langs_all',
        title: 'Full-Stack Compiler',
        description: 'Execute code in all 9 supported languages (C++, Python, SQL, Java, etc.).',
        category: 'learner',
        xpReward: 400,
        iconName: 'Crown',
        badgeTier: 'gold',
        progress: Math.min(9, s.languagesRun.length),
        maxProgress: 9,
        unlocked: s.languagesRun.length >= 9
      },

      // CATEGORY 3: STREAKS & DAILY CHALLENGES (8 Badges)
      {
        id: 'streak_first_puzzle',
        title: 'Daily Problem Solver',
        description: 'Solve your first daily coding challenge or quiz.',
        category: 'streak',
        xpReward: 50,
        iconName: 'Target',
        badgeTier: 'bronze',
        progress: Math.min(1, s.challengesSolvedCount || (s.currentStreak > 0 ? 1 : 0)),
        maxProgress: 1,
        unlocked: (s.challengesSolvedCount || 0) >= 1 || s.currentStreak >= 1
      },
      {
        id: 'streak_puzzles_5',
        title: 'Consistent Solver',
        description: 'Solve 5 daily coding challenges to build disciplined momentum.',
        category: 'streak',
        xpReward: 120,
        iconName: 'Target',
        badgeTier: 'bronze',
        progress: Math.min(5, s.challengesSolvedCount || 0),
        maxProgress: 5,
        unlocked: (s.challengesSolvedCount || 0) >= 5
      },
      {
        id: 'streak_puzzles_15',
        title: 'Puzzle Specialist',
        description: 'Solve 15 daily coding puzzles across algorithms, syntax & queries.',
        category: 'streak',
        xpReward: 250,
        iconName: 'Target',
        badgeTier: 'silver',
        progress: Math.min(15, s.challengesSolvedCount || 0),
        maxProgress: 15,
        unlocked: (s.challengesSolvedCount || 0) >= 15
      },
      {
        id: 'streak_3_days',
        title: 'Spark of Discipline',
        description: 'Maintain an active 3-day unbroken daily coding streak.',
        category: 'streak',
        xpReward: 100,
        iconName: 'Flame',
        badgeTier: 'bronze',
        progress: Math.min(3, effectiveStreak),
        maxProgress: 3,
        unlocked: effectiveStreak >= 3
      },
      {
        id: 'streak_7_days',
        title: 'Weekly Warrior',
        description: 'Maintain an unbroken 7-day streak. Rewards +1 extra Streak Saver shield!',
        category: 'streak',
        xpReward: 250,
        iconName: 'Flame',
        badgeTier: 'silver',
        progress: Math.min(7, effectiveStreak),
        maxProgress: 7,
        unlocked: effectiveStreak >= 7
      },
      {
        id: 'streak_14_days',
        title: 'Fortnight Flame',
        description: 'Maintain an unbroken 14-day daily coding habit.',
        category: 'streak',
        xpReward: 400,
        iconName: 'Flame',
        badgeTier: 'silver',
        progress: Math.min(14, effectiveStreak),
        maxProgress: 14,
        unlocked: effectiveStreak >= 14
      },
      {
        id: 'streak_30_days',
        title: 'Monthly Master',
        description: 'Maintain an unbroken 30-day coding streak. Rewards +2 Streak Savers!',
        category: 'streak',
        xpReward: 800,
        iconName: 'Crown',
        badgeTier: 'gold',
        progress: Math.min(30, effectiveStreak),
        maxProgress: 30,
        unlocked: effectiveStreak >= 30
      },
      {
        id: 'streak_100_days',
        title: 'Centurion Developer',
        description: 'Achieve a legendary 100-day daily coding streak. Elite developer dedication.',
        category: 'streak',
        xpReward: 3000,
        iconName: 'Crown',
        badgeTier: 'diamond',
        progress: Math.min(100, effectiveStreak),
        maxProgress: 100,
        unlocked: effectiveStreak >= 100
      },

      // CATEGORY 4: LEARNING & QUIZ MASTERY (8 Badges)
      {
        id: 'quiz_first_complete',
        title: 'Quiz Initiate',
        description: 'Complete your first 10-question language certification quiz.',
        category: 'mastery',
        xpReward: 50,
        iconName: 'Award',
        badgeTier: 'bronze',
        progress: Math.min(1, quizzesDoneCount),
        maxProgress: 1,
        unlocked: quizzesDoneCount >= 1
      },
      {
        id: 'quiz_perfect_score',
        title: 'Flawless Execution',
        description: 'Score a perfect 10/10 on any language certification quiz.',
        category: 'mastery',
        xpReward: 200,
        iconName: 'Medal',
        badgeTier: 'silver',
        progress: Math.min(1, perfectQuizzesCount),
        maxProgress: 1,
        unlocked: perfectQuizzesCount >= 1
      },
      {
        id: 'quiz_polyglot_3',
        title: 'Polyglot Certified',
        description: 'Complete 10-question quizzes in 3 different programming languages.',
        category: 'mastery',
        xpReward: 300,
        iconName: 'Award',
        badgeTier: 'silver',
        progress: Math.min(3, quizzesDoneCount),
        maxProgress: 3,
        unlocked: quizzesDoneCount >= 3
      },
      {
        id: 'quiz_polyglot_5',
        title: 'Multi-Certified Engineer',
        description: 'Complete certification quizzes in 5 different programming languages.',
        category: 'mastery',
        xpReward: 600,
        iconName: 'Crown',
        badgeTier: 'gold',
        progress: Math.min(5, quizzesDoneCount),
        maxProgress: 5,
        unlocked: quizzesDoneCount >= 5
      },
      {
        id: 'lessons_done_5',
        title: 'Curious Scholar',
        description: 'Complete 5 structured interactive lessons in the Learning Hub.',
        category: 'mastery',
        xpReward: 100,
        iconName: 'BookOpen',
        badgeTier: 'bronze',
        progress: Math.min(5, lessonsDoneCount),
        maxProgress: 5,
        unlocked: lessonsDoneCount >= 5
      },
      {
        id: 'lessons_done_15',
        title: 'Knowledge Builder',
        description: 'Complete 15 structured curriculum lessons.',
        category: 'mastery',
        xpReward: 250,
        iconName: 'BookOpen',
        badgeTier: 'silver',
        progress: Math.min(15, lessonsDoneCount),
        maxProgress: 15,
        unlocked: lessonsDoneCount >= 15
      },
      {
        id: 'lessons_done_30',
        title: 'Curriculum Graduate',
        description: 'Complete 30 structured curriculum lessons across all course tracks.',
        category: 'mastery',
        xpReward: 600,
        iconName: 'Crown',
        badgeTier: 'gold',
        progress: Math.min(30, lessonsDoneCount),
        maxProgress: 30,
        unlocked: lessonsDoneCount >= 30
      },
      {
        id: 'streak_shield_used',
        title: 'Guardian Angel',
        description: 'Successfully preserve an active streak using a Streak Saver shield.',
        category: 'streak',
        xpReward: 50,
        iconName: 'ShieldCheck',
        badgeTier: 'bronze',
        progress: Math.min(1, s.streakSaversUsed || 0),
        maxProgress: 1,
        unlocked: (s.streakSaversUsed || 0) >= 1
      },

      // CATEGORY 5: COMMUNITY & SOCIAL (6 Badges)
      {
        id: 'community_first_like',
        title: 'Friendly Peer',
        description: 'Upvote your first community snippet to support a creator.',
        category: 'community',
        xpReward: 20,
        iconName: 'Heart',
        badgeTier: 'bronze',
        progress: Math.min(1, s.likesGiven),
        maxProgress: 1,
        unlocked: s.likesGiven >= 1
      },
      {
        id: 'community_likes_10',
        title: 'Community Supporter',
        description: 'Upvote 10 community snippets across the repository.',
        category: 'community',
        xpReward: 80,
        iconName: 'Heart',
        badgeTier: 'silver',
        progress: Math.min(10, s.likesGiven),
        maxProgress: 10,
        unlocked: s.likesGiven >= 10
      },
      {
        id: 'community_likes_50',
        title: 'Dev Ecosystem Pillar',
        description: 'Upvote 50 snippets to foster an inspiring engineering environment.',
        category: 'community',
        xpReward: 250,
        iconName: 'Heart',
        badgeTier: 'gold',
        progress: Math.min(50, s.likesGiven),
        maxProgress: 50,
        unlocked: s.likesGiven >= 50
      },
      {
        id: 'bookmarks_5',
        title: 'Code Collector',
        description: 'Bookmark 5 high-utility snippets for quick reference.',
        category: 'community',
        xpReward: 50,
        iconName: 'Bookmark',
        badgeTier: 'bronze',
        progress: Math.min(5, s.bookmarksCount),
        maxProgress: 5,
        unlocked: s.bookmarksCount >= 5
      },
      {
        id: 'bookmarks_20',
        title: 'Library Archivist',
        description: 'Bookmark 20 valuable code snippets in your personal repository.',
        category: 'community',
        xpReward: 150,
        iconName: 'Bookmark',
        badgeTier: 'silver',
        progress: Math.min(20, s.bookmarksCount),
        maxProgress: 20,
        unlocked: s.bookmarksCount >= 20
      },
      {
        id: 'reactions_10',
        title: 'Active Expresser',
        description: 'React with emojis to 10 community code snippets.',
        category: 'community',
        xpReward: 50,
        iconName: 'Sparkles',
        badgeTier: 'bronze',
        progress: Math.min(10, s.reactionsGiven),
        maxProgress: 10,
        unlocked: s.reactionsGiven >= 10
      }
    ];
  }

  private checkAchievements(stats: UserStats) {
    const list = this.getAchievements();
    let newlyUnlocked = false;

    for (const a of list) {
      if (a.unlocked && !stats.unlockedAchievementIds.includes(a.id)) {
        stats.unlockedAchievementIds.push(a.id);
        newlyUnlocked = true;

        // Reward extra Streak Savers on milestone achievements!
        if (a.id === 'streak_7_days') {
          stats.streakSavers = (stats.streakSavers || 0) + 1;
        } else if (a.id === 'streak_30_days') {
          stats.streakSavers = (stats.streakSavers || 0) + 2;
        } else if (a.id === 'streak_100_days') {
          stats.streakSavers = (stats.streakSavers || 0) + 3;
        }
      }
    }

    if (newlyUnlocked) {
      this.saveStats(stats);
    }
  }

  /**
   * Real Leaderboard:
   * Computed exclusively from real registered users with genuine verified activity.
   * NEVER invent users, random XP, or fictional competitors.
   * If no users have earned points (XP <= 0), returns empty array.
   */
  public getRealLeaderboard(): Array<{
    rank: number;
    name: string;
    xp: number;
    uploads: number;
    isCurrent: boolean;
    avatar?: string;
  }> {
    const currentUser = authService.getCurrentUser();
    const currentStats = this.getStats();

    const contributorsMap = new Map<string, { name: string; uploads: number; xp: number; avatar?: string; isCurrent: boolean }>();

    // 1. Include current authenticated user ONLY if they have verified earned XP
    if (currentUser && currentStats && currentStats.xp > 0) {
      contributorsMap.set(currentUser.id || currentUser.uid || currentUser.email, {
        name: currentUser.name || currentUser.email.split('@')[0],
        uploads: currentStats.snippetsUploaded || 0,
        xp: currentStats.xp,
        avatar: currentUser.avatar,
        isCurrent: true
      });
    }

    // 2. Cross-reference other verified registered users stored in system (must have earned XP > 0)
    const registeredUsers = authService.getRegisteredUsers();
    if (Array.isArray(registeredUsers)) {
      registeredUsers.forEach(regUser => {
        if (!regUser || !regUser.id) return;
        // Don't duplicate current user
        if (currentUser && (regUser.id === currentUser.id || regUser.email === currentUser.email)) {
          return;
        }

        // Check if there are real stats saved for this registered user
        try {
          const statsRaw = localStorage.getItem(`codeself_user_stats_${regUser.id}`);
          if (statsRaw) {
            const regStats = JSON.parse(statsRaw);
            if (regStats && regStats.xp && regStats.xp > 0) {
              contributorsMap.set(regUser.id, {
                name: regUser.name || regUser.email.split('@')[0],
                uploads: regStats.snippetsUploaded || 0,
                xp: regStats.xp,
                avatar: regUser.avatar,
                isCurrent: false
              });
            }
          }
        } catch {}
      });
    }

    // Sort strictly by real verified XP descending
    const list = Array.from(contributorsMap.values())
      .filter(item => item.xp > 0)
      .sort((a, b) => b.xp - a.xp);

    return list.map((item, idx) => ({
      rank: idx + 1,
      ...item
    }));
  }
}

export const gamificationService = new GamificationService();
