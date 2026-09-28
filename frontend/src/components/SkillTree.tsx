import React, { useState } from 'react';
import { SkillItem, TeammateProfile, AutonomyLevel } from '../types';
import { 
  Zap, 
  Check, 
  Lock, 
  Play, 
  SlidersHorizontal, 
  Layers, 
  ArrowRight, 
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface SkillTreeProps {
  skills: SkillItem[];
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  onToggleSkill: (skillId: string) => void;
  onRunSkillInSimulator: (objective: string) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  skills,
  teammate,
  currentLevelData,
  onToggleSkill,
  onRunSkillInSimulator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSkills = skills.filter(
    (s) => selectedCategory === 'all' || s.category === selectedCategory
  );

  return (
    <div className="p-6 sm:p-10 lg:p-12 bg-[#0D111C] text-white space-y-8">
      <div>
        
        {/* Section Header */}
        <div className="border-b border-[#182030] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141B2D] border border-[#1E2B48] text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
              <Layers className="w-3.5 h-3.5 text-[#D8F040]" />
              CHAPTER 7 · FEATURE D · SIMPLE SKILL TREE
            </div>
            <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Turn On New Abilities with One Tap.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              No configuration wizards or API tokens. Each skill is just a toggle with a plain sentence explaining what it does. Equipping a skill is the entire setup.
            </p>
          </div>

          <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-xl text-right">
            <span className="text-[11px] font-mono text-neutral-400 block uppercase">
              Equipped Abilities:
            </span>
            <span className="font-mono font-bold text-base text-[#D8F040] flex items-center justify-end gap-1.5 mt-0.5">
              <Zap className="w-4 h-4 text-[#D8F040]" />
              {teammate.activeSkills.length} of {skills.length} Active
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs mb-8">
          {[
            { id: 'all', label: 'All Abilities' },
            { id: 'inventory', label: 'Suppliers & Restocking' },
            { id: 'sales', label: 'Sales & Revenue Analysis' },
            { id: 'support', label: 'Customer Relations' },
            { id: 'finance', label: 'POS & Reconciliation' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'border-[#1842FF] bg-[#141B2D] text-white font-bold shadow-[0_0_10px_rgba(24,66,255,0.3)]'
                  : 'border-[#1E2B48] bg-[#0B0E16] text-neutral-400 hover:text-white hover:bg-[#101626]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSkills.map((skill) => {
            const isEquipped = teammate.activeSkills.includes(skill.id);
            const isClearanceMet = teammate.currentLevel >= skill.levelRequired;

            return (
              <div
                key={skill.id}
                className={`p-6 rounded-2xl border transition-all space-y-4 relative flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-[#0B0E17] border-[#1842FF]/70 shadow-[0_0_25px_rgba(24,66,255,0.15)]'
                    : 'bg-[#080A0F] border-[#182030] hover:border-[#1E2B48]'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Skill Card Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isClearanceMet
                          ? 'bg-[#141B2D] text-[#38BDF8] border border-[#1E2B48]'
                          : 'bg-[#181018] text-[#FF5252] border border-[#381818]'
                      }`}>
                        Requires Level {skill.levelRequired}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {skill.categoryLabel}
                      </span>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => onToggleSkill(skill.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEquipped ? 'bg-[#D8F040]' : 'bg-[#1E2B48]'
                      }`}
                      title={isEquipped ? 'Click to unequip' : 'Click to equip'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#080A0F] shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isEquipped ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Plain Sentence Explanation */}
                  <div>
                    <h3 className="font-bricolage font-bold text-lg text-white">
                      {skill.title}
                    </h3>
                    <p className="text-sm text-neutral-300 leading-relaxed mt-1">
                      {skill.description}
                    </p>
                  </div>

                  {/* Plain How It Works */}
                  <div className="p-3 bg-[#080A0F] border border-[#182236] rounded-xl text-xs font-mono text-neutral-300">
                    <span className="text-[#38BDF8] block mb-1">WHAT REN DOES:</span>
                    <span>{skill.inActionSummary}</span>
                  </div>

                </div>

                {/* Card Action Bar */}
                <div className="pt-3 border-t border-[#182030] flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {skill.supportedTools.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#121826] border border-[#1C263A] rounded text-[10px] font-mono text-neutral-300">
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onRunSkillInSimulator(skill.sampleObjective)}
                    className="px-3.5 py-1.5 bg-[#141B2D] hover:bg-[#1842FF] text-[#D8F040] hover:text-white border border-[#1E2B48] hover:border-[#1842FF] rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3" />
                    <span>Test In Simulator</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
