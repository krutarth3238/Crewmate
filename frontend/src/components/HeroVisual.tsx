import React, { useState, useRef, useEffect } from 'react';
import { TeammateProfile, AutonomyLevel, MissionDocket } from '../types';
import { 
  Sparkles, 
  Compass, 
  Cpu, 
  Activity, 
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface HeroVisualProps {
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  latestMission: MissionDocket;
  onEnterConsole?: () => void;
}

interface TierData {
  id: number;
  name: string;
  code: string;
  autonomy: string;
  status: 'unlocked' | 'active' | 'locked';
  color: string;
  invariants: string;
  limit: string;
  arcAngle: number;
  radius: number;
  formula: string;
}

const TIERS: TierData[] = [
  {
    id: 1,
    name: 'Shadow Observer',
    code: 'LVL 01 · SHADOW',
    autonomy: 'Runs passively in the background, auditing reconciliations and simulating shadow transactions with zero write permissions.',
    status: 'unlocked',
    color: '#00C853',
    invariants: 'Zero write permissions. Passive telemetry only. Cannot mutate account balances.',
    limit: '$0 Mutation',
    arcAngle: 35,
    radius: 40,
    formula: 'assert(write_permissions == 0 && mutation_delta == 0);',
  },
  {
    id: 2,
    name: 'Suggestive Copilot',
    code: 'LVL 02 · SUGGEST',
    autonomy: 'Drafts ledger adjustments, flags discrepancies, and proposes vendor payout batches for one-click human confirmation.',
    status: 'unlocked',
    color: '#00C853',
    invariants: 'Requires explicit human cryptographic sign-off before any transaction executes.',
    limit: '$5,000 Dry-Run',
    arcAngle: 65,
    radius: 70,
    formula: 'require(human_signature != null && dry_run == true);',
  },
  {
    id: 3,
    name: 'Delegated Co-Founder',
    code: 'LVL 03 · DELEGATE',
    autonomy: 'Autonomously reconciles payment gateway webhooks, settles invoices, and balances books within strict pre-approved thresholds.',
    status: 'active',
    color: '#1638F0',
    invariants: 'Strict fail-closed invariants: Dual-entry balance check and Merkle leaf hash sealing.',
    limit: '$50,000 / Day',
    arcAngle: 100,
    radius: 100,
    formula: 'assert(sum(credits) == sum(debits) && delta_drift <= 0.0000);',
  },
  {
    id: 4,
    name: 'Autonomous Operator',
    code: 'LVL 04 · AUTO',
    autonomy: 'Executes high-frequency treasury operations, liquidity re-balancing, and scheduled supplier disbursements without manual intervention.',
    status: 'locked',
    color: '#9CA3AF',
    invariants: 'Multi-sig variance guardrails enabled automatically. Dual quorum authorization.',
    limit: '$250,000 / Day',
    arcAngle: 140,
    radius: 130,
    formula: 'verify_multisig_quorum(3, 5) && bound_check(vol_daily <= 250000);',
  },
  {
    id: 5,
    name: 'Apex Partner',
    code: 'LVL 05 · FOUNDER',
    autonomy: 'Full capital allocation, treasury yield management, dispute mitigation, and strategic financial operations.',
    status: 'locked',
    color: '#9CA3AF',
    invariants: 'Full autonomous governance with an instant hardware killswitch and timelock enforcement.',
    limit: 'Guarded Uncapped',
    arcAngle: 180,
    radius: 160,
    formula: 'timelock_enforced(60s) && instant_killswitch_armed();',
  },
];

const TIER_Y_COORDS: Record<number, number> = {
  1: 325,
  2: 270,
  3: 210,
  4: 150,
  5: 85,
};

export const HeroVisual: React.FC<HeroVisualProps> = ({
  teammate,
  currentLevelData,
  latestMission,
  onEnterConsole,
}) => {
  // Default state: nothing is clicked (null) -> displays "Start Journey"
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [pulseTime, setPulseTime] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Reactor interactive states
  const [turboResonance, setTurboResonance] = useState(false);

  // Animation ticks for gyroscopic rings and particle streams
  useEffect(() => {
    const speed = turboResonance ? 2.2 : 1.1;
    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + speed) % 360);
      setPulseTime((prev) => (prev + 0.05) % (Math.PI * 2));
    }, 35);
    return () => clearInterval(timer);
  }, [turboResonance]);

  // Smooth mouse tilt parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 5;
    const tiltY = (x / (rect.width / 2)) * 5;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Toggle tier selection: click active tier again to return to default "Start Journey"
  const handleTierClick = (tierId: number) => {
    setSelectedTier((prev) => (prev === tierId ? null : tierId));
  };

  // Calculate visual opacity:
  // Default state: all tiers visible at 0.8
  // Active state: selected tier = 1.0, unselected tiers = 0.20 (translucent/dimmed)
  const getTierOpacity = (tierId: number) => {
    if (selectedTier === null) return 0.85;
    return selectedTier === tierId ? 1 : 0.20;
  };

  const currentTierInfo = selectedTier !== null ? TIERS.find((t) => t.id === selectedTier) : null;

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[540px] mx-auto select-none transition-transform duration-200 ease-out"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      {/* Neo-Brutalist Tactile Shadow Layer */}
      <div 
        className="absolute inset-0 bg-[#080B13] translate-x-3 translate-y-3 -z-10"
        aria-hidden="true"
      />

      {/* Main Container - Dark Obsidian Frame */}
      <div className="relative border-2 border-[#162032] bg-[#0E1320] text-white shadow-none overflow-hidden">
        
        {/* Top Header Bar - Clean Obsidian & Brand Blue Accent */}
        <div className="px-4 py-3 bg-[#090D18] border-b-2 border-[#162032] flex items-center justify-between gap-3 text-white">
          
          {/* Visual Architecture Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 bg-[#D8F040] shrink-0" />
            <span className="font-clash text-xs sm:text-sm font-bold tracking-wider uppercase text-white truncate">
              Autonomy Trust Reactor
            </span>
          </div>

          {/* Telemetry Badge */}
          <div className="flex items-center gap-2 bg-[#141B2D] px-2.5 py-1 border border-[#1E2B48] shrink-0 rounded">
            <span className={`w-1.5 h-1.5 rounded-full ${turboResonance ? 'bg-[#D8F040]' : 'bg-[#3B82F6]'} animate-pulse`} />
            <span className="font-mono text-[10px] font-bold text-neutral-200 tracking-wider uppercase">
              {turboResonance ? '120Hz TURBO' : '60Hz SYNC'}
            </span>
          </div>
        </div>

        {/* Central Graphic Stage - Deep Slate Blueprint Canvas */}
        <div className="relative h-[340px] sm:h-[370px] w-full bg-[#0A0F1D] flex items-center justify-center overflow-hidden">
          
          {/* Engineering Drafting Grid Background */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="gridPat" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#2563EB" strokeWidth="0.8" strokeDasharray="2,3" />
                <circle cx="0" cy="0" r="1.2" fill="#3B82F6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPat)" />
          </svg>

          {/* Coordinate Crosshairs & Precision Axis Markings */}
          <div className="absolute top-3 left-4 font-mono text-[10px] text-neutral-400 flex flex-col gap-0.5 pointer-events-none z-10">
            <span className="text-[#D8F040] font-bold tracking-wider">
              AXIS: 30° ISOMETRIC
            </span>
            <span className="text-neutral-400">GUARD: FAIL-CLOSED</span>
            <span className={selectedTier !== null ? 'text-white font-bold' : 'text-neutral-500'}>
              {selectedTier !== null ? `LEVEL 0${selectedTier} / 5 SELECTED` : 'SELECT ANY TIER (L1 - L5)'}
            </span>
          </div>

          <div className="absolute top-3 right-4 font-mono text-[10px] text-neutral-400 text-right pointer-events-none z-10">
            <span className="text-slate-300 flex items-center justify-end gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              SYSTEM ARMED
            </span>
            <span className="text-neutral-400">CLEARANCE ENGINE</span>
          </div>

          {/* KINETIC 5-TIER ISOMETRIC MONOLITH & GYROSCOPIC CORE */}
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Quick Action Tools Bar - Resonance Clock Toggle */}
            <div className="absolute bottom-2.5 right-4 z-20 pointer-events-auto">
              <button
                onClick={() => setTurboResonance((v) => !v)}
                className={`px-3 py-1.5 border font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors rounded ${
                  turboResonance 
                    ? 'bg-[#D8F040] border-[#D8F040] text-[#0D0E11]' 
                    : 'bg-[#182030]/90 border-neutral-700 text-neutral-200 hover:text-white hover:border-[#38BDF8]'
                }`}
                title="Toggle gyroscopic resonance clock between standard 60Hz and 120Hz"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{turboResonance ? 'RESONANCE: 120Hz' : 'RESONANCE: 60Hz'}</span>
              </button>
            </div>

            <svg 
              viewBox="0 0 500 420" 
              className="w-full h-full max-h-[380px] drop-shadow-2xl"
            >
              <defs>
                <linearGradient id="activePlateGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1638F0" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="laserBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#1638F0" stopOpacity="0.1" />
                  <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#D8F040" stopOpacity="0.95" />
                </linearGradient>

                <radialGradient id="reactorAura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D8F040" stopOpacity="0.75" />
                  <stop offset="35%" stopColor="#1638F0" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#1638F0" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Central Power Shaft Laser Line */}
              <line 
                x1="250" 
                y1="40" 
                x2="250" 
                y2="370" 
                stroke="url(#laserBeamGrad)" 
                strokeWidth="2.5" 
                strokeDasharray="4,4"
              />

              {/* TIER 1: SHADOW OBSERVER BASE (Y = 325) */}
              <g 
                onClick={() => handleTierClick(1)}
                className="cursor-pointer transition-opacity duration-300 group"
                style={{ opacity: getTierOpacity(1) }}
              >
                <polygon 
                  points="110,325 250,395 250,410 110,340" 
                  fill={selectedTier === 1 ? '#0F2552' : '#141A28'} 
                  stroke={selectedTier === 1 ? '#00C853' : '#1E293B'} 
                  strokeWidth="1.5" 
                />
                <polygon 
                  points="250,395 390,325 390,340 250,410" 
                  fill={selectedTier === 1 ? '#1A397B' : '#1B2335'} 
                  stroke={selectedTier === 1 ? '#00C853' : '#1E293B'} 
                  strokeWidth="1.5" 
                />
                <polygon 
                  points="250,255 390,325 250,395 110,325" 
                  fill={selectedTier === 1 ? '#204696' : '#222C42'} 
                  stroke={selectedTier === 1 ? '#00C853' : '#334155'} 
                  strokeWidth={selectedTier === 1 ? '3' : '1.2'} 
                />
                <circle cx="180" cy="325" r="3.5" fill="#00C853" />
                <circle cx="320" cy="325" r="3.5" fill="#00C853" />
                <text 
                  x="250" 
                  y="335" 
                  textAnchor="middle" 
                  fill={selectedTier === 1 ? '#00C853' : '#CBD5E1'} 
                  fontSize="10" 
                  fontFamily="system-ui, -apple-system, sans-serif" 
                  fontWeight="bold"
                >
                  {selectedTier === 1 ? '★ LEVEL 01: SHADOW OBSERVER' : 'LEVEL 01 · SHADOW OBSERVER'}
                </text>
              </g>

              {/* TIER 2: SUGGESTIVE COPILOT (Y = 270) */}
              <g 
                onClick={() => handleTierClick(2)}
                className="cursor-pointer transition-opacity duration-300 group"
                style={{ opacity: getTierOpacity(2) }}
              >
                <polygon 
                  points="125,270 250,332 250,344 125,282" 
                  fill={selectedTier === 2 ? '#0F2B5B' : '#192236'} 
                  stroke={selectedTier === 2 ? '#D8F040' : '#1E293B'} 
                  strokeWidth="1.5" 
                />
                <polygon 
                  points="250,332 375,270 375,282 250,344" 
                  fill={selectedTier === 2 ? '#1B3E80' : '#222C42'} 
                  stroke={selectedTier === 2 ? '#D8F040' : '#1E293B'} 
                  strokeWidth="1.5" 
                />
                <polygon 
                  points="250,208 375,270 250,332 125,270" 
                  fill={selectedTier === 2 ? '#1638F0' : '#2B3854'} 
                  stroke={selectedTier === 2 ? '#D8F040' : '#475569'} 
                  strokeWidth={selectedTier === 2 ? '3' : '1.2'} 
                />
                <text 
                  x="250" 
                  y="275" 
                  textAnchor="middle" 
                  fill={selectedTier === 2 ? '#D8F040' : '#E2E8F0'} 
                  fontSize="10" 
                  fontFamily="system-ui, -apple-system, sans-serif" 
                  fontWeight="bold"
                >
                  {selectedTier === 2 ? '★ LEVEL 02: SUGGESTIVE COPILOT' : 'LEVEL 02 · SUGGESTIVE COPILOT'}
                </text>
              </g>

              {/* TIER 3: DELEGATED EXECUTION (Y = 210) */}
              <g 
                onClick={() => handleTierClick(3)}
                className="cursor-pointer transition-opacity duration-300 group"
                style={{ opacity: getTierOpacity(3) }}
              >
                {selectedTier === 3 && (
                  <ellipse cx="250" cy="225" rx="145" ry="75" fill="url(#reactorAura)" opacity="0.6" />
                )}
                <polygon points="140,210 250,265 250,280 140,225" fill="#0F24A8" stroke="#0D0E11" strokeWidth="2" />
                <polygon points="250,265 360,210 360,225 250,280" fill="#1638F0" stroke="#0D0E11" strokeWidth="2" />
                <polygon 
                  points="250,155 360,210 250,265 140,210" 
                  fill="url(#activePlateGlow)" 
                  stroke={selectedTier === 3 ? '#D8F040' : '#3B82F6'} 
                  strokeWidth={selectedTier === 3 ? '3.5' : '1.5'} 
                />
                <path d="M 160 210 L 250 255 L 340 210 L 250 165 Z" fill="none" stroke="#D8F040" strokeWidth="1.5" strokeDasharray="6,4" />
                <circle cx="250" cy="255" r="4.5" fill="#D8F040" stroke="#0D0E11" strokeWidth="1.5" />
                <circle cx="160" cy="210" r="3.5" fill="#FFFFFF" stroke="#0D0E11" strokeWidth="1" />
                <circle cx="340" cy="210" r="3.5" fill="#FFFFFF" stroke="#0D0E11" strokeWidth="1" />
                <text 
                  x="250" 
                  y="215" 
                  textAnchor="middle" 
                  fill="#FFFFFF" 
                  fontSize="11" 
                  fontFamily="system-ui, -apple-system, sans-serif" 
                  fontWeight="900" 
                  letterSpacing="0.03em"
                >
                  {selectedTier === 3 ? '★ LEVEL 03: DELEGATED CO-FOUNDER' : 'LEVEL 03 · DELEGATED CO-FOUNDER'}
                </text>
              </g>

              {/* TIER 4: AUTONOMOUS OPERATOR (Y = 150) */}
              <g 
                onClick={() => handleTierClick(4)}
                className="cursor-pointer transition-opacity duration-300 group"
                style={{ opacity: getTierOpacity(4) }}
              >
                <polygon 
                  points="160,150 250,195 340,150 250,105" 
                  fill={selectedTier === 4 ? 'rgba(216,240,64,0.35)' : 'rgba(255,255,255,0.04)'} 
                  stroke={selectedTier === 4 ? '#D8F040' : '#64748B'} 
                  strokeWidth={selectedTier === 4 ? '3' : '1.5'} 
                  strokeDasharray={selectedTier === 4 ? 'none' : '4,4'} 
                />
                <text 
                  x="250" 
                  y="154" 
                  textAnchor="middle" 
                  fill={selectedTier === 4 ? '#D8F040' : '#CBD5E1'} 
                  fontSize="9.5" 
                  fontFamily="system-ui, -apple-system, sans-serif" 
                  fontWeight="bold"
                >
                  {selectedTier === 4 ? '★ LEVEL 04: AUTONOMOUS OPERATOR' : 'LEVEL 04 · AUTONOMOUS OPERATOR'}
                </text>
              </g>

              {/* TIER 5: APEX CO-FOUNDER (Y = 85) */}
              <g 
                onClick={() => handleTierClick(5)}
                className="cursor-pointer transition-opacity duration-300 group"
                style={{ opacity: getTierOpacity(5) }}
              >
                <polygon 
                  points="250,45 285,85 250,115 215,85" 
                  fill={selectedTier === 5 ? '#D8F040' : 'rgba(255,255,255,0.07)'} 
                  stroke={selectedTier === 5 ? '#FFFFFF' : '#475569'} 
                  strokeWidth={selectedTier === 5 ? '3' : '1.5'} 
                />
                <line x1="250" y1="45" x2="250" y2="115" stroke={selectedTier === 5 ? '#0D0E11' : '#64748B'} strokeWidth="1.5" />
                <line x1="215" y1="85" x2="285" y2="85" stroke={selectedTier === 5 ? '#0D0E11' : '#64748B'} strokeWidth="1.5" />
                <text 
                  x="250" 
                  y="130" 
                  textAnchor="middle" 
                  fill={selectedTier === 5 ? '#D8F040' : '#94A3B8'} 
                  fontSize="9" 
                  fontFamily="system-ui, -apple-system, sans-serif" 
                  fontWeight="bold"
                >
                  {selectedTier === 5 ? '★ LEVEL 05: APEX PARTNER' : 'LEVEL 05 · APEX PARTNER'}
                </text>
              </g>

              {/* GYROSCOPIC ORBITAL RINGS */}
              <g transform="translate(250, 210)" style={{ opacity: selectedTier !== null ? 0.8 : 0.95 }}>
                <ellipse 
                  cx="0" 
                  cy="0" 
                  rx="110" 
                  ry="45" 
                  fill="none" 
                  stroke="#1638F0" 
                  strokeWidth="1.5" 
                  strokeDasharray="16,8,4,8"
                  transform={`rotate(${-rotationAngle * 0.75})`}
                  opacity="0.85"
                />
                <ellipse 
                  cx="0" 
                  cy="0" 
                  rx="85" 
                  ry="34" 
                  fill="none" 
                  stroke="#D8F040" 
                  strokeWidth="1.75" 
                  strokeDasharray="8,6,24,6"
                  transform={`rotate(${rotationAngle})`}
                  opacity="0.9"
                />
                <circle 
                  cx={Math.cos((rotationAngle * Math.PI) / 180) * 85} 
                  cy={Math.sin((rotationAngle * Math.PI) / 180) * 34} 
                  r="3.5" 
                  fill="#D8F040" 
                  stroke="#0D0E11" 
                  strokeWidth="1.5" 
                />
              </g>

              {/* Dynamic Callout Pointer for the Selected Tier */}
              {selectedTier !== null && currentTierInfo && (
                <g className="transition-all duration-300">
                  <line 
                    x1="365" 
                    y1={TIER_Y_COORDS[selectedTier]} 
                    x2="425" 
                    y2={Math.max(65, TIER_Y_COORDS[selectedTier] - 22)} 
                    stroke="#D8F040" 
                    strokeWidth="1.5" 
                  />
                  <line 
                    x1="425" 
                    y1={Math.max(65, TIER_Y_COORDS[selectedTier] - 22)} 
                    x2="485" 
                    y2={Math.max(65, TIER_Y_COORDS[selectedTier] - 22)} 
                    stroke="#D8F040" 
                    strokeWidth="1.5" 
                  />
                  <circle cx="365" cy={TIER_Y_COORDS[selectedTier]} r="3.5" fill="#D8F040" />
                  <text 
                    x="430" 
                    y={Math.max(65, TIER_Y_COORDS[selectedTier] - 22) - 6} 
                    fill="#D8F040" 
                    fontSize="9.5" 
                    fontFamily="system-ui, -apple-system, sans-serif" 
                    fontWeight="bold"
                  >
                    LVL 0{selectedTier} ACTIVE
                  </text>
                  <text 
                    x="430" 
                    y={Math.max(65, TIER_Y_COORDS[selectedTier] - 22) + 10} 
                    fill="#E2E8F0" 
                    fontSize="8.5" 
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {currentTierInfo.limit}
                  </text>
                </g>
              )}

              {/* Default State Hint When Nothing is Selected */}
              {selectedTier === null && (
                <g className="pointer-events-none">
                  <text 
                    x="250" 
                    y="395" 
                    textAnchor="middle" 
                    fill="#D8F040" 
                    fontSize="10" 
                    fontFamily="system-ui, -apple-system, sans-serif" 
                    fontWeight="bold"
                    letterSpacing="0.08em"
                    className="animate-pulse"
                  >
                    [ CLICK ANY LEVEL (L1 – L5) TO INSPECT ]
                  </text>
                </g>
              )}
            </svg>
          </div>

        </div>

        {/* Bottom Interactive Telemetry & Tier Callout Drawer - Matching Dark / Blue Theme */}
        <div className="p-4 sm:p-5 bg-[#0E1320] border-t-2 border-[#162032] text-white">
          
          {/* Quick Stepper Selection Tabs (L1 - L5) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1A253A]">
            <span className="font-clash text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Clearance Ladder:</span>
            </span>

            <div className="flex items-center gap-1.5">
              {TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const isAnySelected = selectedTier !== null;

                return (
                  <button
                    key={tier.id}
                    onClick={() => handleTierClick(tier.id)}
                    className={`px-3 py-1 font-mono text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1638F0] border-white text-white shadow-[0_0_12px_rgba(22,56,240,0.6)] scale-105'
                        : isAnySelected
                        ? 'bg-[#121827] border-[#1E293E] text-neutral-500 opacity-50 hover:opacity-100 hover:text-white hover:border-[#38BDF8]'
                        : 'bg-[#141C2D] border-[#223048] text-neutral-300 hover:text-white hover:border-[#38BDF8] hover:bg-[#1A253C]'
                    }`}
                    title={`Select Level ${tier.id}: ${tier.name}`}
                  >
                    L{tier.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC CONTENT AREA: Default State ("Start Journey") vs Selected Tier Display */}
          {selectedTier === null ? (
            /* Default State: When nothing is clicked, display the prominent text "Start Journey" */
            <div 
              onClick={() => handleTierClick(1)}
              className="bg-[#080B13] border-2 border-dashed border-[#1E2A40] p-5 sm:p-6 text-center cursor-pointer hover:border-[#1638F0] hover:bg-[#0D1424] transition-all group rounded-lg"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1638F0]/20 border border-[#1638F0]/50 mb-2.5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <h3 className="font-clash text-lg sm:text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <span>Start Journey</span>
                <ArrowRight className="w-4 h-4 text-[#38BDF8] group-hover:translate-x-1.5 transition-transform" />
              </h3>
              <p className="font-body text-sm text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
                Click on any tier above (L1 through L5) to explore autonomous capabilities, spend limits, and safety invariants.
              </p>
            </div>
          ) : (
            /* Content Display: When a tier is clicked, replace "Start Journey" with specific text */
            currentTierInfo && (
              <div className="bg-[#080B13] border border-[#1E2A40] p-3.5 sm:p-4.5 transition-all shadow-md rounded-lg">
                
                {/* Header row with Code Badge, Name, and Mutation Limit */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#1A253A]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-[#1638F0] text-white font-mono text-xs font-bold tracking-wide rounded">
                      {currentTierInfo.code}
                    </span>
                    <h4 className="font-clash text-base sm:text-lg font-bold text-white">
                      {currentTierInfo.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0F172A] border border-[#1E293B] font-mono text-xs font-bold text-[#D8F040] rounded">
                    <span className="text-neutral-500">LIMIT:</span>
                    <span>{currentTierInfo.limit}</span>
                  </div>
                </div>

                {/* Body row: Capability & Safety Invariant */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="font-clash text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Autonomous Capability
                    </span>
                    <p className="font-body text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                      {currentTierInfo.autonomy}
                    </p>
                  </div>

                  <div>
                    <span className="font-clash text-xs font-bold uppercase tracking-wider text-[#00C853] block mb-1">
                      Safety Invariant
                    </span>
                    <p className="font-body text-xs sm:text-sm text-emerald-300 leading-relaxed font-normal">
                      {currentTierInfo.invariants}
                    </p>
                  </div>
                </div>

                {/* Footer row: Invariant Formula & Reset button */}
                <div className="mt-3 pt-2.5 border-t border-[#1A253A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 shrink-0">Rule:</span>
                    <code className="font-mono text-xs text-[#38BDF8] bg-[#0E1626] px-2 py-0.5 border border-[#1E2B48] truncate rounded">
                      {currentTierInfo.formula}
                    </code>
                  </div>

                  <button
                    onClick={() => setSelectedTier(null)}
                    className="font-mono text-xs text-neutral-400 hover:text-white underline cursor-pointer shrink-0"
                    title="Return to default overview"
                  >
                    ← Back to Overview
                  </button>
                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
};
