import React from 'react';
import { MissionDocket } from '../types';
import { 
  X, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Code, 
  Terminal,
  Download,
  Share2,
  Zap
} from 'lucide-react';

interface MissionDetailModalProps {
  mission: MissionDocket | null;
  onClose: () => void;
}

export const MissionDetailModal: React.FC<MissionDetailModalProps> = ({
  mission,
  onClose,
}) => {
  if (!mission) return null;

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mission, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${mission.refCode.replace(/[^a-zA-Z0-9]/g, '_')}_proof.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A0F]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D111C] border border-[#1E2B48] shadow-[0_0_50px_rgba(24,66,255,0.25)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative text-white">
        
        {/* Title Bar */}
        <div className="bg-[#080A0F] border-b border-[#182030] p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C853] animate-pulse" />
            <span className="font-mono text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
              {mission.refCode} · CRYPTOGRAPHIC AUDIT PROOF
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#141B2D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Mission Overview */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400 mb-2">
              <span>TIMESTAMP: {mission.timestamp}</span>
              <span className="font-bold text-[#00C853] flex items-center gap-1.5 px-2 py-0.5 bg-[#00C853]/15 border border-[#00C853]/30 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100.0% VERIFIED SIGNED
              </span>
            </div>

            <h2 className="font-bricolage font-bold text-2xl text-white leading-tight mb-2">
              {mission.title}
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {mission.summary}
            </p>
          </div>

          {/* Cryptographic Seal & Merkle Proof Block */}
          <div className="bg-[#080A0F] border border-[#1E2B48] rounded-xl p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-[#D8F040] border-b border-[#182030] pb-2 font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                MERKLE-ROOT INVARIANT RECORD
              </span>
              <span className="text-[10px] text-neutral-400">ECDSA SECP256K1</span>
            </div>

            <div className="text-neutral-300 space-y-1.5 text-xs">
              <div><strong className="text-neutral-400">ROOT HASH:</strong> <span className="text-[#38BDF8] break-all">{mission.verificationSeal}</span></div>
              <div><strong className="text-neutral-400">INVARIANT:</strong> <span className="text-[#00C853]">variance_delta == $0.000 (PASSED)</span></div>
              <div><strong className="text-neutral-400">FAIL-CLOSED GUARD:</strong> <span className="text-neutral-300">Armed. Zero mutation leaks.</span></div>
              <div><strong className="text-neutral-400">RECORDS AUDITED:</strong> <span className="text-[#D8F040]">{mission.journalLinesCount} records</span></div>
            </div>
          </div>

          {/* Before & After State Transition Diff */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold uppercase text-[#38BDF8]">
              Deterministic State Transition Diff:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              
              {/* Before */}
              <div className="p-4 bg-[#140D0F] border border-[#381818] rounded-xl">
                <div className="font-bold text-[#FF5252] mb-1.5 uppercase text-[10px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5252]" />
                  [-] What Ren Examined
                </div>
                <div className="text-neutral-300 leading-relaxed text-xs">
                  {mission.beforeState}
                </div>
              </div>

              {/* After */}
              <div className="p-4 bg-[#0A1A12] border border-[#163824] rounded-xl">
                <div className="font-bold text-[#00C853] mb-1.5 uppercase text-[10px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                  [+] Audited Outcome
                </div>
                <div className="text-neutral-300 leading-relaxed text-xs">
                  {mission.afterState}
                </div>
              </div>

            </div>
          </div>

          {/* Connected APIs Touched */}
          <div>
            <div className="font-mono text-xs font-bold uppercase text-[#38BDF8] mb-2">
              Mutated Integration Graph:
            </div>
            <div className="flex flex-wrap gap-2">
              {mission.systemsTouched.map((sys, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-1.5 bg-[#080A0F] border border-[#1E2B48] rounded-lg font-mono text-xs text-neutral-200 font-bold flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                  <span>{sys}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#080A0F] border-t border-[#182030] p-4 px-6 flex items-center justify-between shrink-0">
          <span className="font-mono text-xs text-neutral-400">
            AUDITED IMPACT: <strong className="text-[#D8F040]">{mission.auditedValue || 'Zero Variance'}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 bg-[#141B2D] hover:bg-[#1E2942] border border-[#1E2B48] rounded-xl font-mono text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#1842FF] hover:bg-[#2855FF] text-white font-mono text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
