import { ALL_LEARNING_TRACKS } from '../data/curriculum/tracks';
import { LearningTrack, CurriculumChapter, ChapterLesson, UserLearningProgress, Language } from '../types';
import { gamificationService } from './gamificationService';
import { authService } from './authService';

const PROGRESS_STORAGE_KEY = 'chullicode_learning_progress';
const ACTIVE_TRACK_KEY = 'chullicode_active_track_id';

function loadStoredProgress(): UserLearningProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          activeTrackId: parsed.activeTrackId || undefined,
          completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
          unlockedChapters: Array.isArray(parsed.unlockedChapters) ? parsed.unlockedChapters : ['py_c1', 'cpp_c1', 'java_c1', 'js_c1', 'ts_c1', 'sql_c1', 'c_c1', 'cs_c1', 'html_c1', 'php_c1'],
          chapterQuizScores: parsed.chapterQuizScores || {},
          trackProgress: parsed.trackProgress || {}
        };
      }
    }
  } catch {}

  return {
    activeTrackId: undefined,
    completedLessons: [],
    unlockedChapters: ['py_c1', 'cpp_c1', 'java_c1', 'js_c1', 'ts_c1', 'sql_c1', 'c_c1', 'cs_c1', 'html_c1', 'php_c1'],
    chapterQuizScores: {},
    trackProgress: {}
  };
}

function saveStoredProgress(progress: UserLearningProgress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('chullicode_learning_progress_updated', { detail: { progress } }));
  } catch {}
}

export const learningService = {
  // === Track Navigation & Retrieval ===
  getAllTracks(): LearningTrack[] {
    return ALL_LEARNING_TRACKS;
  },

  getTrackById(trackId: string): LearningTrack | undefined {
    return ALL_LEARNING_TRACKS.find(t => t.id === trackId || t.language === trackId);
  },

  getTrackByLanguage(lang: Language): LearningTrack | undefined {
    return ALL_LEARNING_TRACKS.find(t => t.language === lang);
  },

  getActiveTrackId(): string | undefined {
    try {
      const stored = localStorage.getItem(ACTIVE_TRACK_KEY);
      if (stored) return stored;
    } catch {}
    const prog = loadStoredProgress();
    return prog.activeTrackId;
  },

  setActiveTrack(trackId: string): void {
    try {
      localStorage.setItem(ACTIVE_TRACK_KEY, trackId);
    } catch {}
    const prog = loadStoredProgress();
    prog.activeTrackId = trackId;
    saveStoredProgress(prog);
  },

  clearActiveTrack(): void {
    try {
      localStorage.removeItem(ACTIVE_TRACK_KEY);
    } catch {}
    const prog = loadStoredProgress();
    prog.activeTrackId = undefined;
    saveStoredProgress(prog);
  },

  // === Progress & Unlocking ===
  getProgress(): UserLearningProgress {
    return loadStoredProgress();
  },

  isLessonCompleted(lessonId: string): boolean {
    const prog = loadStoredProgress();
    return prog.completedLessons.includes(lessonId);
  },

  isChapterUnlocked(chapterId: string, track: LearningTrack): boolean {
    const prog = loadStoredProgress();
    // Default unlock for first chapter of each level or track
    if (chapterId === 'py_c1' || chapterId === 'cpp_c1' || chapterId === 'java_c1' || 
        chapterId === 'js_c1' || chapterId === 'ts_c1' || chapterId === 'sql_c1' || 
        chapterId === 'c_c1' || chapterId === 'cs_c1' || chapterId === 'html_c1' || chapterId === 'php_c1') {
      return true;
    }

    if (prog.unlockedChapters.includes(chapterId)) {
      return true;
    }

    // Check if previous chapter in sequence was completed
    const allChapters: CurriculumChapter[] = [];
    track.levels.forEach(lvl => allChapters.push(...lvl.chapters));
    const idx = allChapters.findIndex(c => c.id === chapterId);
    if (idx <= 0) return true; // first chapter is always unlocked

    const prevChapter = allChapters[idx - 1];
    const prevLessonsCompleted = prevChapter.lessons.every(l => prog.completedLessons.includes(l.id));
    if (prevLessonsCompleted) {
      // Auto unlock and persist
      if (!prog.unlockedChapters.includes(chapterId)) {
        prog.unlockedChapters.push(chapterId);
        saveStoredProgress(prog);
      }
      return true;
    }

    return false;
  },

  recordLessonComplete(lessonId: string, chapterId: string, trackId: string): { xpEarned: number; nextLessonId?: string } {
    const prog = loadStoredProgress();
    let xpEarned = 0;

    const alreadyDone = prog.completedLessons.includes(lessonId);
    if (!alreadyDone) {
      prog.completedLessons.push(lessonId);
      xpEarned = 25; // 25 XP per completed lesson
    }

    // Find track and chapter to unlock next if applicable
    const track = this.getTrackById(trackId);
    let nextLessonId: string | undefined = undefined;

    if (track) {
      const allChapters: CurriculumChapter[] = [];
      track.levels.forEach(lvl => allChapters.push(...lvl.chapters));

      const currentChapter = allChapters.find(c => c.id === chapterId);
      if (currentChapter) {
        // Find next lesson inside current chapter
        const lessonIdx = currentChapter.lessons.findIndex(l => l.id === lessonId);
        if (lessonIdx >= 0 && lessonIdx < currentChapter.lessons.length - 1) {
          nextLessonId = currentChapter.lessons[lessonIdx + 1].id;
        }

        // If all lessons in current chapter are complete, unlock the next chapter!
        const allDone = currentChapter.lessons.every(l => prog.completedLessons.includes(l.id));
        if (allDone) {
          const chIdx = allChapters.findIndex(c => c.id === chapterId);
          if (chIdx >= 0 && chIdx < allChapters.length - 1) {
            const nextChapter = allChapters[chIdx + 1];
            if (!prog.unlockedChapters.includes(nextChapter.id)) {
              prog.unlockedChapters.push(nextChapter.id);
            }
            if (!nextLessonId && nextChapter.lessons[0]) {
              nextLessonId = nextChapter.lessons[0].id;
            }
          }
        }
      }

      // Update track progress metrics
      const totalTrackLessons = track.lessonsCount || 1;
      const completedTrackLessons = allChapters.flatMap(c => c.lessons).filter(l => prog.completedLessons.includes(l.id)).length;
      const percent = Math.min(100, Math.round((completedTrackLessons / totalTrackLessons) * 100));

      prog.trackProgress[track.id] = {
        completedLessons: completedTrackLessons,
        totalLessons: totalTrackLessons,
        percent,
        lastActiveChapterId: chapterId,
        lastActiveLessonId: lessonId,
        lastStudiedAt: new Date().toISOString()
      };
    }

    saveStoredProgress(prog);

    // Award XP to gamification service
    if (xpEarned > 0) {
      const lang = track?.language || 'python';
      gamificationService.recordLessonCompletion(lessonId, lang);
    }

    return { xpEarned, nextLessonId };
  },

  recordChapterQuizScore(chapterId: string, score: number, total: number): void {
    const prog = loadStoredProgress();
    const percent = Math.round((score / total) * 100);
    prog.chapterQuizScores[chapterId] = percent;
    saveStoredProgress(prog);

    if (percent >= 70) {
      gamificationService.addXp(50);
    }
  },

  getTrackProgressStats(trackId: string): { completed: number; total: number; percent: number } {
    const track = this.getTrackById(trackId);
    if (!track) return { completed: 0, total: 0, percent: 0 };

    const prog = loadStoredProgress();
    let total = 0;
    let completed = 0;

    track.levels.forEach(lvl => {
      lvl.chapters.forEach(ch => {
        ch.lessons.forEach(l => {
          total++;
          if (prog.completedLessons.includes(l.id)) {
            completed++;
          }
        });
      });
    });

    const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    return { completed, total, percent };
  }
};
