import React from 'react';
import { TeammateProfile, AutonomyLevel, MissionDocket } from '../types';
import { ArrowDown, Flame, Shield, CheckCircle2, Terminal, Zap } from 'lucide-react';
import { CrewmateMark } from './CrewmateLogo';

interface HeroProps {
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  latestMission: MissionDocket;
  onLaunchSimulator: () => void;
  onOpenRecruit: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  teammate,
  currentLevelData,
  latestMission,
  onLaunchSimulator,
  onOpenRecruit,
}) => {
  return (
    <section id="hero" className="relative pt-8 pb-12 lg:pt-14 lg:pb-20 border-b-2 border-[#0D0E11] bg-white overflow-hidden">
      
      {/* Subtle grid accent background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0D0E11 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative">
        
        {/* Hackathon Context & Status Flag */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0D0E11] text-white font-mono text-xs font-bold uppercase tracking-wider">
            <CrewmateMark size={14} variant="color" />
            PAYTM BUILD FOR INDIA HACKATHON
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#0D0E11] text-[#0D0E11] font-mono text-xs font-bold uppercase">
            AUTONOMOUS AI CO-FOUNDER
          </div>
          <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] border border-[#1638F0] text-[#1638F0] font-mono text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            SYSTEM ACTIVE · ZERO MUTATION LEAKAGE
          </div>
        </div>

        {/* Hero Grid: Main Typographic Statement on Left, Live Proof Docket on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Statement & Action Plan (7 cols) */}
          <div className="lg:col-span-7">
            <h1 className="font-clash text-3xl sm:text-4xl xl:text-5xl font-bold text-[#0D0E11] tracking-tight leading-[1.08] mb-5">
              Hire an AI teammate.<br />
              <span className="text-[#1638F0]">Watch it earn your trust,</span><br />
              one mission at a time.
            </h1>

            <p className="font-body text-base sm:text-lg text-neutral-800 leading-relaxed max-w-2xl mb-8">
              No conversational chat illusions. <strong className="font-semibold text-[#0D0E11]">Crewmate</strong> is an autonomous operational co-founder engineered around a <strong className="font-semibold text-[#0D0E11]">5-level gamified trust ladder</strong>. It starts in Shadow mode, observes your business workflows, and unlocks real operational clearances only as verified proofs of work accumulate.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <button
                onClick={onLaunchSimulator}
                className="px-6 py-4 bg-[#1638F0] hover:bg-[#112ec7] text-white font-mono font-bold text-sm tracking-wider uppercase border-2 border-[#0D0E11] shadow-hard-black btn-press flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Launch Live Objective Demo</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>

              <button
                onClick={onOpenRecruit}
                className="px-6 py-4 bg-white hover:bg-neutral-50 text-[#0D0E11] font-mono font-bold text-sm tracking-wider uppercase border-2 border-[#0D0E11] shadow-hard-black btn-press flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Recruit / Name Teammate</span>
                <span className="text-[#1638F0] font-black">→</span>
              </button>
            </div>

            {/* Micro-Copy Trust Principle */}
            <div className="p-3 bg-neutral-50 border border-neutral-300 font-mono text-xs text-neutral-700 flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#1638F0] shrink-0 mt-0.5" />
              <span>
                <strong>The Core Principle:</strong> Zero unverified mutations. Every action generates an immutable Merkle audit slip with zero-variance balance checks.
              </span>
            </div>

          </div>

          {/* Column 2: Physical Work Slip Mockup & Teammate Dossier (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-[#0D0E11] p-5 sm:p-6 shadow-hard-black relative">
              
              {/* Slip Header Tag */}
              <div className="flex items-center justify-between border-b-2 border-[#0D0E11] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#00C853] animate-ping" />
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-[#0D0E11]">
                    LIVE TEAMMATE DOSSIER
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-neutral-500">
                  SYS: CREWMATE-V4
                </span>
              </div>

              {/* Teammate Bio Card */}
              <div className="bg-neutral-50 border border-[#0D0E11] p-4 mb-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0D0E11] text-[#D8F040] font-mono font-black text-base flex items-center justify-center border border-[#0D0E11]">
                      {teammate.avatarSeed}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-syne font-black text-lg text-[#0D0E11]">
                          {teammate.name}
                        </h3>
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-[#1638F0] text-white">
                          LVL {currentLevelData.id}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-600">
                        {teammate.roleTitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-500 block">RELIABILITY</span>
                    <span className="font-mono font-black text-sm text-[#00C853]">100.0%</span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-neutral-700 font-semibold">Trust Progression to Level {Math.min(5, currentLevelData.id + 1)}</span>
                    <span className="font-bold text-[#1638F0]">{teammate.currentXp} / {teammate.nextLevelXp} XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-200 border border-[#0D0E11] overflow-hidden">
                    <div 
                      className="h-full bg-[#1638F0] transition-all duration-700"
                      style={{ width: `${Math.min(100, (teammate.currentXp / teammate.nextLevelXp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Latest Verified Work Slip Snapshot */}
              <div className="border border-neutral-300 bg-white p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-neutral-500 uppercase">{latestMission.refCode}</span>
                  <span className="inline-flex items-center gap-1 text-[#00C853] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED COMPLETE
                  </span>
                </div>

                <div className="font-grotesk font-bold text-sm text-[#0D0E11] leading-snug">
                  {latestMission.title}
                </div>

                <p className="text-xs font-mono text-neutral-600 line-clamp-2">
                  {latestMission.summary}
                </p>

                <div className="pt-2 border-t border-dashed border-neutral-300 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-500">AUDITED VALUE</span>
                  <span className="font-bold text-[#0D0E11] bg-[#D8F040] px-1.5 py-0.5 border border-[#0D0E11]">
                    {latestMission.auditedValue || 'Zero Variance'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                  <span>EXEC: {latestMission.executionDuration}</span>
                  <span>PROOF: {latestMission.verificationSeal}</span>
                </div>
              </div>

              {/* Bottom Decorative Stamp */}
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>SEAL: MERKLE-ROOT-INVARIANT-CHECK</span>
                <span className="text-[#FF441F] font-bold">FAIL-CLOSED ACTIVE</span>
              </div>

            </div>
          </div>

        </div>

        {/* Live Reliability & Momentum Stat Ribbons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 pt-8 border-t-2 border-[#0D0E11]">
          
          <div className="bg-white border-2 border-[#0D0E11] p-4 shadow-hard-black-sm">
            <div className="font-mono text-[11px] font-bold text-neutral-500 uppercase mb-1">
              Verified Missions
            </div>
            <div className="font-syne font-black text-2xl sm:text-3xl text-[#0D0E11]">
              {teammate.totalMissionsCompleted}
            </div>
            <div className="text-[11px] font-mono text-[#00C853] font-semibold mt-0.5">
              100% Cryptographically Sealed
            </div>
          </div>

          <div className="bg-white border-2 border-[#0D0E11] p-4 shadow-hard-black-sm">
            <div className="font-mono text-[11px] font-bold text-neutral-500 uppercase mb-1">
              Human Rollback Rate
            </div>
            <div className="font-syne font-black text-2xl sm:text-3xl text-[#1638F0]">
              0.0%
            </div>
            <div className="text-[11px] font-mono text-neutral-600 font-semibold mt-0.5">
              Zero manual interventions
            </div>
          </div>

          <div className="bg-white border-2 border-[#0D0E11] p-4 shadow-hard-black-sm">
            <div className="font-mono text-[11px] font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FF441F] fill-[#FF441F]" />
              <span>Reliability Streak</span>
            </div>
            <div className="font-syne font-black text-2xl sm:text-3xl text-[#FF441F]">
              {teammate.streakDays} Days
            </div>
            <div className="text-[11px] font-mono text-neutral-600 font-semibold mt-0.5">
              {teammate.streakShields} streak shields ready
            </div>
          </div>

          <div className="bg-white border-2 border-[#0D0E11] p-4 shadow-hard-black-sm">
            <div className="font-mono text-[11px] font-bold text-neutral-500 uppercase mb-1">
              Executive Time Saved
            </div>
            <div className="font-syne font-black text-2xl sm:text-3xl text-[#0D0E11]">
              {teammate.hoursSaved}h
            </div>
            <div className="text-[11px] font-mono text-[#1638F0] font-semibold mt-0.5">
              Reclaimed this month
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
