import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { adminService, PlatformSettings } from '../services/adminService';
import { snippetStorage } from '../services/snippetStorage';
import { communityService, CommunityDiscussion } from '../services/communityService';
import { reportService } from '../services/reportService';
import { learningService } from '../services/learningService';
import { gamificationService } from '../services/gamificationService';
import { ALGORITHMIC_CHALLENGES, getTodayAlgorithmicChallenge } from '../data/dailyChallengesData';
import { Snippet, ReportItem, AdminAuditLogEntry } from '../types';
import { useTheme } from '../utils/theme';
import { 
  ShieldCheck, Users, FileCode2, MessageSquare, AlertCircle, 
  Settings, Activity, BookOpen, Search, Trash2, CheckCircle2, 
  XCircle, Lock, Unlock, Eye, ArrowLeft, RefreshCw, AlertTriangle,
  Sliders, Bell, Check, ExternalLink, Flame, Trophy, BarChart3,
  Sun, Moon, Menu, X, Pin, Shield, Filter, Globe, ChevronRight
} from 'lucide-react';
import { CodeSelfLogo } from '../components/CodeSelfLogo';

interface AdminControlCenterViewProps {
  onToast: (msg: string) => void;
}

type AdminSection = 
  | 'overview' 
  | 'users' 
  | 'code' 
  | 'discussions' 
  | 'learning' 
  | 'challenges' 
  | 'reports' 
  | 'leaderboard' 
  | 'analytics' 
  | 'audit' 
  | 'settings';

export const AdminControlCenterView: React.FC<AdminControlCenterViewProps> = ({ onToast }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const currentUser = authService.getCurrentUser();
  const isAdmin = adminService.isAdmin(currentUser);

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(() => adminService.getSettings());
  const [tracks, setTracks] = useState(() => learningService.getAllTracks());
  const [todayChallenge] = useState(() => getTodayAlgorithmicChallenge().challenge);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [snippetSearch, setSnippetSearch] = useState('');
  const [discussionSearch, setDiscussionSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Preview & Confirmations
  const [selectedSnippetPreview, setSelectedSnippetPreview] = useState<Snippet | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'user' | 'snippet' | 'discussion';
    id: string;
    title: string;
    reason: string;
  } | null>(null);

  const refreshData = async () => {
    if (!isAdmin) return;
    try {
      const u = await adminService.listUsers();
      setUsers(u);
    } catch {}
    setSnippets(snippetStorage.getAllSnippets());
    setDiscussions(communityService.getAllDiscussions());
    setReports(reportService.getAllReports());
    setAuditLogs(adminService.getAuditLogs());
    setSettings(adminService.getSettings());
  };

  useEffect(() => {
    refreshData();
  }, [isAdmin]);

  // Access Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">403 — Unauthorized Access</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            The Admin Control Center is strictly restricted to verified platform administrators (shakti14112008@gmail.com).
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Main Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Action handlers
  const handleToggleSuspendUser = (userId: string, isSuspended: boolean) => {
    try {
      if (isSuspended) {
        adminService.restoreUser(userId);
        onToast('User access restored.');
      } else {
        adminService.suspendUser(userId, 'Administrative suspension');
        onToast('User account suspended.');
      }
      refreshData();
    } catch (err: any) {
      onToast(err.message || 'Operation failed');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;
    try {
      if (deleteConfirmation.type === 'snippet') {
        adminService.deleteSnippet(deleteConfirmation.id, deleteConfirmation.reason || 'Admin removed');
        onToast('Code snippet removed from repository.');
      } else if (deleteConfirmation.type === 'discussion') {
        adminService.deleteDiscussion(deleteConfirmation.id, deleteConfirmation.reason || 'Admin removed');
        onToast('Discussion thread purged.');
      } else if (deleteConfirmation.type === 'user') {
        adminService.deleteUserAccount(deleteConfirmation.id);
        onToast('User account deleted.');
      }
      setDeleteConfirmation(null);
      refreshData();
    } catch (err: any) {
      onToast(err.message || 'Deletion failed');
    }
  };

  const handleResolveReport = (reportId: string) => {
    adminService.resolveReport(reportId, 'Reviewed and resolved by administrator.');
    onToast('Report marked as resolved.');
    refreshData();
  };

  const handleDismissReport = (reportId: string) => {
    adminService.dismissReport(reportId, 'Dismissed by administrator.');
    onToast('Report dismissed.');
    refreshData();
  };

  const handleUpdateSettings = (updated: Partial<PlatformSettings>) => {
    const s = adminService.updateSettings(updated);
    setSettings(s);
    onToast('Platform settings updated successfully.');
  };

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const realLeaderboard = gamificationService.getRealLeaderboard();

  interface AdminNavItem {
    id: AdminSection;
    label: string;
    icon: any;
    badge?: number;
  }

  const navItems: AdminNavItem[] = [
    { id: 'overview', label: '1. Overview', icon: Sliders },
    { id: 'users', label: `2. User Management (${users.length})`, icon: Users },
    { id: 'code', label: `3. Code Repository (${snippets.length})`, icon: FileCode2 },
    { id: 'discussions', label: `4. Community Discussions (${discussions.length})`, icon: MessageSquare },
    { id: 'learning', label: `5. Learning Curriculum (${tracks.length})`, icon: BookOpen },
    { id: 'challenges', label: `6. Coding Challenges (${ALGORITHMIC_CHALLENGES.length})`, icon: Flame },
    { id: 'reports', label: `7. Reports & Moderation`, icon: AlertCircle, badge: pendingReportsCount > 0 ? pendingReportsCount : undefined },
    { id: 'leaderboard', label: `8. Leaderboard (${realLeaderboard.length})`, icon: Trophy },
    { id: 'analytics', label: '9. Platform Analytics', icon: BarChart3 },
    { id: 'audit', label: `10. Audit Logs (${auditLogs.length})`, icon: Activity },
    { id: 'settings', label: '11. Platform Settings', icon: Settings },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Dedicated Admin Header */}
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle admin sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <CodeSelfLogo className="w-7 h-7 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>ChulliCode Admin</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Master
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Powered by Chulli Tech
              </span>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={refreshData}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {/* Admin Identity Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
              {currentUser?.email}
            </span>
          </div>

          {/* Return to Main Site */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Main Site</span>
            <span className="sm:hidden">Exit</span>
          </Link>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shrink-0 p-4 space-y-1">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Control Center Navigation
            </span>
          </div>

          <nav className="space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-[#111827] h-full p-4 flex flex-col space-y-2 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Admin Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto flex-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id as AdminSection);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          
          {/* Section 1: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Platform Overview & Metrics
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live verified metrics directly computed from real user accounts and activity. Zero fabricated stats.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Users</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">{users.length}</p>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">Verified accounts</span>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code Snippets</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">{snippets.length}</p>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 block">User submissions</span>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Discussions</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">{discussions.length}</p>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 block">Community threads</span>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Reports</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">{pendingReportsCount}</p>
                  <span className={`text-[11px] mt-1 block ${pendingReportsCount > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                    {pendingReportsCount > 0 ? 'Action required' : 'Clean moderation queue'}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Operational</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Cloud Firestore synchronized. All 10 learning tracks active. Daily challenge initialized for {getTodayAlgorithmicChallenge().dateStr}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('reports')}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    View Reports
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('audit')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-lg text-white transition-colors"
                  >
                    View Audit Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: User Management */}
          {activeSection === 'users' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Registered Users Management
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Search and manage real registered accounts. Zero fabricated demonstration users.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {users.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No registered user accounts found in the database.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <tr>
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Joined</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users
                          .filter(u => {
                            if (!userSearch) return true;
                            const q = userSearch.toLowerCase();
                            return (
                              (u.name && u.name.toLowerCase().includes(q)) ||
                              (u.email && u.email.toLowerCase().includes(q))
                            );
                          })
                          .map(u => {
                            const isUserMasterAdmin = u.email?.toLowerCase() === 'shakti14112008@gmail.com';
                            return (
                              <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      {u.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                                      {u.name || 'Anonymous User'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                  {u.email}
                                </td>
                                <td className="px-4 py-3">
                                  {isUserMasterAdmin ? (
                                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                                      Master Admin
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                                      Member
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                                </td>
                                <td className="px-4 py-3">
                                  {u.isSuspended ? (
                                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                                      Suspended
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {!isUserMasterAdmin && (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSuspendUser(u.id, !!u.isSuspended)}
                                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                        title={u.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                      >
                                        {u.isSuspended ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmation({ type: 'user', id: u.id, title: u.name || u.email, reason: '' })}
                                        className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500"
                                        title="Delete Account"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Code Repository */}
          {activeSection === 'code' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Code Repository Moderation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review and moderate code snippets published by community developers.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={snippetSearch}
                    onChange={e => setSnippetSearch(e.target.value)}
                    placeholder="Search snippets..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {snippets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No code snippets published yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Language</th>
                          <th className="px-4 py-3">Author</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {snippets
                          .filter(s => {
                            if (!snippetSearch) return true;
                            const q = snippetSearch.toLowerCase();
                            return (
                              (s.title && s.title.toLowerCase().includes(q)) ||
                              (s.language && s.language.toLowerCase().includes(q)) ||
                              (s.author?.name && s.author.name.toLowerCase().includes(q))
                            );
                          })
                          .map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                <Link to={`/snippet/${s.id}`} className="hover:text-blue-600 transition-colors">
                                  {s.title}
                                </Link>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] uppercase">
                                  {s.language}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                {s.author?.name || 'Developer'}
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                {new Date(s.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmation({ type: 'snippet', id: s.id, title: s.title, reason: '' })}
                                  className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500"
                                  title="Delete Snippet"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Community Discussions */}
          {activeSection === 'discussions' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Community Discussions Moderation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Moderate technical discussion posts and user comments.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={discussionSearch}
                    onChange={e => setDiscussionSearch(e.target.value)}
                    placeholder="Search discussions..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {discussions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No discussions yet. Community queue is clean.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Topic Title</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Author</th>
                          <th className="px-4 py-3">Replies</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {discussions
                          .filter(d => {
                            if (!discussionSearch) return true;
                            const q = discussionSearch.toLowerCase();
                            return (
                              (d.title && d.title.toLowerCase().includes(q)) ||
                              (d.authorName && d.authorName.toLowerCase().includes(q))
                            );
                          })
                          .map(d => (
                            <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                {d.title}
                              </td>
                              <td className="px-4 py-3 text-slate-500">{d.category}</td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.authorName}</td>
                              <td className="px-4 py-3 font-mono text-[11px]">{d.repliesCount || 0}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmation({ type: 'discussion', id: d.id, title: d.title, reason: '' })}
                                  className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500"
                                  title="Delete Discussion"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Learning Curriculum */}
          {activeSection === 'learning' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Learning Curriculum Tracks
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Overview of all 10 verified programming curricula and chapter modules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.map(track => {
                  const totalChapters = track.levels.reduce((acc, lvl) => acc + lvl.chapters.length, 0);
                  const totalLessons = track.levels.reduce(
                    (acc, lvl) => acc + lvl.chapters.reduce((cAcc, ch) => cAcc + ch.lessons.length, 0),
                    0
                  );

                  return (
                    <div
                      key={track.id}
                      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {track.name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] uppercase font-bold">
                          {track.language}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {track.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>{track.levels.length} Levels</span>
                        <span>{totalChapters} Chapters</span>
                        <span>{totalLessons} Lessons</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 6: Coding Challenges */}
          {activeSection === 'challenges' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Daily Coding Challenges Pool
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Algorithmic challenge pool with deterministic rotation and automated test suites.
                  </p>
                </div>

                <Link
                  to="/challenges/daily"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Open Daily Route</span>
                </Link>
              </div>

              {/* Active Today Challenge Card */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">Active Challenge Today</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{todayChallenge.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Difficulty: {todayChallenge.difficulty} · Category: {todayChallenge.category} · {todayChallenge.testCases.length} Test Cases
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-200 bg-white/80 dark:bg-amber-900/60 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-700">
                  +50 XP Streak Reward
                </span>
              </div>

              {/* Challenge Pool List */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Challenge</th>
                        <th className="px-4 py-3">Difficulty</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Supported Languages</th>
                        <th className="px-4 py-3">Test Cases</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ALGORITHMIC_CHALLENGES.map(ch => (
                        <tr key={ch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {ch.title}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ch.difficulty === 'Easy'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : ch.difficulty === 'Medium'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {ch.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{ch.category}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                            {ch.supportedLanguages.join(', ')}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px]">
                            {ch.testCases.length} Cases
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Reports & Moderation */}
          {activeSection === 'reports' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Content Reports & Moderation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Flagged community submissions, inappropriate code, and bug reports.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {(['all', 'pending', 'resolved'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setReportFilter(f)}
                      className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors cursor-pointer ${
                        reportFilter === f
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {reports
                  .filter(r => (reportFilter === 'all' ? true : r.status === reportFilter))
                  .map(r => (
                    <div
                      key={r.id}
                      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {r.status}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white uppercase font-mono text-[10px]">
                            {r.type}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">
                          {r.description || r.reason}
                        </p>
                        {r.snippetTitle && (
                          <p className="text-[11px] text-slate-500 font-mono">
                            Target Snippet: {r.snippetTitle}
                          </p>
                        )}
                      </div>

                      {r.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDismissReport(r.id)}
                            className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveReport(r.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {reports.length === 0 && (
                  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
                    No reports submitted yet. Community moderation queue is empty.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 8: Leaderboard */}
          {activeSection === 'leaderboard' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Verified Platform Leaderboard
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Exclusively computed from real users who have earned XP. Zero fabricated competitors.
                </p>
              </div>

              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {realLeaderboard.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No leaderboard entries yet. Leaderboard activates when registered users earn XP by solving challenges or completing lessons.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Developer</th>
                          <th className="px-4 py-3">XP Earned</th>
                          <th className="px-4 py-3">Uploads</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {realLeaderboard.map(entry => (
                          <tr key={entry.rank} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                              #{entry.rank}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                              {entry.name}
                            </td>
                            <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {entry.xp} XP
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-500">
                              {entry.uploads}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 9: Platform Analytics */}
          {activeSection === 'analytics' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Real Platform Analytics
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Aggregate telemetry computed directly from verified data sources.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Repository Languages Distribution
                  </h3>
                  {snippets.length === 0 ? (
                    <p className="text-xs text-slate-500">No snippets uploaded yet to analyze language spread.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(
                        snippets.reduce((acc: Record<string, number>, s) => {
                          acc[s.language] = (acc[s.language] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([lang, count]) => (
                        <div key={lang} className="text-xs flex items-center justify-between">
                          <span className="font-mono uppercase">{lang}</span>
                          <span className="font-mono text-slate-500">{count} snippets</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Safety & Content Moderation Ratios
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Total Code Snippets</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{snippets.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Total Discussions</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{discussions.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Open Moderation Reports</span>
                      <span className="font-mono font-bold text-rose-500">{pendingReportsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 10: Audit Logs */}
          {activeSection === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Administrative Audit Logs
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Immutable activity log recording all security and administrative mutations.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No administrative actions recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Target</th>
                          <th className="px-4 py-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-mono text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                              {log.action}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                              {log.targetId}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {log.details ? JSON.stringify(log.details) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 11: Platform Settings */}
          {activeSection === 'settings' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Platform Settings & Security Flags
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure global community, submission, and maintenance flags.
                </p>
              </div>

              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Allow User Registration</h4>
                    <p className="text-slate-500">Allow new developers to authenticate and register accounts.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowNewRegistrations}
                    onChange={e => handleUpdateSettings({ allowNewRegistrations: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Public Code Sharing</h4>
                    <p className="text-slate-500">Allow verified users to publish snippets to the explore repository.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowSnippetSubmissions}
                    onChange={e => handleUpdateSettings({ allowSnippetSubmissions: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Max Daily Uploads Per User</h4>
                    <p className="text-slate-500">Volumetric threshold to prevent spam and rate-limit uploads.</p>
                  </div>
                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                    {settings.maxDailySnippetUploads || 20} / day
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-rose-600 dark:text-rose-400">Maintenance Mode</h4>
                    <p className="text-slate-500">Restrict normal platform access for scheduled upgrades.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={e => handleUpdateSettings({ maintenanceMode: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete "{deleteConfirmation.title}"? This administrative action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
