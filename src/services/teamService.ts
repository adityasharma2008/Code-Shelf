import { doc, getDoc, setDoc, updateDoc, deleteDoc, query, collection, where, getDocs, increment } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { WorkspaceTeam, ActiveTeamSession, User } from '../types';

const ACTIVE_TEAM_KEY = 'codeshelf_active_team';
const CREATED_TEAMS_KEY = 'codeshelf_created_teams_cache';

export const teamService = {
  /**
   * Get the active joined team session for this browser (for guest or member)
   */
  getActiveTeam(): ActiveTeamSession | null {
    try {
      const raw = localStorage.getItem(ACTIVE_TEAM_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.teamId && parsed.teamName) {
        return parsed as ActiveTeamSession;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Set active team session (persisted in localStorage)
   */
  setActiveTeam(session: ActiveTeamSession): void {
    try {
      localStorage.setItem(ACTIVE_TEAM_KEY, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('codeshelf_team_changed', { detail: { session } }));
      window.dispatchEvent(new Event('codeshelf_auth_changed'));
    } catch (err) {
      console.warn('Failed to save active team session:', err);
    }
  },

  /**
   * Leave current active team
   */
  leaveActiveTeam(): void {
    try {
      localStorage.removeItem(ACTIVE_TEAM_KEY);
      window.dispatchEvent(new CustomEvent('codeshelf_team_changed', { detail: { session: null } }));
      window.dispatchEvent(new Event('codeshelf_auth_changed'));
    } catch (err) {
      console.warn('Failed to leave active team:', err);
    }
  },

  /**
   * Create a new Workspace / Team (by authenticated user)
   */
  async createTeam(
    name: string,
    rawTeamId: string,
    pin: string,
    user: User,
    description?: string
  ): Promise<WorkspaceTeam> {
    const cleanName = (name || '').trim();
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Team name must be at least 2 characters.');
    }

    // Sanitize Team ID: lowercase alphanumeric and hyphens only
    const cleanId = (rawTeamId || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 32);

    if (!cleanId || cleanId.length < 3) {
      throw new Error('Team ID must be at least 3 characters (letters, numbers, hyphens only).');
    }

    const cleanPin = (pin || '').trim();
    if (!cleanPin || cleanPin.length < 3 || cleanPin.length > 16) {
      throw new Error('Security PIN must be between 3 and 16 characters.');
    }

    const path = `teams/${cleanId}`;

    // Check if ID is already taken in Firestore
    try {
      const existingSnap = await getDoc(doc(db, 'teams', cleanId));
      if (existingSnap.exists()) {
        throw new Error(`Team ID "${cleanId}" is already taken. Please pick another unique ID.`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already taken')) throw err;
      // Offline fallback: check local cache
      const cached = this.getLocalCreatedTeams();
      if (cached.some(t => t.id === cleanId)) {
        throw new Error(`Team ID "${cleanId}" is already registered. Please choose another ID.`);
      }
    }

    const newTeam: WorkspaceTeam = {
      id: cleanId,
      name: cleanName,
      pin: cleanPin,
      ownerId: user.id || (user as any).uid || 'owner',
      ownerEmail: user.email || '',
      ownerName: user.name || 'Team Creator',
      createdAt: new Date().toISOString(),
      snippetCount: 0,
      membersCount: 1,
      description: description?.trim() || ''
    };

    // Save to Firestore
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'teams', cleanId), newTeam);
      }
    } catch (err) {
      console.warn('Could not save team to Cloud Firestore, falling back to local cache:', err);
    }

    // Also cache locally
    this.saveLocalCreatedTeam(newTeam);

    // Auto-join creator into their own team as an active session if not already in one
    this.setActiveTeam({
      teamId: newTeam.id,
      teamName: newTeam.name,
      teamOwnerId: newTeam.ownerId,
      teamOwnerEmail: newTeam.ownerEmail,
      teamOwnerName: newTeam.ownerName,
      memberName: newTeam.ownerName,
      joinedAt: new Date().toISOString()
    });

    return newTeam;
  },

  /**
   * Join a Workspace / Team using Team ID and PIN (For Guest Users or Members)
   */
  async joinTeam(teamId: string, pin: string, memberName: string): Promise<ActiveTeamSession> {
    const cleanId = (teamId || '').toLowerCase().trim();
    const cleanPin = (pin || '').trim();
    const cleanMemberName = (memberName || '').trim() || 'Team Member';

    if (!cleanId) {
      throw new Error('Please enter a valid Team ID.');
    }
    if (!cleanPin) {
      throw new Error('Please enter the Team PIN.');
    }

    let team: WorkspaceTeam | null = null;

    // 1. Try fetching from Firestore
    try {
      const docSnap = await getDoc(doc(db, 'teams', cleanId));
      if (docSnap.exists()) {
        team = docSnap.data() as WorkspaceTeam;
      }
    } catch (err) {
      console.warn('Firestore team lookup error, checking local cache:', err);
    }

    // 2. Fallback to local cache if offline or not in Firestore
    if (!team) {
      const cached = this.getLocalCreatedTeams();
      const found = cached.find(t => t.id === cleanId);
      if (found) {
        team = found;
      }
    }

    if (!team) {
      throw new Error(`Team with ID "${cleanId}" not found. Please verify the ID with your team creator.`);
    }

    // Verify PIN
    if (team.pin !== cleanPin) {
      throw new Error('Incorrect Team PIN. Please enter the correct PIN provided by the team creator.');
    }

    // Increment member count in Firestore if possible
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'teams', cleanId), {
          membersCount: increment(1)
        });
      }
    } catch {}

    const session: ActiveTeamSession = {
      teamId: team.id,
      teamName: team.name,
      teamOwnerId: team.ownerId,
      teamOwnerEmail: team.ownerEmail,
      teamOwnerName: team.ownerName,
      memberName: cleanMemberName,
      joinedAt: new Date().toISOString()
    };

    this.setActiveTeam(session);
    return session;
  },

  /**
   * Fetch teams created by the currently logged-in user
   */
  async getUserCreatedTeams(userId: string): Promise<WorkspaceTeam[]> {
    const local = this.getLocalCreatedTeams().filter(t => t.ownerId === userId);
    if (!auth.currentUser || !userId) {
      return local;
    }

    const path = 'teams';
    try {
      const q = query(collection(db, path), where('ownerId', '==', userId));
      const snap = await getDocs(q);
      const remote: WorkspaceTeam[] = [];
      snap.forEach(d => {
        remote.push(d.data() as WorkspaceTeam);
      });

      // Merge remote and local
      const map = new Map<string, WorkspaceTeam>();
      local.forEach(t => map.set(t.id, t));
      remote.forEach(t => map.set(t.id, t));

      const merged = Array.from(map.values());
      localStorage.setItem(CREATED_TEAMS_KEY, JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.warn('Failed to query remote teams:', err);
      return local;
    }
  },

  /**
   * Update team PIN
   */
  async updateTeamPin(teamId: string, newPin: string, user: User): Promise<void> {
    const cleanPin = (newPin || '').trim();
    if (!cleanPin || cleanPin.length < 3) {
      throw new Error('PIN must be at least 3 characters.');
    }

    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'teams', teamId), {
          pin: cleanPin
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
    }

    // Update local cache
    const teams = this.getLocalCreatedTeams();
    const target = teams.find(t => t.id === teamId);
    if (target) {
      target.pin = cleanPin;
      localStorage.setItem(CREATED_TEAMS_KEY, JSON.stringify(teams));
    }
  },

  /**
   * Delete a team created by user
   */
  async deleteTeam(teamId: string, user: User): Promise<void> {
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'teams', teamId));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teams/${teamId}`);
    }

    // Remove from local cache
    const teams = this.getLocalCreatedTeams().filter(t => t.id !== teamId);
    localStorage.setItem(CREATED_TEAMS_KEY, JSON.stringify(teams));

    // If currently active team is this team, leave it
    const active = this.getActiveTeam();
    if (active && active.teamId === teamId) {
      this.leaveActiveTeam();
    }
  },

  /**
   * Increment snippet count for a team
   */
  async recordSnippetUploaded(teamId: string): Promise<void> {
    try {
      const teams = this.getLocalCreatedTeams();
      const target = teams.find(t => t.id === teamId);
      if (target) {
        target.snippetCount = (target.snippetCount || 0) + 1;
        localStorage.setItem(CREATED_TEAMS_KEY, JSON.stringify(teams));
      }

      if (auth.currentUser) {
        await updateDoc(doc(db, 'teams', teamId), {
          snippetCount: increment(1)
        });
      }
    } catch {}
  },

  // Local storage helpers
  getLocalCreatedTeams(): WorkspaceTeam[] {
    try {
      const raw = localStorage.getItem(CREATED_TEAMS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveLocalCreatedTeam(team: WorkspaceTeam): void {
    try {
      const list = this.getLocalCreatedTeams().filter(t => t.id !== team.id);
      list.unshift(team);
      localStorage.setItem(CREATED_TEAMS_KEY, JSON.stringify(list));
    } catch {}
  }
};
