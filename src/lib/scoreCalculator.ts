import {
  MSMEProfile,
  FinancialMetrics,
  CreditScoreDetails,
  SubScores,
  SimulatorVariables,
  GSTFiling,
  UPIMetrics,
  BankMetrics,
  EPFOMetrics
} from '../types';

// Default static list of 4 diverse MSME profiles for Kredo MVP
export const DEFAULT_MSMES: MSMEProfile[] = [
  {
    id: 'msme-1',
    name: 'Vardhaman Garments Ltd.',
    gstNumber: '29AAACV5489B1ZX',
    upiId: 'vardhamangarments@okaxis',
    aaConsentId: 'CONS-AA-9921-A8',
    epfoId: 'MH/BAN/0045129/000',
    sector: 'Apparel & Textiles Manufacturing',
    location: 'Surat, Gujarat',
    establishedYear: 2018,
    employeeCount: 22
  },
  {
    id: 'msme-2',
    name: 'Srinivasa Kirana & Provisions',
    gstNumber: '36ABCDE1234F1Z0',
    upiId: 'srinivasastore@ybl',
    aaConsentId: 'CONS-AA-5512-C3',
    epfoId: '', // Micro-merchant with no employees
    sector: 'Retail Grocery & FMCG',
    location: 'Nellore, Andhra Pradesh',
    establishedYear: 2015,
    employeeCount: 0 // Micro business
  },
  {
    id: 'msme-3',
    name: 'Aura Digital Solutions',
    gstNumber: '27AABCA9876C1Z9',
    upiId: 'auradigital@okicici',
    aaConsentId: 'CONS-AA-4431-K2',
    epfoId: 'DL/CPM/0091234/000',
    sector: 'IT Services & Tech Agency',
    location: 'Noida, Uttar Pradesh',
    establishedYear: 2021,
    employeeCount: 12
  },
  {
    id: 'msme-4',
    name: 'Apex Logistics & Transport',
    gstNumber: '24KKKDD4321A1Z5',
    upiId: 'apexlogistics@okhdfc',
    aaConsentId: 'CONS-AA-8812-X5',
    epfoId: 'MH/PUN/0022331/000',
    sector: 'Logistics, Supply Chain & Transport',
    location: 'Pune, Maharashtra',
    establishedYear: 2019,
    employeeCount: 35
  }
];

// Historical metrics for the 4 default MSMEs over the last 6 months (Jan - Jun)
export const DEFAULT_METRICS: Record<string, FinancialMetrics> = {
  'msme-1': {
    gstFilings: [
      { month: 'Jan', amount: 340000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Feb', amount: 310000, delayedDays: 1, filingStatus: 'FILED_ON_TIME' },
      { month: 'Mar', amount: 420000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Apr', amount: 390000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'May', amount: 360000, delayedDays: 3, filingStatus: 'FILED_LATE' },
      { month: 'Jun', amount: 410000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' }
    ],
    upiMetrics: [
      { month: 'Jan', count: 450, totalVolume: 125000, averageTicketSize: 277, failureRate: 0.8 },
      { month: 'Feb', count: 420, totalVolume: 118000, averageTicketSize: 280, failureRate: 1.1 },
      { month: 'Mar', count: 520, totalVolume: 145000, averageTicketSize: 278, failureRate: 0.6 },
      { month: 'Apr', count: 490, totalVolume: 135000, averageTicketSize: 275, failureRate: 0.9 },
      { month: 'May', count: 480, totalVolume: 132000, averageTicketSize: 275, failureRate: 1.5 },
      { month: 'Jun', count: 530, totalVolume: 152000, averageTicketSize: 286, failureRate: 0.7 }
    ],
    bankMetrics: [
      { month: 'Jan', avgBalance: 120000, bounceCount: 0, creditDebitRatio: 1.05, overdraftUtilization: 10 },
      { month: 'Feb', avgBalance: 98000, bounceCount: 0, creditDebitRatio: 1.02, overdraftUtilization: 25 },
      { month: 'Mar', avgBalance: 145000, bounceCount: 0, creditDebitRatio: 1.08, overdraftUtilization: 0 },
      { month: 'Apr', avgBalance: 110000, bounceCount: 1, creditDebitRatio: 0.98, overdraftUtilization: 35 },
      { month: 'May', avgBalance: 115000, bounceCount: 0, creditDebitRatio: 1.04, overdraftUtilization: 20 },
      { month: 'Jun', avgBalance: 135000, bounceCount: 0, creditDebitRatio: 1.10, overdraftUtilization: 5 }
    ],
    epfoMetrics: [
      { month: 'Jan', activeEmployees: 22, delayedDays: 0, totalContribution: 44000 },
      { month: 'Feb', activeEmployees: 22, delayedDays: 0, totalContribution: 44000 },
      { month: 'Mar', activeEmployees: 22, delayedDays: 0, totalContribution: 44000 },
      { month: 'Apr', activeEmployees: 22, delayedDays: 0, totalContribution: 44000 },
      { month: 'May', activeEmployees: 22, delayedDays: 2, totalContribution: 44000 },
      { month: 'Jun', activeEmployees: 22, delayedDays: 0, totalContribution: 44000 }
    ]
  },
  'msme-2': {
    gstFilings: [
      { month: 'Jan', amount: 80000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Feb', amount: 85000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Mar', amount: 90000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Apr', amount: 78000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'May', amount: 82000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Jun', amount: 88000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' }
    ],
    upiMetrics: [
      { month: 'Jan', count: 1850, totalVolume: 320000, averageTicketSize: 172, failureRate: 0.4 },
      { month: 'Feb', count: 1920, totalVolume: 340000, averageTicketSize: 177, failureRate: 0.3 },
      { month: 'Mar', count: 2100, totalVolume: 380000, averageTicketSize: 180, failureRate: 0.2 },
      { month: 'Apr', count: 1780, totalVolume: 310000, averageTicketSize: 174, failureRate: 0.5 },
      { month: 'May', count: 1890, totalVolume: 330000, averageTicketSize: 174, failureRate: 0.4 },
      { month: 'Jun', count: 2050, totalVolume: 365000, averageTicketSize: 178, failureRate: 0.3 }
    ],
    bankMetrics: [
      { month: 'Jan', avgBalance: 65000, bounceCount: 0, creditDebitRatio: 1.01, overdraftUtilization: 0 },
      { month: 'Feb', avgBalance: 72000, bounceCount: 0, creditDebitRatio: 1.03, overdraftUtilization: 0 },
      { month: 'Mar', avgBalance: 80000, bounceCount: 0, creditDebitRatio: 1.02, overdraftUtilization: 0 },
      { month: 'Apr', avgBalance: 58000, bounceCount: 0, creditDebitRatio: 0.99, overdraftUtilization: 0 },
      { month: 'May', avgBalance: 64000, bounceCount: 0, creditDebitRatio: 1.04, overdraftUtilization: 0 },
      { month: 'Jun', avgBalance: 75000, bounceCount: 0, creditDebitRatio: 1.02, overdraftUtilization: 0 }
    ],
    epfoMetrics: [] // None, micro-merchant with 0 payroll
  },
  'msme-3': {
    gstFilings: [
      { month: 'Jan', amount: 550000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Feb', amount: 580000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Mar', amount: 720000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Apr', amount: 610000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'May', amount: 590000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' },
      { month: 'Jun', amount: 640000, delayedDays: 0, filingStatus: 'FILED_ON_TIME' }
    ],
    upiMetrics: [
      { month: 'Jan', count: 48, totalVolume: 180000, averageTicketSize: 3750, failureRate: 0.1 },
      { month: 'Feb', count: 52, totalVolume: 195000, averageTicketSize: 3750, failureRate: 0.2 },
      { month: 'Mar', count: 68, totalVolume: 255000, averageTicketSize: 3750, failureRate: 0.1 },
      { month: 'Apr', count: 58, totalVolume: 215000, averageTicketSize: 3706, failureRate: 0.3 },
      { month: 'May', count: 55, totalVolume: 206000, averageTicketSize: 3745, failureRate: 0.2 },
      { month: 'Jun', count: 60, totalVolume: 228000, averageTicketSize: 3800, failureRate: 0.1 }
    ],
    bankMetrics: [
      { month: 'Jan', avgBalance: 420000, bounceCount: 0, creditDebitRatio: 1.15, overdraftUtilization: 5 },
      { month: 'Feb', avgBalance: 460000, bounceCount: 0, creditDebitRatio: 1.10, overdraftUtilization: 2 },
      { month: 'Mar', avgBalance: 590000, bounceCount: 0, creditDebitRatio: 1.25, overdraftUtilization: 0 },
      { month: 'Apr', avgBalance: 490000, bounceCount: 0, creditDebitRatio: 0.95, overdraftUtilization: 8 },
      { month: 'May', avgBalance: 510000, bounceCount: 0, creditDebitRatio: 1.05, overdraftUtilization: 5 },
      { month: 'Jun', avgBalance: 550000, bounceCount: 0, creditDebitRatio: 1.12, overdraftUtilization: 0 }
    ],
    epfoMetrics: [
      { month: 'Jan', activeEmployees: 11, delayedDays: 0, totalContribution: 28500 },
      { month: 'Feb', activeEmployees: 11, delayedDays: 0, totalContribution: 28500 },
      { month: 'Mar', activeEmployees: 12, delayedDays: 0, totalContribution: 31000 },
      { month: 'Apr', activeEmployees: 12, delayedDays: 0, totalContribution: 31000 },
      { month: 'May', activeEmployees: 12, delayedDays: 0, totalContribution: 31000 },
      { month: 'Jun', activeEmployees: 12, delayedDays: 0, totalContribution: 31000 }
    ]
  },
  'msme-4': {
    gstFilings: [
      { month: 'Jan', amount: 820000, delayedDays: 14, filingStatus: 'FILED_LATE' },
      { month: 'Feb', amount: 790000, delayedDays: 19, filingStatus: 'FILED_LATE' },
      { month: 'Mar', amount: 950000, delayedDays: 22, filingStatus: 'FILED_LATE' },
      { month: 'Apr', amount: 880000, delayedDays: 8, filingStatus: 'FILED_LATE' },
      { month: 'May', amount: 850000, delayedDays: 15, filingStatus: 'FILED_LATE' },
      { month: 'Jun', amount: 910000, delayedDays: 28, filingStatus: 'FILED_LATE' }
    ],
    upiMetrics: [
      { month: 'Jan', count: 120, totalVolume: 95000, averageTicketSize: 791, failureRate: 4.8 },
      { month: 'Feb', count: 110, totalVolume: 88000, averageTicketSize: 800, failureRate: 5.2 },
      { month: 'Mar', count: 140, totalVolume: 110000, averageTicketSize: 785, failureRate: 6.5 },
      { month: 'Apr', count: 125, totalVolume: 98000, averageTicketSize: 784, failureRate: 3.9 },
      { month: 'May', count: 115, totalVolume: 92000, averageTicketSize: 800, failureRate: 4.2 },
      { month: 'Jun', count: 130, totalVolume: 104000, averageTicketSize: 800, failureRate: 7.1 }
    ],
    bankMetrics: [
      { month: 'Jan', avgBalance: 32000, bounceCount: 2, creditDebitRatio: 0.95, overdraftUtilization: 92 },
      { month: 'Feb', avgBalance: 24000, bounceCount: 3, creditDebitRatio: 0.94, overdraftUtilization: 98 },
      { month: 'Mar', avgBalance: 45000, bounceCount: 1, creditDebitRatio: 0.99, overdraftUtilization: 85 },
      { month: 'Apr', avgBalance: 21000, bounceCount: 4, creditDebitRatio: 0.91, overdraftUtilization: 100 },
      { month: 'May', avgBalance: 28000, bounceCount: 2, creditDebitRatio: 0.96, overdraftUtilization: 95 },
      { month: 'Jun', avgBalance: 18000, bounceCount: 5, creditDebitRatio: 0.88, overdraftUtilization: 100 }
    ],
    epfoMetrics: [
      { month: 'Jan', activeEmployees: 35, delayedDays: 8, totalContribution: 78000 },
      { month: 'Feb', activeEmployees: 34, delayedDays: 14, totalContribution: 76000 },
      { month: 'Mar', activeEmployees: 34, delayedDays: 20, totalContribution: 76000 },
      { month: 'Apr', activeEmployees: 32, delayedDays: 12, totalContribution: 71500 },
      { month: 'May', activeEmployees: 31, delayedDays: 18, totalContribution: 69000 },
      { month: 'Jun', activeEmployees: 31, delayedDays: 25, totalContribution: 69000 }
    ]
  }
};

// Convert static metrics to default simulator variables
export function extractSimulatorVariables(msme: MSMEProfile, metrics: FinancialMetrics): SimulatorVariables {
  const filings = metrics.gstFilings || [];
  const upi = metrics.upiMetrics || [];
  const bank = metrics.bankMetrics || [];
  const epfo = metrics.epfoMetrics || [];

  // 1. GST delays
  const totalDays = filings.reduce((sum, f) => sum + f.delayedDays, 0);
  const lateFilingsCount = filings.filter(f => f.delayedDays > 0).length;
  const gstDelayedFilingsRatio = filings.length > 0 ? (lateFilingsCount / filings.length) * 100 : 0;

  // 2. UPI failure rate & volume
  const avgUpiFailure = upi.length > 0 ? upi.reduce((sum, u) => sum + u.failureRate, 0) / upi.length : 0.5;
  const avgUpiVolume = upi.length > 0 ? upi.reduce((sum, u) => sum + u.totalVolume, 0) / upi.length : 100000;

  // 3. Bank balance & bounce counts
  const avgBankBalance = bank.length > 0 ? bank.reduce((sum, b) => sum + b.avgBalance, 0) / bank.length : 50000;
  const bankBounceCount6M = bank.reduce((sum, b) => sum + b.bounceCount, 0);

  // 4. EPFO delayed months & growth
  const epfoDelayDays = epfo.length > 0 ? epfo.reduce((sum, e) => sum + e.delayedDays, 0) / epfo.length : 0;
  // delay months estimate based on delayed days
  const epfoDelayMonths = Math.min(6, Math.floor(epfoDelayDays / 5));

  let headcountGrowth = 0;
  if (epfo.length >= 6) {
    const startCount = epfo[0].activeEmployees;
    const endCount = epfo[epfo.length - 1].activeEmployees;
    if (startCount > 0) {
      headcountGrowth = ((endCount - startCount) / startCount) * 100;
    }
  }

  return {
    gstDelayedFilingsRatio: Math.round(gstDelayedFilingsRatio),
    upiFailureRate: Math.round(avgUpiFailure * 10) / 10,
    upiMonthlyVolume: Math.round(avgUpiVolume),
    bankAvgBalance: Math.round(avgBankBalance),
    bankBounceCount6M,
    epfoDelayMonths: Math.round(epfoDelayMonths),
    epfoHeadcountGrowth: Math.round(headcountGrowth)
  };
}

// Compute custom credit score based on simulated variables or current values
export function calculateKredoScore(
  profile: MSMEProfile,
  vars: SimulatorVariables
): CreditScoreDetails {
  const isMicroMerchant = profile.employeeCount === 0;

  // 1. GST Score calculation (0-100)
  // GST ratio represents percentage of delayed filings in last 6M
  // Perfect compliance is 0% delay ratio.
  let gstCompliance = 100 - (vars.gstDelayedFilingsRatio * 0.7);
  gstCompliance = Math.max(20, Math.min(100, Math.round(gstCompliance)));

  // 2. UPI Flow stability (0-100)
  // High failure rate harms score. High volume boosts it.
  let upiFlowStability = 100 - (vars.upiFailureRate * 5); // 10% failure rate = -50 points
  
  // Volume boost
  const volumeInLakhs = vars.upiMonthlyVolume / 100000;
  const volumeBoost = Math.min(20, volumeInLakhs * 4); // Boost up to 20 points
  upiFlowStability += volumeBoost;
  upiFlowStability = Math.max(10, Math.min(100, Math.round(upiFlowStability)));

  // 3. Banking liquidity score (0-100)
  // High bounce count severely penalizes. High average balance boosts.
  let bankingLiquidity = 50; // base score
  
  // Balance calculation (capped at 5 Lakhs for high score)
  const balanceFactor = Math.min(50, (vars.bankAvgBalance / 500000) * 50);
  bankingLiquidity += balanceFactor;

  // Bounce penalty
  const bouncePenalty = vars.bankBounceCount6M * 12; // 5 bounces = -60 points
  bankingLiquidity -= bouncePenalty;
  bankingLiquidity = Math.max(10, Math.min(100, Math.round(bankingLiquidity)));

  // 4. Payroll consistency (0-100)
  // Only computed if not a micro merchant.
  let payrollConsistency = 100;
  if (!isMicroMerchant) {
    payrollConsistency -= (vars.epfoDelayMonths * 20); // 3 months delay = -60 points
    
    // Headcount growth adjustment
    const headcountAdjustment = vars.epfoHeadcountGrowth * 0.5; // e.g. +20% growth = +10 points
    payrollConsistency += headcountAdjustment;
    payrollConsistency = Math.max(10, Math.min(100, Math.round(payrollConsistency)));
  } else {
    payrollConsistency = 100; // placeholder, weight will be 0
  }

  // Define weights
  const subScores: SubScores = {
    gstCompliance,
    upiFlowStability,
    bankingLiquidity,
    payrollConsistency
  };

  let weightedSubscore = 0;
  if (isMicroMerchant) {
    // Redistribute EPFO weight to UPI and Banking for Micro Merchants
    weightedSubscore = (gstCompliance * 0.3) + (upiFlowStability * 0.35) + (bankingLiquidity * 0.35);
  } else {
    weightedSubscore = (gstCompliance * 0.25) + (upiFlowStability * 0.25) + (bankingLiquidity * 0.3) + (payrollConsistency * 0.2);
  }

  // Scale score between 300 and 900
  // weightedSubscore is 0-100.
  // 300 + (weightedSubscore * 6) => 300 to 900.
  const totalScore = Math.max(300, Math.min(900, Math.round(300 + (weightedSubscore * 6))));

  // Determine Risk Grade
  let riskGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'HR' = 'C';
  if (totalScore >= 820) riskGrade = 'A+';
  else if (totalScore >= 740) riskGrade = 'A';
  else if (totalScore >= 660) riskGrade = 'B';
  else if (totalScore >= 560) riskGrade = 'C';
  else if (totalScore >= 460) riskGrade = 'D';
  else riskGrade = 'HR';

  // Identify risk flags
  const riskFlags: string[] = [];
  if (vars.gstDelayedFilingsRatio > 50) {
    riskFlags.push('Irregular GST Filings (Over 50% delayed filings)');
  }
  if (vars.upiFailureRate > 3.5) {
    riskFlags.push(`Elevated UPI Failure Rate (${vars.upiFailureRate}%)`);
  }
  if (vars.bankBounceCount6M >= 3) {
    riskFlags.push(`Critical Bank Bounces (${vars.bankBounceCount6M} bounces in 6M)`);
  }
  if (!isMicroMerchant && vars.epfoDelayMonths >= 2) {
    riskFlags.push(`EPFO Contribution Delays (Average ${vars.epfoDelayMonths} months delay)`);
  }
  if (!isMicroMerchant && vars.epfoHeadcountGrowth < -15) {
    riskFlags.push(`Payroll Contraction (${vars.epfoHeadcountGrowth}% employee decline)`);
  }
  if (vars.bankAvgBalance < 25000) {
    riskFlags.push('Substandard Account Balance (Under INR 25,000)');
  }

  // Suggested Credit Limit & Interest Rate calculation
  // Base Limit is linked to either UPI volume or bank balances
  // Micro merchants are heavily capped on size, manufacturing/IT have larger headroom.
  const proxyRevenue = vars.upiMonthlyVolume * 1.5 + (vars.bankAvgBalance * 0.8);
  let approvedLimit = 0;
  let suggestedInterestRate = 0;

  switch (riskGrade) {
    case 'A+':
      approvedLimit = Math.round(proxyRevenue * 1.6);
      suggestedInterestRate = 9.5;
      break;
    case 'A':
      approvedLimit = Math.round(proxyRevenue * 1.25);
      suggestedInterestRate = 11.0;
      break;
    case 'B':
      approvedLimit = Math.round(proxyRevenue * 0.9);
      suggestedInterestRate = 14.0;
      break;
    case 'C':
      approvedLimit = Math.round(proxyRevenue * 0.5);
      suggestedInterestRate = 18.5;
      break;
    case 'D':
      approvedLimit = Math.round(proxyRevenue * 0.2);
      suggestedInterestRate = 24.0;
      break;
    case 'HR':
      approvedLimit = 0;
      suggestedInterestRate = 32.0; // Prohibitive/Micro-credit rates
      break;
  }

  // Cap the approved limits to standard values based on business profiles
  if (isMicroMerchant) {
    approvedLimit = Math.min(250000, approvedLimit); // Cap micro stores to 2.5 Lakhs
  } else {
    approvedLimit = Math.min(5000000, approvedLimit); // Cap larger businesses to 50 Lakhs
  }

  // Clean rounding of approvedLimit to nearest thousand
  approvedLimit = Math.round(approvedLimit / 1000) * 1000;

  // Generate score trends
  const scoreTrends = [
    { month: 'Jan', score: Math.round(totalScore * 0.97) },
    { month: 'Feb', score: Math.round(totalScore * 0.96) },
    { month: 'Mar', score: Math.round(totalScore * 0.98) },
    { month: 'Apr', score: Math.round(totalScore * 1.01) },
    { month: 'May', score: Math.round(totalScore * 0.99) },
    { month: 'Jun', score: Math.round(totalScore) }
  ].map(t => ({
    ...t,
    score: Math.max(300, Math.min(900, t.score))
  }));

  return {
    totalScore,
    riskGrade,
    subScores,
    scoreTrends,
    riskFlags,
    approvedLimit,
    suggestedInterestRate
  };
}
