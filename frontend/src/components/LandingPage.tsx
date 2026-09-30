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

  const handleRunThinking = async (queryToRun?: string) => {
    const q = queryToRun || userInput;
    if (!q.trim() || isThinking) return;

    setUserInput(q);
    setIsThinking(true);
    setFindingResult(null);
    setPlanSteps([]);
    setActiveStepIndex(0);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/agent/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objective: q })
      });
      if (res.ok) {
          const data = await res.json();
          if (data.status === 'demo_completed') {
              const steps = data.demo_plan_steps || [];
              for (let i = 0; i < steps.length; i++) {
                  setPlanSteps(prev => [...prev, { name: steps[i].tool || 'Step', tool: steps[i].tool }]);
                  setActiveStepIndex(i);
                  await new Promise(r => setTimeout(r, 800));
              }
              setIsThinking(false);
              setActiveStepIndex(steps.length);
              setFindingResult({
                  status: '✅ Success',
                  insight: data.demo_summary,
                  action: 'Systems updated: ' + (data.demo_systems_touched?.join(', ') || 'None')
              });
              return;
          }
      }
    } catch (e) {
      console.error(e);
    }

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

      {/* 1. Header (Obsidian Palette) */}
      <header className="sticky top-0 z-40 bg-[#080A0F]/90 backdrop-blur-md border-b border-[#182030] px-6 lg:px-12 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <CrewmateLogo size="md" variant="white" withTagline={false} />

          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">


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
          <div className="max-w-7xl mx-auto">
            

            {/* Two-Column Visual Grid: Trust Ladder Visual + Story Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
              
              {/* Left Column: Quick Story Context (7 cols) */}
              <div className="lg:col-span-7 space-y-12">
            {/* Eyebrow & Top Headline */}
            <div className="max-w-3xl space-y-3">

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

          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <Footer onNavigate={() => onGoToLogin()} />

    </div>
  );
};
