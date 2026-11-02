import { User, Snippet, ReportItem, AdminAuditLogEntry } from '../types';
import { authService } from './authService';
import { snippetStorage } from './snippetStorage';
import { communityService, CommunityDiscussion } from './communityService';
import { reportService } from './reportService';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface PlatformSettings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  allowSnippetSubmissions: boolean;
  announcementBanner: string;
  maxDailySnippetUploads: number;
}

const SETTINGS_STORAGE_KEY = 'chullicode_admin_settings';
const AUDIT_LOG_STORAGE_KEY = 'chullicode_admin_audit_logs';
const SUSPENDED_USERS_KEY = 'chullicode_suspended_users';

const ADMIN_EMAILS = new Set([
  'shakti14112008@gmail.com'
]);

function loadSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    maintenanceMode: false,
    allowNewRegistrations: true,
    allowSnippetSubmissions: true,
    announcementBanner: '',
    maxDailySnippetUploads: 20
  };
}

function loadAuditLogs(): AdminAuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function getSuspendedUserIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SUSPENDED_USERS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveSuspendedUserIds(ids: Set<string>) {
  try {
    localStorage.setItem(SUSPENDED_USERS_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export const adminService = {
  // === Authorization Guard ===
  isAdmin(user?: User | null): boolean {
    const currentUser = user !== undefined ? user : authService.getCurrentUser();
    if (!currentUser || !currentUser.email) return false;
    return ADMIN_EMAILS.has(currentUser.email.toLowerCase().trim());
  },

  verifyAdmin(): void {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Administrative privileges required.');
    }
  },

  // === Audit Logging ===
  recordAudit(action: string, targetType: AdminAuditLogEntry['targetType'], details: string, targetId?: string, targetTitle?: string): void {
    const current = authService.getCurrentUser();
    const entry: AdminAuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      action,
      actorEmail: current?.email || 'shakti14112008@gmail.com',
      targetType,
      targetId,
      targetTitle,
      details,
      timestamp: new Date().toISOString()
    };

    const logs = loadAuditLogs();
    logs.unshift(entry);
    // Keep last 100 entries
    if (logs.length > 100) logs.pop();

    try {
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('chullicode_audit_logged', { detail: { entry } }));
    } catch {}
  },

  getAuditLogs(): AdminAuditLogEntry[] {
    return loadAuditLogs();
  },

  // === Platform Settings ===
  getSettings(): PlatformSettings {
    return loadSettings();
  },

  updateSettings(newSettings: Partial<PlatformSettings>): PlatformSettings {
    this.verifyAdmin();
    const current = loadSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    this.recordAudit('settings_updated', 'setting', `Updated platform settings: ${Object.keys(newSettings).join(', ')}`);
    return updated;
  },

  // === User Management ===
  async listUsers(): Promise<{ id: string; name: string; email: string; avatar?: string; isSuspended: boolean; createdAt: string }[]> {
    this.verifyAdmin();
    const suspended = getSuspendedUserIds();
    const usersMap = new Map<string, any>();

    // 1. Fetch from Firestore if accessible
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach(d => {
        const u = d.data();
        usersMap.set(d.id, {
          id: d.id,
          name: u.name || 'Developer',
          email: u.email || 'unknown',
          avatar: u.avatar,
          isSuspended: suspended.has(d.id),
          createdAt: u.createdAt || new Date().toISOString()
        });
      });
    } catch {}

    // 2. Also include local current user if not already in list
    const current = authService.getCurrentUser();
    if (current && !usersMap.has(current.id)) {
      usersMap.set(current.id, {
        id: current.id,
        name: current.name,
        email: current.email,
        avatar: current.avatar,
        isSuspended: suspended.has(current.id),
        createdAt: current.createdAt || new Date().toISOString()
      });
    }

    return Array.from(usersMap.values());
  },

  suspendUser(userId: string, reason: string): void {
    this.verifyAdmin();
    const current = authService.getCurrentUser();
    if (current && (current.id === userId || current.email === 'shakti14112008@gmail.com' && current.id === userId)) {
      throw new Error('Safety protection: You cannot suspend your own administrator account.');
    }

    const suspended = getSuspendedUserIds();
    suspended.add(userId);
    saveSuspendedUserIds(suspended);

    this.recordAudit('user_suspended', 'user', `Suspended user ${userId}. Reason: ${reason}`, userId);
  },

  restoreUser(userId: string): void {
    this.verifyAdmin();
    const suspended = getSuspendedUserIds();
    suspended.delete(userId);
    saveSuspendedUserIds(suspended);

    this.recordAudit('user_restored', 'user', `Restored user ${userId}.`, userId);
  },

  deleteUserAccount(userId: string): void {
    this.verifyAdmin();
    const current = authService.getCurrentUser();
    if (current && current.id === userId) {
      throw new Error('Safety protection: You cannot delete your own administrator account.');
    }

    try {
      deleteDoc(doc(db, 'users', userId)).catch(() => {});
    } catch {}

    const suspended = getSuspendedUserIds();
    suspended.delete(userId);
    saveSuspendedUserIds(suspended);

    this.recordAudit('user_deleted', 'user', `Deleted user account ${userId}.`, userId);
  },

  // === Code Management ===
  listSnippets(): Snippet[] {
    this.verifyAdmin();
    return snippetStorage.getAllSnippets();
  },

  deleteSnippet(snippetId: string, reason: string): void {
    this.verifyAdmin();
    const snippet = snippetStorage.getSnippetById(snippetId);
    snippetStorage.deleteSnippet(snippetId);

    try {
      deleteDoc(doc(db, 'snippets', snippetId)).catch(() => {});
    } catch {}

    this.recordAudit('snippet_deleted', 'snippet', `Deleted snippet. Reason: ${reason}`, snippetId, snippet?.title);
  },

  // === Discussion Moderation ===
  listDiscussions(): CommunityDiscussion[] {
    this.verifyAdmin();
    return communityService.getAllDiscussions();
  },

  deleteDiscussion(discId: string, reason: string): void {
    this.verifyAdmin();
    try {
      deleteDoc(doc(db, 'discussions', discId)).catch(() => {});
    } catch {}

    // Purge from local storage
    try {
      const raw = localStorage.getItem('chullicode_discussions');
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter((d: any) => d.id !== discId);
        localStorage.setItem('chullicode_discussions', JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('chullicode_discussions_updated'));
      }
    } catch {}

    this.recordAudit('discussion_deleted', 'discussion', `Deleted discussion. Reason: ${reason}`, discId);
  },

  // === Report Management ===
  listReports(): ReportItem[] {
    this.verifyAdmin();
    return reportService.getAllReports();
  },

  resolveReport(reportId: string, notes?: string): void {
    this.verifyAdmin();
    reportService.updateReportStatus(reportId, 'resolved', notes);
    this.recordAudit('report_resolved', 'report', `Resolved report ${reportId}. Notes: ${notes || 'None'}`, reportId);
  },

  dismissReport(reportId: string, notes?: string): void {
    this.verifyAdmin();
    reportService.updateReportStatus(reportId, 'dismissed', notes);
    this.recordAudit('report_dismissed', 'report', `Dismissed report ${reportId}. Notes: ${notes || 'None'}`, reportId);
  }
};
