import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';
import { CreditScoreDetails } from '../types';

interface NtcComparisonPanelProps {
  scoreDetails: CreditScoreDetails;
}

export const NtcComparisonPanel: React.FC<NtcComparisonPanelProps> = ({ scoreDetails }) => {
  const traditionalRows = [
    'No audited financial statements',
    'No collateral or property docs',
    'No credit bureau history',
  ];

  const kredoRows = [
    'GST + UPI turnover verified (6 months)',
    'Account Aggregator bank liquidity tracked',
    'Behavioral credit score from alternate data',
  ];

  const capLabel =
    scoreDetails.approvedLimit > 0
      ? `Grade ${scoreDetails.riskGrade} — ₹${(scoreDetails.approvedLimit / 100000).toFixed(1)}L cap`
      : 'High risk — manual review required';

  return (
    <div
      id="ntc-comparison-panel"
      className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-4">
        <h4 className="text-xs font-semibold text-rose-300 font-mono uppercase mb-3">
          Traditional Doc-Only Assessment
        </h4>
        <ul className="space-y-2">
          {traditionalRows.map((row) => (
            <li key={row} className="flex items-start gap-2 text-xs text-zinc-300">
              <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              {row}
            </li>
          ))}
        </ul>
        <div className="mt-3 text-sm font-bold text-rose-400">Result: REJECTED</div>
      </div>

      <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4">
        <h4 className="text-xs font-semibold text-emerald-300 font-mono uppercase mb-3">
          Kredo Alternate Data Assessment
        </h4>
        <ul className="space-y-2">
          {kredoRows.map((row) => (
            <li key={row} className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              {row}
            </li>
          ))}
        </ul>
        <div className="mt-3 text-sm font-bold text-emerald-400">Result: {capLabel}</div>
      </div>
    </div>
  );
};
