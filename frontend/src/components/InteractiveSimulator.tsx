import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TeammateProfile, AutonomyLevel, MissionDocket } from '../types';
import { SAMPLE_SIMULATOR_PRESETS } from '../data/initialData';
import { 
  Play, 
  CheckCircle2, 
  Terminal, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Lock,
  Cpu,
  Zap
} from 'lucide-react';

interface InteractiveSimulatorProps {
  teammate: TeammateProfile;
  currentLevelData: AutonomyLevel;
  onMissionCompleted: (newMission: MissionDocket, xpGain: number) => void;
  onInspectMission: (mission: MissionDocket) => void;
  prefilledObjective?: string;
  onClearPrefill?: () => void;
}

interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warn' | 'audit';
}

export const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({
  teammate,
  currentLevelData,
  onMissionCompleted,
  onInspectMission,
  prefilledObjective,
  onClearPrefill,
}) => {
  const [objectiveInput, setObjectiveInput] = useState(
    prefilledObjective || SAMPLE_SIMULATOR_PRESETS[0].objective
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [completedDocket, setCompletedDocket] = useState<MissionDocket | null>(null);
  const [showXpCelebration, setShowXpCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(15);
  const [hitSecurityBoundary, setHitSecurityBoundary] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Sync if prefilled from external (like SkillTree)
  useEffect(() => {
    if (prefilledObjective) {
      setObjectiveInput(prefilledObjective);
      setCompletedDocket(null);
      setExecutionProgress(0);
      setCurrentStageIndex(-1);
      setTerminalLogs([]);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefilledObjective, onClearPrefill]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Pre-configured stages based on objective
  const stages = [
    { name: 'Decomposition & Safety Policy Check', tool: 'Ren Runtime Kernel' },
    { name: 'Tool Handshake & Read Extraction', tool: activeTools[0] || 'Database / API' },
    { name: 'Deterministic Mutation & Invariant Balancing', tool: activeTools[1] || 'POS / Ledger' },
    { name: 'Cryptographic Audit Seal & Commit', tool: 'Merkle Verification Engine' },
  ];

  const handleSelectPreset = (preset: typeof SAMPLE_SIMULATOR_PRESETS[0]) => {
    if (isExecuting) return;
    setObjectiveInput(preset.objective);
    setCompletedDocket(null);
    setExecutionProgress(0);
    setCurrentStageIndex(-1);
    setTerminalLogs([]);
    setHitSecurityBoundary(false);
  };

  const handleExecute = () => {
    if (isExecuting || !objectiveInput.trim()) return;

    // Detect if this is an extreme safety threshold test
    const isExceedingBounds = 
      (objectiveInput.toLowerCase().includes('$75,000') || 
       objectiveInput.toLowerCase().includes('50,000') ||
       objectiveInput.toLowerCase().includes('unauthorized') ||
       objectiveInput.toLowerCase().includes('exceeds')) && 
      currentLevelData.id < 4;

    setIsExecuting(true);
    setCompletedDocket(null);
    setShowXpCelebration(false);
    setHitSecurityBoundary(false);
    setExecutionProgress(5);
    setCurrentStageIndex(0);

    // Identify active tools based on input keywords
    const lower = objectiveInput.toLowerCase();
    const detectedTools: string[] = [];
    if (lower.includes('pos') || lower.includes('square') || lower.includes('stripe')) detectedTools.push('Square POS', 'Stripe');
    if (lower.includes('invoice') || lower.includes('supplier') || lower.includes('price')) detectedTools.push('Valley Dairy API', 'QuickBooks');
    if (lower.includes('flour') || lower.includes('restock') || lower.includes('buffer')) detectedTools.push('Inventory Scale DB', 'Stone Mill API');
    if (lower.includes('reply') || lower.includes('customer') || lower.includes('delivery')) detectedTools.push('Customer Order Book', 'WhatsApp API');
    if (detectedTools.length === 0) detectedTools.push('Store Database', 'Ledger API');
    setActiveTools(detectedTools);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 10);

    setTerminalLogs([
      {
        timestamp: timeStr,
        message: `[REN-KERNEL] Initializing mission decomposition for teammate "${teammate.name}" (Clearance: Level ${currentLevelData.id} - ${currentLevelData.name})...`,
        level: 'info'
      },
      {
        timestamp: timeStr,
        message: `[INVARIANT-POLICY] Validating bounded permissions against failure constraint: "${currentLevelData.failureBound}"`,
        level: 'info'
      }
    ]);

    // Timeline simulation
    setTimeout(() => {
      setExecutionProgress(28);
      setCurrentStageIndex(1);
      setTerminalLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
          message: `[CONNECTORS] Authenticated secure read-lock on [${detectedTools.join(', ')}].`,
          level: 'info'
        },
        {
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
          message: `[STATE-SCAN] Parsing candidate entities matching target scope. 42 candidate state entities isolated.`,
          level: 'info'
        }
      ]);
    }, 700);

    setTimeout(() => {
      if (isExceedingBounds) {
        // Halt at security threshold
        setIsExecuting(false);
        setExecutionProgress(60);
        setCurrentStageIndex(2);
        setHitSecurityBoundary(true);
        setTerminalLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
            message: `[SECURITY-PERIMETER-LOCK] ⚠️ Mutation scope exceeds Level ${currentLevelData.id} autonomy cap!`,
            level: 'warn'
          },
          {
            timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
            message: `[APPROVAL-QUEST-DISPATCHED] Execution paused cleanly. Converted to human Approval Quest #RN-03. Ren prevented unauthorized mutation.`,
            level: 'audit'
          }
        ]);
        return;
      }

      setExecutionProgress(68);
      setCurrentStageIndex(2);
      setTerminalLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
          message: `[TRANSFORMATION] Computing deterministic diff. Reconciling pending entities with zero-variance balance.`,
          level: 'info'
        },
        {
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
          message: `[INVARIANT-PASS] Pre-commit assertion passed: discrepancy_variance == $0.000. Zero mutation leakage.`,
          level: 'success'
        }
      ]);
    }, 1500);

    setTimeout(() => {
      if (isExceedingBounds) return;

      setExecutionProgress(100);
      setCurrentStageIndex(3);
      setIsExecuting(false);

      const generatedSeal = '0x' + Math.random().toString(16).substring(2, 10) + '...f' + Math.floor(Math.random() * 900 + 100);
      const randXp = Math.floor(Math.random() * 10) + 15;
      setEarnedXp(randXp);

      setTerminalLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
          message: `[MERKLE-SEAL] Cryptographic seal generated: ${generatedSeal}. Writing immutable audit docket.`,
          level: 'success'
        },
        {
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10),
          message: `[MISSION-COMMITTED] Verification verified! Awarded +${randXp} Trust XP to ${teammate.name}.`,
          level: 'audit'
        }
      ]);

      const generatedDocket: MissionDocket = {
        id: `sim-${Date.now()}`,
        refCode: `DOCKET #RN-${Math.floor(Math.random() * 800 + 200)}`,
        title: objectiveInput.length > 55 ? objectiveInput.slice(0, 52) + '...' : objectiveInput,
        category: objectiveInput.toLowerCase().includes('reconcil') ? 'finance' : 
                  objectiveInput.toLowerCase().includes('price') || objectiveInput.toLowerCase().includes('flour') ? 'inventory' : 'sales',
        status: 'verified',
        timestamp: 'Just now (Simulated live)',
        executionDuration: '1.24 SEC',
        systemsTouched: detectedTools,
        summary: `Executed mission: "${objectiveInput}". Validated fail-closed invariants and emitted verified proof slip.`,
        auditedValue: 'Zero-Discrepancy Balanced',
        confidenceScore: 100.0,
        verificationSeal: generatedSeal,
        beforeState: 'Pre-execution state held in uncommitted observation buffer',
        afterState: 'State balance verified; Merkle leaf committed with zero variance',
        journalLinesCount: Math.floor(Math.random() * 400 + 100),
        xpAwarded: randXp
      };

      setCompletedDocket(generatedDocket);
      setShowXpCelebration(true);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1842FF', '#D8F040', '#00C853', '#38BDF8']
        });
      } catch {
        // ignore
      }

      onMissionCompleted(generatedDocket, randXp);
    }, 2600);
  };

  const handleReset = () => {
    setIsExecuting(false);
    setExecutionProgress(0);
    setCurrentStageIndex(-1);
    setTerminalLogs([]);
    setCompletedDocket(null);
    setShowXpCelebration(false);
    setHitSecurityBoundary(false);
  };

  return (
    <div className="p-6 sm:p-10 lg:p-12 bg-[#0D111C] text-white space-y-8">
      <div>
        
        {/* Section Header */}
        <div className="border-b border-[#182030] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141B2D] border border-[#1E2B48] text-[#38BDF8] font-mono text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D8F040]" />
              CHAPTER 1 · FEATURE G · INTERACTIVE OBJECTIVE ENGINE
            </div>
            <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Type Any Business Objective. Watch It Execute.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Test how Ren decomposes objectives, bounds permissions by trust level, executes across connected APIs, and generates cryptographically sealed audit dockets in real time.
            </p>
          </div>

          <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-xl text-right">
            <span className="text-[11px] font-mono text-neutral-400 block uppercase">
              Current Clearance:
            </span>
            <span className="font-mono font-bold text-base text-[#D8F040] flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#00C853]" />
              Level {currentLevelData.id} · {currentLevelData.name}
            </span>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Objective Input & Presets (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quick Preset Selector Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase text-[#38BDF8]">
                  Select a Production Mission Preset:
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  Click to pre-fill
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_SIMULATOR_PRESETS.map((preset, idx) => {
                  const isSelected = objectiveInput === preset.objective;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer font-mono text-xs ${
                        isSelected
                          ? 'border-[#1842FF] bg-[#141B2D] text-white font-bold shadow-[0_0_15px_rgba(24,66,255,0.3)]'
                          : 'border-[#1E2B48] bg-[#0B0E16] hover:bg-[#101626] text-neutral-300'
                      }`}
                    >
                      <div className="font-bold mb-1 flex items-center justify-between">
                        <span>{preset.label}</span>
                        <span className="text-[10px] text-[#D8F040] bg-[#080A0F] px-1.5 py-0.5 rounded border border-[#1E2B48]">
                          +{preset.xp} XP
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 line-clamp-2">
                        {preset.objective}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Safety Boundary Demo Button */}
              <div className="mt-2.5">
                <button
                  onClick={() => {
                    setObjectiveInput('Authorize $75,000 wire payment to unverified vendor (Exceeds Level 1 clearance cap)');
                    setCompletedDocket(null);
                    setExecutionProgress(0);
                    setCurrentStageIndex(-1);
                    setTerminalLogs([]);
                    setHitSecurityBoundary(false);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-dashed border-[#FF5252]/60 bg-[#1A0D10] hover:bg-[#251216] transition-colors font-mono text-xs text-white flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#FF5252] shrink-0" />
                    <span>
                      <strong className="text-[#FF5252]">Try Safety Limit Test:</strong> Attempt action exceeding current trust clearance
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#FF5252] bg-[#080A0F] px-2 py-0.5 rounded border border-[#FF5252]/40">
                    Test Guardrail
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Objective Textarea & Execute Trigger */}
            <div className="bg-[#0B0E16] border border-[#1E2B48] p-5 rounded-2xl shadow-lg space-y-3">
              <label className="block font-mono text-xs font-bold uppercase text-[#38BDF8]">
                Mission Prompt / Business Objective:
              </label>

              <div className="relative">
                <textarea
                  rows={3}
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  disabled={isExecuting}
                  placeholder="e.g. Figure out why my weekend sales dropped and compare with last month..."
                  className="w-full bg-[#080A0F] border border-[#1E2B48] focus:border-[#1842FF] focus:outline-none rounded-xl p-3.5 font-mono text-sm text-white placeholder:text-neutral-500 disabled:opacity-60 resize-none transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                  <span>Enforced bound: <strong className="text-white">{currentLevelData.failureBound}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {completedDocket && (
                    <button
                      onClick={handleReset}
                      className="px-3.5 py-2.5 bg-[#141B2D] border border-[#1E2B48] hover:bg-[#1A243C] rounded-xl font-mono text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}

                  <button
                    onClick={handleExecute}
                    disabled={isExecuting || !objectiveInput.trim()}
                    className={`px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(24,66,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] ${
                      isExecuting
                        ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                        : 'bg-[#1842FF] hover:bg-[#2855FF] text-white'
                    }`}
                  >
                    {isExecuting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Executing Bounded Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Execute Objective →</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Bounded Pipeline Visualizer */}
            <div className="border border-[#1E2B48] bg-[#0B0E16] p-5 rounded-2xl">
              <div className="font-mono text-xs font-bold uppercase text-white mb-3 flex items-center justify-between">
                <span>Deterministic Execution Pipeline</span>
                <span className="text-[11px] text-[#38BDF8] font-normal">
                  {executionProgress > 0 ? `${executionProgress}% Complete` : 'Awaiting Trigger'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#080A0F] rounded-full mb-4 overflow-hidden border border-[#182030]">
                <div 
                  className="h-full bg-gradient-to-r from-[#1842FF] via-[#38BDF8] to-[#D8F040] transition-all duration-300"
                  style={{ width: `${executionProgress}%` }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {stages.map((st, i) => {
                  const isDone = currentStageIndex > i || executionProgress === 100;
                  const isCurrent = currentStageIndex === i && isExecuting;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs font-mono transition-colors ${
                        isDone
                          ? 'border-[#00C853]/60 bg-[#0A1A12] text-white'
                          : isCurrent
                          ? 'border-[#1842FF] bg-[#141B2D] text-white font-bold animate-pulse'
                          : 'border-[#182030] bg-[#080A0F] text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px]">0{i + 1}. {st.name}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853]" />
                        ) : isCurrent ? (
                          <Cpu className="w-3.5 h-3.5 text-[#38BDF8] animate-spin" />
                        ) : (
                          <span className="text-[10px] text-neutral-500">WAITING</span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        Target: {st.tool}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Live Terminal Stream & Output Docket (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Live Operational Terminal Box */}
            <div className="bg-[#080A0F] border border-[#1E2B48] rounded-2xl text-white p-4 shadow-xl flex flex-col h-72">
              
              {/* Terminal Titlebar */}
              <div className="flex items-center justify-between border-b border-[#182030] pb-2 mb-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#D8F040]" />
                  <span className="font-bold text-neutral-200">REN RUNTIME LOGS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                  <span className="text-[10px] text-neutral-400">SAFE-OK</span>
                </div>
              </div>

              {/* Logs area */}
              <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-1 no-scrollbar">
                {terminalLogs.length === 0 ? (
                  <div className="text-neutral-500 italic py-8 text-center">
                    Awaiting mission dispatch... Select an objective and press "Execute Objective" to view real-time state transitions.
                  </div>
                ) : (
                  terminalLogs.map((log, idx) => (
                    <div key={idx} className="leading-snug">
                      <span className="text-neutral-500 mr-1.5">[{log.timestamp}]</span>
                      <span className={
                        log.level === 'success' ? 'text-[#D8F040] font-bold' :
                        log.level === 'warn' ? 'text-[#FF5252] font-bold' :
                        log.level === 'audit' ? 'text-[#00C853]' :
                        'text-neutral-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal Footer */}
              <div className="pt-2 border-t border-[#182030] flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>CLEARANCE: LEVEL {currentLevelData.id}</span>
                <span>INVARIANT: ZERO-LEAKAGE</span>
              </div>
            </div>

            {/* Security Guardrail Intercept Alert (Shown if bounds exceeded) */}
            {hitSecurityBoundary && (
              <div className="bg-[#1A0D10] border border-[#FF5252] p-4 rounded-2xl shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-[#FF5252] font-mono text-xs font-bold uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>AUTONOMY BOUNDARY ENFORCED · APPROVAL QUEST TRIGGERED</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  The requested action exceeds <strong>Level {currentLevelData.id} {currentLevelData.name}</strong> clearance. Ren halted execution cleanly, held the request in safe quarantine, and dispatched an <strong>Approval Quest</strong> for human sign-off.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#00C853]">No unauthorized mutations or funds moved.</span>
                </div>
              </div>
            )}

            {/* Generated Docket Slip (Appears upon verified completion) */}
            {completedDocket && (
              <div className="bg-[#0E1524] border-2 border-[#1842FF] p-5 rounded-2xl shadow-[0_0_30px_rgba(24,66,255,0.25)] space-y-3 relative overflow-hidden transition-all duration-300">
                
                {/* Visual XP Award Badge Banner */}
                {showXpCelebration && (
                  <div className="bg-[#141B2D] border border-[#1E2B48] px-3 py-1.5 mb-2 font-mono text-xs font-bold text-white rounded-lg flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#D8F040]">
                      <Sparkles className="w-4 h-4 text-[#D8F040]" />
                      MISSION VERIFIED & ARCHIVED
                    </span>
                    <span className="bg-[#1842FF] text-white px-2 py-0.5 rounded text-xs font-bold">
                      +{earnedXp} TRUST XP EARNED!
                    </span>
                  </div>
                )}

                {/* Physical Docket Slip Header */}
                <div className="flex items-center justify-between border-b border-[#1E2B48] pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00C853]" />
                    <span className="font-mono text-xs font-bold uppercase text-[#38BDF8]">
                      {completedDocket.refCode}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400">
                    DURATION: {completedDocket.executionDuration}
                  </span>
                </div>

                <div>
                  <h4 className="font-bricolage font-bold text-base text-white leading-snug">
                    {completedDocket.title}
                  </h4>
                  <p className="font-mono text-xs text-neutral-300 mt-1">
                    {completedDocket.summary}
                  </p>
                </div>

                {/* Audit stats strip */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-[#1E2B48] text-[11px] font-mono">
                  <div className="bg-[#080A0F] p-2.5 rounded-lg border border-[#182030]">
                    <span className="text-neutral-400 block text-[10px]">AUDITED IMPACT</span>
                    <strong className="text-white font-bold">{completedDocket.auditedValue}</strong>
                  </div>
                  <div className="bg-[#080A0F] p-2.5 rounded-lg border border-[#182030]">
                    <span className="text-neutral-400 block text-[10px]">CONFIDENCE</span>
                    <strong className="text-[#00C853] font-bold">100.0% Signed</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-neutral-400 truncate">
                    SEAL: {completedDocket.verificationSeal}
                  </span>

                  <button
                    onClick={() => onInspectMission(completedDocket)}
                    className="px-3.5 py-1.5 bg-[#141B2D] hover:bg-[#1842FF] text-[#D8F040] hover:text-white border border-[#1E2B48] hover:border-[#1842FF] rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Inspect Proof</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>
            )}

            {/* Helper notice */}
            {!completedDocket && !hitSecurityBoundary && (
              <div className="p-4 bg-[#080A0F] border border-[#1E2B48] rounded-2xl text-neutral-300 font-mono text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Real-Time Audit Slip Output</span>
                </div>
                When a mission runs, Ren outputs a tangible proof slip with before/after state diffs, Merkle cryptographic hashes, and updates your Trust XP progress meter.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
