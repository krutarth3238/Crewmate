import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ApprovalQuest, TeammateProfile } from '../types';
import { 
  Flame, 
  Shield, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  UserCheck,
  Check,
  X
} from 'lucide-react';

interface StreaksAndQuestsProps {
  teammate: TeammateProfile;
  quests: ApprovalQuest[];
  onApproveQuest: (questId: string, xpReward: number) => void;
  onRejectQuest: (questId: string) => void;
}

export const StreaksAndQuests: React.FC<StreaksAndQuestsProps> = ({
  teammate,
  quests,
  onApproveQuest,
  onRejectQuest,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const pendingQuests = quests.filter(q => q.status === 'pending');
  const displayQuests = activeTab === 'pending' ? pendingQuests : quests;

  const handleApprove = (quest: ApprovalQuest) => {
    onApproveQuest(quest.id, quest.xpReward);
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00C853', '#1842FF', '#D8F040']
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-12 bg-[#0D111C] text-white space-y-8">
      <div>
        
        {/* Section Header */}
        <div className="border-b border-[#182030] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141B2D] border border-[#1E2B48] text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
              <Flame className="w-3.5 h-3.5 text-[#FF5252]" />
              CHAPTERS 8 & 9 · FEATURES E & F · RELIABILITY & APPROVALS
            </div>
            <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Unbroken Streaks & The Safety Valve.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Turning reliability into something you can see and feel good about. And whenever high-stakes actions occur, Ren stops and asks with one clean prompt: <strong className="text-white">"Approve?"</strong> One tap says yes.
            </p>
          </div>

          <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-xl text-right">
            <span className="text-[11px] font-mono text-neutral-400 block uppercase">
              Pending Human Sign-Offs:
            </span>
            <span className="font-mono font-bold text-base text-[#D8F040] flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#D8F040] animate-pulse" />
              {pendingQuests.length} Quests Awaiting You
            </span>
          </div>
        </div>

        {/* CHAPTER 8: RELIABILITY STREAK POD */}
        <div className="bg-[#0B0E16] border border-[#1E2B48] rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#141B2D] border border-[#1E2B48] rounded-2xl flex items-center justify-center text-[#D8F040] shadow-[0_0_20px_rgba(216,240,64,0.2)]">
                <Flame className="w-8 h-8 text-[#D8F040]" />
              </div>
              <div>
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block">
                  CHAPTER 8 · FEATURE E · RELIABILITY COUNTER
                </span>
                <div className="font-bricolage font-bold text-2xl sm:text-3xl text-white">
                  {teammate.streakDays}-Day Flawless Completion Streak
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00C853]/20 border border-[#00C853]/40 text-[#00C853] text-xs font-mono font-bold rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                100% Zero Rollbacks
              </span>
            </div>
          </div>

          {/* 12 Days Visual Chain */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#080A0F] border border-[#1E2B48] rounded-xl text-center font-mono space-y-1"
              >
                <div className="text-[10px] text-neutral-400">Day {idx + 1}</div>
                <div className="w-2 h-2 rounded-full bg-[#00C853] mx-auto" />
                <div className="text-[9px] text-[#D8F040] font-bold">PASS</div>
              </div>
            ))}
          </div>

          <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00C853]" />
            <span>Target completion rate maintained continuously without a single human revert or manual error.</span>
          </div>
        </div>

        {/* CHAPTER 9: APPROVAL QUESTS ("The One Time It Asks First") */}
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block">
                CHAPTER 9 · FEATURE F · THE ONE TIME IT ASKS FIRST
              </span>
              <h3 className="font-bricolage font-bold text-2xl text-white">
                Human Sign-Off Queue
              </h3>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  activeTab === 'pending'
                    ? 'border-[#1842FF] bg-[#141B2D] text-white font-bold'
                    : 'border-[#1E2B48] bg-[#0B0E16] text-neutral-400 hover:text-white'
                }`}
              >
                Needs Sign-Off ({pendingQuests.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'border-[#1842FF] bg-[#141B2D] text-white font-bold'
                    : 'border-[#1E2B48] bg-[#0B0E16] text-neutral-400 hover:text-white'
                }`}
              >
                All History ({quests.length})
              </button>
            </div>
          </div>

          {/* Quests List */}
          <div className="space-y-4">
            {displayQuests.map((quest) => {
              const isPending = quest.status === 'pending';
              const isApproved = quest.status === 'approved';
              const isRejected = quest.status === 'rejected';

              return (
                <div
                  key={quest.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 ${
                    isPending
                      ? 'bg-[#0B0E17] border-[#1842FF]/80 shadow-[0_0_30px_rgba(24,66,255,0.2)]'
                      : 'bg-[#080A0F] border-[#182030] opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182030] pb-3.5">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-[#141B2D] text-[#38BDF8] border border-[#1E2B48] rounded text-xs font-mono font-bold">
                        {quest.refCode}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {quest.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#141B2D] text-[#D8F040] border border-[#1E2B48] rounded text-xs font-mono font-bold">
                        +{quest.xpReward} XP Reward
                      </span>
                      {isApproved && (
                        <span className="px-2.5 py-0.5 bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/40 rounded text-xs font-mono font-bold">
                          ✓ APPROVED
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/40 rounded text-xs font-mono font-bold">
                          ✕ REJECTED
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bricolage font-bold text-xl text-white">
                      {quest.title}
                    </h4>
                    <p className="text-sm text-neutral-300 leading-relaxed mt-2">
                      {quest.details}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#080A0F] border border-[#182236] rounded-xl flex items-start gap-2.5 text-xs font-mono">
                    <Shield className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#38BDF8] font-bold block mb-0.5">SAFETY REASON FOR HUMAN PAUSE:</span>
                      <span className="text-neutral-300">{quest.reason}</span>
                    </div>
                  </div>

                  {/* 1-Tap Action Buttons */}
                  {isPending && (
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="text-xs font-mono text-neutral-400">
                        Scope: <strong className="text-white">{quest.amountOrScope}</strong>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onRejectQuest(quest.id)}
                          className="px-4 py-2.5 bg-[#080A0F] hover:bg-[#1E1215] text-[#FF5252] border border-[#381818] rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                        >
                          Decline Request
                        </button>

                        <button
                          onClick={() => handleApprove(quest)}
                          className="px-6 py-2.5 bg-[#00C853] hover:bg-[#00b34a] text-[#080A0F] font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(0,200,83,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                          <Check className="w-4 h-4 text-[#080A0F]" />
                          <span>Approve & Dispatch Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {displayQuests.length === 0 && (
              <div className="p-12 text-center text-neutral-400 font-mono text-sm bg-[#080A0F] border border-[#1E2B48] rounded-2xl">
                No approval quests in this queue. Everything within standard safety bounds is running smoothly!
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
