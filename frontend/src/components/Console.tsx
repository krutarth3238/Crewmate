import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, CheckCircle2, AlertCircle, LogOut, Zap, Shield, TrendingUp, ListChecks, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import {
  executeObjective,
  getMissions,
  getQuests,
  approveQuest,
  rejectQuest,
  devSetLevel,
  type MissionSummary,
  type QuestResponse,
  type AgentExecuteResponse,
} from '../lib/api';
import { CrewmateMark } from './CrewmateLogo';

type Tab = 'run' | 'log' | 'approve' | 'progress';

interface ConsoleProps {
  onSignOut: () => void;
}

// ── XP Bar ───────────────────────────────────────────────────────────────────

function XpBar({ xp, nextLevelXp, levelColor }: { xp: number; nextLevelXp: number | null; levelColor: string }) {
  const pct = nextLevelXp ? Math.min(100, Math.round((xp / nextLevelXp) * 100)) : 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: levelColor }}
        />
      </div>
      <span className="text-xs text-neutral-400 shrink-0">
        {xp}{nextLevelXp ? `/${nextLevelXp}` : ''} XP
      </span>
    </div>
  );
}

// ── Level Up Overlay ──────────────────────────────────────────────────────────

function LevelUpOverlay({ levelName, levelColor, tagline, unlockedPermissions, onDismiss }: {
  levelName: string;
  levelColor: string;
  tagline: string;
  unlockedPermissions: string[];
  onDismiss: () => void;
}) {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0D111C] border rounded-2xl shadow-2xl overflow-hidden" style={{ borderColor: levelColor + '40' }}>
        <div className="h-1" style={{ backgroundColor: levelColor }} />
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">⬆️</div>
          <p className="text-sm font-medium mb-1" style={{ color: levelColor }}>Level Up!</p>
          <h2 className="text-3xl font-bold text-white mb-2">{levelName}</h2>
          <p className="text-neutral-400 text-sm mb-6">{tagline}</p>

          {unlockedPermissions.length > 0 && (
            <div className="text-left bg-white/4 rounded-xl p-4 mb-6">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Now unlocked</p>
              <div className="space-y-2">
                {unlockedPermissions.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: levelColor }} />
                    <span className="capitalize">{p.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-xl font-semibold text-sm text-[#080A0F] transition-all hover:opacity-90 cursor-pointer active:scale-[0.98]"
            style={{ backgroundColor: levelColor }}
          >
            Keep going →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Run Tab ───────────────────────────────────────────────────────────────────

function RunTab({ onMissionComplete, onQuestCreated }: {
  onMissionComplete: () => void;
  onQuestCreated: () => void;
}) {
  const { teammate } = useAuth();
  const [objective, setObjective] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AgentExecuteResponse | null>(null);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = async () => {
    if (!objective.trim() || isRunning) return;
    setError('');
    setResult(null);
    setIsRunning(true);
    try {
      const res = await executeObjective(objective.trim(), teammate?.id);
      setResult(res);
      if (res.status === 'completed') onMissionComplete();
      else if (res.status === 'needs_approval') onQuestCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsRunning(false);
    }
  };

  const level = teammate?.current_level;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1842FF]/20 to-[#D8F040]/20 border border-white/10 shadow-[0_0_40px_-10px_rgba(24,66,255,0.3)] mb-2">
          <Send className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-brand font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 tracking-tight">
          Run a Mission
        </h2>
        <p className="text-lg font-body text-neutral-400 max-w-xl mx-auto">
          Describe what you want done. Your teammate will autonomously plan and execute it.
        </p>
      </div>

      {/* Current level badge */}
      {level && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 shadow-lg backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: level.color, color: level.color }} />
            <span className="font-semibold tracking-wide" style={{ color: level.color }}>{level.name}</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-300">
              {level.unlocked_permissions.length > 0
                ? `Capabilities: ${level.unlocked_permissions.map(p => p.replace(/_/g, ' ')).join(', ')}`
                : 'Research only'}
            </span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="relative group max-w-3xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#1842FF] to-[#D8F040] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-[#0D111C]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all focus-within:border-white/20">
          <textarea
            ref={textareaRef}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun();
            }}
            placeholder="e.g. Research the top 3 competitors in our space and summarize their pricing..."
            rows={4}
            className="w-full bg-transparent px-6 py-5 text-base text-white placeholder:text-neutral-500 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-t border-white/5">
            <span className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-sans border border-white/10">⌘</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-sans border border-white/10">Enter</kbd> to execute
            </span>
            <button
              onClick={handleRun}
              disabled={!objective.trim() || isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-[#1842FF] disabled:bg-[#1842FF]/50 hover:bg-[#2855FF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-hard-cobalt btn-press border border-black"
            >
              {isRunning ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isRunning ? 'Running...' : 'Execute Mission'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {isRunning && (
        <div className="max-w-2xl mx-auto flex items-center gap-4 p-5 bg-gradient-to-r from-[#141B2D] to-[#0A1020] border border-[#1842FF]/30 rounded-2xl shadow-[0_0_30px_-10px_rgba(24,66,255,0.2)] animate-in slide-in-from-bottom-4">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-[#1842FF]/20 border-t-[#1842FF] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#1842FF] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-white">Synthesizing plan & executing...</p>
            <p className="text-sm text-neutral-400 mt-0.5">Your AI is reasoning through the steps.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto flex items-start gap-3 p-5 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-200 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)] animate-in slide-in-from-bottom-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <span className="text-sm font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {/* Result */}
      {result && !isRunning && (
        <div className={`max-w-3xl mx-auto p-6 rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-500 ${
          result.status === 'completed'
            ? 'bg-gradient-to-br from-emerald-950/40 to-[#080A0F] border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)]'
            : result.status === 'needs_approval'
            ? 'bg-gradient-to-br from-amber-950/40 to-[#080A0F] border-amber-500/30 shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)]'
            : 'bg-[#141B2D] border-white/10'
        }`}>
          {result.status === 'completed' && result.mission && (
            <>
              <div className="flex items-center gap-3 mb-4 border-b border-emerald-500/20 pb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="block text-base font-bold text-emerald-400">Mission Accomplished</span>
                  <span className="block text-xs text-emerald-500/70">Verified by Crewmate Agent</span>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-lg font-black text-[#D8F040] drop-shadow-[0_0_10px_rgba(216,240,64,0.5)]">+{result.mission.xp_awarded} XP</span>
                  <span className="text-xs text-neutral-500">Awarded</span>
                </div>
              </div>
              <p className="text-lg text-white font-semibold mb-2">{result.mission.title}</p>
              <div className="bg-black/40 border border-white/5 rounded-xl p-5 mb-4 text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap shadow-inner font-body">
                {result.mission.summary}
              </div>
              {result.mission.systems_touched.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {result.mission.systems_touched.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-neutral-300 capitalize flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
          {result.status === 'needs_approval' && result.quest && (
            <>
              <div className="flex items-center gap-3 mb-4 border-b border-amber-500/20 pb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="block text-base font-bold text-amber-400">Authorization Required</span>
                  <span className="block text-xs text-amber-500/70">Outside of current autonomy bounds</span>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-lg font-black text-[#D8F040] opacity-50">+{result.quest.xp_reward} XP</span>
                  <span className="text-xs text-amber-500/70">Pending Approval</span>
                </div>
              </div>
              <p className="text-lg text-white font-semibold mb-2">{result.quest.title}</p>
              <p className="text-sm text-neutral-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 mb-4">{result.quest.reason}</p>
              <button onClick={() => {
                const tabs = document.querySelectorAll('button[role="tab"]');
                const approvalsTab = Array.from(tabs).find(t => t.textContent?.includes('Approvals')) as HTMLButtonElement;
                if(approvalsTab) approvalsTab.click();
              }} className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold rounded-xl text-sm transition-all cursor-pointer">
                Review Request in Approvals →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Mission Log Tab ───────────────────────────────────────────────────────────

function LogTab() {
  const { teammate } = useAuth();
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    if (!teammate) return;
    getMissions(teammate.id)
      .then((r) => { setMissions(r.missions); setNextCursor(r.next_cursor); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [teammate]);

  const handleLoadMore = () => {
    if (!teammate || !nextCursor) return;
    getMissions(teammate.id, nextCursor)
      .then((r) => { 
        setMissions(prev => [...prev, ...r.missions]); 
        setNextCursor(r.next_cursor); 
      })
      .catch(() => {});
  };

  if (isLoading) return (
    <div className="p-6 flex items-center gap-3 text-neutral-400 text-sm">
      <div className="w-4 h-4 rounded-full border-2 border-neutral-600 border-t-neutral-300 animate-spin" />
      Loading missions...
    </div>
  );

  if (missions.length === 0) return (
    <div className="p-6 text-center">
      <ListChecks className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
      <p className="text-neutral-400 text-sm">No missions yet.</p>
      <p className="text-neutral-500 text-xs mt-1">Run your first mission to see it here.</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-lg">
          <ListChecks className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-brand font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 tracking-tight">Mission Log</h2>
          <p className="text-base text-neutral-400">History of all executed tasks and operations</p>
        </div>
      </div>
      <div className="space-y-4">
        {missions.map((m) => (
          <div key={m.id} className="p-5 bg-[#0D111C]/80 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 hover:bg-[#141B2D]/80 transition-all group">
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="text-base font-semibold text-white line-clamp-1 group-hover:text-[#1842FF] transition-colors">{m.title}</p>
              <span className={`shrink-0 text-xs px-3 py-1 rounded-full font-bold shadow-sm ${
                m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                m.status === 'completed_with_errors' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-neutral-800/50 text-neutral-400 border border-white/10'
              }`}>{m.status.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-sm text-neutral-400 mb-4 leading-relaxed whitespace-pre-wrap">{m.summary}</p>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 border-t border-white/5 pt-3">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {m.xp_awarded > 0 && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#D8F040]/10 rounded-md text-[#D8F040] shadow-sm">
                  <Star className="w-3 h-3" />
                  +{m.xp_awarded} XP
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {nextCursor && (
        <button onClick={handleLoadMore} className="w-full mt-6 py-3.5 text-sm font-semibold text-neutral-400 hover:text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
          Load more missions
        </button>
      )}
    </div>
  );
}

// ── Approve Tab ───────────────────────────────────────────────────────────────

function ApproveTab({ onQuestResolved }: { onQuestResolved: () => void }) {
  const { teammate } = useAuth();
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const load = () => {
    if (!teammate) return;
    setIsLoading(true);
    getQuests(teammate.id, 'pending')
      .then(setQuests)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [teammate]);

  const handleApprove = async (questId: number) => {
    setProcessingId(questId);
    try {
      await approveQuest(questId);
      setQuests((prev) => prev.filter((q) => q.id !== questId));
      onQuestResolved();
    } catch (e: any) { 
      alert("Failed to approve quest: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (questId: number) => {
    setProcessingId(questId);
    try {
      await rejectQuest(questId);
      setQuests((prev) => prev.filter((q) => q.id !== questId));
      onQuestResolved();
    } catch (e: any) {
      alert("Failed to reject quest: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return (
    <div className="p-6 flex items-center gap-3 text-neutral-400 text-sm">
      <div className="w-4 h-4 rounded-full border-2 border-neutral-600 border-t-neutral-300 animate-spin" />
      Loading...
    </div>
  );

  if (quests.length === 0) return (
    <div className="p-6 text-center">
      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
      <p className="text-neutral-400 text-sm">No pending approvals.</p>
      <p className="text-neutral-500 text-xs mt-1">Your teammate is operating within approved bounds.</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-b border-amber-500/20 pb-6 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]">
          <Shield className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-3xl font-brand font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 tracking-tight">Pending Approvals</h2>
          <p className="text-base text-neutral-400">These actions need your sign-off before your teammate can proceed.</p>
        </div>
      </div>
      
      <div className="space-y-4">
      {quests.map((q) => (
        <div key={q.id} className="p-6 bg-gradient-to-br from-amber-950/40 to-[#080A0F] border border-amber-500/30 rounded-2xl shadow-xl transition-all hover:border-amber-500/50">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white mb-2">{q.title}</p>
              <p className="text-sm text-neutral-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">{q.reason}</p>
            </div>
            <div className="shrink-0 flex flex-col items-end">
              <span className="text-lg font-black text-[#D8F040] drop-shadow-[0_0_10px_rgba(216,240,64,0.3)]">+{q.xp_reward} XP</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500/70 mt-1">Reward</span>
            </div>
          </div>
          {q.systems.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 ml-12">
              {q.systems.map((s) => (
                <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-neutral-300 capitalize flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-3 ml-12 border-t border-amber-500/20 pt-5">
            <button
              onClick={() => handleApprove(q.id)}
              disabled={processingId === q.id}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2"
            >
              {processingId === q.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {processingId === q.id ? 'Approving...' : 'Authorize Action'}
            </button>
            <button
              onClick={() => handleReject(q.id)}
              disabled={processingId === q.id}
              className="flex-1 py-3 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 disabled:opacity-50 text-red-200 text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98]"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

// ── Progress Tab ──────────────────────────────────────────────────────────────

function ProgressTab() {
  const { teammate, autonomyLevels, refreshTeammate } = useAuth();
  const [isSettingLevel, setIsSettingLevel] = useState(false);

  if (!teammate) return null;

  const currentLevelIdx = autonomyLevels.findIndex((l) => l.id === teammate.current_level.id);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1842FF]/30 to-[#D8F040]/30 flex items-center justify-center border border-white/10 shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-brand font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 tracking-tight">Progress & Trust</h2>
          <p className="text-base text-neutral-400">Track your AI's growth, efficiency, and autonomous capabilities</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Missions', value: teammate.total_missions_completed, icon: '🎯' },
          { label: 'Hours saved', value: `${teammate.hours_saved.toFixed(1)}h`, icon: '⏱️' },
          { label: 'Streak', value: `${teammate.streak_days}d`, icon: '🔥' },
          { label: 'Accuracy', value: `${teammate.accuracy_rate.toFixed(0)}%`, icon: '✓' },
        ].map((stat) => (
          <div key={stat.label} className="p-5 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg hover:border-white/20 transition-all group hover:-translate-y-1">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Level ladder */}
      <div>
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Star className="w-5 h-5 text-[#D8F040]" />
          Autonomy Ladder
        </h3>
        <div className="space-y-4">
          {autonomyLevels.map((level, idx) => {
            const isCurrent = level.id === teammate.current_level.id;
            const isUnlocked = idx <= currentLevelIdx;
            const xpNeeded = !isUnlocked ? level.required_xp - teammate.current_xp : 0;

            return (
              <div
                key={level.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-opacity-50 shadow-[0_0_30px_-10px_rgba(var(--level-color-rgb),0.3)]'
                    : isUnlocked
                    ? 'bg-white/5 border-white/10'
                    : 'bg-[#080A0F] border-white/5 opacity-60'
                }`}
                style={isCurrent ? {
                  backgroundColor: level.color + '15',
                  borderColor: level.color + '50',
                  ['--level-color-rgb' as any]: level.color
                } : {}}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 shadow-inner ${
                      isUnlocked ? '' : 'bg-white/5 text-neutral-600'
                    }`}
                    style={isUnlocked ? { backgroundColor: level.color + '25', color: level.color, border: `1px solid ${level.color}40` } : {}}
                  >
                    {isUnlocked ? (isCurrent ? '★' : '✓') : level.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className={`text-xl font-extrabold ${isUnlocked ? 'text-white' : 'text-neutral-500'}`}>
                        {level.name}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-sm" style={{ backgroundColor: level.color + '30', color: level.color }}>
                          Current Level
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${isUnlocked ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {isUnlocked ? level.tagline : `${xpNeeded} XP needed to unlock`}
                    </p>
                  </div>
                  {isCurrent && (
                    <div className="text-right shrink-0 bg-black/20 p-3 rounded-xl border border-white/5">
                      <p className="text-sm font-black text-white">{teammate.current_xp} <span className="text-neutral-500 font-medium text-xs">XP</span></p>
                      {teammate.next_level_xp && (
                        <p className="text-xs font-semibold text-neutral-500 mt-0.5">/ {teammate.next_level_xp} to next</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Dev level slider */}
                {isCurrent && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <XpBar xp={teammate.current_xp} nextLevelXp={teammate.next_level_xp} levelColor={level.color} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dev controls */}
        <div className="mt-4 p-4 bg-white/2 border border-dashed border-white/10 rounded-xl">
          <p className="text-xs text-neutral-500 mb-3">Dev: Simulate level</p>
          <div className="flex gap-2 flex-wrap">
            {autonomyLevels.map((level) => (
              <button
                key={level.id}
                disabled={isSettingLevel || level.id === teammate.current_level.id}
                onClick={async () => {
                  setIsSettingLevel(true);
                  try {
                    const updated = await devSetLevel(teammate.id, level.id);
                    // Refresh teammate via context
                    await refreshTeammate();
                  } catch { } finally {
                    setIsSettingLevel(false);
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  level.id === teammate.current_level.id
                    ? 'opacity-30 cursor-not-allowed'
                    : 'bg-white/8 hover:bg-white/15 text-neutral-300'
                }`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Console ──────────────────────────────────────────────────────────────

export function Console({ onSignOut }: ConsoleProps) {
  const { teammate, refreshTeammate, previousLevelId, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('run');
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [levelUpData, setLevelUpData] = useState<{
    name: string; color: string; tagline: string; unlocked: string[];
  } | null>(null);

  useEffect(() => {
    if (!teammate) return;
    getQuests(teammate.id, 'pending')
      .then((r) => setPendingApprovals(r.length))
      .catch(() => {});
  }, [teammate]);

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  const handleMissionComplete = async () => {
    const fresh = await refreshTeammate();
    if (fresh && fresh.current_level.id > previousLevelId) {
      setLevelUpData({
        name: fresh.current_level.name,
        color: fresh.current_level.color,
        tagline: fresh.current_level.tagline,
        unlocked: fresh.current_level.unlocked_permissions,
      });
    }
  };

  const handleQuestResolved = async () => {
    const fresh = await refreshTeammate();
    if (fresh && fresh.current_level.id > previousLevelId) {
      setLevelUpData({
        name: fresh.current_level.name,
        color: fresh.current_level.color,
        tagline: fresh.current_level.tagline,
        unlocked: fresh.current_level.unlocked_permissions,
      });
    }
    setPendingApprovals((prev) => Math.max(0, prev - 1));
  };

  if (!teammate) return (
    <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#1842FF] border-t-transparent animate-spin" />
        <span className="text-neutral-400 text-sm">Restoring your workspace…</span>
      </div>
    </div>
  );

  const level = teammate.current_level;

  const tabs: { id: Tab; label: string; badge?: number; icon: React.ReactNode }[] = [
    { id: 'run', label: 'Run Mission', icon: <Send className="w-4 h-4" /> },
    { id: 'log', label: 'Activity Log', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'approve', label: 'Approvals', badge: pendingApprovals || undefined, icon: <Shield className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress & Levels', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080A0F] bg-grid-white-subtle text-white flex flex-col relative overflow-hidden font-body">
      
      {/* Ambient glowing background blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1842FF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#D8F040]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Level-up overlay */}
      {levelUpData && (
        <LevelUpOverlay
          levelName={levelUpData.name}
          levelColor={levelUpData.color}
          tagline={levelUpData.tagline}
          unlockedPermissions={levelUpData.unlocked}
          onDismiss={() => setLevelUpData(null)}
        />
      )}

      {/* Top nav */}
      <header className="border-b border-white/5 glass-panel sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <CrewmateMark size={24} variant="color" />
            <span className="font-brand font-extrabold text-lg tracking-wide text-white">Crewmate</span>
          </div>

          {/* Teammate + XP centered block */}
          <div className="flex-1 max-w-lg hidden md:flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 shadow-inner backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"
              style={{ backgroundColor: level.color + '20', color: level.color, border: `1px solid ${level.color}40` }}>
              {teammate.avatar_seed}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm font-bold text-white">{teammate.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: level.color + '20', color: level.color }}>
                    {level.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-neutral-400">
                  {teammate.current_xp} {teammate.next_level_xp ? `/ ${teammate.next_level_xp}` : '(Max)'} XP
                </span>
              </div>
              <XpBar xp={teammate.current_xp} nextLevelXp={teammate.next_level_xp} levelColor={level.color} />
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/10"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-2 border-t border-white/5 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3 px-5 text-sm font-semibold transition-all cursor-pointer rounded-t-xl flex items-center gap-2 overflow-hidden group ${
                activeTab === tab.id
                  ? 'text-white bg-white/5'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/2'
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1842FF] to-[#D8F040]" />
              )}
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[10px] font-black shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12">
          {activeTab === 'run' && (
            <RunTab
              onMissionComplete={handleMissionComplete}
              onQuestCreated={() => { setPendingApprovals((p) => p + 1); setActiveTab('approve'); }}
            />
          )}
        {activeTab === 'log' && <LogTab />}
        {activeTab === 'approve' && <ApproveTab onQuestResolved={handleQuestResolved} />}
        {activeTab === 'progress' && <ProgressTab />}
        </div>
      </main>
    </div>
  );
}
