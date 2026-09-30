import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { subscribeToAuthState, signOut as firebaseSignOut, type User } from '../firebase';
import {
  syncUser,
  getMe,
  getTeammate,
  listTeammates,
  getAutonomyLevels,
  apiFetch,
  type TeammateResponse,
  type UserWithWorkspaces,
  type AutonomyLevelResponse,
} from '../lib/api';

interface AuthContextValue {
  firebaseUser: User | null;
  backendUser: UserWithWorkspaces | null;
  teammate: TeammateResponse | null;
  autonomyLevels: AutonomyLevelResponse[];
  isLoading: boolean;
  /** Previous XP before last refresh — used to animate XP gain */
  previousXp: number;
  /** Previous level id before last refresh — used to detect level-up */
  previousLevelId: number;
  syncWithBackend: (founderName: string) => Promise<UserWithWorkspaces>;
  refreshBackendUser: () => Promise<UserWithWorkspaces>;
  setActiveTeammate: (t: TeammateResponse) => void;
  refreshTeammate: () => Promise<TeammateResponse | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<UserWithWorkspaces | null>(null);
  const [teammate, setTeammate] = useState<TeammateResponse | null>(null);
  const [autonomyLevels, setAutonomyLevels] = useState<AutonomyLevelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previousXp, setPreviousXp] = useState(0);
  const [previousLevelId, setPreviousLevelId] = useState(1);

  // Load autonomy levels once (static reference data)
  useEffect(() => {
    getAutonomyLevels()
      .then(setAutonomyLevels)
      .catch(() => {/* backend may not be running — gracefully ignore */});
  }, []);

  // Subscribe to Firebase auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Try to restore backend session for returning users
        try {
          const me = await getMe();
          setBackendUser(me);
          // Restore active teammate from DB — no localStorage dependency
          if (me.workspaces.length > 0) {
            try {
              const teammates = await listTeammates();
              if (teammates.length > 0) {
                // Prefer the last-used teammate (stored as a hint in localStorage)
                const savedId = localStorage.getItem('crewmate_teammate_id');
                const preferred = savedId
                  ? teammates.find(t => String(t.id) === savedId) ?? teammates[0]
                  : teammates[0];
                setTeammate(preferred);
                setPreviousXp(preferred.current_xp);
                setPreviousLevelId(preferred.current_level.id);
                localStorage.setItem('crewmate_teammate_id', String(preferred.id));
              }
            } catch {
              // Could not fetch teammates — will show onboarding if needed
            }
          }

        } catch (error: any) {
          // The backend returns 401 if the user record doesn't exist yet (onboarding needed)
          if (error?.message?.includes('401') || error?.message?.includes('No local account')) {
            setBackendUser(null);
          } else {
            console.error("Backend error or offline:", error);
            // Don't wipe the user if the backend just restarted. Just wait or retry.
            // For now, we'll keep loading true so they don't get trapped in onboarding.
            setTimeout(() => window.location.reload(), 2000); // Simple auto-retry
            return; // keep isLoading true
          }
        }
      } else {
        setBackendUser(null);
        setTeammate(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const syncWithBackend = useCallback(async (founderName: string): Promise<UserWithWorkspaces> => {
    await syncUser(founderName);
    const me = await getMe();
    setBackendUser(me);
    return me;
  }, []);

  const refreshBackendUser = useCallback(async (): Promise<UserWithWorkspaces> => {
    const me = await getMe();
    setBackendUser(me);
    return me;
  }, []);

  const setActiveTeammate = useCallback((t: TeammateResponse) => {
    setPreviousXp(t.current_xp);
    setPreviousLevelId(t.current_level.id);
    setTeammate(t);
    localStorage.setItem('crewmate_teammate_id', String(t.id));
  }, []);

  const refreshTeammate = useCallback(async (): Promise<TeammateResponse | null> => {
    if (!teammate) return null;
    const prevXp = teammate.current_xp;
    const prevLevelId = teammate.current_level.id;
    const fresh = await getTeammate(teammate.id);
    setPreviousXp(prevXp);
    setPreviousLevelId(prevLevelId);
    setTeammate(fresh);
    return fresh;
  }, [teammate]);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    setFirebaseUser(null);
    setBackendUser(null);
    setTeammate(null);
    localStorage.removeItem('crewmate_teammate_id');
  }, []);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      backendUser,
      teammate,
      autonomyLevels,
      isLoading,
      previousXp,
      previousLevelId,
      syncWithBackend,
      refreshBackendUser,
      setActiveTeammate,
      refreshTeammate,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
