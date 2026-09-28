import React from 'react';
import { TeammateProfile, AutonomyLevel } from '../types';
import { ShieldCheck, Flame, UserPlus, Sparkles, Sliders } from 'lucide-react';
import { CrewmateLogo } from './CrewmateLogo';

interface HeaderProps {
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  onOpenRecruit: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  teammate,
  currentLevelData,
  onOpenRecruit,
  onNavigate,
  activeSection,
}) => {
  const xpPercentage = Math.min(
    100,
    Math.round((teammate.currentXp / teammate.nextLevelXp) * 100)
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#0D0E11] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark & Core Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('hero')}
            className="text-left group flex items-center gap-3 cursor-pointer focus:outline-none"
          >
            <CrewmateLogo size="md" withTagline={false} />
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#D8F040] text-[#0D0E11] border border-[#0D0E11] uppercase tracking-wider">
              AI CO-FOUNDER
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {[
            { id: 'simulator', label: 'Live Simulator', icon: Sparkles },
            { id: 'levels', label: 'Trust Levels', icon: ShieldCheck },
            { id: 'mission-log', label: 'Mission Log', count: teammate.totalMissionsCompleted },
            { id: 'skill-tree', label: 'Skill Tree', count: teammate.activeSkills.length },
            { id: 'streaks-quests', label: 'Streaks & Quests', icon: Flame },
          ].map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 text-xs font-mono font-bold tracking-tight uppercase transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isActive
                    ? 'bg-[#0D0E11] text-white border-[#0D0E11] shadow-hard-black-sm'
                    : 'bg-transparent text-[#0D0E11] border-transparent hover:border-[#0D0E11] hover:bg-neutral-100'
                }`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                {item.label}
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1 py-0.2 ${isActive ? 'bg-[#1638F0] text-white' : 'bg-neutral-200 text-[#0D0E11]'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Active Teammate Status Pill & Recruit CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Teammate Status Widget */}
          <div className="hidden sm:flex items-center gap-2.5 bg-white border-2 border-[#0D0E11] px-3 py-1 shadow-hard-black-sm">
            <div className="w-6 h-6 bg-[#1638F0] text-white flex items-center justify-center font-mono font-bold text-xs">
              {teammate.avatarSeed}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-syne font-bold text-xs text-[#0D0E11]">
                  {teammate.name}
                </span>
                <span className="text-[10px] font-mono px-1 bg-neutral-100 border border-neutral-300 font-bold">
                  LVL {currentLevelData.id} · {currentLevelData.name.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 h-1.5 bg-neutral-200 overflow-hidden">
                  <div 
                    className="h-full bg-[#1638F0] transition-all duration-500"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-neutral-500 font-semibold">
                  {teammate.currentXp}/{teammate.nextLevelXp} XP
                </span>
              </div>
            </div>
            
            {/* Streak Indicator */}
            <div className="pl-2 border-l border-neutral-300 flex items-center gap-1 text-[#FF441F] font-mono font-black text-xs">
              <Flame className="w-3.5 h-3.5 fill-[#FF441F]" />
              <span>{teammate.streakDays}D</span>
            </div>
          </div>

          {/* Recruit / Configure Teammate Button */}
          <button
            onClick={onOpenRecruit}
            className="px-3.5 py-1.5 bg-[#D8F040] hover:bg-[#cbe435] text-[#0D0E11] font-mono font-black text-xs uppercase tracking-wider border-2 border-[#0D0E11] shadow-hard-black-sm btn-press flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recruit / Configure</span>
            <span className="sm:hidden">Setup</span>
          </button>
        </div>

      </div>
    </header>
  );
};
