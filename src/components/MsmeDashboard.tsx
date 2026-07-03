import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { exportMsmeHealthCardToPDF } from '../lib/pdfExporter';
import { DocumentAuditLog } from './DocumentAuditLog';
import {
  MSMEProfile,
  FinancialMetrics,
  CreditScoreDetails,
  SimulatorVariables,
  LoanApplication
} from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  FileText,
  DollarSign,
  Briefcase,
  Sliders,
  Sparkles,
  RefreshCw,
  Send,
  User,
  Clock,
  CheckCircle,
  XCircle,
  X,
  HelpCircle,
  MessageSquare,
  FileCode2,
  ChevronRight,
  Database,
  Building2,
  Bot,
  Calculator
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface MsmeDashboardProps {
  profile: MSMEProfile;
  metrics: FinancialMetrics;
  variables: SimulatorVariables;
  scoreDetails: CreditScoreDetails;
  applications: LoanApplication[];
  onUpdateSimVariables: (vars: SimulatorVariables) => Promise<any>;
  onSubmitLoan: (data: { requestedAmount: number; purpose: string; tenureMonths: number }) => Promise<any>;
  onSendChatMessage: (appId: string, message: string) => Promise<any>;
}

export const MsmeDashboard: React.FC<MsmeDashboardProps> = ({
  profile,
  metrics,
  variables,
  scoreDetails,
  applications,
  onUpdateSimVariables,
  onSubmitLoan,
  onSendChatMessage
}) => {
  const isMicroMerchant = profile.employeeCount === 0;

  // Simulator State
  const [simVars, setSimVars] = useState<SimulatorVariables>({ ...variables });
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Loan Form State
  const [loanAmount, setLoanAmount] = useState('500000');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanTenure, setLoanTenure] = useState('12');
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [loanSuccess, setLoanSuccess] = useState(false);

  // Chat State
  const [activeChatAppId, setActiveChatAppId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'CREDIT_PASSPORT' | 'AUDIT_LOG'>('CREDIT_PASSPORT');

  // Documents Audit Log State
  const [auditDocs, setAuditDocs] = useState<Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    status: 'VERIFIED' | 'VERIFYING' | 'FAILED';
    size: string;
  }>>([]);

  // Drag & Drop state
  const [dragActive, setDragActive] = useState(false);

  // Floating AI Advisor Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<Array<{ sender: 'USER' | 'AI'; message: string; timestamp: string }>>([
    {
      sender: 'AI',
      message: `Hello! I am your **Kredo AI Advisor**. I've analyzed your GST tax compliance, UPI merchant velocity, bank liquidity records, and payroll continuity profiles.
      
I can help you understand your risk flags and give you specific steps to lower your interest rate. Ask me anything, or tap one of the suggested prompts below!`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Estimator Slider States
  const [estimateAmount, setEstimateAmount] = useState(500000);
  const [estimateTenure, setEstimateTenure] = useState(12);

  // Bulk Sync State
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStep, setSyncStep] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Scroll AI messages to bottom
  useEffect(() => {
    if (isAiOpen) {
      const container = document.getElementById('ai-chat-messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, [aiHistory, isAiOpen, isAiTyping]);

  const handleBulkSync = async () => {
    setIsSyncingAll(true);
    setSyncSuccess(false);
    
    const steps = [
      'Establishing secure handshake with GSTR Tax portal...',
      'Verifying UPI Merchant Settler payment transactions...',
      'Validating multi-bank statement Account Aggregator feeds...',
      'Checking active employee EPFO payroll deposit entries...',
      'Recalculating algorithmic Kredo Financial Health indicators...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setSyncStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const res = await fetch(`/api/msmes/${profile.id}/bulk-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        // Trigger parent state update to fetch latest computed scores/metrics
        await onUpdateSimVariables({ ...simVars });
        setSyncSuccess(true);
        setLastSyncedTime(new Date().toLocaleTimeString());
        setTimeout(() => setSyncSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Bulk sync failed:", err);
    } finally {
      setIsSyncingAll(false);
      setSyncStep('');
    }
  };

  const handleSendAiMessage = async (textToSend?: string) => {
    const text = textToSend || aiMessage;
    if (!text.trim()) return;

    // Add user message to history
    const userMsg = {
      sender: 'USER' as const,
      message: text,
      timestamp: new Date().toLocaleTimeString()
    };
    setAiHistory(prev => [...prev, userMsg]);
    setAiMessage('');
    setIsAiTyping(true);

    try {
      const chatPayload = aiHistory.map(h => ({
        sender: h.sender === 'USER' ? 'USER' : 'SYSTEM',
        message: h.message
      }));

      const res = await fetch('/api/msme-ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msmeId: profile.id,
          message: text,
          chatHistory: chatPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiHistory(prev => [...prev, {
          sender: 'AI' as const,
          message: data.reply,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error('AI query failed');
      }
    } catch (err) {
      console.error(err);
      setAiHistory(prev => [...prev, {
        sender: 'AI' as const,
        message: "I apologize, but I am experiencing difficulty reaching the credit server right now. Please try again or check your network connection.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Generate 12 months of revenue data dynamically based on UPI monthly volume and sector
  const get12MonthRevenueData = () => {
    const months = ['Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26'];
    
    // Industry base averages per sector
    let industryBase = 350000;
    if (profile.sector.includes('Apparel')) industryBase = 380000;
    else if (profile.sector.includes('Retail')) industryBase = 150000;
    else if (profile.sector.includes('IT')) industryBase = 600000;
    else if (profile.sector.includes('Logistics')) industryBase = 1200000;

    // Use current simulated UPI monthly volume as base for business revenue
    const businessBase = simVars.upiMonthlyVolume || 300000;

    return months.map((month, idx) => {
      // Create some seasonal variations (e.g., peak sales in Oct/Nov/Dec festive season)
      let seasonality = 1.0;
      if (idx === 3 || idx === 4 || idx === 5) { // Oct, Nov, Dec
        seasonality = 1.25; // +25% peak
      } else if (idx === 1 || idx === 7) { // Aug, Feb
        seasonality = 0.9;  // slump
      }

      // Add a small wiggle
      const wiggle = 1 + (Math.sin(idx) * 0.05);

      const businessRevenue = Math.round(businessBase * seasonality * wiggle);
      const industryAverage = Math.round(industryBase * seasonality * (1 + Math.cos(idx + 1) * 0.04));

      return {
        month,
        'Your Revenue': businessRevenue,
        'Industry Avg': industryAverage
      };
    });
  };

  const revenueChartData = get12MonthRevenueData();

  // Dynamic Estimator Calculations
  const principal = estimateAmount;
  const annualRate = scoreDetails.suggestedInterestRate || 18.5;
  const monthlyRate = annualRate / 12 / 100;
  const emi = monthlyRate > 0 
    ? Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, estimateTenure)) / (Math.pow(1 + monthlyRate, estimateTenure) - 1))
    : Math.round(principal / estimateTenure);
  const totalRepayment = emi * estimateTenure;
  const totalInterest = totalRepayment - principal;

  // Populate default documents when profile changes
  useEffect(() => {
    const defaultDocs = [
      {
        id: 'doc-1',
        name: `gstr1_ledger_${profile.gstNumber || 'composite'}.json`,
        type: 'GSTR-1 Tax Invoice Ledger',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 3600 * 1000).toISOString(),
        status: 'VERIFIED' as const,
        size: '184 KB'
      },
      {
        id: 'doc-2',
        name: `gstr3b_receipt_${profile.gstNumber || 'composite'}.pdf`,
        type: 'GSTR-3B Tax Filing Receipt',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 3600 * 1000).toISOString(),
        status: 'VERIFIED' as const,
        size: '1.2 MB'
      },
      {
        id: 'doc-3',
        name: `upi_merchant_transactions_6m.csv`,
        type: 'UPI Merchant Aggregator Statement',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'VERIFIED' as const,
        size: '852 KB'
      },
      {
        id: 'doc-4',
        name: `bank_statement_aa_${profile.aaConsentId.replace(/-/g, '_')}.json`,
        type: 'Account Aggregator Bank Ledger',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'VERIFIED' as const,
        size: '340 KB'
      }
    ];

    if (profile.employeeCount > 0) {
      defaultDocs.push({
        id: 'doc-5',
        name: `epfo_payroll_compliance_${profile.epfoId.replace(/\//g, '_')}.json`,
        type: 'EPFO Employer Payroll Settlement',
        uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'VERIFIED' as const,
        size: '115 KB'
      });
    }

    setAuditDocs(defaultDocs);
  }, [profile.id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.name.endsWith('.pdf') ? 'Alternate Credit PDF Document' : 'JSON Alternate Footprint',
      uploadedAt: new Date().toISOString(),
      status: 'VERIFYING' as const,
      size: `${(file.size / 1024).toFixed(0)} KB`
    };

    setAuditDocs(prev => [newDoc, ...prev]);

    // Simulate verification
    setTimeout(() => {
      setAuditDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'VERIFIED' } : d));
    }, 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Update local simulator state when profile changes
  useEffect(() => {
    setSimVars({ ...variables });
  }, [variables, profile.id]);

  // Handle slide updates and auto-call API with debounce
  const handleSimChange = async (key: keyof SimulatorVariables, value: number) => {
    const updated = { ...simVars, [key]: value };
    setSimVars(updated);
    setIsSimulating(true);
    try {
      await onUpdateSimVariables(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetSimulation = async () => {
    setIsSimulating(true);
    try {
      await onUpdateSimVariables(variables);
      setSimVars({ ...variables });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanPurpose.trim()) return;
    setIsSubmittingLoan(true);
    try {
      await onSubmitLoan({
        requestedAmount: Number(loanAmount),
        purpose: loanPurpose,
        tenureMonths: Number(loanTenure)
      });
      setLoanPurpose('');
      setLoanSuccess(true);
      setTimeout(() => setLoanSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeChatAppId) return;
    try {
      await onSendChatMessage(activeChatAppId, chatMessage);
      setChatMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  // Find the active application being chatted about
  const activeChatApp = applications.find(a => a.id === activeChatAppId);

  // Score Color Mapping
  const getScoreColor = (score: number) => {
    if (score >= 780) return 'text-emerald-400';
    if (score >= 680) return 'text-stitch-green';
    if (score >= 580) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 780) return 'from-emerald-500/20 to-teal-500/5 border-emerald-500/20';
    if (score >= 680) return 'from-stitch-green/20 to-emerald-500/5 border-stitch-green/20';
    if (score >= 580) return 'from-yellow-500/20 to-orange-500/5 border-yellow-500/20';
    return 'from-rose-500/20 to-red-500/5 border-rose-500/20';
  };

  const getDialGradient = (score: number) => {
    if (score >= 780) return '#10b981'; // Emerald
    if (score >= 680) return '#ccff00'; // Stitch Green
    if (score >= 580) return '#eab308'; // Yellow
    return '#f43f5e'; // Rose
  };

  const getGradeExplanation = (grade: string) => {
    switch (grade) {
      case 'A+': return 'Pristine Credential (Prime interest tier. Immediate automated approval expected)';
      case 'A': return 'Strong Cash Flow Continuity (Excellent lending profiles. Flexible loan structures available)';
      case 'B': return 'Stable alternate risk profile (Standard interest levels. Small business working capital range)';
      case 'C': return 'Moderate transaction risk (Standard underwriting checking. Structured cash-sweeps recommended)';
      case 'D': return 'Elevated cash flow instability (Substandard files. Credit-building interest limits)';
      case 'HR': return 'High risk exposure (Alternative documentation needed. Direct underwriting required)';
      default: return 'Under development';
    }
  };

  // Recharts Radar Score conversion
  const radarData = [
    { subject: 'GST Compliance', value: scoreDetails.subScores.gstCompliance },
    { subject: 'UPI Stability', value: scoreDetails.subScores.upiFlowStability },
    { subject: 'Bank Balance Liquidity', value: scoreDetails.subScores.bankingLiquidity },
    { subject: 'Payroll Consistency', value: profile.employeeCount > 0 ? scoreDetails.subScores.payrollConsistency : 100 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-stitch-border/30 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">{profile.name}</h1>
            <span className="text-[10px] font-mono font-bold bg-stitch-green/10 text-stitch-green border border-stitch-green/20 px-2.5 py-0.5 rounded-full uppercase">
              {profile.sector}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Alternate credit scoring gateway & transactional cash flow engine • Registered GST: <span className="font-mono text-zinc-300">{profile.gstNumber || 'N/A'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSyncedTime && (
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">HEALTH CARD RE-VERIFIED</p>
              <p className="text-xs font-mono text-zinc-300">{lastSyncedTime}</p>
            </div>
          )}
          <button
            id="header-bulk-sync-button"
            onClick={handleBulkSync}
            disabled={isSyncingAll}
            className="bg-stitch-green hover:bg-stitch-green-hover disabled:opacity-50 text-black text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-stitch-green/10 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing Feeds...' : 'Bulk Sync Status'}</span>
          </button>
          <button
            id="export-health-card-pdf-btn"
            onClick={() => exportMsmeHealthCardToPDF(profile, scoreDetails, auditDocs, applications, lastSyncedTime)}
            className="bg-zinc-850 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <FileText className="h-4 w-4 text-stitch-green" />
            <span>Export Compliance PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-stitch-border">
        <button
          onClick={() => setActiveTab('CREDIT_PASSPORT')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'CREDIT_PASSPORT'
              ? 'border-stitch-green text-stitch-green'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Credit Passport & Sandbox
        </button>
        <button
          onClick={() => setActiveTab('AUDIT_LOG')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'AUDIT_LOG'
              ? 'border-stitch-green text-stitch-green'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Document Audit Log</span>
          <span className="text-[10px] bg-stitch-green/10 text-stitch-green border border-stitch-green/20 px-2 py-0.5 rounded-full font-mono font-semibold">
            {auditDocs.length}
          </span>
        </button>
      </div>

      {activeTab === 'CREDIT_PASSPORT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Health Card and Simulator */}
      <div className="lg:col-span-7 flex flex-col space-y-8">
        
        {/* Dynamic Financial Health Card */}
        <motion.div
          id="financial-health-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative p-6 rounded-3xl border bg-gradient-to-br ${getScoreBg(scoreDetails.totalScore)} transition-all duration-500 shadow-xl overflow-hidden`}
        >
          {/* Decorative Grid Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(204,255,0,0.08),transparent)] pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-mono font-semibold tracking-widest text-stitch-green bg-stitch-dark px-2.5 py-1 rounded-full border border-stitch-green/20">
                KREDO CREDIT PASSPORT
              </span>
              <h3 className="font-display text-2xl font-bold mt-2 text-white">{profile.name}</h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">{profile.sector} | Established {profile.establishedYear}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div>
                <span className="text-xs text-zinc-400 font-mono">DIGITAL ID</span>
                <div className="font-mono text-xs text-gray-200 mt-1">{profile.gstNumber || 'MICRO-MERCHANT'}</div>
              </div>
              <button
                id="passport-export-pdf-btn"
                onClick={() => exportMsmeHealthCardToPDF(profile, scoreDetails, auditDocs, applications, lastSyncedTime)}
                className="mt-1 bg-stitch-dark hover:bg-zinc-900 text-zinc-300 hover:text-white border border-stitch-border/60 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
              >
                <FileText className="h-3.5 w-3.5 text-stitch-green" />
                <span>Download Compliance PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visual Score Arc */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Score gauge background circle */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke={getDialGradient(scoreDetails.totalScore)}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * (scoreDetails.totalScore - 300)) / 600}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="text-center z-10">
                  <div className={`font-display text-4xl font-bold tracking-tight ${getScoreColor(scoreDetails.totalScore)}`}>
                    {scoreDetails.totalScore}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">KREDO RATING</div>
                  <div className={`text-xs font-bold mt-1 px-2.5 py-0.5 rounded-full bg-stitch-dark border inline-block ${getScoreColor(scoreDetails.totalScore)} border-stitch-border`}>
                    Grade {scoreDetails.riskGrade}
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Capacity Information */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stitch-dark p-3 rounded-2xl border border-stitch-border">
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-stitch-green" /> SUGGESTED CREDIT CAP
                  </div>
                  <div className="text-base font-bold text-gray-100 mt-1 font-mono">
                    {scoreDetails.approvedLimit > 0 ? `₹${(scoreDetails.approvedLimit / 100000).toFixed(1)}L` : 'NA'}
                  </div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">Based on alternate turnover</div>
                </div>
                <div className="bg-stitch-dark p-3 rounded-2xl border border-stitch-border">
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-stitch-green" /> PROPOSED RATE
                  </div>
                  <div className="text-base font-bold text-gray-100 mt-1 font-mono">
                    {scoreDetails.approvedLimit > 0 ? `${scoreDetails.suggestedInterestRate.toFixed(1)}%` : 'Rejected'}
                  </div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">Estimated p.a. interest</div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-1">Risk Grading Status</h4>
                <p className="text-xs text-zinc-200 bg-stitch-dark/40 px-3 py-2 rounded-xl border border-stitch-border">
                  {getGradeExplanation(scoreDetails.riskGrade)}
                </p>
              </div>
            </div>
          </div>

          {/* Subscores Grid */}
          <div className="border-t border-stitch-border mt-6 pt-5">
            <h4 className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-3 flex items-center justify-between">
              <span>Alternate Stream Quality Index</span>
              <span className="text-[9px] font-normal lowercase italic text-stitch-green">*Real-time alternate data weights applied</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-stitch-dark/40 p-2.5 rounded-xl border border-stitch-border">
                <div className="text-[10px] text-zinc-400">GST Compliance</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-semibold text-gray-100 font-mono">{scoreDetails.subScores.gstCompliance}%</span>
                  <span className="text-[9px] text-stitch-green">wt: {profile.employeeCount > 0 ? '25%' : '30%'}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-stitch-green h-full" style={{ width: `${scoreDetails.subScores.gstCompliance}%` }} />
                </div>
              </div>

              <div className="bg-stitch-dark/40 p-2.5 rounded-xl border border-stitch-border">
                <div className="text-[10px] text-zinc-400">UPI Cash Stability</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-semibold text-gray-100 font-mono">{scoreDetails.subScores.upiFlowStability}%</span>
                  <span className="text-[9px] text-stitch-green">wt: {profile.employeeCount > 0 ? '25%' : '35%'}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-stitch-green h-full" style={{ width: `${scoreDetails.subScores.upiFlowStability}%` }} />
                </div>
              </div>

              <div className="bg-stitch-dark/40 p-2.5 rounded-xl border border-stitch-border">
                <div className="text-[10px] text-zinc-400">Banking Liquidity</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-semibold text-gray-100 font-mono">{scoreDetails.subScores.bankingLiquidity}%</span>
                  <span className="text-[9px] text-stitch-green">wt: {profile.employeeCount > 0 ? '30%' : '35%'}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-stitch-green h-full" style={{ width: `${scoreDetails.subScores.bankingLiquidity}%` }} />
                </div>
              </div>

              <div className="bg-stitch-dark/40 p-2.5 rounded-xl border border-stitch-border">
                <div className="text-[10px] text-zinc-400">Payroll Consistency</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-semibold text-gray-100 font-mono">
                    {profile.employeeCount > 0 ? `${scoreDetails.subScores.payrollConsistency}%` : 'N/A'}
                  </span>
                  <span className="text-[9px] text-stitch-green">wt: {profile.employeeCount > 0 ? '20%' : '0%'}</span>
                </div>
                {profile.employeeCount > 0 ? (
                  <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-stitch-green h-full" style={{ width: `${scoreDetails.subScores.payrollConsistency}%` }} />
                  </div>
                ) : (
                  <div className="text-[9px] text-zinc-500 mt-1 italic">Micro distributed</div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Alerts Flag List */}
          {scoreDetails.riskFlags.length > 0 && (
            <div className="mt-5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 font-mono mb-1.5">
                <ShieldAlert className="h-4 w-4" /> CREDIT ATTENTION ALERTS ({scoreDetails.riskFlags.length})
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-300">
                {scoreDetails.riskFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span className="text-rose-500">●</span> {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Real-time Credit Score Sandbox */}
        <div className="bg-stitch-card rounded-3xl p-6 border border-stitch-border relative">
          <div className="absolute top-6 right-6 flex items-center space-x-2">
            <button
              onClick={resetSimulation}
              disabled={isSimulating}
              className="text-xs bg-stitch-dark hover:bg-zinc-800 disabled:opacity-50 text-stitch-green font-semibold px-2.5 py-1.5 rounded-lg border border-stitch-border flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`h-3 w-3 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Reset Variables</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Sliders className="h-5 w-5 text-stitch-green" />
            <div>
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-1.5">
                Financial Hygiene Simulator
              </h3>
              <p className="text-xs text-zinc-400">Tweak operational variables to see score and lending limit adjust instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* GSTR Delays */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Late GSTR Filing cycles</span>
                <span className="text-stitch-green font-mono">{simVars.gstDelayedFilingsRatio}% late</span>
              </div>
              <input
                id="sim-gst-delay-slider"
                type="range"
                min="0"
                max="100"
                step="5"
                value={simVars.gstDelayedFilingsRatio}
                onChange={(e) => handleSimChange('gstDelayedFilingsRatio', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
              />
              <p className="text-[10px] text-zinc-500 italic">Timely GSTR-1 & 3B drives credit reliability</p>
            </div>

            {/* UPI Failures */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">UPI Txn Failure Rate</span>
                <span className="text-stitch-green font-mono">{simVars.upiFailureRate}% fail</span>
              </div>
              <input
                id="sim-upi-fail-slider"
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={simVars.upiFailureRate}
                onChange={(e) => handleSimChange('upiFailureRate', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
              />
              <p className="text-[10px] text-zinc-500 italic">Merchant terminal failures raise operational risk alerts</p>
            </div>

            {/* UPI Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">UPI Monthly Sales Volume</span>
                <span className="text-stitch-green font-mono">₹{(simVars.upiMonthlyVolume / 1000).toFixed(0)}k</span>
              </div>
              <input
                id="sim-upi-vol-slider"
                type="range"
                min="10000"
                max="1000000"
                step="20000"
                value={simVars.upiMonthlyVolume}
                onChange={(e) => handleSimChange('upiMonthlyVolume', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
              />
              <p className="text-[10px] text-zinc-500 italic">Verified digital sale aggregates increase approved capacity</p>
            </div>

            {/* AA Bank Balance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Bank Average Balance</span>
                <span className="text-stitch-green font-mono">₹{(simVars.bankAvgBalance / 1000).toFixed(0)}k</span>
              </div>
              <input
                id="sim-bank-bal-slider"
                type="range"
                min="5000"
                max="1000000"
                step="15000"
                value={simVars.bankAvgBalance}
                onChange={(e) => handleSimChange('bankAvgBalance', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
              />
              <p className="text-[10px] text-zinc-500 italic">Liquid buffer tracked via real-time Account Aggregator feed</p>
            </div>

            {/* AA Bank Bounces */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Bank Cheque/Mandate Bounces</span>
                <span className="text-rose-400 font-mono">{simVars.bankBounceCount6M} bounces (6M)</span>
              </div>
              <input
                id="sim-bank-bounce-slider"
                type="range"
                min="0"
                max="15"
                step="1"
                value={simVars.bankBounceCount6M}
                onChange={(e) => handleSimChange('bankBounceCount6M', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
              />
              <p className="text-[10px] text-zinc-500 italic">Cheque bounces heavily slash the banking liquidity subscore</p>
            </div>

            {/* EPFO Details */}
            {!isMicroMerchant ? (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">EPFO Payroll Delay</span>
                    <span className="text-stitch-green font-mono">{simVars.epfoDelayMonths} months</span>
                  </div>
                  <input
                    id="sim-epfo-delay-slider"
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={simVars.epfoDelayMonths}
                    onChange={(e) => handleSimChange('epfoDelayMonths', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Prompt salary deposits confirm corporate stability</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">EPFO Workforce growth</span>
                    <span className="text-stitch-green font-mono">{simVars.epfoHeadcountGrowth}% growth</span>
                  </div>
                  <input
                    id="sim-epfo-growth-slider"
                    type="range"
                    min="-50"
                    max="100"
                    step="5"
                    value={simVars.epfoHeadcountGrowth}
                    onChange={(e) => handleSimChange('epfoHeadcountGrowth', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
                  />
                  <p className="text-[10px] text-zinc-500 italic">Active headcount growth flags robust expansion trajectory</p>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 bg-stitch-dark p-3 rounded-2xl border border-stitch-green/10 text-center flex items-center justify-center">
                <p className="text-xs text-zinc-400">
                  <span className="font-semibold text-stitch-green">Composition Micro-Merchant Mode:</span> EPFO employee contributions are bypassed and weights are automatically reallocated to UPI flows and bank average balances.
                </p>
              </div>
            )}
          </div>

          {/* AI Tips Card */}
          <div className="mt-5 p-3.5 bg-stitch-dark rounded-2xl border border-stitch-border flex items-start gap-3">
            <div className="bg-stitch-green/10 p-1.5 rounded-lg text-stitch-green mt-0.5 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-stitch-green font-mono">KREDO OPTIMIZATION TIP</h5>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                {simVars.bankBounceCount6M > 0 ? (
                  <span>Reducing bank mandate bounces from <b className="text-rose-400 font-mono">{simVars.bankBounceCount6M}</b> to <b className="text-emerald-400 font-mono">0</b> by ensuring adequate ledger balance before the 5th of each month will immediately restore your Banking Liquidity rating. This single action is projected to boost your credit limit by over <b className="text-stitch-green">₹3,00,000</b>.</span>
                ) : simVars.gstDelayedFilingsRatio > 0 ? (
                  <span>Filing GSTR-1 and GSTR-3B before the 20th deadline (reducing late filing ratio to <b className="text-emerald-400 font-mono">0%</b>) will establish a consistent tax payment record. This improves your compliance score and makes you eligible for premium banking rates under OCEN structures.</span>
                ) : (
                  <span>Excellent financial compliance! Your cash flow metrics are pristine. Maintain UPI transaction densities and regular monthly average balance above ₹3 Lakhs to trigger automated line-of-credit expansion up to your maximum cap.</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 12-Month Revenue & Industry Benchmark Chart */}
        <div id="revenue-trend-benchmark-card" className="bg-stitch-card rounded-3xl p-6 border border-stitch-border flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-stitch-green" />
            <div>
              <h3 className="font-display text-lg font-bold text-white">12-Month Revenue & Benchmark</h3>
              <p className="text-xs text-zinc-400">Comparing verified merchant inflows against industry averages</p>
            </div>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueChartData}
                margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  stroke="#71717a" 
                  fontSize={10}
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  verticalAlign="bottom"
                  height={36}
                />
                <Line 
                  type="monotone" 
                  dataKey="Your Revenue" 
                  stroke="#ccff00" 
                  strokeWidth={2.5}
                  dot={{ r: 3, stroke: '#ccff00', strokeWidth: 1, fill: '#090d16' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Industry Avg" 
                  stroke="#3b82f6" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-stitch-border text-center">
            <div>
              <div className="text-[10px] text-zinc-500 font-mono">ANNUALIZED RUN-RATE</div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                ₹{((simVars.upiMonthlyVolume * 12) / 100000).toFixed(1)} Lakhs
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-mono">BENCHMARK STANDING</div>
              <div className="text-sm font-bold text-stitch-green font-mono mt-1">
                {simVars.upiMonthlyVolume >= (profile.sector.includes('Retail') ? 150000 : profile.sector.includes('Apparel') ? 380000 : profile.sector.includes('IT') ? 600000 : 1200000) ? 'Outperforming Peer Avg' : 'Below Sector Avg'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Alternate Data Feed and Applications */}
      <div className="lg:col-span-5 flex flex-col space-y-8">
        
        {/* Alternate Data Ingestion Feed */}
        <div className="bg-stitch-card rounded-3xl p-6 border border-stitch-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-stitch-green" />
              <div>
                <h3 className="font-display text-lg font-bold text-white">Ingested Digital Data feeds</h3>
                <p className="text-xs text-zinc-400">Consent-based verification footprints compiled</p>
              </div>
            </div>
            
            <button
              id="bulk-sync-button"
              onClick={handleBulkSync}
              disabled={isSyncingAll}
              className="text-xs bg-stitch-dark hover:bg-zinc-800 disabled:opacity-80 text-stitch-green hover:text-white font-semibold px-3 py-1.5 rounded-xl border border-stitch-border flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncingAll ? 'animate-spin text-stitch-green' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : 'Bulk Sync'}</span>
            </button>
          </div>

          {isSyncingAll && (
            <div className="mb-4 p-3 bg-stitch-dark border border-stitch-green/20 rounded-2xl flex items-center gap-3">
              <RefreshCw className="h-4 w-4 animate-spin text-stitch-green shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono font-semibold text-stitch-green">ACCOUNT INTEGRATION AUDIT RUNNING</p>
                <p className="text-[10px] text-zinc-300 truncate mt-0.5">{syncStep}</p>
              </div>
            </div>
          )}

          {syncSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-400">All Accounts Re-verified Simultaneously!</p>
                <p className="text-[10px] text-zinc-400">Financial Health Card updated at {lastSyncedTime}</p>
              </div>
            </div>
          )}

          <div className="space-y-3.5">
            {/* GST */}
            <div className="bg-stitch-dark p-3.5 rounded-2xl border border-stitch-border hover:border-stitch-green/25 transition-all flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-stitch-green/10 p-2.5 rounded-xl text-stitch-green shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200">GST Filing Ledger (GSTR-1/3B)</h4>
                  <p className="text-[11px] text-stitch-green font-mono mt-0.5">{profile.gstNumber || 'Unregistered Micro store'}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Verified via GSTN integration gateway</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                  CONNECTED
                </span>
                <div className="text-[11px] text-zinc-300 font-mono mt-2">{metrics.gstFilings?.length || 0} filings synced</div>
              </div>
            </div>

            {/* UPI */}
            <div className="bg-stitch-dark p-3.5 rounded-2xl border border-stitch-border hover:border-stitch-green/25 transition-all flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-stitch-green/10 p-2.5 rounded-xl text-stitch-green shrink-0">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200">UPI QR & Merchant Settlers</h4>
                  <p className="text-[11px] text-stitch-green font-mono mt-0.5">{profile.upiId}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Direct aggregator UPI transaction feeds</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                  ACTIVE FEED
                </span>
                <div className="text-[11px] text-zinc-300 font-mono mt-2">6M flow parsed</div>
              </div>
            </div>

            {/* Account Aggregator (Bank) */}
            <div className="bg-stitch-dark p-3.5 rounded-2xl border border-stitch-border hover:border-stitch-green/25 transition-all flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-stitch-green/10 p-2.5 rounded-xl text-stitch-green shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200">Account Aggregator Consent</h4>
                  <p className="text-[11px] text-stitch-green font-mono mt-0.5">{profile.aaConsentId}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Multi-bank statement analyzer synced</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                  CONSENTED
                </span>
                <div className="text-[11px] text-zinc-300 font-mono mt-2">Daily tracking live</div>
              </div>
            </div>

            {/* EPFO */}
            <div className="bg-stitch-dark p-3.5 rounded-2xl border border-stitch-border hover:border-stitch-green/25 transition-all flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-stitch-green/10 p-2.5 rounded-xl text-stitch-green shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200">EPFO Payroll Deposits</h4>
                  <p className="text-[11px] text-stitch-green font-mono mt-0.5">{profile.epfoId || 'N/A (Micro enterprise)'}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Employee payroll deposit compliance</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {profile.employeeCount > 0 ? (
                  <>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                      LINKED
                    </span>
                    <div className="text-[11px] text-zinc-300 font-mono mt-2">{profile.employeeCount} headcount</div>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-mono font-semibold">
                      EXEMPT
                    </span>
                    <div className="text-[11px] text-zinc-500 font-mono mt-2">No payroll record</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Document Audit Log Component */}
        <div id="document-audit-log-card" className="bg-stitch-card rounded-3xl p-6 border border-stitch-border flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-stitch-green/10 p-2.5 rounded-xl text-stitch-green">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">Document Audit Log</h3>
                <p className="text-[11px] text-zinc-400">Verifiable compliance ledger of alternate footprints</p>
              </div>
            </div>
            <span className="text-[10px] bg-stitch-green/10 text-stitch-green border border-stitch-green/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              {auditDocs.length} SECURE
            </span>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div
            id="drag-drop-uploader"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('audit-file-upload-input')?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 relative ${
              dragActive 
                ? 'border-stitch-green bg-stitch-green/5' 
                : 'border-stitch-border hover:border-stitch-green/40 hover:bg-stitch-dark/20'
            }`}
          >
            <input
              id="audit-file-upload-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.json,.xml,.csv,.xlsx"
            />
            <div className="flex flex-col items-center space-y-1.5">
              <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                <Send className="h-4 w-4 rotate-45 transform" />
              </div>
              <p className="text-xs font-medium text-gray-200">
                Drag & drop files here, or <span className="text-stitch-green hover:underline">browse</span>
              </p>
              <p className="text-[9px] text-zinc-500">
                Supports PDF, JSON, XML, CSV, XLSX (Max 10MB)
              </p>
            </div>
          </div>

          {/* Audit History List */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {auditDocs.map((doc) => (
              <div key={doc.id} className="bg-stitch-dark/50 border border-stitch-border/60 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-zinc-800 p-2 rounded-lg shrink-0">
                    {doc.name.endsWith('.pdf') ? (
                      <FileText className="h-4 w-4 text-rose-400" />
                    ) : doc.name.endsWith('.json') ? (
                      <FileCode2 className="h-4 w-4 text-stitch-green" />
                    ) : (
                      <Building2 className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">{doc.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{doc.type}</p>
                    <p className="text-[9px] text-zinc-500 font-mono mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {doc.status === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                      <CheckCircle className="h-2.5 w-2.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded-full animate-pulse">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Pending
                    </span>
                  )}
                  <div className="text-[10px] text-zinc-500 font-mono mt-1.5">{doc.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loan Application Center */}
        <div className="bg-stitch-card rounded-3xl p-6 border border-stitch-border flex flex-col space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-stitch-green" />
            <div>
              <h3 className="font-display text-lg font-bold text-white">Line of Credit Applications</h3>
              <p className="text-xs text-zinc-400">Directly submit and track credit requests</p>
            </div>
          </div>

          {/* Interactive Loan Eligibility Estimator Card */}
          <div id="loan-eligibility-estimator-card" className="bg-stitch-dark p-4 rounded-2xl border border-stitch-border/60 flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-stitch-green" />
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase">Interactive Credit Estimator</h4>
                <p className="text-[10px] text-zinc-400">Sandbox repayment plans based on current Kredo rate</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Amount Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-300">Requested Capital</span>
                  <span className="text-stitch-green font-mono font-bold">₹{estimateAmount.toLocaleString()}</span>
                </div>
                <input
                  id="estimator-amount-slider"
                  type="range"
                  min="50000"
                  max="5000000"
                  step="50000"
                  value={estimateAmount}
                  onChange={(e) => setEstimateAmount(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
                />
                <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                  <span>Min: ₹50k</span>
                  <span>Max: ₹50 Lakhs</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-300">Repayment Period</span>
                  <span className="text-stitch-green font-mono font-bold">{estimateTenure} Months</span>
                </div>
                <input
                  id="estimator-tenure-slider"
                  type="range"
                  min="3"
                  max="36"
                  step="1"
                  value={estimateTenure}
                  onChange={(e) => setEstimateTenure(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-stitch-green"
                />
                <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                  <span>3 Months</span>
                  <span>36 Months</span>
                </div>
              </div>

              {/* Calculations Grid */}
              <div className="grid grid-cols-2 gap-2 bg-stitch-card p-3 rounded-xl border border-stitch-border text-[11px]">
                <div>
                  <span className="text-[9px] text-zinc-500 font-mono block">INTEREST RATE</span>
                  <span className="font-bold text-white font-mono mt-0.5 block">{annualRate.toFixed(1)}% p.a.</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-mono block">ESTIMATED EMI</span>
                  <span className="font-bold text-stitch-green font-mono mt-0.5 block">₹{emi.toLocaleString()} / mo</span>
                </div>
                <div className="col-span-2 pt-1.5 border-t border-stitch-border/40 grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">TOTAL INTEREST</span>
                    <span className="font-semibold text-gray-300 font-mono">₹{totalInterest.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 font-mono block">REPAYMENT SUM</span>
                    <span className="font-semibold text-gray-300 font-mono">₹{totalRepayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Eligibility Warning/Success */}
              <div className={`p-2.5 rounded-xl border text-[10px] leading-relaxed transition-all duration-300 ${
                estimateAmount > scoreDetails.approvedLimit
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              }`}>
                {estimateAmount > scoreDetails.approvedLimit ? (
                  <span>
                    ⚠️ Exceeds algorithmic cap of <b>₹{scoreDetails.approvedLimit.toLocaleString()}</b>. Secondary collateral or manual banking audit is required for this volume.
                  </span>
                ) : (
                  <span>
                    ✓ Within approved cap! Extremely high probability of instant automated disbursement.
                  </span>
                )}
              </div>

              {/* Auto Fill Trigger */}
              <button
                type="button"
                onClick={() => {
                  setLoanAmount(estimateAmount.toString());
                  setLoanTenure(estimateTenure.toString());
                }}
                className="w-full text-center py-1.5 text-[10px] font-semibold text-stitch-green hover:text-white bg-stitch-card hover:bg-zinc-800 border border-stitch-border rounded-xl transition-all cursor-pointer"
              >
                Apply Estimator Configuration to Application Form Below
              </button>
            </div>
          </div>

          {/* Form to Apply */}
          <form onSubmit={handleLoanSubmit} className="space-y-3 bg-stitch-dark p-4 rounded-2xl border border-stitch-border mb-5">
            <h4 className="text-xs font-semibold text-gray-200 font-mono uppercase tracking-wider">Submit New Application</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 font-medium mb-1">Requested Amount (INR)</label>
                <select
                  id="loan-amount-select"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full bg-stitch-dark border border-stitch-border rounded-xl px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green font-mono"
                >
                  <option value="150000">₹1,50,000</option>
                  <option value="500000">₹5,00,000</option>
                  <option value="1000000">₹10,00,000</option>
                  <option value="2000000">₹20,00,000</option>
                  <option value="5000000">₹50,00,000</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-medium mb-1">Tenure (Months)</label>
                <select
                  id="loan-tenure-select"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(e.target.value)}
                  className="w-full bg-stitch-dark border border-stitch-border rounded-xl px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green font-mono"
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-medium mb-1">Business Purpose</label>
              <input
                id="loan-purpose-input"
                type="text"
                placeholder="e.g. Warehouse inventory expansion..."
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                className="w-full bg-stitch-dark border border-stitch-border rounded-xl px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green"
                required
              />
            </div>

            <button
              id="submit-loan-btn"
              type="submit"
              disabled={isSubmittingLoan || scoreDetails.approvedLimit === 0}
              className="w-full bg-stitch-green hover:bg-stitch-green-hover disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-stitch-green/10"
            >
              {isSubmittingLoan ? 'Submitting...' : scoreDetails.approvedLimit === 0 ? 'Not Eligible (Poor Credit Rating)' : 'Submit Digital Credit Application'}
            </button>

            {loanSuccess && (
              <p className="text-[10px] text-emerald-400 text-center font-semibold mt-1">
                ✓ Application submitted successfully to Kredo underwriters!
              </p>
            )}
          </form>

          {/* List of Applications */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-gray-200 font-mono uppercase tracking-wider">Application Tracking</h4>
            {applications.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center italic py-4">No historic loan applications.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-stitch-dark p-3 rounded-2xl border border-stitch-border flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stitch-green font-mono">ID: {app.id.substring(4, 9)}</span>
                      <h5 className="text-xs font-bold text-gray-200 mt-0.5">₹{(app.requestedAmount).toLocaleString()}</h5>
                    </div>
                    <div>
                      {app.status === 'APPROVED' && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold font-mono flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> APPROVED
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-semibold font-mono flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> REJECTED
                        </span>
                      )}
                      {app.status === 'PENDING' && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-full font-semibold font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" /> UNDERWRITING
                        </span>
                      )}
                      {app.status === 'CLARIFICATION_REQUIRED' && (
                        <span className="text-[10px] bg-stitch-green/10 text-stitch-green border border-stitch-green/20 px-2.5 py-0.5 rounded-full font-semibold font-mono flex items-center gap-1 animate-pulse">
                          <HelpCircle className="h-3 w-3" /> NEED CLARIFICATION
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 italic line-clamp-1">"{app.purpose}"</p>

                  {/* Vertical step-by-step progress tracker */}
                  <div id={`app-tracker-${app.id}`} className="bg-stitch-dark/40 p-4 rounded-xl border border-stitch-border/30 my-2 flex flex-col space-y-4">
                    <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono border-b border-stitch-border/30 pb-2 mb-1">
                      <span className="uppercase tracking-wider">Underwriting Pipeline</span>
                      <span className="text-stitch-green font-bold bg-stitch-green/10 px-2 py-0.5 rounded-full border border-stitch-green/25 font-mono">
                        {app.status === 'APPROVED' ? 'Approved (4/4)' : app.status === 'REJECTED' ? 'Rejected (4/4)' : app.status === 'CLARIFICATION_REQUIRED' ? 'Flagged (3/4)' : 'Under Review (3/4)'}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-4.5 relative pl-1.5">
                      {/* Step 1: Ingested */}
                      <div className="flex gap-3 relative">
                        <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-emerald-500" style={{ height: '22px' }} />
                        <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0 z-10 text-[8px] font-bold font-mono">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-gray-200">Submitted</h4>
                          <p className="text-[9px] text-zinc-400 mt-0.5">Consent granted for alternate digital ledger feeds.</p>
                        </div>
                      </div>

                      {/* Step 2: KYC */}
                      <div className="flex gap-3 relative">
                        <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-emerald-500" style={{ height: '22px' }} />
                        <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0 z-10 text-[8px] font-bold font-mono">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-gray-200">KYC Verification</h4>
                          <p className="text-[9px] text-zinc-400 mt-0.5">Entity GSTIN ({profile.gstNumber || 'MICRO'}) and bank accounts matched.</p>
                        </div>
                      </div>

                      {/* Step 3: Scoring */}
                      <div className="flex gap-3 relative">
                        <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-zinc-800" style={{ height: '22px' }} />
                        <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0 z-10 text-[8px] font-bold font-mono">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-gray-200">Scoring</h4>
                          <p className="text-[9px] text-zinc-400 mt-0.5">Credit score parsed as <span className="text-stitch-green font-bold font-mono">{scoreDetails.totalScore}</span> from transaction history.</p>
                        </div>
                      </div>

                      {/* Step 4: Decision */}
                      <div className="flex gap-3 relative">
                        {app.status === 'APPROVED' ? (
                          <>
                            <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 border border-emerald-400 text-black flex items-center justify-center shrink-0 z-10 text-[8px] font-bold font-mono">
                              ✓
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-emerald-400">Final Approval</h4>
                              <p className="text-[9px] text-zinc-300 mt-0.5">Authorized Limit: <b className="text-white">₹{(app.approvedAmount || 0).toLocaleString()}</b> @ <b className="text-stitch-green">{app.interestRate}% p.a.</b></p>
                            </div>
                          </>
                        ) : app.status === 'REJECTED' ? (
                          <>
                            <div className="h-4.5 w-4.5 rounded-full bg-rose-500 border border-rose-400 text-black flex items-center justify-center shrink-0 z-10 text-[8px] font-bold font-mono">
                              ✕
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-rose-400">Final Approval (Declined)</h4>
                              <p className="text-[9px] text-zinc-400 mt-0.5">Underwriting criteria not met due to short-term liquidity stress.</p>
                            </div>
                          </>
                        ) : app.status === 'CLARIFICATION_REQUIRED' ? (
                          <>
                            <div className="h-4.5 w-4.5 rounded-full bg-yellow-500 border border-yellow-400 text-black flex items-center justify-center shrink-0 z-10 text-[8px] font-bold font-mono animate-bounce">
                              ?
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-yellow-400">Final Approval (Clarification Flagged)</h4>
                              <p className="text-[9px] text-zinc-300 mt-0.5">Lender requested cash flow feedback. Resolve below.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-4.5 w-4.5 rounded-full bg-zinc-950 border border-yellow-500 text-yellow-400 flex items-center justify-center shrink-0 z-10 text-[8px] font-bold font-mono animate-pulse">
                              ●
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-yellow-500">Final Approval (Underwriter Queue)</h4>
                              <p className="text-[9px] text-zinc-400 mt-0.5">Review in progress. Risk desk usually signs off under 15 mins.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-stitch-border/60 pt-2">
                    <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                    {app.status === 'CLARIFICATION_REQUIRED' && (
                      <button
                        onClick={() => setActiveChatAppId(app.id === activeChatAppId ? null : app.id)}
                        className="text-[10px] text-stitch-green font-semibold hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        {activeChatAppId === app.id ? 'Close Chat' : 'Resolve Flag / Chat'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Clarification Chat Portal */}
        <AnimatePresence>
          {activeChatAppId && activeChatApp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-stitch-card rounded-3xl p-5 border border-stitch-green/20 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-stitch-border pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-stitch-green" />
                  <div>
                    <h4 className="text-xs font-semibold text-gray-200">Lender Clarification Desk</h4>
                    <p className="text-[9px] text-zinc-400">Resolving alerts for application ID: {activeChatApp.id.substring(4, 9)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveChatAppId(null)}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4 flex flex-col">
                {activeChatApp.chatHistory.map((msg) => {
                  const isLender = msg.sender === 'LENDER';
                  const isSystem = msg.sender === 'SYSTEM';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] rounded-xl p-2.5 text-xs ${
                        isSystem
                          ? 'bg-stitch-dark border border-stitch-border text-zinc-400 mx-auto text-center'
                          : isLender
                          ? 'bg-zinc-900 border border-stitch-border text-gray-200 self-start'
                          : 'bg-stitch-green text-black font-semibold self-end'
                      }`}
                    >
                      {!isSystem && (
                        <div className="text-[9px] font-mono opacity-85 mb-1 flex justify-between gap-4">
                          <span className={msg.sender === 'LENDER' ? 'text-zinc-300' : 'text-zinc-900'}>{msg.sender === 'LENDER' ? 'Bank Underwriter' : 'You'}</span>
                          <span className={msg.sender === 'LENDER' ? 'text-zinc-500' : 'text-zinc-800'}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  id="chat-message-input"
                  type="text"
                  placeholder="Type message to clear underwriters' flags..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 bg-stitch-dark border border-stitch-border rounded-xl px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-stitch-green"
                />
                <button
                  id="send-chat-btn"
                  type="submit"
                  className="bg-stitch-green hover:bg-stitch-green-hover text-black p-2 rounded-xl transition-colors shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Reusable DocumentAuditLog component */}
          <div className="lg:col-span-8">
            <DocumentAuditLog msmeId={profile.id} refreshTrigger={auditDocs.length} />
          </div>

          {/* Right Column: File Ingest Uploader */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* File Drag Drop uploader */}
            <div className="bg-stitch-card border border-stitch-border rounded-3xl p-6 flex flex-col space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-200 font-mono uppercase tracking-wider">Ingest New Compliance Feeds</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Upload supplementary tax summaries, GSTIN ledgers, or EPFO receipts.</p>
              </div>

              {/* Drag & Drop File Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('audit-file-upload-input-tab')?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 relative ${
                  dragActive 
                    ? 'border-stitch-green bg-stitch-green/5' 
                    : 'border-stitch-border hover:border-stitch-green/40 hover:bg-stitch-dark/20'
                }`}
              >
                <input
                  id="audit-file-upload-input-tab"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.json,.xml,.csv,.xlsx"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-zinc-850 p-2.5 rounded-xl text-zinc-400">
                    <Send className="h-5 w-5 rotate-45 transform text-stitch-green" />
                  </div>
                  <p className="text-xs font-semibold text-gray-200">
                    Drag & drop files here, or <span className="text-stitch-green hover:underline">browse</span>
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Supports PDF, JSON, XML, CSV (Max 10MB)
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950/40 border border-stitch-border/50 p-4 rounded-2xl text-[11px] text-zinc-400 leading-relaxed">
                <p className="font-bold text-gray-300 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-stitch-green" /> Cryptographic Notarization
                </p>
                All uploaded files are parsed on secure sandbox environments, mapped to their verified schemas, and registered with a unique SHA-256 digital hash on the Kredo Compliance Ledger.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Business Advisor Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isAiOpen && (
            <motion.div
              id="ai-chat-advisor-panel"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-80 sm:w-96 h-[500px] bg-stitch-card border border-stitch-border rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4"
            >
              {/* Header */}
              <div className="bg-stitch-dark px-4 py-3 border-b border-stitch-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-stitch-green/10 p-1.5 rounded-xl text-stitch-green">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Kredo AI Advisor</h3>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-stitch-green inline-block animate-pulse"></span>
                      Smart Credit Optimizer (Gemini)
                    </p>
                  </div>
                </div>
                <button
                  id="close-ai-advisor"
                  onClick={() => setIsAiOpen(false)}
                  className="text-zinc-500 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat messages */}
              <div
                id="ai-chat-messages-container"
                className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/20 text-xs text-gray-200"
              >
                {aiHistory.map((h, idx) => (
                  <div
                    key={idx}
                    className={`flex ${h.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed whitespace-pre-line border ${
                        h.sender === 'USER'
                          ? 'bg-stitch-green/10 border-stitch-green/30 text-stitch-green rounded-tr-none'
                          : 'bg-stitch-dark border-stitch-border text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {h.message}
                    </div>
                  </div>
                ))}
                
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-stitch-dark border border-stitch-border rounded-2xl rounded-tl-none px-3 py-2 text-zinc-400 italic flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3 animate-spin text-stitch-green" />
                      Kredo Advisor is analyzing alternate ledger...
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt Suggestions */}
              <div className="p-2 border-t border-stitch-border/50 bg-stitch-dark/40 flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { text: 'Improve GST score', label: 'GST Filings' },
                  { text: 'Explain my risk flags', label: 'Risk Flags' },
                  { text: 'Cheque bounce solutions', label: 'Bank Bounces' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAiMessage(s.text)}
                    className="text-[9px] bg-stitch-dark hover:bg-zinc-800 text-stitch-green hover:text-white px-2.5 py-1 rounded-lg border border-stitch-border/60 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="p-3 border-t border-stitch-border bg-stitch-dark flex gap-2"
              >
                <input
                  id="ai-advisor-input-text"
                  type="text"
                  placeholder="Ask Kredo AI Advisor..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-stitch-border rounded-xl px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green"
                />
                <button
                  id="send-ai-advisor-msg"
                  type="submit"
                  disabled={!aiMessage.trim() || isAiTyping}
                  className="bg-stitch-green hover:bg-stitch-green-hover disabled:opacity-40 text-black px-3 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md shadow-stitch-green/10 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launcher Toggle Button */}
        <button
          id="ai-advisor-launcher"
          onClick={() => setIsAiOpen(prev => !prev)}
          className="bg-stitch-green text-black hover:bg-stitch-green-hover p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 group relative"
        >
          <Bot className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stitch-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-black"></span>
          </span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-bold text-black pl-0 group-hover:pl-2 whitespace-nowrap">
            Kredo Advisor AI
          </span>
        </button>
      </div>
    </div>
  );
};
