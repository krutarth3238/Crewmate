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
              Hire an autonomous AI teammate. Watch it earn your trust through real, verified missions.
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
              <div><strong>Category:</strong> Autonomous AI Teammates</div>
              <div><strong>Trust Mode:</strong> Earned Authority Progression</div>
            </div>
          </div>

        </div>



        {/* Bottom copyright row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Crewmate Autonomous Runtime.
          </div>

        </div>

      </div>
    </footer>
  );
};
