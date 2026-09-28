import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AutonomyLevel, AutonomyLevelId, TeammateProfile } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  Check, 
  ChevronRight, 
  ShieldAlert,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';

interface TrustLevelsProps {
  levels: AutonomyLevel[];
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  onSimulateLevelChange: (newLevelId: AutonomyLevelId) => void;
}

export const TrustLevels: React.FC<TrustLevelsProps> = ({
  levels,
  teammate,
  currentLevelData,
  onSimulateLevelChange,
}) => {
  const [inspectedLevelId, setInspectedLevelId] = useState<AutonomyLevelId>(teammate.currentLevel);

  const inspectedLevel = levels.find(l => l.id === inspectedLevelId) || currentLevelData;
  const isCurrentTeammateLevel = inspectedLevel.id === teammate.currentLevel;
  const isUnlockedByTeammate = teammate.currentLevel >= inspectedLevel.id;

  const handlePromoteOrSelect = (levelId: AutonomyLevelId) => {
    setInspectedLevelId(levelId);
    if (levelId !== teammate.currentLevel) {
      onSimulateLevelChange(levelId);
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#1842FF', '#D8F040', '#38BDF8', '#00C853']
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-12 bg-[#0D111C] text-white space-y-8">
      <div>
        
        {/* Section Header */}
        <div className="border-b border-[#182030] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141B2D] border border-[#1E2B48] text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8F040]" />
              CHAPTERS 4 & 6 · FEATURE B · 5-LEVEL AUTONOMY LADDER
            </div>
            <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Real Permissions. Zero Cosmetic Fluff.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Ren doesn't start with access to anything. It starts at <strong className="text-white">Level 1 — Shadow</strong>. It can observe orders and flag supplier price changes, but literally cannot send an email or touch bank funds. Every level-up is tied to an actual permission turning on.
            </p>
          </div>

          <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-xl text-right">
            <span className="text-[11px] font-mono text-neutral-400 block uppercase">
              Current System State:
            </span>
            <span className="font-mono font-bold text-base text-[#D8F040] flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
              Level {teammate.currentLevel} · {currentLevelData.name}
            </span>
            <span className="text-[11px] font-mono text-[#38BDF8] block mt-0.5">
              {teammate.currentLevel === 1 
                ? '14 / 25 Tasks to Assistant'
                : `${teammate.currentXp} / ${teammate.nextLevelXp} XP`}
            </span>
          </div>
        </div>

        {/* 5 Levels Interactive Stepper Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
          {levels.map((lvl) => {
            const isCurrent = teammate.currentLevel === lvl.id;
            const isInspected = inspectedLevelId === lvl.id;
            const isPassed = teammate.currentLevel >= lvl.id;

            return (
              <button
                key={lvl.id}
                onClick={() => handlePromoteOrSelect(lvl.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isInspected
                    ? 'border-[#1842FF] bg-[#141B2D] shadow-[0_0_20px_rgba(24,66,255,0.35)]'
                    : isPassed
                    ? 'border-[#1E2B48] bg-[#0B0E16] hover:bg-[#101626]'
                    : 'border-[#161C2C] bg-[#080A0F] opacity-70 hover:opacity-100'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#D8F040] text-[#080A0F] text-[9px] font-mono font-bold uppercase rounded-bl">
                    ACTIVE
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#38BDF8]">
                    LEVEL 0{lvl.id}
                  </span>
                  {isPassed ? (
                    <Check className="w-4 h-4 text-[#00C853]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                </div>

                <div className="font-bricolage font-bold text-base text-white">
                  {lvl.name}
                </div>
                
                <div className="text-[11px] font-mono text-neutral-400 mt-1 line-clamp-1">
                  {lvl.requiredXp === 0 ? '0 XP (Entry)' : `${lvl.requiredXp} XP Threshold`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Inspected Level Deep-Dive Inspection Card */}
        <div className="bg-[#0B0E16] border border-[#1E2B48] rounded-2xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#182030] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#141B2D] text-[#38BDF8] border border-[#1E2B48] rounded text-xs font-mono font-bold">
                  LEVEL 0{inspectedLevel.id} · {inspectedLevel.name.toUpperCase()}
                </span>
                {isCurrentTeammateLevel && (
                  <span className="px-2.5 py-0.5 bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/40 rounded text-xs font-mono font-bold">
                    CURRENT TEAMMATE CLEARANCE
                  </span>
                )}
              </div>
              <h3 className="font-bricolage font-bold text-2xl text-white mt-1.5">
                {inspectedLevel.tagline}
              </h3>
            </div>

            <button
              onClick={() => handlePromoteOrSelect(inspectedLevel.id)}
              className="px-5 py-2.5 bg-[#1842FF] hover:bg-[#2855FF] text-white text-xs font-mono font-bold uppercase rounded-xl shadow-[0_0_20px_rgba(24,66,255,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <span>{isCurrentTeammateLevel ? 'Currently Active' : `Simulate Level ${inspectedLevel.id} Clearance`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Permitted vs Restricted Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Unlocked Capabilities */}
            <div className="p-5 bg-[#080A0F] border border-[#1A263D] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00C853] uppercase">
                <Unlock className="w-4 h-4 text-[#00C853]" />
                <span>UNLOCKED OPERATIONAL POWERS</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                {inspectedLevel.unlockedPermissions.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] mt-2 shrink-0" />
                    <span className="leading-relaxed">{perm}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hard-Coded Restrictions & Failure Boundaries */}
            <div className="p-5 bg-[#080A0F] border border-[#1A263D] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF5252] uppercase">
                <Lock className="w-4 h-4 text-[#FF5252]" />
                <span>HARD FAIL-CLOSED RESTRICTIONS</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                {inspectedLevel.restrictedPermissions.map((rest, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5252] mt-2 shrink-0" />
                    <span className="leading-relaxed">{rest}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Mathematical Invariant Boundary */}
          <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-xl flex items-start gap-3 text-xs font-mono">
            <Zap className="w-4 h-4 text-[#D8F040] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#D8F040] font-bold uppercase block mb-0.5">
                ENFORCED KERNEL INVARIANT FOR LEVEL {inspectedLevel.id}:
              </span>
              <span className="text-neutral-300">
                {inspectedLevel.failureBound}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
