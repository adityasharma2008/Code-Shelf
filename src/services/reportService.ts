import { ReportItem, ReportType, ReportReason } from '../types';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const STORAGE_KEY = 'codeself_reports_cache';

class ReportService {
  private reportsCache: ReportItem[] = [];

  constructor() {
    this.reportsCache = this.loadFromStorage();
    this.syncFromCloud();
  }

  private loadFromStorage(): ReportItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reportsCache));
      window.dispatchEvent(new CustomEvent('codeself_reports_updated'));
    } catch {}
  }

  public async syncFromCloud() {
    try {
      const q = query(collection(db, 'reports'));
      const snapshot = await getDocs(q);
      const cloudReports: ReportItem[] = [];
      snapshot.forEach(docSnap => {
        cloudReports.push(docSnap.data() as ReportItem);
      });

      if (cloudReports.length > 0) {
        // Merge with local cache
        const map = new Map<string, ReportItem>();
        this.reportsCache.forEach(r => map.set(r.id, r));
        cloudReports.forEach(r => map.set(r.id, r));
        this.reportsCache = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.saveToStorage();
      }
    } catch (err) {
      // Offline fallback: rely on local cache
    }
  }

  public async submitReport(data: {
    type: ReportType;
    reason: ReportReason;
    reasonLabel: string;
    description: string;
    snippetId?: string;
    snippetTitle?: string;
    snippetLanguage?: string;
    reporterUserId?: string;
    reporterName?: string;
    reporterEmail?: string;
  }): Promise<{ success: boolean; report?: ReportItem; error?: string }> {
    const trimmedDesc = (data.description || '').trim();
    if (!trimmedDesc) {
      return { success: false, error: 'Please describe the issue in detail.' };
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReport: ReportItem = {
      id: reportId,
      type: data.type,
      reason: data.reason,
      reasonLabel: data.reasonLabel,
      description: trimmedDesc,
      snippetId: data.snippetId,
      snippetTitle: data.snippetTitle,
      snippetLanguage: data.snippetLanguage,
      reporterUserId: data.reporterUserId || 'guest',
      reporterName: data.reporterName || 'Guest User',
      reporterEmail: data.reporterEmail,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save locally
    this.reportsCache.unshift(newReport);
    this.saveToStorage();

    // Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'reports', reportId), newReport);
    } catch (err) {
      console.warn('Report queued in local offline storage:', err);
    }

    return { success: true, report: newReport };
  }

  public getAllReports(): ReportItem[] {
    return [...this.reportsCache];
  }

  public getPendingCount(): number {
    return this.reportsCache.filter(r => r.status === 'pending').length;
  }

  public async updateReportStatus(reportId: string, status: 'pending' | 'resolved' | 'dismissed', adminNotes?: string) {
    const idx = this.reportsCache.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      this.reportsCache[idx].status = status;
      if (adminNotes !== undefined) {
        this.reportsCache[idx].adminNotes = adminNotes;
      }
      this.saveToStorage();

      try {
        await updateDoc(doc(db, 'reports', reportId), {
          status,
          adminNotes: adminNotes || ''
        });
      } catch {}
    }
  }

  public async deleteReport(reportId: string) {
    this.reportsCache = this.reportsCache.filter(r => r.id !== reportId);
    this.saveToStorage();

    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch {}
  }
}

export const reportService = new ReportService();
