/**
 * Typed API client for all Crewmate backend endpoints.
 * Automatically attaches Firebase ID token on authenticated requests.
 */
import { auth } from '../firebase';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ── Types mirroring backend schemas ──────────────────────────────────────────

export interface AutonomyLevelResponse {
  id: number;
  name: string;
  tagline: string;
  required_xp: number;
  unlocked_permissions: string[];
  restricted_permissions: string[];
  failure_bound: string;
  color: string;
  bg_light: string;
  accent_border: string;
}

export interface TeammateResponse {
  id: number;
  workspace_id: number;
  name: string;
  avatar_seed: string;
  visual_mark: string;
  role_title: string;
  current_level: AutonomyLevelResponse;
  current_xp: number;
  next_level_xp: number | null;
  streak_days: number;
  streak_shields: number;
  total_missions_completed: number;
  hours_saved: number;
  accuracy_rate: number;
}

export interface WorkspaceResponse {
  id: number;
  owner_user_id: number;
  name: string;
  business_type: string;
  created_at: string;
}

export interface UserResponse {
  id: number;
  firebase_uid: string;
  email: string;
  founder_name: string;
  created_at: string;
  google_connected: boolean;
}

export interface UserWithWorkspaces {
  user: UserResponse;
  workspaces: { id: number; name: string; business_type: string }[];
}

export interface MissionSummary {
  id: number;
  ref_code: string;
  title: string;
  category: string;
  status: string;
  execution_duration: string;
  systems_touched: string[];
  summary: string;
  confidence_score: number;
  xp_awarded: number;
  created_at: string;
}

export interface MissionDetail extends MissionSummary {
  audited_value: string | null;
  verification_seal: string;
  before_state: string | null;
  after_state: string | null;
  journal_lines_count: number;
}

export interface QuestResponse {
  id: number;
  ref_code: string;
  title: string;
  reason: string;
  amount_or_scope: string | null;
  systems: string[];
  xp_reward: number;
  details: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AgentExecuteResponse {
  status: 'completed' | 'needs_approval' | 'demo_completed';
  mission?: MissionDetail;
  quest?: QuestResponse;
  demo_objective?: string;
  demo_plan_steps?: { tool: string; args: Record<string, unknown>; reason: string }[];
  demo_summary?: string;
  demo_systems_touched?: string[];
}

export interface QuestResolutionResponse {
  quest: QuestResponse;
  mission: MissionDetail;
  teammate: TeammateResponse;
}

// ── Core fetch helper ─────────────────────────────────────────────────────────

async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = await getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      // ignore json parse error
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const syncUser = (founderName: string) =>
  apiFetch<UserResponse>('/api/auth/sync', {
    method: 'POST',
    body: JSON.stringify({ founder_name: founderName }),
  });

export const getMe = () => apiFetch<UserWithWorkspaces>('/api/users/me');

// ── Workspaces ────────────────────────────────────────────────────────────────

export const createWorkspace = (name: string, businessType: string, location: string, subNiche: string) =>
  apiFetch<WorkspaceResponse>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name, business_type: businessType, location, sub_niche: subNiche }),
  });

export const createTeammate = (
  workspaceId: number,
  data: { name: string; avatar_seed: string; visual_mark: string },
) =>
  apiFetch<TeammateResponse>(`/api/workspaces/${workspaceId}/teammate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Teammates ─────────────────────────────────────────────────────────────────

export const getTeammate = (id: number) =>
  apiFetch<TeammateResponse>(`/api/teammates/${id}`);

export const listTeammates = () =>
  apiFetch<TeammateResponse[]>('/api/teammates');


export const getAutonomyLevels = () =>
  apiFetch<AutonomyLevelResponse[]>('/api/autonomy-levels', {}, false);

export const devSetLevel = (teammateId: number, levelId: number) =>
  apiFetch<TeammateResponse>(
    `/api/dev/teammates/${teammateId}/set-level?level_id=${levelId}`,
    { method: 'POST' },
  );

// ── Agent ─────────────────────────────────────────────────────────────────────

export const executeObjective = (
  objective: string,
  teammateId?: number,
) =>
  apiFetch<AgentExecuteResponse>(
    '/api/agent/execute',
    {
      method: 'POST',
      body: JSON.stringify({ objective, teammate_id: teammateId }),
    },
    !!teammateId,
  );

// ── Missions ──────────────────────────────────────────────────────────────────

export const getMissions = (
  teammateId: number,
  cursor?: string,
) => {
  const params = new URLSearchParams({ teammate_id: String(teammateId), limit: '20' });
  if (cursor) params.set('cursor', cursor);
  return apiFetch<{ missions: MissionSummary[]; next_cursor: string | null }>(
    `/api/missions?${params}`,
  );
};

export const getMission = (id: number) =>
  apiFetch<MissionDetail>(`/api/missions/${id}`);

// ── Quests ────────────────────────────────────────────────────────────────────

export const getQuests = (teammateId: number, statusFilter = 'pending') => {
  const params = new URLSearchParams({
    teammate_id: String(teammateId),
    status_filter: statusFilter,
  });
  return apiFetch<QuestResponse[]>(`/api/quests?${params}`);
};

export const approveQuest = (questId: number) =>
  apiFetch<QuestResolutionResponse>(`/api/quests/${questId}/approve`, {
    method: 'POST',
  });

export const rejectQuest = (questId: number) =>
  apiFetch<QuestResponse>(`/api/quests/${questId}/reject`, { method: 'POST' });
