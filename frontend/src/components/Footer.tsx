import React from 'react';
import { ShieldCheck, Terminal, Heart } from 'lucide-react';
import { CrewmateLogo } from './CrewmateLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#080A0F] text-white border-t border-[#182030] py-12 px-6 lg:px-12 font-mono">
      <div className="max-w-7xl mx-auto">
        
        {/* Top colophon row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#182030]">
          
          {/* Brand & Mission Statement */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <CrewmateLogo size="lg" variant="white" withTagline={true} />
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D8F040] text-[#0D0E11] self-start mt-1">
                AI CO-FOUNDER
              </span>
            </div>

            <p className="font-body text-xs text-neutral-400 max-w-md leading-relaxed">
              Hire an autonomous AI teammate. Watch it earn your trust through real, verified missions. Made by <strong className="text-white">Krutarth Ashar</strong> and <strong className="text-white">Raghav Arora</strong> for the <strong className="text-[#38BDF8]">Paytm AI Hackathon</strong>.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="w-2 h-2 rounded-none bg-[#00C853]" />
              <span>Kernel Status: Invariant fail-closed active (Zero mutation leakage)</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase text-[#D8F040] tracking-wider">
              Core Architecture
            </div>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button 
                  onClick={() => onNavigate('simulator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  → Live Objective Simulator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('levels')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  → 5-Level Autonomy Ladder
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('mission-log')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  → Verified Mission Docket
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('skill-tree')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  → Modular Skill Tree
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('streaks-quests')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  → Streaks & Approval Quests
                </button>
              </li>
            </ul>
          </div>

          {/* Hackathon Specs */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase text-[#D8F040] tracking-wider">
              Hackathon Submission
            </div>
            <div className="text-xs text-neutral-400 space-y-1.5">
              <div><strong>Hackathon:</strong> <span className="text-white font-medium">Paytm AI Hackathon</span></div>
              <div><strong>Builders:</strong> <span className="text-[#38BDF8] font-medium">Krutarth Ashar & Raghav Arora</span></div>
              <div><strong>Category:</strong> Autonomous AI Teammates</div>
              <div><strong>Trust Mode:</strong> Earned Authority Progression</div>
            </div>
          </div>

        </div>

        {/* Highlighted Hackathon Attribution Banner */}
        <div className="my-8 p-4 sm:p-5 rounded-xl bg-[#0B0E17] border border-[#1E2B48] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(24,66,255,0.12)]">
          <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
            <div className="w-10 h-10 rounded-lg bg-[#1842FF] text-[#D8F040] flex items-center justify-center font-bold text-base shrink-0 border border-[#38BDF8]/40 shadow-[0_0_15px_rgba(24,66,255,0.4)]">
              ⚡
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-[#D8F040] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                Paytm AI Hackathon Project
              </div>
              <div className="text-sm sm:text-base font-semibold text-white mt-0.5">
                Made by <span className="text-[#38BDF8] font-bold">Krutarth Ashar</span> and <span className="text-[#38BDF8] font-bold">Raghav Arora</span> for the <span className="text-[#D8F040] font-bold">Paytm AI Hackathon</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-[#141B2D] border border-[#1E2B48] text-xs font-mono text-neutral-200">
              Krutarth Ashar
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#141B2D] border border-[#1E2B48] text-xs font-mono text-neutral-200">
              Raghav Arora
            </span>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Crewmate Autonomous Runtime.
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <span>Made by <strong className="text-neutral-200">Krutarth Ashar</strong> and <strong className="text-neutral-200">Raghav Arora</strong> for the <strong className="text-[#38BDF8]">Paytm AI Hackathon</strong></span>
          </div>
        </div>

      </div>
    </footer>
  );
};
