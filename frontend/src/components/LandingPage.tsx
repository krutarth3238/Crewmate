import React, { useState } from 'react';
import { TeammateProfile, AutonomyLevel, MissionDocket } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Zap,
  Lock,
  Cpu,
  LogIn,
  Search,
  Check,
  ChevronRight,
  ShieldAlert,
  Clock,
  Flame,
  UserCheck
} from 'lucide-react';
import { Footer } from './Footer';
import { CrewmateLogo } from './CrewmateLogo';
import { HeroVisual } from './HeroVisual';

interface LandingPageProps {
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  latestMission: MissionDocket;
  onEnterConsole: () => void;
  onGoToLogin: () => void;
  onOpenHireModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  teammate,
  currentLevelData,
  latestMission,
  onEnterConsole,
  onGoToLogin,
  onOpenHireModal,
}) => {
  // CHAPTER 1 (FEATURE G) INTERACTIVE STATE:
  const [userInput, setUserInput] = useState('Figure out why my weekend sales dropped');
  const [isThinking, setIsThinking] = useState(false);
  const [planSteps, setPlanSteps] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [findingResult, setFindingResult] = useState<{
    title: string;
    detail: string;
    recommendation: string;
    confidence: string;
  } | null>(null);

  // Clickable presets for Chapter 1
  const quickPrompts = [
    {
      label: '🥐 Weekend sales drop',
      query: 'Figure out why my weekend sales dropped',
      plan: [
        "Checking last weekend's POS orders & hourly revenue timestamps...",
        "Cross-referencing supplier ingredient deliveries & delivery van GPS logs...",
        "Synthesizing anomaly pattern against 30-day baseline..."
      ],
      finding: {
        title: 'Sourdough ingredient delivery arrived 3 hours late Saturday morning',
        detail: 'Delivery van arrived at 10:15 AM instead of 7:00 AM; 18 pre-ordered catering baskets were delayed or cancelled, accounting for 74% of the weekend sales dip ($740 lost). Counter walk-in footfall was actually +8% higher.',
        recommendation: 'Auto-flag supplier van delays past 6:00 AM so morning bake schedule auto-calibrates.',
        confidence: '99.8%'
      }
    },
    {
      label: '🔍 Supplier price hike',
      query: 'Flag which supplier prices changed on this week\'s invoices',
      plan: [
        "Scanning recent delivery receipts from Valley Dairy & Stone Mill...",
        "Comparing invoice line-item rates to contract purchase order terms...",
        "Calculating batch margin compression on butter & flour SKUs..."
      ],
      finding: {
        title: 'Valley Dairy increased organic butter +14% ($4.80 → $5.47/kg)',
        detail: 'Quiet price hike on Tuesday delivery invoice #8841 without notification. Adds $80.40 unbudgeted cost per 120kg batch. Margin compressed by 2.4%.',
        recommendation: 'Stage supplier dispute credit memo referencing master contract rate.',
        confidence: '100.0%'
      }
    },
    {
      label: '🌾 Flour restock buffer',
      query: 'Check flour and butter inventory levels before tomorrow\'s 6:00 AM bake prep',
      plan: [
        "Reading real-time scale sensors & recent batch production records...",
        "Calculating 7-day consumption velocity for stoneground rye & baker wheat...",
        "Checking supplier lead times and minimum batch reorder triggers..."
      ],
      finding: {
        title: 'Organic rye flour reached 2.4 days safety buffer threshold',
        detail: 'Current stock is 65kg with expected consumption of 28kg/day before Friday rush. High risk of stock-out by Thursday evening bake.',
        recommendation: 'Stage standard replenishment PO #108 for Stone Mill Artisans ready for 1-tap dispatch.',
        confidence: '100.0%'
      }
    }
  ];

  const handleRunThinking = (queryToRun?: string) => {
    const q = queryToRun || userInput;
    if (!q.trim() || isThinking) return;

    setUserInput(q);
    setIsThinking(true);
    setFindingResult(null);
    setPlanSteps([]);
    setActiveStepIndex(0);

    // Find preset or build dynamic plan
    const matched = quickPrompts.find(p => p.query.toLowerCase() === q.toLowerCase()) || quickPrompts[0];

    // Step 1
    setTimeout(() => {
      setPlanSteps([matched.plan[0]]);
      setActiveStepIndex(0);
    }, 400);

    // Step 2
    setTimeout(() => {
      setPlanSteps([matched.plan[0], matched.plan[1]]);
      setActiveStepIndex(1);
    }, 1800);

    // Step 3
    setTimeout(() => {
      setPlanSteps([matched.plan[0], matched.plan[1], matched.plan[2]]);
      setActiveStepIndex(2);
    }, 3200);

    // Show finding card
    setTimeout(() => {
      setIsThinking(false);
      setActiveStepIndex(3);
      setFindingResult(matched.finding);
    }, 4600);
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-body antialiased flex flex-col selection:bg-[#D8F040] selection:text-[#080A0F]">
      
      {/* 0. Top Hackathon Banner */}
      <div className="bg-[#0B0F19] border-b border-[#182030] px-4 py-2 text-xs font-mono text-neutral-300 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141B2D] border border-[#1E2B48] text-[#D8F040] font-bold text-[11px] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
          Paytm AI Hackathon
        </span>
        <span className="text-neutral-500 hidden sm:inline">·</span>
        <span className="text-neutral-300">
          Made by <strong className="text-white font-semibold">Krutarth Ashar</strong> and <strong className="text-white font-semibold">Raghav Arora</strong> for the <strong className="text-[#38BDF8] font-semibold">Paytm AI Hackathon</strong>
        </span>
      </div>

      {/* 1. Header (Obsidian Palette) */}
      <header className="sticky top-0 z-40 bg-[#080A0F]/90 backdrop-blur-md border-b border-[#182030] px-6 lg:px-12 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <CrewmateLogo size="md" variant="white" withTagline={false} />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold bg-[#141B2D] text-[#38BDF8] rounded border border-[#1E2B48] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8F040] animate-pulse" />
              AI OPERATIONAL TEAMMATE
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#0E131F] border border-[#1C2538] rounded text-xs text-neutral-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
              <span>LEVEL 1 · SHADOW MODE ACTIVE</span>
            </div>

            {onOpenHireModal && (
              <button
                onClick={onOpenHireModal}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F1422] hover:bg-[#151D30] text-[#D8F040] border border-[#D8F040]/40 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Hire {teammate.name}</span>
              </button>
            )}

            <button
              onClick={onGoToLogin}
              className="px-4 py-2 bg-[#1842FF] hover:bg-[#2855FF] text-white font-medium text-xs rounded-lg shadow-[0_0_20px_rgba(24,66,255,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Launch Console</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        
        <section className="relative pt-4 sm:pt-6 lg:pt-8 pb-14 sm:pb-16 lg:pb-20 px-6 lg:px-12 border-b border-[#182030] bg-gradient-to-b from-[#080A0F] via-[#0B0E17] to-[#080A0F]">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Eyebrow & Top Headline */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 bg-[#0F1626] border border-[#1E2B48] rounded-full text-xs text-[#38BDF8] font-medium shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#D8F040] animate-pulse" />
                <span className="font-mono text-[11px] text-[#D8F040] font-bold uppercase tracking-wider">PAYTM AI HACKATHON</span>
                <span className="text-neutral-600 hidden sm:inline" aria-hidden="true">·</span>
                <span className="text-neutral-300">Made by <strong className="text-white font-semibold">Krutarth Ashar</strong> &amp; <strong className="text-white font-semibold">Raghav Arora</strong></span>
              </div>

              <h1 className="font-bricolage text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-white tracking-[-0.03em] leading-[1.12]">
                Hire an AI teammate that earns your trust,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#1842FF] to-[#D8F040]">
                  one mission at a time.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
                No dashboards to configure. No chatbot giving vague advice you have to do yourself. <strong className="text-white">Ren</strong> starts in <strong className="text-[#38BDF8]">Shadow Mode</strong>, observes your business, and unlocks real operational clearances only as verified proofs accumulate.
              </p>
            </div>

            {/* CHAPTER 1 (FEATURE G) — THE PLAIN BOX: "Tell it what you need" */}
            <div className="bg-[#0B0E17] border border-[#1E2B48] rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(24,66,255,0.15)] relative overflow-hidden">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D8F040] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-[#D8F040] uppercase tracking-wider">
                      CHAPTER 1 · FEATURE G · INSTANT LIVE PREVIEW
                    </span>
                  </div>
                  <h2 className="font-bricolage font-bold text-xl sm:text-2xl text-white mt-1">
                    Tell it what you need. Watch it think in 10 seconds.
                  </h2>
                </div>

                <div className="text-xs font-mono text-neutral-400 bg-[#101726] border border-[#1B2538] px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />
                  <span>Zero Signup · Zero API Keys Needed</span>
                </div>
              </div>

              {/* The Input Box */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunThinking()}
                      placeholder="e.g. Figure out why my weekend sales dropped..."
                      className="w-full bg-[#080A0F] border border-[#1E2B48] focus:border-[#1842FF] focus:outline-none rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-neutral-500 font-medium text-sm sm:text-base transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => handleRunThinking()}
                    disabled={isThinking}
                    className="px-6 py-3.5 bg-[#1842FF] hover:bg-[#2855FF] disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-[0_0_20px_rgba(24,66,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] shrink-0"
                  >
                    {isThinking ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#D8F040]" />
                        <span>Watch It Think</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Presets Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-mono text-neutral-400 mr-1">Try example:</span>
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRunThinking(p.query)}
                      className="px-3 py-1 bg-[#101626] hover:bg-[#18233A] border border-[#1E2B48] hover:border-[#38BDF8]/60 text-xs text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Step Plan Assembly (Watched In Real Time!) */}
                {(isThinking || planSteps.length > 0) && (
                  <div className="pt-4 border-t border-[#182030] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">PLAN FORMULATION SEQUENCE</span>
                      <span className="text-[#38BDF8]">
                        {activeStepIndex === 3 ? 'Analysis Complete' : `Phase ${activeStepIndex + 1} of 3`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {planSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-[#080A0F] border border-[#182236] rounded-xl font-mono text-xs sm:text-sm text-neutral-200 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#1842FF]/30 border border-[#1842FF] text-[#D8F040] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* THE RESULTING FINDING CARD */}
                {findingResult && (
                  <div className="mt-4 p-5 sm:p-6 bg-[#0E1524] border-2 border-[#1842FF]/80 rounded-xl shadow-[0_0_30px_rgba(24,66,255,0.25)] space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#00C853]/20 border border-[#00C853] text-[#00C853] text-xs font-mono font-bold rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        FINDING DISCOVERED · {findingResult.confidence} CONFIDENCE
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Observed without touching live systems
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bricolage font-bold text-lg sm:text-xl text-white">
                        {findingResult.title}
                      </h4>
                      <p className="text-sm text-neutral-300 leading-relaxed mt-1">
                        {findingResult.detail}
                      </p>
                    </div>

                    <div className="p-3 bg-[#080A0F] border border-[#182236] rounded-lg text-xs font-mono text-[#D8F040] flex items-start gap-2">
                      <Zap className="w-4 h-4 text-[#D8F040] shrink-0 mt-0.5" />
                      <div>
                        <strong>Recommended Next Step:</strong> {findingResult.recommendation}
                      </div>
                    </div>

                    {/* ACTION BUTTON: HIRE REN (CHAPTER 2 / 3) */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={onOpenHireModal || onEnterConsole}
                        className="px-6 py-3 bg-[#D8F040] hover:bg-[#cbf026] text-[#080A0F] font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(216,240,64,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                      >
                        <UserCheck className="w-4 h-4 text-[#080A0F]" />
                        <span>Hire {teammate.name} to Handle This (Zero Risk)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={onEnterConsole}
                        className="px-5 py-3 bg-[#141B2D] hover:bg-[#1A2338] text-white border border-[#1E2B48] font-medium text-xs rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Inspect Level 1 Shadow Permissions →
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Two-Column Visual Grid: Trust Ladder Visual + Story Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
              
              {/* Left Column: Quick Story Context (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider block">
                  CHAPTER 4 · START AT THE BOTTOM (FEATURE B)
                </span>
                
                <h3 className="font-bricolage text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Ren starts at Level 1 — Shadow. And you can watch every permission unlock.
                </h3>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                  The real fear every small business owner has about autonomous AI is: <em>what if it breaks something or sends an email I didn't approve?</em>
                </p>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                  With Crewmate, the answer isn't "trust us" — it's <strong className="text-white">mathematical inability</strong>. At Level 1, Ren has zero write permissions. It can monitor invoices and flag supplier increases, but it literally cannot send an email or touch bank funds.
                </p>

                {/* Level Progress Bar Mockup */}
                <div className="p-4 bg-[#0B0E16] border border-[#1B2335] rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-white">Current Clearance: Level 1 (Shadow)</span>
                    <span className="text-[#38BDF8]">14 / 25 Tasks to Assistant</span>
                  </div>
                  <div className="w-full h-2 bg-[#141B2D] rounded-full overflow-hidden">
                    <div className="w-[56%] h-full bg-[#38BDF8]" />
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">
                    Next unlock: Assistant Level (Drafts customer replies & replenishment orders requiring human 1-tap confirmation).
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={onEnterConsole}
                    className="px-6 py-2.5 bg-[#1842FF] hover:bg-[#2855FF] text-white text-xs font-semibold rounded-lg shadow-[0_0_20px_rgba(24,66,255,0.35)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Open Autonomy Ladder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Hero Visual Pod (5 cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <HeroVisual
                  teammate={teammate}
                  currentLevelData={currentLevelData}
                  latestMission={latestMission}
                  onEnterConsole={onEnterConsole}
                />
              </div>

            </div>

            {/* Teammate Snapshot Banner: Midnight Obsidian Pod */}
            <div className="bg-[#0B0E16] border border-[#1B2335] rounded-xl p-6 lg:p-7 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-[#1842FF] text-[#D8F040] font-mono font-bold text-xl rounded-lg flex items-center justify-center border border-[#38BDF8]/40 shrink-0 shadow-md">
                  {teammate.visualMark || teammate.avatarSeed}
                </div>
                <div>
                  <div className="font-bricolage font-bold text-base text-white">
                    {teammate.name}
                  </div>
                  <div className="text-xs text-neutral-400 font-mono">
                    {teammate.businessType}
                  </div>
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-[#1B2335] md:pl-6">
                <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                  CURRENT CLEARANCE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#141B2D] text-[#38BDF8] border border-[#1E2B48] rounded text-xs font-mono font-bold">
                  Level {currentLevelData.id} · {currentLevelData.name}
                </span>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-[#1B2335] md:pl-6">
                <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                  PROVEN RELIABILITY
                </span>
                <span className="text-base font-mono font-bold text-[#00C853] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
                  {teammate.accuracyRate}% Zero Rollbacks
                </span>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-[#1B2335] md:pl-6">
                <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                  LEVERAGE GENERATED
                </span>
                <span className="text-base font-mono font-bold text-[#D8F040]">
                  {teammate.hoursSaved} hrs saved / week
                </span>
              </div>

            </div>

          </div>
        </section>

        {/* 3. Core Architecture Pillars Section */}
        <section className="py-16 lg:py-20 px-6 lg:px-12 bg-[#0A0D15] border-b border-[#182030]">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#101626] border border-[#1E2B48] rounded-full text-xs font-mono font-bold text-[#D8F040] shadow-sm uppercase tracking-wider">
                <span>THE MACHINE UNDERNEATH</span>
              </div>
              <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
                A serious permission system wearing a legible skin.
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Nothing here is cosmetic decoration. Every gamified element stands in for something real: the level is the permission boundary, the mission log is the audit trail, and the quest is the human safety valve.
              </p>
            </div>

            {/* 3 High-Tech Obsidian Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <div className="bg-[#0D111C] border border-[#1B2438] hover:border-[#1842FF]/60 rounded-xl p-6 sm:p-7 shadow-lg space-y-4 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-[#141B2D] border border-[#1E2B48] group-hover:border-[#1842FF] rounded-lg flex items-center justify-center text-[#38BDF8] group-hover:text-[#D8F040] transition-colors">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#38BDF8]/70">01</span>
                </div>
                <h3 className="font-bricolage font-bold text-xl text-white">
                  Chapter 5: Diary Mission Log
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Every little thing Ren observes gets written down like a diary of a new employee's first week — what it looked at, what it found, and how confident it is.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-2.5 py-1 bg-[#121726] border border-[#1E2942] rounded text-xs font-mono font-semibold text-[#38BDF8]">
                    Proof of Real Work
                  </span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-[#0D111C] border border-[#1B2438] hover:border-[#1842FF]/60 rounded-xl p-6 sm:p-7 shadow-lg space-y-4 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-[#141B2D] border border-[#1E2B48] group-hover:border-[#1842FF] rounded-lg flex items-center justify-center text-[#38BDF8] group-hover:text-[#D8F040] transition-colors">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#38BDF8]/70">02</span>
                </div>
                <h3 className="font-bricolage font-bold text-xl text-white">
                  Chapter 7: Simple Skill Tree
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Meera flips on restocking reminders or supplier price monitoring with a single toggle. No API configs or code. Equipping a skill is the setup.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-2.5 py-1 bg-[#121726] border border-[#1E2942] rounded text-xs font-mono font-semibold text-[#D8F040]">
                    1-Tap Capability Toggles
                  </span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-[#0D111C] border border-[#1B2438] hover:border-[#1842FF]/60 rounded-xl p-6 sm:p-7 shadow-lg space-y-4 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-[#141B2D] border border-[#1E2B48] group-hover:border-[#1842FF] rounded-lg flex items-center justify-center text-[#38BDF8] group-hover:text-[#D8F040] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#38BDF8]/70">03</span>
                </div>
                <h3 className="font-bricolage font-bold text-xl text-white">
                  Chapter 9: The One Time It Asks
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Before sending discounts to 40 customers or dispatching a $1,420 flour purchase order, Ren asks with one clean prompt: "Approve?" One tap says yes.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-2.5 py-1 bg-[#121726] border border-[#1E2942] rounded text-xs font-mono font-semibold text-[#00C853]">
                    Human Safety Valve
                  </span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4. Dedicated Windows Feature Directory */}
        <section className="py-16 lg:py-20 px-6 lg:px-12 bg-[#080A0F] border-b border-[#182030]">
          <div className="max-w-6xl mx-auto space-y-10">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#182030]">
              <div>
                <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider block mb-2">
                  EXPLORE THE SYSTEM CHAPTERS
                </span>
                <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Dedicated Feature Architecture
                </h2>
              </div>
              <button
                onClick={onGoToLogin}
                className="px-5 py-2.5 bg-[#141B2D] hover:bg-[#1842FF] text-[#38BDF8] hover:text-white border border-[#1E2B48] hover:border-[#1842FF] text-xs font-mono font-bold uppercase rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
              >
                <span>Enter Full Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {[
                {
                  id: 'simulator',
                  icon: <Zap className="w-5 h-5 text-[#D8F040]" />,
                  title: 'Feature G: Objective Simulator',
                  desc: 'Input complex business tasks. Inspect decomposition stages, real-time terminal telemetry, and safe execution bounds.'
                },
                {
                  id: 'levels',
                  icon: <Layers className="w-5 h-5 text-[#38BDF8]" />,
                  title: 'Feature B: 5-Level Autonomy Ladder',
                  desc: 'Inspect exact API clearances, failure bounds, invariant rules, and simulate level promotions as verified tasks accumulate.'
                },
                {
                  id: 'missions',
                  icon: <CheckCircle2 className="w-5 h-5 text-[#00C853]" />,
                  title: 'Feature C: Auditable Mission Diary',
                  desc: 'Physical proof slips of observed anomalies, supplier price changes, before/after diffs, and cryptographic hash seals.'
                },
                {
                  id: 'skills',
                  icon: <Cpu className="w-5 h-5 text-[#38BDF8]" />,
                  title: 'Feature D: Skill Tree Marketplace',
                  desc: 'Equip restocking reminders, price monitors, and customer reply drafters with simple 1-sentence explanations.'
                },
                {
                  id: 'quests',
                  icon: <Flame className="w-5 h-5 text-[#FF5252]" />,
                  title: 'Features E & F: Streaks & Quests',
                  desc: '12-day reliability counter and 1-tap human authorization queue for discounts and high-value supplier restocking.'
                },
                {
                  id: 'radar',
                  icon: <TrendingUp className="w-5 h-5 text-[#D8F040]" />,
                  title: 'Features I & J: Teamwork & Timeline',
                  desc: 'Weekly workload distribution (Ren vs Meera vs Baker Staff), hours saved, and relationship history milestones.'
                }
              ].map((win) => (
                <div
                  key={win.id}
                  onClick={onEnterConsole}
                  className="bg-[#0B0E16] border border-[#1A2234] hover:border-[#1842FF]/60 rounded-xl p-6 shadow-md hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#121726] border border-[#1C263E] group-hover:bg-[#1842FF]/20 group-hover:border-[#1842FF]/50 rounded-lg flex items-center justify-center mb-4 transition-colors">
                    {win.icon}
                  </div>
                  <h3 className="font-bricolage font-bold text-lg text-white mb-2 group-hover:text-[#D8F040] transition-colors">
                    {win.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {win.desc}
                  </p>
                </div>
              ))}

            </div>

          </div>
        </section>

        {/* 5. High-Impact Call-To-Action */}
        <section className="py-16 lg:py-20 px-6 lg:px-12 bg-gradient-to-b from-[#0A0D15] via-[#080A0F] to-[#05060A] text-white text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="inline-block px-3 py-1 bg-[#101726] border border-[#1D2B48] rounded-full text-xs font-mono font-bold text-[#D8F040] uppercase tracking-wider">
              READY IN 4 QUESTIONS
            </span>

            <h2 className="font-bricolage text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Hire Ren. Reclaim your mornings.
            </h2>

            <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              No learning curve, no dashboard setup. Answer 4 short conversational questions and watch your teammate start in Shadow Mode.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onOpenHireModal || onGoToLogin}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#D8F040] hover:bg-[#cbf026] text-[#080A0F] font-bold text-sm rounded-lg shadow-[0_0_25px_rgba(216,240,64,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <UserCheck className="w-4 h-4 text-[#080A0F]" />
                <span>Hire Your Teammate (4 Questions)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onEnterConsole}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0F1422] hover:bg-[#151D30] text-[#38BDF8] hover:text-white border border-[#1E2B48] font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                <span>Open Autonomous Console</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <Footer onNavigate={() => onGoToLogin()} />

    </div>
  );
};
