import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Briefcase, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createWorkspace, createTeammate } from '../lib/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BUSINESS_TYPES = [
  'E-commerce & Retail',
  'Food & Beverage',
  'Professional Services',
  'SaaS & Technology',
  'Healthcare',
  'Education',
  'Real Estate',
  'Other',
];

const AVATAR_EMOJIS = ['🤖', '⚡', '🚀', '🎯', '💡', '🔮', '🌟', '🦾'];

const VISUAL_MARKS = [
  { value: 'triangle', label: '△' },
  { value: 'circle', label: '○' },
  { value: 'diamond', label: '◇' },
  { value: 'hexagon', label: '⬡' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { firebaseUser, backendUser, syncWithBackend, setActiveTeammate, refreshBackendUser, signOut } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 0 — Business
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [subNiche, setSubNiche] = useState('');

  // Step 1 — Teammate
  const [teammateName, setTeammateName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🤖');
  const [selectedMark, setSelectedMark] = useState('triangle');

  if (!isOpen) return null;

  const canProceedStep0 = businessName.trim().length > 0 && businessType.length > 0 && location.trim().length > 0 && subNiche.trim().length > 0;
  const canProceedStep1 = teammateName.trim().length > 0;

  const handleFinish = async () => {
    if (!canProceedStep1) return;
    setError('');
    setIsSubmitting(true);
    try {
      if (!backendUser) {
        const displayName = firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Founder';
        await syncWithBackend(displayName);
      }
      const workspace = await createWorkspace(businessName.trim(), businessType, location.trim(), subNiche.trim());
      const teammate = await createTeammate(workspace.id, {
        name: teammateName.trim(),
        avatar_seed: selectedEmoji,
        visual_mark: selectedMark,
      });
      await refreshBackendUser();
      setActiveTeammate(teammate);
      onComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080A0F] p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0D111C] border border-white/8 rounded-2xl shadow-2xl overflow-hidden my-auto">

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-[#1842FF] transition-all duration-500"
            style={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>

        <div className="p-8">
        {/* Step indicator + sign out escape */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-neutral-500">Step {step + 1} of 2</span>
            <button
              onClick={async () => { await signOut(); }}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
            >
              ← Sign out
            </button>
          </div>

          {/* Step 0 — Business Setup */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-[#1842FF]" />
                  <h2 className="text-xl font-bold text-white">Set up your workspace</h2>
                </div>
                <p className="text-neutral-400 text-sm">
                  Tell us about your business so your AI teammate can understand context.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Business name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Commerce"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#1842FF] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Business type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setBusinessType(type)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-all cursor-pointer ${
                        businessType === type
                          ? 'bg-[#1842FF] text-white'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/8'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Specific Sub Areas / Cities
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Downtown SF, Financial District..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#1842FF] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Sub Niche / Specialty
                </label>
                <input
                  type="text"
                  value={subNiche}
                  onChange={(e) => setSubNiche(e.target.value)}
                  placeholder="e.g. High-end athletic wear, B2B SaaS for dental..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#1842FF] transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 1 — Teammate Setup */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-[#1842FF]" />
                  <h2 className="text-xl font-bold text-white">Meet your teammate</h2>
                </div>
                <p className="text-neutral-400 text-sm">
                  Give your AI co-founder a name and personality.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Teammate name
                </label>
                <input
                  type="text"
                  value={teammateName}
                  onChange={(e) => setTeammateName(e.target.value)}
                  placeholder="e.g. Nova, Atlas, Sage..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#1842FF] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Avatar
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                        selectedEmoji === emoji
                          ? 'bg-[#1842FF] ring-2 ring-[#1842FF] ring-offset-2 ring-offset-[#0D111C]'
                          : 'bg-white/5 hover:bg-white/10 border border-white/8'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Symbol
                </label>
                <div className="flex gap-2">
                  {VISUAL_MARKS.map((mark) => (
                    <button
                      key={mark.value}
                      onClick={() => setSelectedMark(mark.value)}
                      className={`w-11 h-11 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                        selectedMark === mark.value
                          ? 'bg-[#1842FF] ring-2 ring-[#1842FF] ring-offset-2 ring-offset-[#0D111C]'
                          : 'bg-white/5 hover:bg-white/10 border border-white/8'
                      }`}
                    >
                      {mark.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-4 bg-white/4 rounded-xl border border-white/8">
                <div className="w-11 h-11 rounded-xl bg-[#1842FF]/20 border border-[#1842FF]/30 flex items-center justify-center text-2xl">
                  {selectedEmoji}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {teammateName || 'Your teammate'}
                  </p>
                  <p className="text-xs text-neutral-400">Level 1 · Shadow · 0 XP</p>
                </div>
                <div className="ml-auto">
                  <Sparkles className="w-4 h-4 text-[#D8F040]" />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step === 0 && (
              <button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1842FF] hover:bg-[#2855FF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.98]"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 1 && (
              <button
                onClick={handleFinish}
                disabled={!canProceedStep1 || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#D8F040] hover:bg-[#cbf026] disabled:opacity-40 disabled:cursor-not-allowed text-[#080A0F] font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#080A0F] border-t-transparent animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Launch Crewmate
                  </>
                )}
              </button>
            )}
          </div>

          {step === 0 && (
            <button
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="w-full mt-3 text-center text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer py-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
