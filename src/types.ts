export interface MSMEProfile {
  id: string;
  name: string;
  gstNumber: string;
  upiId: string;
  aaConsentId: string;
  epfoId: string;
  sector: string;
  location: string;
  establishedYear: number;
  employeeCount: number;
}

export interface GSTFiling {
  month: string;
  amount: number;
  delayedDays: number;
  filingStatus: 'FILED_ON_TIME' | 'FILED_LATE' | 'PENDING';
}

export interface UPIMetrics {
  month: string;
  count: number;
  totalVolume: number;
  averageTicketSize: number;
  failureRate: number; // percentage (e.g. 1.2%)
}

export interface BankMetrics {
  month: string;
  avgBalance: number;
  bounceCount: number; // check/mandate bounces
  creditDebitRatio: number; // e.g. 1.05
  overdraftUtilization: number; // percentage (e.g. 25%)
}

export interface EPFOMetrics {
  month: string;
  activeEmployees: number;
  delayedDays: number;
  totalContribution: number;
}

export interface FinancialMetrics {
  gstFilings: GSTFiling[];
  upiMetrics: UPIMetrics[];
  bankMetrics: BankMetrics[];
  epfoMetrics: EPFOMetrics[];
}

export interface SubScores {
  gstCompliance: number;      // 0-100
  upiFlowStability: number;   // 0-100
  bankingLiquidity: number;   // 0-100
  payrollConsistency: number; // 0-100
}

export interface CreditScoreDetails {
  totalScore: number; // 300 to 900
  riskGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'HR'; // HR = High Risk
  subScores: SubScores;
  scoreTrends: { month: string; score: number }[];
  riskFlags: string[];
  approvedLimit: number; // INR
  suggestedInterestRate: number; // percentage per annum
}

export interface UnderwritingReport {
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  cashFlowAssessment: string;
  riskMitigants: string;
  recommendedLimitINR: number;
  recommendedRatePercentage: number;
}

export interface LoanApplication {
  id: string;
  msmeId: string;
  msmeName: string;
  requestedAmount: number;
  purpose: string;
  tenureMonths: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUIRED';
  appliedAt: string;
  decidedAt: string | null;
  approvedAmount?: number;
  interestRate?: number;
  chatHistory: ChatMessage[];
  underwritingReport?: UnderwritingReport;
}

export interface ChatMessage {
  id: string;
  sender: 'MSME' | 'LENDER' | 'SYSTEM';
  message: string;
  timestamp: string;
}

export interface SimulatorVariables {
  gstDelayedFilingsRatio: number; // 0 to 100
  upiFailureRate: number; // 0 to 20 %
  upiMonthlyVolume: number; // INR
  bankAvgBalance: number; // INR
  bankBounceCount6M: number; // Count
  epfoDelayMonths: number; // 0 to 6
  epfoHeadcountGrowth: number; // percentage -50 to 150 %
}
