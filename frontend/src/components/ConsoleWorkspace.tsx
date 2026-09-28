import React from 'react';
import { 
  TeammateProfile, 
  AutonomyLevel, 
  MissionDocket, 
  SkillItem, 
  ApprovalQuest,
  AutonomyLevelId 
} from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Flame, 
  Users, 
  LogOut, 
  UserPlus, 
  Terminal, 
  CheckCircle2, 
  ShieldAlert,
  Building2,
  Lock,
  Maximize2,
  Cpu,
  UserCheck
} from 'lucide-react';
import { InteractiveSimulator } from './InteractiveSimulator';
import { TrustLevels } from './TrustLevels';
import { MissionLog } from './MissionLog';
import { SkillTree } from './SkillTree';
import { StreaksAndQuests } from './StreaksAndQuests';
import { CollaborationRadar } from './CollaborationRadar';
import { CrewmateLogo } from './CrewmateLogo';

export type ConsoleWindowId = 'simulator' | 'levels' | 'missions' | 'skills' | 'quests' | 'radar';

interface ConsoleWorkspaceProps {
  activeWindow: ConsoleWindowId;
  onSelectWindow: (winId: ConsoleWindowId) => void;
  workspaceName: string;
  founderName: string;
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  levels: AutonomyLevel[];
  missions: MissionDocket[];
  skills: SkillItem[];
  quests: ApprovalQuest[];
  onMissionCompleted: (newMission: MissionDocket, xpGain: number) => void;
  onInspectMission: (m: MissionDocket) => void;
  onSimulateLevelChange: (lvlId: AutonomyLevelId) => void;
  onToggleSkill: (skillId: string) => void;
  onRunSkillInSimulator: (objective: string) => void;
  onApproveQuest: (questId: string, xpReward: number) => void;
  onRejectQuest: (questId: string) => void;
  onOpenRecruitModal: () => void;
  onSignOut: () => void;
  prefilledObjective: string;
  onClearPrefill: () => void;
}

export const ConsoleWorkspace: React.FC<ConsoleWorkspaceProps> = ({
  activeWindow,
  onSelectWindow,
  workspaceName,
  founderName,
  teammate,
  currentLevelData,
  levels,
  missions,
  skills,
  quests,
  onMissionCompleted,
  onInspectMission,
  onSimulateLevelChange,
  onToggleSkill,
  onRunSkillInSimulator,
  onApproveQuest,
  onRejectQuest,
  onOpenRecruitModal,
  onSignOut,
  prefilledObjective,
  onClearPrefill,
}) => {
  const pendingQuestsCount = quests.filter(q => q.status === 'pending').length;

  const windowTabs: { id: ConsoleWindowId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'simulator',
      label: 'Feature G: Live Simulator',
      icon: <Sparkles className="w-4 h-4 text-[#D8F040]" />,
    },
    {
      id: 'levels',
      label: 'Feature B: Autonomy Ladder',
      icon: <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />,
      badge: `Lvl ${teammate.currentLevel} · ${currentLevelData.name}`,
    },
    {
      id: 'missions',
      label: 'Feature C: Mission Diary',
      icon: <FileText className="w-4 h-4 text-[#00C853]" />,
      badge: `${missions.length} Verified`,
    },
    {
      id: 'skills',
      label: 'Feature D: Skill Tree',
      icon: <Layers className="w-4 h-4 text-[#1842FF]" />,
      badge: `${teammate.activeSkills.length} Equipped`,
    },
    {
      id: 'quests',
      label: 'Features E&F: Streaks & Quests',
      icon: <Flame className="w-4 h-4 text-[#FF5252]" />,
      badge: pendingQuestsCount > 0 ? `${pendingQuestsCount} Needs You` : undefined,
    },
    {
      id: 'radar',
      label: 'Features I&J: Team Radar',
      icon: <Users className="w-4 h-4 text-[#38BDF8]" />,
    },
  ];

  const windowTitles: Record<ConsoleWindowId, { title: string; subtitle: string }> = {
    simulator: {
      title: 'WINDOW: LIVE OBJECTIVE SIMULATOR (FEATURE G)',
      subtitle: 'Bounded Task Decomposition, Connected API Checks & Verification Dockets',
    },
    levels: {
      title: 'WINDOW: 5-LEVEL AUTONOMY LADDER (FEATURE B)',
      subtitle: 'Real Operational Clearance Matrix, Mathematical Failure Bounds & Promotion Gates',
    },
    missions: {
      title: 'WINDOW: MISSION DIARY & AUDIT DOCKETS (FEATURE C)',
      subtitle: 'Every Little Thing Written Down · Cryptographic Proof of Work & State Transitions',
    },
    skills: {
      title: 'WINDOW: MODULAR SKILL MARKETPLACE (FEATURE D)',
      subtitle: 'Equip Capabilities with 1 Toggle · 1-Sentence Plain Descriptions & Zero Config',
    },
    quests: {
      title: 'WINDOW: STREAKS & APPROVAL QUESTS (FEATURES E & F)',
      subtitle: '12-Day Reliability Momentum & The One Time It Asks For Human Sign-Off',
    },
    radar: {
      title: 'WINDOW: TEAMWORK RADAR & MILESTONES (FEATURES I & J)',
      subtitle: 'Workload Split (Ren vs Meera vs Staff) & Partnership Milestones from Day 1',
    },
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-body selection:bg-[#D8F040] selection:text-[#080A0F] flex flex-col">
      
      {/* 0. Top Hackathon Banner */}
      <div className="bg-[#0B0F19] border-b border-[#182030] px-4 py-1.5 text-xs font-mono text-neutral-300 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#141B2D] border border-[#1E2B48] text-[#D8F040] font-bold text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
            Paytm AI Hackathon
          </span>
          <span className="text-neutral-300 text-xs">
            Made by <strong className="text-white font-semibold">Krutarth Ashar</strong> and <strong className="text-white font-semibold">Raghav Arora</strong> for the <strong className="text-[#38BDF8] font-semibold">Paytm AI Hackathon</strong>
          </span>
        </div>
        <div className="text-[11px] text-neutral-500 font-mono hidden lg:block">
          BUILD FOR INDIA · BOUNDED AUTONOMOUS AGENTS
        </div>
      </div>

      {/* 1. Main System Header (Obsidian Palette) */}
      <header className="sticky top-0 z-40 bg-[#0B0E17]/95 backdrop-blur-md border-b border-[#182030] px-4 lg:px-8 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand & Workspace Indicator */}
          <div className="flex items-center gap-3">
            <CrewmateLogo size="md" variant="white" withTagline={false} />
            <div className="border-l border-[#1E2B48] pl-3">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#141B2D] text-[#38BDF8] border border-[#1E2B48] rounded">
                  WORKSPACE
                </span>
                <span className="text-[11px] font-mono text-neutral-300">
                  {workspaceName}
                </span>
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                Operator / Founder: <span className="text-white font-semibold">{founderName}</span>
              </div>
            </div>
          </div>

          {/* Center Teammate Status HUD (Story Chapter 3 & 4) */}
          <div className="hidden md:flex items-center gap-4 bg-[#0E1422] border border-[#1E2B48] px-4 py-2 rounded-xl font-mono text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#1842FF] text-[#D8F040] font-bold text-xs flex items-center justify-center border border-[#38BDF8]/40 shadow-sm">
                {teammate.visualMark || teammate.avatarSeed}
              </div>
              <div>
                <span className="font-bold text-white block">{teammate.name}</span>
                <span className="text-[9px] text-[#38BDF8] block">
                  Level {teammate.currentLevel} · {currentLevelData.name}
                </span>
              </div>
            </div>
            
            <div className="h-5 w-px bg-[#1E2B48]" />

            <div>
              <div className="flex items-center justify-between gap-3 text-[10px] text-neutral-400 mb-0.5">
                <span>PROGRESS TO NEXT LEVEL:</span>
                <span className="font-bold text-[#D8F040]">{teammate.currentXp} / {teammate.nextLevelXp} XP</span>
              </div>
              <div className="w-24 h-1.5 bg-[#141B2D] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D8F040] transition-all"
                  style={{ width: `${Math.min(100, (teammate.currentXp / teammate.nextLevelXp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="h-5 w-px bg-[#1E2B48]" />

            <div className="flex items-center gap-1.5 text-[#00C853] text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />
              <span>{teammate.accuracyRate}% RELIABLE</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRecruitModal}
              className="px-3 py-1.5 bg-[#141B2D] hover:bg-[#1E2942] text-[#D8F040] font-mono font-bold text-xs uppercase border border-[#1E2B48] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#D8F040]" />
              <span className="hidden sm:inline">Configure {teammate.name}</span>
            </button>

            <button
              onClick={onSignOut}
              className="px-3 py-1.5 bg-[#0F1422] hover:bg-[#FF441F]/20 text-neutral-300 hover:text-white font-mono font-bold text-xs uppercase border border-[#1E2B48] hover:border-[#FF441F] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Return to Public Landing Page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Window Switcher Subheader (Tabs) */}
      <div className="bg-[#080A0F] border-b border-[#182030] px-4 lg:px-8 py-2 sticky top-[57px] z-30 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-max">
          
          {/* Window Tabs */}
          <nav className="flex items-center gap-2">
            {windowTabs.map((tab) => {
              const isActive = activeWindow === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectWindow(tab.id)}
                  className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 border cursor-pointer ${
                    isActive
                      ? 'bg-[#141B2D] text-white border-[#1842FF] shadow-[0_0_15px_rgba(24,66,255,0.3)]'
                      : 'bg-[#0B0E16] text-neutral-400 border-[#1B2438] hover:text-white hover:bg-[#101626]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      isActive 
                        ? 'bg-[#1842FF] text-[#D8F040]' 
                        : 'bg-[#121826] text-neutral-300 border border-[#1E2B48]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Strict Invariant Status */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-neutral-300 bg-[#0E1422] px-3 py-1.5 border border-[#1E2B48] rounded-lg">
            <Lock className="w-3.5 h-3.5 text-[#00C853]" />
            <span>SAFE INVARIANT: Δ == $0.000 (ZERO DRIFT)</span>
          </div>

        </div>
      </div>

      {/* 3. Main Dedicated Window Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="bg-[#0D111C] border border-[#1B2438] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* OS Window Titlebar */}
          <div className="bg-[#0B0E16] border-b border-[#182030] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Window Dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5252]/80 border border-[#FF5252]" />
                <span className="w-3 h-3 rounded-full bg-[#D8F040]/80 border border-[#D8F040]" />
                <span className="w-3 h-3 rounded-full bg-[#00C853]/80 border border-[#00C853]" />
              </div>
              
              <div className="h-4 w-px bg-[#1E2B48] hidden sm:block" />

              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D8F040]">
                  {windowTitles[activeWindow].title}
                </span>
                <span className="hidden md:inline text-neutral-400 text-xs font-mono ml-2">
                  — {windowTitles[activeWindow].subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
              <span className="hidden sm:inline">AIR-GAPPED PERIMETER</span>
              <span className="px-2 py-0.5 bg-[#141B2D] text-[#38BDF8] border border-[#1E2B48] rounded">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Window Interior Content Area */}
          <div className="bg-[#0D111C]">
            
            {/* WINDOW 1: LIVE OBJECTIVE SIMULATOR (FEATURE G) */}
            {activeWindow === 'simulator' && (
              <InteractiveSimulator
                teammate={teammate}
                currentLevelData={currentLevelData}
                onMissionCompleted={onMissionCompleted}
                onInspectMission={onInspectMission}
                prefilledObjective={prefilledObjective}
                onClearPrefill={onClearPrefill}
              />
            )}

            {/* WINDOW 2: 5-LEVEL AUTONOMY LADDER (FEATURE B) */}
            {activeWindow === 'levels' && (
              <TrustLevels
                levels={levels}
                teammate={teammate}
                currentLevelData={currentLevelData}
                onSimulateLevelChange={onSimulateLevelChange}
              />
            )}

            {/* WINDOW 3: VERIFIED MISSION DOCKET (FEATURE C) */}
            {activeWindow === 'missions' && (
              <MissionLog
                missions={missions}
                onInspectMission={onInspectMission}
              />
            )}

            {/* WINDOW 4: MODULAR SKILL MARKETPLACE (FEATURE D) */}
            {activeWindow === 'skills' && (
              <SkillTree
                skills={skills}
                teammate={teammate}
                currentLevelData={currentLevelData}
                onToggleSkill={onToggleSkill}
                onRunSkillInSimulator={(obj) => {
                  onRunSkillInSimulator(obj);
                  onSelectWindow('simulator');
                }}
              />
            )}

            {/* WINDOW 5: STREAKS & APPROVAL QUESTS (FEATURES E & F) */}
            {activeWindow === 'quests' && (
              <StreaksAndQuests
                teammate={teammate}
                quests={quests}
                onApproveQuest={onApproveQuest}
                onRejectQuest={onRejectQuest}
              />
            )}

            {/* WINDOW 6: PARTNERSHIP DYNAMICS RADAR (FEATURES I & J) */}
            {activeWindow === 'radar' && (
              <CollaborationRadar
                teammate={teammate}
              />
            )}

          </div>

        </div>

      </main>

      {/* 4. Minimalist Console Footer */}
      <footer className="border-t border-[#182030] bg-[#080A0F] px-6 py-3.5 text-xs font-mono text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
          <span>Ren Bounded Runtime Active · Merkle Invariant: Zero Mutation Leakage</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <span>Made by <strong className="text-neutral-200">Krutarth Ashar</strong> and <strong className="text-neutral-200">Raghav Arora</strong> for the <strong className="text-[#38BDF8]">Paytm AI Hackathon</strong></span>
        </div>
      </footer>

    </div>
  );
};
