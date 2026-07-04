export type DemoRole = 'MSME' | 'LENDER';

export interface DemoStep {
  id: number;
  title: string;
  description: string;
  msmeId?: string;
  role?: DemoRole;
  scrollToId?: string;
  highlightAppId?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 0,
    title: 'Meet an NTC Micro-Merchant',
    description:
      'Srinivasa Kirana has no audited books, no collateral, and no bureau history — a typical credit-invisible MSME.',
    msmeId: 'msme-2',
    role: 'MSME',
  },
  {
    id: 1,
    title: 'Financial Health Card',
    description:
      'Kredo aggregates GST, UPI, Account Aggregator, and EPFO data into a real-time credit passport.',
    msmeId: 'msme-2',
    role: 'MSME',
    scrollToId: 'financial-health-card',
  },
  {
    id: 2,
    title: 'Traditional vs Alternate Data',
    description:
      'See why doc-only underwriting rejects this business — and how alternate data unlocks credit.',
    msmeId: 'msme-2',
    role: 'MSME',
    scrollToId: 'ntc-comparison-panel',
  },
  {
    id: 3,
    title: 'Scoring Explainability',
    description:
      'Every score is decomposed into weighted sub-scores — transparent, auditable, regulator-friendly.',
    msmeId: 'msme-2',
    role: 'MSME',
    scrollToId: 'score-explainability',
  },
  {
    id: 4,
    title: 'Lender Underwriter View',
    description:
      'Switch to the bank side — review applications powered by alternate data intelligence.',
    role: 'LENDER',
  },
  {
    id: 5,
    title: 'NTC Loan Success Case',
    description:
      'Srinivasa Kirana was approved for ₹1.5L at 11% — enabled by UPI velocity and GST compliance.',
    role: 'LENDER',
    highlightAppId: 'app-2',
    scrollToId: 'lender-app-detail',
  },
  {
    id: 6,
    title: 'Impact at Scale',
    description:
      'Alternate data expands credit access while improving portfolio quality for lenders.',
    scrollToId: 'impact-metrics-strip',
  },
];

export const GITHUB_REPO_URL = 'https://github.com/Sarthak702-droid/kredo';
