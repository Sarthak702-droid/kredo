import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MSMEProfile, CreditScoreDetails, SimulatorVariables } from '../types';

interface ScoreExplainabilityProps {
  profile: MSMEProfile;
  scoreDetails: CreditScoreDetails;
  variables: SimulatorVariables;
}

export const ScoreExplainability: React.FC<ScoreExplainabilityProps> = ({
  profile,
  scoreDetails,
  variables,
}) => {
  const [open, setOpen] = useState(true);
  const isMicroMerchant = profile.employeeCount === 0;

  const weights = isMicroMerchant
    ? { gst: 30, upi: 35, bank: 35, epfo: 0 }
    : { gst: 25, upi: 25, bank: 30, epfo: 20 };

  const bars = [
    { label: 'GST Compliance', score: scoreDetails.subScores.gstCompliance, weight: weights.gst },
    { label: 'UPI Flow Stability', score: scoreDetails.subScores.upiFlowStability, weight: weights.upi },
    { label: 'Banking Liquidity', score: scoreDetails.subScores.bankingLiquidity, weight: weights.bank },
    {
      label: isMicroMerchant ? 'EPFO (N/A — micro)' : 'Payroll Consistency',
      score: isMicroMerchant ? null : scoreDetails.subScores.payrollConsistency,
      weight: weights.epfo,
    },
  ];

  const factors: string[] = [];
  if (variables.gstDelayedFilingsRatio === 0) factors.push('Perfect GST filing record (+compliance)');
  if (variables.upiFailureRate < 1) factors.push(`Low UPI failure rate (${variables.upiFailureRate}%)`);
  if (variables.bankBounceCount6M === 0) factors.push('Zero cheque bounces in 6 months');
  scoreDetails.riskFlags.slice(0, 2).forEach((flag) => factors.push(`⚠ ${flag}`));

  return (
    <div id="score-explainability" className="mt-4 border border-stitch-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stitch-dark/60 text-left hover:bg-stitch-dark transition-colors"
      >
        <span className="text-xs font-mono font-semibold text-stitch-green uppercase">
          Why score = {scoreDetails.totalScore}?
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-stitch-card/40">
          {bars.map(({ label, score, weight }) => (
            <div key={label}>
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono mb-1">
                <span>{label}</span>
                <span>
                  {score !== null ? `${score}/100` : 'N/A'} · weight {weight}%
                </span>
              </div>
              {score !== null && (
                <div className="h-2 bg-stitch-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stitch-green rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
              )}
            </div>
          ))}
          {factors.length > 0 && (
            <ul className="text-[10px] text-zinc-400 space-y-1 pt-2 border-t border-stitch-border">
              {factors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
