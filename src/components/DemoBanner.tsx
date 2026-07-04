import React from 'react';
import { Trophy, Github, Play, Compass } from 'lucide-react';
import { GITHUB_REPO_URL } from '../demo/demoSteps';

interface DemoBannerProps {
  onStartDemo: () => void;
  onExploreFreely: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onStartDemo, onExploreFreely }) => (
  <div className="bg-gradient-to-r from-emerald-950/80 via-stitch-dark to-stitch-dark border-b border-stitch-green/30 px-6 py-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <Trophy className="h-6 w-6 text-stitch-green shrink-0 mt-0.5" />
        <div>
          <h2 className="font-display text-sm font-bold text-white">
            IDBI Innovate 2026 — Track 03 Demo
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            AI-driven MSME Financial Health Card · GST · UPI · AA · EPFO
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onStartDemo}
          className="inline-flex items-center gap-1.5 bg-stitch-green text-black text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Play className="h-3.5 w-3.5" />
          Start 3-Min Demo
        </button>
        <button
          type="button"
          onClick={onExploreFreely}
          className="inline-flex items-center gap-1.5 bg-stitch-card border border-stitch-border text-zinc-300 text-xs font-semibold px-4 py-2 rounded-xl hover:text-white transition-colors"
        >
          <Compass className="h-3.5 w-3.5" />
          Explore Freely
        </button>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-stitch-card border border-stitch-border text-zinc-300 text-xs font-semibold px-4 py-2 rounded-xl hover:text-white transition-colors"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </a>
      </div>
    </div>
  </div>
);
