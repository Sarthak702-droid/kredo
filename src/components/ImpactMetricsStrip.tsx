import React from 'react';
import { TrendingUp, Clock, Layers, ShieldCheck } from 'lucide-react';

export const ImpactMetricsStrip: React.FC = () => {
  const metrics = [
    { icon: TrendingUp, label: 'NTC Scorable', value: '14% → 73%', sub: 'doc-only vs alternate data' },
    { icon: Clock, label: 'Assessment Time', value: '~40% faster', sub: 'near real-time scoring' },
    { icon: Layers, label: 'Data Sources', value: '4 → 1', sub: 'GST · UPI · AA · EPFO' },
  ];

  const badges = ['RBI AA Framework', 'OCEN 1.2 Ready', 'ULI Compatible'];

  return (
    <section
      id="impact-metrics-strip"
      className="border-t border-stitch-border bg-stitch-dark/80 px-6 py-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="font-display text-lg font-bold text-white">Impact at Scale</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Expanding credit-invisible MSME onboarding while improving lender portfolio quality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="bg-stitch-card border border-stitch-border rounded-2xl p-4 text-center"
            >
              <Icon className="h-5 w-5 text-stitch-green mx-auto mb-2" />
              <div className="text-[10px] text-zinc-400 font-mono uppercase">{label}</div>
              <div className="text-xl font-bold text-white mt-1">{value}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-stitch-green bg-stitch-green/10 border border-stitch-green/20 px-3 py-1 rounded-full"
            >
              <ShieldCheck className="h-3 w-3" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
