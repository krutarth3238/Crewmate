import React from 'react';
import { TeammateProfile, RelationshipMilestone } from '../types';
import { RELATIONSHIP_TIMELINE } from '../data/initialData';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  CheckCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

interface CollaborationRadarProps {
  teammate: TeammateProfile;
}

export const CollaborationRadar: React.FC<CollaborationRadarProps> = ({ teammate }) => {
  return (
    <div className="p-6 sm:p-10 lg:p-12 bg-[#0D111C] text-white space-y-8">
      <div>
        
        {/* Section Header */}
        <div className="border-b border-[#182030] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141B2D] border border-[#1E2B48] text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
              <Users className="w-3.5 h-3.5 text-[#D8F040]" />
              CHAPTERS 10 & 11 · FEATURES I & J · MILESTONES & TEAMWORK
            </div>
            <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Looking Back & The Real Team.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Framed as teamwork, not a replacement scoreboard. See how Ren takes over repetitive supplier price watching and POS balancing so Meera and her bakery team focus on craft and customers.
            </p>
          </div>

          <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-xl text-right">
            <span className="text-[11px] font-mono text-neutral-400 block uppercase">
              Weekly Autonomous Split:
            </span>
            <span className="font-mono font-bold text-base text-[#00C853] flex items-center justify-end gap-1.5 mt-0.5">
              74% Routine Automated · 26% High-Value Human
            </span>
          </div>
        </div>

        {/* CHAPTER 11: SMALL TEAM COLLABORATION VIEW */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block">
              CHAPTER 11 · FEATURE J · TEAMWORK CO-EXISTENCE (NO SCOREBOARDS)
            </span>
            <h3 className="font-bricolage font-bold text-2xl text-white">
              Who Handled What This Week
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Teammate 1: Ren (AI) */}
            <div className="p-6 bg-[#0B0E16] border border-[#1842FF]/70 rounded-2xl shadow-[0_0_20px_rgba(24,66,255,0.2)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1842FF] text-[#D8F040] font-bold text-base flex items-center justify-center border border-[#38BDF8]/40">
                  {teammate.visualMark || '⚡'}
                </div>
                <div>
                  <div className="font-bricolage font-bold text-lg text-white">
                    {teammate.name} (AI Teammate)
                  </div>
                  <div className="text-xs font-mono text-[#38BDF8]">
                    Background Operations
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-neutral-300 border-t border-[#182030] pt-3">
                <div className="flex items-center justify-between">
                  <span>Tasks Completed:</span>
                  <strong className="text-white">142 Missions</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time Saved:</span>
                  <strong className="text-[#D8F040]">{teammate.hoursSaved} Hours / Wk</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accuracy:</span>
                  <strong className="text-[#00C853]">100% (0 Rollbacks)</strong>
                </div>
              </div>

              <div className="p-3 bg-[#080A0F] border border-[#182236] rounded-xl text-xs text-neutral-300">
                <span className="text-[#D8F040] font-mono block mb-1">HANDLED ROUTINE:</span>
                Supplier butter price alerts, daily POS reconciliation, rye flour buffer checks, customer reply drafts.
              </div>
            </div>

            {/* Teammate 2: Meera (Owner) */}
            <div className="p-6 bg-[#0B0E16] border border-[#1E2B48] rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#141B2D] text-[#38BDF8] font-bold text-base flex items-center justify-center border border-[#1E2B48]">
                  M
                </div>
                <div>
                  <div className="font-bricolage font-bold text-lg text-white">
                    Meera (Bakery Owner)
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    Artisan Baker & Founder
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-neutral-300 border-t border-[#182030] pt-3">
                <div className="flex items-center justify-between">
                  <span>Focus Area:</span>
                  <strong className="text-white">Product & Growth</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Safety Authorizations:</span>
                  <strong className="text-[#D8F040]">2 Quests Approved</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mornings Reclaimed:</span>
                  <strong className="text-[#00C853]">100% Paperwork Free</strong>
                </div>
              </div>

              <div className="p-3 bg-[#080A0F] border border-[#182236] rounded-xl text-xs text-neutral-300">
                <span className="text-[#38BDF8] font-mono block mb-1">HANDLED HIGH-LEVERAGE:</span>
                Artisan sourdough recipes, wholesale catering agreements, approving 15% comeback customer offers.
              </div>
            </div>

            {/* Teammate 3: Sarah (Baker / Staff) */}
            <div className="p-6 bg-[#0B0E16] border border-[#1E2B48] rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#141B2D] text-[#00C853] font-bold text-base flex items-center justify-center border border-[#1E2B48]">
                  S
                </div>
                <div>
                  <div className="font-bricolage font-bold text-lg text-white">
                    Sarah (Assistant Baker)
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    Kitchen Prep & Floor
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-neutral-300 border-t border-[#182030] pt-3">
                <div className="flex items-center justify-between">
                  <span>Focus Area:</span>
                  <strong className="text-white">Kitchen Operations</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Prep Disruption:</span>
                  <strong className="text-[#00C853]">0 Stock-Outs</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Morning Shift:</span>
                  <strong className="text-white">On Schedule (6:00 AM)</strong>
                </div>
              </div>

              <div className="p-3 bg-[#080A0F] border border-[#182236] rounded-xl text-xs text-neutral-300">
                <span className="text-[#00C853] font-mono block mb-1">HANDLED CRAFT:</span>
                Baking croissants, pastry dough folding, in-store customer smiles, morning counter service.
              </div>
            </div>

          </div>
        </div>

        {/* CHAPTER 10: PARTNERSHIP TIMELINE ("Looking Back") */}
        <div className="space-y-4 pt-4 border-t border-[#182030]">
          <div>
            <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block">
              CHAPTER 10 · FEATURE I · LOOKING BACK TIMELINE
            </span>
            <h3 className="font-bricolage font-bold text-2xl text-white">
              The Journey from Skeptical Homepage Click to Trusted Partner
            </h3>
            <p className="text-neutral-300 text-sm mt-1">
              "It's not functional — it doesn't do anything — but it's the moment Meera realizes how far this has come from a skeptical ten-second demo on a homepage."
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {RELATIONSHIP_TIMELINE.map((m, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#0B0E16] border border-[#1E2B48] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="px-3 py-1 bg-[#141B2D] border border-[#1E2B48] text-[#D8F040] text-xs font-mono font-bold rounded-lg shrink-0">
                    {m.day}
                  </div>
                  <div>
                    <h4 className="font-bricolage font-bold text-lg text-white">
                      {m.title}
                    </h4>
                    <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-[#080A0F] border border-[#182236] text-[#38BDF8] font-mono text-xs font-bold rounded-lg mb-1">
                    {m.levelBadge}
                  </span>
                  <div className="text-xs font-mono text-[#00C853]">
                    {m.highlightStat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hackathon Attribution Card */}
        <div className="pt-6 border-t border-[#182030]">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1626] to-[#0A0D15] border border-[#1E2B48] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#1842FF] text-[#D8F040] flex items-center justify-center font-bold text-sm border border-[#38BDF8]/40 shadow-sm">
                ⚡
              </span>
              <div>
                <div className="text-xs font-mono font-bold text-[#D8F040] uppercase tracking-wider">
                  Paytm AI Hackathon
                </div>
                <div className="text-sm font-semibold text-white">
                  Made by <strong className="text-[#38BDF8]">Krutarth Ashar</strong> and <strong className="text-[#38BDF8]">Raghav Arora</strong> for the <span className="text-[#D8F040]">Paytm AI Hackathon</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
              <span className="px-2.5 py-1 bg-[#141B2D] border border-[#1E2B48] rounded-md">Krutarth Ashar</span>
              <span className="px-2.5 py-1 bg-[#141B2D] border border-[#1E2B48] rounded-md">Raghav Arora</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
