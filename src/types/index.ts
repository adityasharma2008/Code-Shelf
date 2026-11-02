export type Language = 
  | 'cpp'
  | 'c'
  | 'python'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'php'
  | 'html_css'
  | 'sql';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type CategoryTag = 
  | 'Basics'
  | 'OOP'
  | 'STL'
  | 'DSA'
  | 'Database/Queries'
  | 'Web Dev'
  | 'Algorithms';

export interface Author {
  name: string;
  username: string;
  avatar: string;
  role?: 'Member' | 'Contributor' | 'Maintainer' | 'Admin' | 'Guest';
  isVerified?: boolean;
  email?: string;
  userId?: string;
  isGuest?: boolean;
}

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: Language;
  difficulty: Difficulty;
  category: CategoryTag;
  tags: string[];
  code: string;
  author: Author;
  createdAt: string;
  likes: number;
  views: number;
  bookmarksCount: number;
  isCommunitySubmitted?: boolean;
  sampleOutput?: string;
  sqlInitialSchema?: string;
  userId?: string;
  userEmail?: string;
  authorEmail?: string;
  authorId?: string;
  isGuest?: boolean;
  teamId?: string;
  teamName?: string;
  teamOwnerId?: string;
  teamOwnerEmail?: string;
  uploadedByMember?: string;
  isTeamSnippet?: boolean;
  isPrivate?: boolean;
  visibility?: 'public' | 'private';
}

export interface WorkspaceTeam {
  id: string;
  name: string;
  pin: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  snippetCount: number;
  membersCount: number;
  description?: string;
}

export interface ActiveTeamSession {
  teamId: string;
  teamName: string;
  teamOwnerId: string;
  teamOwnerEmail: string;
  teamOwnerName: string;
  memberName: string;
  joinedAt: string;
}

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'email';
  role?: 'Member' | 'Contributor' | 'Maintainer' | 'Admin';
  isVerified?: boolean;
  createdAt: string;
  bio?: string;
  roleTitle?: string;
  githubUrl?: string;
  websiteUrl?: string;
  location?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr?: string;
  executionTimeMs: number;
  status: 'idle' | 'running' | 'success' | 'error';
  tabularData?: {
    columns: string[];
    values: any[][];
  };
  htmlPreview?: string;
}

export interface LanguageMeta {
  id: Language;
  name: string;
  extension: string;
  mimeType: string;
  pistonLanguage?: string;
  version?: string;
  color: string;
  bgLight: string;
  bgDark: string;
  sampleBoilerplate: string;
  keywords: string[];
  sampleOutput?: ExecutionResult;
}

export type AchievementCategory = 'creator' | 'learner' | 'streak' | 'mastery' | 'community';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xpReward: number;
  iconName: string;
  badgeTier: 'bronze' | 'silver' | 'gold' | 'diamond';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  iconName: string;
}

export interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  highestStreak: number;
  lastActiveDate: string;
  snippetsUploaded: number;
  codeRunsCount: number;
  likesGiven: number;
  bookmarksCount: number;
  languagesRun: string[];
  languagesUploaded: string[];
  reactionsGiven: number;
  unlockedAchievementIds: string[];
  dailyQuestsDate: string;
  claimedQuestIds: string[];
  lastGameCompletedDate?: string;
  languagePoints?: Partial<Record<Language, number>>;
  completedLessons?: string[];
  quizzesCompleted?: Record<string, { score: number; total: number; completedAt: string }>;
  streakSavers?: number;
  streakSaversUsed?: number;
  streakBreaksCount?: number;
  challengesSolvedCount?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
}

export interface LanguageQuiz {
  language: Language;
  languageName: string;
  title: string;
  description: string;
  totalQuestions: number;
  pointsPerCorrect: number;
  completionBonus: number;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  summary: string;
  contentMarkdown: string;
  codeExample: string;
  codeLanguage: Language;
  keyTakeaways: string[];
  practiceQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  practiceCheck?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseTrack {
  id: string;
  language: Language;
  title: string;
  tagline: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  iconName: string;
  color: string;
  modules: CourseModule[];
  quiz: LanguageQuiz;
}

export type ReportType = 'snippet' | 'website';

export type ReportReason =
  | 'broken_code'
  | 'harmful_malicious'
  | 'plagiarism'
  | 'misleading'
  | 'spam'
  | 'ui_bug'
  | 'runner_failure'
  | 'feature_request'
  | 'other';

export interface ReportItem {
  id: string;
  type: ReportType;
  reason: ReportReason;
  reasonLabel: string;
  description: string;
  snippetId?: string;
  snippetTitle?: string;
  snippetLanguage?: string;
  reporterUserId?: string;
  reporterName: string;
  reporterEmail?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  adminNotes?: string;
}

export type CodingGameType = 'bug_spotter' | 'output_predictor' | 'code_assembly';

export interface CodingGameChallenge {
  id: string;
  type: CodingGameType;
  title: string;
  language: string;
  difficulty: 'Easy' | 'Medium';
  prompt: string;
  codeSnippet: string;
  options?: string[];
  correctAnswerIndex?: number;
  explanation: string;
  scrambledLines?: string[];
  correctOrder?: number[];
  pointsReward: number;
}

export interface ChapterLesson {
  id: string;
  chapterId: string;
  title: string;
  duration: string;
  summary: string;
  learningObjectives: string[];
  contentMarkdown: string;
  realWorldContext: string;
  codeExample: string;
  codeLanguage: Language;
  keyTakeaways: string[];
  interactivePractice: {
    instructions: string;
    starterCode: string;
    solutionCode: string;
    expectedOutput?: string;
  };
  knowledgeCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  challenge: {
    title: string;
    task: string;
    hint: string;
  };
}

export interface CurriculumChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  levelNumber: number;
  levelTitle: string;
  estimatedMinutes: number;
  lessons: ChapterLesson[];
  assessmentQuestions?: QuizQuestion[];
  unlockedByDefault?: boolean;
}

export interface CurriculumLevel {
  levelNumber: number;
  title: string;
  description: string;
  chapters: CurriculumChapter[];
}

export interface LearningTrack {
  id: string;
  language: Language;
  name: string;
  tagline: string;
  category: 'Systems & Backend' | 'Web & Frontend' | 'Database' | 'Scripting';
  description: string;
  levelsCount: number;
  chaptersCount: number;
  lessonsCount: number;
  estimatedHours: string;
  prerequisites: string[];
  learningObjectives: string[];
  icon: string;
  color: string;
  badge: string;
  levels: CurriculumLevel[];
}

export interface UserLearningProgress {
  activeTrackId?: string;
  completedLessons: string[];
  unlockedChapters: string[];
  chapterQuizScores: Record<string, number>;
  trackProgress: Record<string, {
    completedLessons: number;
    totalLessons: number;
    percent: number;
    lastActiveChapterId?: string;
    lastActiveLessonId?: string;
    lastStudiedAt: string;
  }>;
}

export interface AdminAuditLogEntry {
  id: string;
  action: string;
  actorEmail: string;
  targetType: 'user' | 'snippet' | 'discussion' | 'reply' | 'report' | 'course' | 'setting';
  targetId?: string;
  targetTitle?: string;
  details: string;
  timestamp: string;
}

