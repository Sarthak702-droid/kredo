import React from 'react';
import { X, ChevronRight, SkipForward } from 'lucide-react';
import { DemoStep } from '../demo/demoSteps';

interface DemoGuideProps {
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onExit: () => void;
}

export const DemoGuide: React.FC<DemoGuideProps> = ({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
  onExit,
}) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[min(100%,28rem)] mx-4">
    <div className="bg-stitch-card border border-stitch-green/40 rounded-2xl shadow-2xl shadow-black/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-stitch-green">
          DEMO · STEP {stepIndex + 1} / {totalSteps}
        </span>
        <button type="button" onClick={onExit} className="text-zinc-500 hover:text-zinc-300">
          <X className="h-4 w-4" />
        </button>
      </div>
      <h3 className="font-display font-bold text-white text-sm">{step.title}</h3>
      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.description}</p>
      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-1 bg-stitch-green text-black text-xs font-bold py-2 rounded-xl"
        >
          {stepIndex + 1 >= totalSteps ? 'Finish Demo' : 'Next'}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-2"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Skip
        </button>
      </div>
    </div>
  </div>
);
