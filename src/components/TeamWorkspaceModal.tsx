import React, { useState, useEffect } from 'react';
import { WorkspaceTeam, ActiveTeamSession, User } from '../types';
import { teamService } from '../services/teamService';
import { authService } from '../services/authService';
import { 
  X, 
  Users, 
  Plus, 
  Key, 
  ShieldCheck, 
  LogOut, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Info,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

interface TeamWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAuth?: (message: string) => void;
  onToast?: (message: string) => void;
  initialTab?: 'join' | 'create' | 'active';
}

export const TeamWorkspaceModal: React.FC<TeamWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onRequestAuth,
  onToast,
  initialTab
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [activeSession, setActiveSession] = useState<ActiveTeamSession | null>(() => teamService.getActiveTeam());
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'active'>('join');

  // Join form state
  const [joinTeamId, setJoinTeamId] = useState('');
  const [joinPin, setJoinPin] = useState('');
  const [joinMemberName, setJoinMemberName] = useState(() => localStorage.getItem('codeshelf_guest_name') || '');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinPin, setShowJoinPin] = useState(false);

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createTeamId, setCreateTeamId] = useState('');
  const [createPin, setCreatePin] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreatePin, setShowCreatePin] = useState(false);
  const [myTeams, setMyTeams] = useState<WorkspaceTeam[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Synchronize auth & team sessions
  useEffect(() => {
    const handleAuthChange = () => {
      const u = authService.getCurrentUser();
      setCurrentUser(u);
      setActiveSession(teamService.getActiveTeam());
      if (u) {
        loadUserTeams(u.id);
      }
    };

    const handleTeamChange = (e: any) => {
      setActiveSession(e?.detail?.session ?? teamService.getActiveTeam());
    };

    window.addEventListener('codeshelf_auth_changed', handleAuthChange);
    window.addEventListener('codeshelf_team_changed', handleTeamChange as EventListener);
    return () => {
      window.removeEventListener('codeshelf_auth_changed', handleAuthChange);
      window.removeEventListener('codeshelf_team_changed', handleTeamChange as EventListener);
    };
  }, []);

  const loadUserTeams = async (userId: string) => {
    setIsLoadingTeams(true);
    try {
      const teams = await teamService.getUserCreatedTeams(userId);
      setMyTeams(teams);
    } catch {
      setMyTeams(teamService.getLocalCreatedTeams().filter(t => t.ownerId === userId));
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const u = authService.getCurrentUser();
      const currentActive = teamService.getActiveTeam();
      setActiveSession(currentActive);
      if (u) {
        loadUserTeams(u.id);
      }
      if (initialTab) {
        setActiveTab(initialTab);
      } else if (currentActive) {
        setActiveTab('active');
      } else if (u) {
        setActiveTab('create');
      } else {
        setActiveTab('join');
      }
      setJoinError(null);
      setCreateError(null);
    }
  }, [isOpen, initialTab]);

  // Auto-slugify team name into team ID if user hasn't explicitly edited ID
  const handleNameChange = (val: string) => {
    setCreateName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 24);
    setCreateTeamId(slug);
  };

  if (!isOpen) return null;

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const cleanId = joinTeamId.trim();
    const cleanPin = joinPin.trim();
    const cleanName = joinMemberName.trim() || 'Guest Member';

    if (!cleanId) {
      setJoinError('Please enter the Team ID provided by your team creator.');
      return;
    }
    if (!cleanPin) {
      setJoinError('Please enter the security PIN for this team.');
      return;
    }

    setIsJoining(true);
    try {
      const session = await teamService.joinTeam(cleanId, cleanPin, cleanName);
      localStorage.setItem('codeshelf_guest_name', cleanName);
      setActiveSession(session);
      setActiveTab('active');
      if (onToast) {
        onToast(`🎉 Successfully joined team "${session.teamName}"! Unlimited submissions enabled.`);
      }
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join team. Check Team ID and PIN.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!currentUser) {
      if (onRequestAuth) onRequestAuth('Please sign in with Google or Email to create a team workspace.');
      return;
    }

    if (!createName.trim()) {
      setCreateError('Please give your team or workspace a name.');
      return;
    }
    if (!createTeamId.trim() || createTeamId.trim().length < 3) {
      setCreateError('Team ID must be at least 3 characters (letters, numbers, hyphens).');
      return;
    }
    if (!createPin.trim() || createPin.trim().length < 3) {
      setCreateError('Please set a security PIN of at least 3 characters.');
      return;
    }

    setIsCreating(true);
    try {
      const newTeam = await teamService.createTeam(
        createName,
        createTeamId,
        createPin,
        currentUser,
        createDescription
      );
      setMyTeams(prev => [newTeam, ...prev.filter(t => t.id !== newTeam.id)]);
      setActiveSession(teamService.getActiveTeam());
      setCreateName('');
      setCreateTeamId('');
      setCreatePin('');
      setCreateDescription('');
      setActiveTab('active');
      if (onToast) {
        onToast(`Workspace "${newTeam.name}" created! Team ID: ${newTeam.id}`);
      }
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create team workspace.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLeaveTeam = () => {
    teamService.leaveActiveTeam();
    setActiveSession(null);
    setActiveTab('join');
    if (onToast) onToast('Left team workspace. You are now in individual guest mode.');
  };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onToast) onToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to delete this team workspace?')) return;
    try {
      await teamService.deleteTeam(teamId, currentUser);
      setMyTeams(prev => prev.filter(t => t.id !== teamId));
      if (onToast) onToast('Team deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete team.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Team & Guest Workspace</span>
                {activeSession && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Collaborate with guest users to upload unlimited code under a shared team account.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/60 px-5 sm:px-6 gap-2 text-xs font-medium">
          {activeSession && (
            <button
              onClick={() => setActiveTab('active')}
              className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Workspace</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('join')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'join'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Join with ID & PIN</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Team (Creator)</span>
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* TAB 1: ACTIVE WORKSPACE */}
          {activeTab === 'active' && activeSession && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950">
                        {activeSession.teamName}
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Team ID: <code className="font-mono bg-white/70 px-1 py-0.5 rounded border border-emerald-200">{activeSession.teamId}</code>
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Unlimited Active
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-emerald-700">Contributing As: </span>
                    <span className="font-semibold text-emerald-950">{activeSession.memberName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700">Team Creator: </span>
                    <span className="font-semibold text-emerald-950">{activeSession.teamOwnerName || activeSession.teamOwnerEmail}</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-white/80 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Any code snippet you submit will be saved under the team owner&apos;s verified account, with your name attributed as contributor!
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleLeaveTeam}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Team Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Continue Coding
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: JOIN TEAM VIA ID & PIN (FOR GUEST USERS) */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Guest Code Submissions: </span>
                  Enter the Team ID and PIN given by your team leader or colleague to join their workspace. You can then submit unlimited code snippets without having to sign in!
                </div>
              </div>

              {joinError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {joinError}
                </div>
              )}

              {/* Team ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Team ID or Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={joinTeamId}
                  onChange={(e) => setJoinTeamId(e.target.value)}
                  placeholder="e.g. alpha-coders or lab-2026"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ask the team creator for their unique Team ID.
                </span>
              </div>

              {/* Security PIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Security PIN <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showJoinPin ? 'text' : 'password'}
                    value={joinPin}
                    onChange={(e) => setJoinPin(e.target.value)}
                    placeholder="Enter PIN set by creator"
                    className="w-full px-3 py-2 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowJoinPin(!showJoinPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showJoinPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Contributor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Your Contributor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={joinMemberName}
                  onChange={(e) => setJoinMemberName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  This name will appear on every snippet you upload under this team.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isJoining ? 'Joining Team...' : 'Join Team Workspace'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CREATE TEAM (FOR AUTHENTICATED USERS) */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              {!currentUser ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Sign in to Create a Team</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Create a team workspace with a custom Team ID and security PIN so your guest team members can upload unlimited code under your account.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestAuth) onRequestAuth('Sign in with Google to create a team workspace.');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Sign In with Google
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  {createError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                      {createError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Team Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Team Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Alpha Coders"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Team ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Unique Team ID (Slug) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createTeamId}
                        onChange={(e) => setCreateTeamId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                        placeholder="e.g. alpha-coders"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Security PIN */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Security PIN <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCreatePin ? 'text' : 'password'}
                          value={createPin}
                          onChange={(e) => setCreatePin(e.target.value)}
                          placeholder="e.g. 1234 or code2026"
                          className="w-full px-3 py-2 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePin(!showCreatePin)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showCreatePin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Share this PIN with your guest members.</span>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={createDescription}
                        onChange={(e) => setCreateDescription(e.target.value)}
                        placeholder="e.g. DSA & CP team project"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isCreating ? 'Creating Workspace...' : 'Create Team Workspace'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* List of user-created teams */}
              {currentUser && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Your Created Teams ({myTeams.length})
                  </h4>

                  {isLoadingTeams ? (
                    <div className="py-6 text-center text-xs text-slate-400">Loading your teams...</div>
                  ) : myTeams.length === 0 ? (
                    <p className="text-xs text-slate-400">You haven&apos;t created any teams yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {myTeams.map((team) => (
                        <div
                          key={team.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{team.name}</span>
                              <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                ID: {team.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-3">
                              <span>PIN: <strong className="font-mono text-slate-700">{team.pin}</strong></span>
                              <span>·</span>
                              <span>Snippets: {team.snippetCount || 0}</span>
                              <span>·</span>
                              <span>Members: {team.membersCount || 1}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const inviteText = `Join team "${team.name}" on CodeShelf!\nTeam ID: ${team.id}\nPIN: ${team.pin}`;
                                handleCopy(inviteText, `invite_${team.id}`, 'Team invite');
                              }}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
                              title="Copy Team Invite"
                            >
                              {copiedKey === `invite_${team.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Invite</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                teamService.setActiveTeam({
                                  teamId: team.id,
                                  teamName: team.name,
                                  teamOwnerId: team.ownerId,
                                  teamOwnerEmail: team.ownerEmail,
                                  teamOwnerName: team.ownerName,
                                  memberName: currentUser.name || 'Owner',
                                  joinedAt: new Date().toISOString()
                                });
                                setActiveSession(teamService.getActiveTeam());
                                setActiveTab('active');
                                if (onToast) onToast(`Activated workspace "${team.name}"`);
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg font-medium cursor-pointer"
                            >
                              Activate
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(team.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
