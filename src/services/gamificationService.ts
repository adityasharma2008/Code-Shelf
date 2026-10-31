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
  { level: 1, title: 'Novice Coder', minXP: 0, maxXP: 100, color: 'text-slate-600' },
  { level: 2, title: 'Syntax Explorer', minXP: 100, maxXP: 300, color: 'text-emerald-600' },
  { level: 3, title: 'Code Craftsman', minXP: 300, maxXP: 600, color: 'text-blue-600' },
  { level: 4, title: 'Algorithm Artisan', minXP: 600, maxXP: 1000, color: 'text-indigo-600' },
  { level: 5, title: 'Polyglot Engineer', minXP: 1000, maxXP: 1600, color: 'text-purple-600' },
  { level: 6, title: 'Core Architect', minXP: 1600, maxXP: 2500, color: 'text-amber-600' },
  { level: 7, title: 'Grandmaster Dev', minXP: 2500, maxXP: 5000, color: 'text-rose-600' }
];

export const DAILY_CODING_CHALLENGES: CodingGameChallenge[] = [
  {
    id: 'game_cpp_off_by_one',
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
  }
];

class GamificationService {
  private getStorageKey(userId: string): string {
    return `codeself_stats_${userId}`;
  }

  /**
   * Get fresh stats for current signed-in user.
   * Returns clean, zero-initialized stats if new user.
   */
  public getStats(): UserStats | null {
    const user = authService.getCurrentUser();
    if (!user) return null;

    try {
      const raw = localStorage.getItem(this.getStorageKey(user.id));
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    // Clean initial stats starting at strictly 0 XP and 0 streak!
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
        java: 0,
        javascript: 0,
        typescript: 0,
        csharp: 0,
        php: 0,
        html_css: 0
      },
      completedLessons: [],
      quizzesCompleted: {}
    };
    return initial;
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

  public getTodayChallenge(): CodingGameChallenge {
    // Deterministically pick today's challenge by date hash
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % DAILY_CODING_CHALLENGES.length;
    return DAILY_CODING_CHALLENGES[idx];
  }

  /**
   * Complete the daily coding game.
   * THIS IS THE ONLY WAY TO INCREASE OR MAINTAIN A STREAK!
   */
  public completeDailyGame(challengeId: string): { success: boolean; xpEarned: number; newStreak: number; alreadyCompletedToday: boolean } {
    const user = authService.getCurrentUser();
    if (!user) {
      return { success: false, xpEarned: 0, newStreak: 0, alreadyCompletedToday: false };
    }

    const stats = this.getStats()!;
    const today = new Date().toISOString().slice(0, 10);

    if (stats.lastGameCompletedDate === today) {
      // Already completed today
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
        // Consecutive day!
        stats.currentStreak += 1;
      } else {
        // Missed one or more days, start new streak
        stats.currentStreak = 1;
      }
    }

    if (stats.currentStreak > stats.highestStreak) {
      stats.highestStreak = stats.currentStreak;
    }

    stats.lastGameCompletedDate = today;
    stats.lastActiveDate = today;

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

  /**
   * Get points breakdown for all programming languages
   */
  public getLanguagePoints(): Record<Language, number> {
    const stats = this.getStats();
    const defaults: Record<Language, number> = {
      python: 0,
      sql: 0,
      cpp: 0,
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

  /**
   * Record completion of an interactive 10-question language quiz.
   * Awards language-specific points, total XP, bonus for high score, and advances streak!
   */
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
    if (!stats.languagePoints) {
      stats.languagePoints = {};
    }
    if (!stats.quizzesCompleted) {
      stats.quizzesCompleted = {};
    }

    // Points calculation: +15 language points per correct question
    const langPointsEarned = correctCount * 15;
    stats.languagePoints[language] = (stats.languagePoints[language] || 0) + langPointsEarned;

    // General XP: +10 XP per correct question + 50 bonus if score >= 7
    let xpEarned = correctCount * 10;
    if (correctCount >= 7) {
      xpEarned += 50; // Bonus for mastery
    }
    stats.xp += xpEarned;

    // Advance daily streak if not yet completed today!
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

  /**
   * Record completion of an interactive lesson
   */
  public recordLessonCompletion(lessonId: string, language?: Language): { xpEarned: number } {
    const user = authService.getCurrentUser();
    if (!user) return { xpEarned: 0 };

    const stats = this.getStats()!;
    if (!stats.completedLessons) {
      stats.completedLessons = [];
    }

    if (stats.completedLessons.includes(lessonId)) {
      return { xpEarned: 0 }; // Already completed
    }

    stats.completedLessons.push(lessonId);
    stats.xp += 25; // 25 XP per lesson completed

    if (language) {
      if (!stats.languagePoints) stats.languagePoints = {};
      stats.languagePoints[language] = (stats.languagePoints[language] || 0) + 20;
    }

    this.saveStats(stats);
    this.checkAchievements(stats);

    return { xpEarned: 25 };
  }

  /**
   * Record interactive action by a signed-in user
   */
  public recordAction(action: 'run_code' | 'upload_snippet' | 'like_snippet' | 'bookmark_snippet' | 'add_reaction', meta?: any) {
    const user = authService.getCurrentUser();
    if (!user) return; // ONLY for signed-in users

    const stats = this.getStats()!;
    let xpGained = 0;

    switch (action) {
      case 'run_code':
        stats.codeRunsCount += 1;
        if (meta?.language && !stats.languagesRun.includes(meta.language)) {
          stats.languagesRun.push(meta.language);
          xpGained += 15;
        }
        xpGained += 10;
        break;

      case 'upload_snippet':
        stats.snippetsUploaded += 1;
        if (meta?.language && !stats.languagesUploaded.includes(meta.language)) {
          stats.languagesUploaded.push(meta.language);
          xpGained += 25;
        }
        xpGained += 50; // Real reward for publishing code
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

  public getAchievements(): Achievement[] {
    const stats = this.getStats();
    const s = stats || {
      snippetsUploaded: 0,
      codeRunsCount: 0,
      languagesRun: [],
      languagesUploaded: [],
      currentStreak: 0,
      likesGiven: 0,
      bookmarksCount: 0
    };

    return [
      {
        id: 'creator_first_code',
        title: 'First Contribution',
        description: 'Publish your very first code snippet to the repository.',
        category: 'creator',
        xpReward: 50,
        iconName: 'UploadCloud',
        badgeTier: 'bronze',
        progress: Math.min(1, s.snippetsUploaded),
        maxProgress: 1,
        unlocked: s.snippetsUploaded >= 1
      },
      {
        id: 'creator_prolific',
        title: 'Prolific Author',
        description: 'Publish 3 or more working code snippets.',
        category: 'creator',
        xpReward: 150,
        iconName: 'Sparkles',
        badgeTier: 'silver',
        progress: Math.min(3, s.snippetsUploaded),
        maxProgress: 3,
        unlocked: s.snippetsUploaded >= 3
      },
      {
        id: 'creator_polyglot',
        title: 'Polyglot Creator',
        description: 'Publish snippets in at least 2 distinct programming languages.',
        category: 'creator',
        xpReward: 200,
        iconName: 'Globe',
        badgeTier: 'gold',
        progress: Math.min(2, s.languagesUploaded.length),
        maxProgress: 2,
        unlocked: s.languagesUploaded.length >= 2
      },
      {
        id: 'learner_first_run',
        title: 'Code Igniter',
        description: 'Execute your first code snippet in the interactive compiler.',
        category: 'learner',
        xpReward: 30,
        iconName: 'Play',
        badgeTier: 'bronze',
        progress: Math.min(1, s.codeRunsCount),
        maxProgress: 1,
        unlocked: s.codeRunsCount >= 1
      },
      {
        id: 'learner_streak_champion',
        title: 'Streak Flame',
        description: 'Solve daily coding challenges 3 days in a row.',
        category: 'learner',
        xpReward: 150,
        iconName: 'Flame',
        badgeTier: 'gold',
        progress: Math.min(3, s.currentStreak),
        maxProgress: 3,
        unlocked: s.currentStreak >= 3
      },
      {
        id: 'community_supporter',
        title: 'Community Supporter',
        description: 'Upvote 3 community snippets to encourage creators.',
        category: 'community',
        xpReward: 50,
        iconName: 'Heart',
        badgeTier: 'bronze',
        progress: Math.min(3, s.likesGiven),
        maxProgress: 3,
        unlocked: s.likesGiven >= 3
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
      }
    }

    if (newlyUnlocked) {
      this.saveStats(stats);
    }
  }

  /**
   * Real Leaderboard:
   * Computed strictly from actual published snippets and current user!
   * NO FAKE USERS!
   */
  public getRealLeaderboard(): Array<{
    rank: number;
    name: string;
    xp: number;
    uploads: number;
    isCurrent: boolean;
    avatar?: string;
  }> {
    const allSnippets = snippetStorage.getAllSnippets();
    const currentUser = authService.getCurrentUser();
    const currentStats = this.getStats();

    // Map unique real contributors
    const contributorsMap = new Map<string, { name: string; uploads: number; xp: number; avatar?: string; isCurrent: boolean }>();

    allSnippets.forEach(snip => {
      const authorName = snip.author?.name || snip.uploadedByMember || 'Developer';
      const key = snip.userId || authorName;

      const existing = contributorsMap.get(key) || {
        name: authorName,
        uploads: 0,
        xp: 0,
        avatar: snip.author?.avatar,
        isCurrent: currentUser ? (snip.userId === currentUser.id || authorName === currentUser.name) : false
      };

      existing.uploads += 1;
      existing.xp += 50 + (snip.likes || 0) * 10;
      contributorsMap.set(key, existing);
    });

    // Add current user if not in list
    if (currentUser && currentStats) {
      const userKey = currentUser.id;
      const existing = contributorsMap.get(userKey);
      if (existing) {
        existing.xp = Math.max(existing.xp, currentStats.xp);
        existing.uploads = Math.max(existing.uploads, currentStats.snippetsUploaded);
        existing.isCurrent = true;
      } else {
        contributorsMap.set(userKey, {
          name: currentUser.name,
          uploads: currentStats.snippetsUploaded,
          xp: currentStats.xp,
          avatar: currentUser.avatar,
          isCurrent: true
        });
      }
    }

    const list = Array.from(contributorsMap.values()).sort((a, b) => b.xp - a.xp);
    return list.map((item, idx) => ({
      rank: idx + 1,
      ...item
    }));
  }
}

export const gamificationService = new GamificationService();
