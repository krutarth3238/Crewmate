import React, { useState } from 'react';
import { MissionDocket } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Filter, 
  Layers, 
  ShieldCheck, 
  Search,
  BookOpen,
  ArrowRight,
  Zap,
  Sparkles
} from 'lucide-react';

interface MissionLogProps {
  missions: MissionDocket[];
  onInspectMission: (mission: MissionDocket) => void;
}

export const MissionLog: React.FC<MissionLogProps> = ({
  missions,
  onInspectMission,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMissions = missions.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.refCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-10 lg:p-12 bg-[#0D111C] text-white space-y-8">
      <div>
        
        {/* Section Header */}
        <div className="border-b border-[#182030] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141B2D] border border-[#1E2B48] text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#D8F040]" />
              CHAPTER 5 · FEATURE C · THE MISSION DIARY
            </div>
            <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Every Little Thing It Does, Written Down.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Reads like a diary of a new employee's first week. What Ren looked at, what it found, and how confident it is — proving real work was completed with mathematical certainty.
            </p>
          </div>

          <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-xl text-right">
            <span className="text-[11px] font-mono text-neutral-400 block uppercase">
              Audited Diary Entries:
            </span>
            <span className="font-mono font-bold text-base text-[#00C853] flex items-center justify-end gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
              {missions.length} Tasks Sealed (0 Rollbacks)
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {[
              { id: 'all', label: 'All Diary Entries' },
              { id: 'inventory', label: 'Suppliers & Stock' },
              { id: 'sales', label: 'Sales & Footfall' },
              { id: 'finance', label: 'POS & Invoicing' },
              { id: 'support', label: 'Customer Relations' }
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

          {/* Search Input */}
          <div className="relative sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diary dockets..."
              className="w-full bg-[#080A0F] border border-[#1E2B48] focus:border-[#1842FF] focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 font-mono"
            />
          </div>

        </div>

        {/* Diary Docket Cards Grid */}
        <div className="space-y-4">
          {filteredMissions.map((m) => (
            <div
              key={m.id}
              onClick={() => onInspectMission(m)}
              className="p-5 sm:p-6 bg-[#0B0E16] border border-[#1E2B48] hover:border-[#1842FF]/70 rounded-2xl shadow-lg transition-all group cursor-pointer space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182030] pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-[#141B2D] text-[#38BDF8] border border-[#1E2B48] rounded text-xs font-mono font-bold">
                    {m.refCode}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {m.timestamp}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00C853]/20 border border-[#00C853]/40 text-[#00C853] text-[11px] font-mono font-bold rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    {m.confidenceScore}% CONFIDENT
                  </span>
                  {m.auditedValue && (
                    <span className="px-2.5 py-0.5 bg-[#141B2D] text-[#D8F040] border border-[#1E2B48] text-[11px] font-mono font-bold rounded">
                      {m.auditedValue}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bricolage font-bold text-lg sm:text-xl text-white group-hover:text-[#38BDF8] transition-colors">
                  {m.title}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed mt-1.5">
                  {m.summary}
                </p>
              </div>

              {/* What It Looked At vs Finding Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#080A0F] border border-[#182236] rounded-xl">
                  <span className="text-neutral-400 block mb-1">WHAT REN LOOKED AT:</span>
                  <span className="text-neutral-200">{m.beforeState}</span>
                </div>

                <div className="p-3 bg-[#080A0F] border border-[#182236] rounded-xl">
                  <span className="text-[#00C853] block mb-1">AUDITED OUTCOME:</span>
                  <span className="text-neutral-200">{m.afterState}</span>
                </div>
              </div>

              {/* Bottom Card Metas */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-mono text-neutral-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Systems Checked:</span>
                  {m.systemsTouched.map((sys, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#121826] border border-[#1C263A] rounded text-[10px] text-neutral-300">
                      {sys}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[#38BDF8] group-hover:text-[#D8F040] transition-colors">
                  <span>Inspect Proof Seal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          ))}

          {filteredMissions.length === 0 && (
            <div className="p-12 text-center text-neutral-400 font-mono text-sm bg-[#080A0F] border border-[#1E2B48] rounded-2xl">
              No diary dockets found matching the filter criteria.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
