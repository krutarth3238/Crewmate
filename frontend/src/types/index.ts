export type AutonomyLevelId = 1 | 2 | 3 | 4 | 5;

export interface AutonomyLevel {
  id: AutonomyLevelId;
  name: string;
  tagline: string;
  requiredXp: number;
  unlockedPermissions: string[];
  restrictedPermissions: string[];
  failureBound: string;
  color: string;
  bgLight: string;
  accentBorder: string;
}

export interface TeammateProfile {
  name: string;
  avatarSeed: string;
  visualMark?: string;
  roleTitle: string;
  businessType: string;
  currentLevel: AutonomyLevelId;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  streakShields: number;
  totalMissionsCompleted: number;
  hoursSaved: number;
  accuracyRate: number;
  activeSkills: string[];
}

export type MissionStatus = 'verified' | 'pending_approval' | 'in_progress' | 'failed';

export interface MissionDocket {
  id: string;
  refCode: string;
  title: string;
  category: 'finance' | 'support' | 'sales' | 'inventory';
  status: MissionStatus;
  timestamp: string;
  executionDuration: string;
  systemsTouched: string[];
  summary: string;
  auditedValue?: string;
  confidenceScore: number;
  verificationSeal: string;
  beforeState: string;
  afterState: string;
  journalLinesCount: number;
  requiresHumanAction?: boolean;
  approvalPrompt?: string;
  xpAwarded: number;
}

export interface SkillItem {
  id: string;
  title: string;
  category: 'finance' | 'support' | 'sales' | 'inventory';
  categoryLabel: string;
  levelRequired: AutonomyLevelId;
  description: string;
  inActionSummary: string;
  equipped: boolean;
  sampleObjective: string;
  supportedTools: string[];
  accentColor: string;
}

export interface ApprovalQuest {
  id: string;
  refCode: string;
  title: string;
  reason: string;
  amountOrScope: string;
  systems: string[];
  timestamp: string;
  xpReward: number;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SimulationStep {
  step: number;
  label: string;
  detail: string;
  tool: string;
  status: 'waiting' | 'running' | 'completed';
}

export interface RelationshipMilestone {
  day: string;
  title: string;
  description: string;
  levelBadge: string;
  highlightStat: string;
}
