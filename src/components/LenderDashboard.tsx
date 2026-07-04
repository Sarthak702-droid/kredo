import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { exportReportToPDF } from '../lib/pdfExporter';
import { apiFetch } from '../lib/api';
import {
  LoanApplication,
  MSMEProfile,
  FinancialMetrics,
  CreditScoreDetails,
  SimulatorVariables
} from '../types';
import {
  FileCode2,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
  Bot,
  Activity,
  Send,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Info,
  DollarSign,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Briefcase,
  FileText,
  User,
  ExternalLink
} from 'lucide-react';

interface LenderDashboardProps {
  applications: LoanApplication[];
  msmes: MSMEProfile[];
  selectedMsmeId?: string;
  highlightAppId?: string | null;
  onApproveReject: (id: string, status: 'APPROVED' | 'REJECTED', data: { approvedAmount: number; interestRate: number; comments: string }) => Promise<any>;
  onAskClarification: (id: string, question: string) => Promise<any>;
  onSendChatMessage: (id: string, message: string) => Promise<any>;
  onGenerateAiReport: (id: string) => Promise<any>;
}

export const LenderDashboard: React.FC<LenderDashboardProps> = ({
  applications,
  msmes,
  selectedMsmeId,
  highlightAppId,
  onApproveReject,
  onAskClarification,
  onSendChatMessage,
  onGenerateAiReport
}) => {
  // Navigation & selection
  const [selectedAppId, setSelectedAppId] = useState<string | null>(applications[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [portfolioRisk, setPortfolioRisk] = useState<Array<{ industry: string; averageScore: number; count: number; minScore: number; maxScore: number }>>([]);
  const [activeView, setActiveView] = useState<'APPLICATIONS' | 'PORTFOLIO_RISK'>('APPLICATIONS');

  useEffect(() => {
    if (highlightAppId) {
      setSelectedAppId(highlightAppId);
      setActiveView('APPLICATIONS');
    }
  }, [highlightAppId]);

  useEffect(() => {
    if (highlightAppId || !selectedMsmeId) return;
    const matchingApp = applications.find((app) => app.msmeId === selectedMsmeId);
    if (matchingApp) {
      setSelectedAppId(matchingApp.id);
      setActiveView('APPLICATIONS');
    }
  }, [selectedMsmeId, applications, highlightAppId]);

  useEffect(() => {
    let isMounted = true;
    const fetchRiskDensity = async () => {
      try {
        const res = await apiFetch('/api/reports/portfolio-risk-density');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPortfolioRisk(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch portfolio risk density:', err);
      }
    };
    fetchRiskDensity();
    return () => {
      isMounted = false;
    };
  }, []);

  // Decision state
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT' | 'CLARIFY' | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [decisionComments, setDecisionComments] = useState('');
  const [clarifyQuestion, setClarifyQuestion] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiReportWarning, setAiReportWarning] = useState<string | null>(null);

  // Chat State
  const [lenderChatMessage, setLenderChatMessage] = useState('');

  // Selected app data derivations
  const activeApp = applications.find(a => a.id === selectedAppId);
  const activeMsme = activeApp ? msmes.find(m => m.id === activeApp.msmeId) : null;
  const activeMetrics = activeMsme ? (activeMsme as any).metrics : null;
  const activeScoreDetails: CreditScoreDetails | null = activeMsme ? (activeMsme as any).scoreDetails : null;
  const activeVars: SimulatorVariables | null = activeMsme ? (activeMsme as any).variables : null;

  // Filtered applications
  const filteredApps = applications.filter(app => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  // Dynamic Sectoral risk computation
  const sectorsMap: Record<string, { totalScore: number; count: number; minScore: number; maxScore: number }> = {};
  msmes.forEach(m => {
    const score = (m as any).scoreDetails?.totalScore || 600;
    const sector = m.sector || 'Other';
    if (!sectorsMap[sector]) {
      sectorsMap[sector] = { totalScore: 0, count: 0, minScore: 900, maxScore: 300 };
    }
    sectorsMap[sector].totalScore += score;
    sectorsMap[sector].count += 1;
    sectorsMap[sector].minScore = Math.min(sectorsMap[sector].minScore, score);
    sectorsMap[sector].maxScore = Math.max(sectorsMap[sector].maxScore, score);
  });

  const sectorData = Object.entries(sectorsMap).map(([sector, data]) => {
    const avgScore = Math.round(data.totalScore / data.count);
    let displayName = sector;
    if (sector.includes('Manufacturing')) displayName = 'Apparel Mfg';
    else if (sector.includes('Grocery')) displayName = 'Retail Grocery';
    else if (sector.includes('IT Services')) displayName = 'IT Services';
    else if (sector.includes('Logistics')) displayName = 'Logistics & Transport';

    return {
      name: displayName,
      fullName: sector,
      avgScore,
      count: data.count,
      minScore: data.minScore,
      maxScore: data.maxScore,
    };
  });

  const chartDataToUse = portfolioRisk.length > 0
    ? portfolioRisk.map(item => {
        let displayName = item.industry;
        if (item.industry.includes('Manufacturing')) displayName = 'Apparel Mfg';
        else if (item.industry.includes('Grocery')) displayName = 'Retail Grocery';
        else if (item.industry.includes('IT Services')) displayName = 'IT Services';
        else if (item.industry.includes('Logistics')) displayName = 'Logistics & Transport';
        return {
          name: displayName,
          fullName: item.industry,
          avgScore: item.averageScore,
          count: item.count,
          minScore: item.minScore,
          maxScore: item.maxScore
        };
      })
    : sectorData;

  // Compile Sector vs Risk Category portfolio heatmap matrix
  const heatmapSectors = ['Apparel Mfg', 'Retail Grocery', 'IT Services', 'Logistics & Transport'];
  const heatmapRisks = ['High Risk', 'Moderate', 'Prime'];
  
  const heatmapData: Array<{
    sector: string;
    riskLevel: string;
    count: number;
    avgScore: number;
    xVal: string;
    yVal: string;
  }> = [];

  heatmapSectors.forEach((s) => {
    heatmapRisks.forEach((r) => {
      const msmesInCell = msmes.filter(m => {
        let displayName = m.sector;
        if (m.sector.includes('Manufacturing')) displayName = 'Apparel Mfg';
        else if (m.sector.includes('Grocery')) displayName = 'Retail Grocery';
        else if (m.sector.includes('IT Services')) displayName = 'IT Services';
        else if (m.sector.includes('Logistics')) displayName = 'Logistics & Transport';

        const score = (m as any).scoreDetails?.totalScore || 600;
        let riskGroup = 'Moderate';
        if (score < 580) riskGroup = 'High Risk';
        else if (score >= 680) riskGroup = 'Prime';

        return displayName === s && riskGroup === r;
      });

      const count = msmesInCell.length;
      const avgScore = count > 0 
        ? Math.round(msmesInCell.reduce((sum, m) => sum + ((m as any).scoreDetails?.totalScore || 600), 0) / count)
        : 0;

      heatmapData.push({
        sector: s,
        riskLevel: r,
        count,
        avgScore,
        xVal: r,
        yVal: s
      });
    });
  });

  const handleGenerateAIReport = async () => {
    if (!selectedAppId) return;
    setIsGeneratingAi(true);
    setAiReportWarning(null);
    try {
      const res = await onGenerateAiReport(selectedAppId);
      if (res && res.warning) {
        setAiReportWarning('Note: Running on fallback analytics. Register a GEMINI_API_KEY under settings to activate cognitive LLM credit reports.');
      } else if (res && res.isMock) {
        setAiReportWarning('Note: Running on deterministic mock underwriting. Provide a real GEMINI_API_KEY in the Secrets panel to activate live generative analysis.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !decisionMode) return;
    setIsSubmittingDecision(true);

    try {
      if (decisionMode === 'APPROVE') {
        await onApproveReject(selectedAppId, 'APPROVED', {
          approvedAmount: Number(approvedAmount),
          interestRate: Number(interestRate),
          comments: decisionComments
        });
        setApprovedAmount('');
        setInterestRate('');
      } else if (decisionMode === 'REJECT') {
        await onApproveReject(selectedAppId, 'REJECTED', {
          approvedAmount: 0,
          interestRate: 0,
          comments: decisionComments
        });
      } else if (decisionMode === 'CLARIFY') {
        await onAskClarification(selectedAppId, clarifyQuestion);
        setClarifyQuestion('');
      }
      setDecisionMode(null);
      setDecisionComments('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !lenderChatMessage.trim()) return;
    try {
      await onSendChatMessage(selectedAppId, lenderChatMessage);
      setLenderChatMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  // Helper score badges
  const getRatingBadge = (score: number) => {
    if (score >= 780) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 680) return 'bg-stitch-green/15 text-stitch-green border-stitch-green/30';
    if (score >= 580) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  const getScoreColor = (score: number) => {
    if (score >= 780) return 'text-emerald-400';
    if (score >= 680) return 'text-stitch-green';
    if (score >= 580) return 'text-yellow-400';
    return 'text-rose-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-stitch-border">
        <button
          onClick={() => setActiveView('APPLICATIONS')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeView === 'APPLICATIONS'
              ? 'border-stitch-green text-stitch-green'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Underwriting Pipeline
        </button>
        <button
          onClick={() => setActiveView('PORTFOLIO_RISK')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeView === 'PORTFOLIO_RISK'
              ? 'border-stitch-green text-stitch-green'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Portfolio Risk Analysis</span>
        </button>
      </div>

      {activeView === 'APPLICATIONS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT PANEL: Applications List (col-span-4) */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        <div className="bg-stitch-card rounded-3xl p-5 border border-stitch-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Underwriting Funnel</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Active credit applications</p>
            </div>
            <span className="text-xs bg-stitch-green/10 text-stitch-green font-mono px-2 py-0.5 rounded-full border border-stitch-green/20 font-semibold">
              {applications.length} TOTAL
            </span>
          </div>

          {/* Filter tabs */}
          <div className="grid grid-cols-5 gap-1 bg-stitch-dark p-1 rounded-xl border border-stitch-border mb-4 text-[10px]">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION_REQUIRED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`py-1.5 rounded-md font-medium text-center transition-all ${
                  filterStatus === status
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-gray-200'
                }`}
              >
                {status === 'CLARIFICATION_REQUIRED' ? 'CLARIFY' : status}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredApps.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center italic py-10">No applications found in this status.</p>
            ) : (
              filteredApps.map((app) => {
                const isSelected = app.id === selectedAppId;
                const msme = msmes.find(m => m.id === app.msmeId);
                const score = msme ? (msme as any).scoreDetails?.totalScore : 500;
                
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setDecisionMode(null);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col space-y-2 ${
                      isSelected
                        ? 'bg-stitch-dark border-stitch-green shadow-md shadow-black/40'
                        : 'bg-stitch-dark/60 border-stitch-border hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-100 line-clamp-1">{app.msmeName}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{msme?.sector.split(' ')[0]} sector</p>
                      </div>
                      <div className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${getRatingBadge(score)}`}>
                        {score}
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-gray-200 font-mono">₹{(app.requestedAmount).toLocaleString()}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{app.tenureMonths} Months</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-stitch-border/60 pt-2 text-[9px]">
                      <span className="text-zinc-500 font-mono">ID: {app.id.substring(4, 9)}</span>
                      <div>
                        {app.status === 'APPROVED' && (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            ● Approved
                          </span>
                        )}
                        {app.status === 'REJECTED' && (
                          <span className="text-rose-400 font-bold flex items-center gap-0.5">
                            ● Declined
                          </span>
                        )}
                        {app.status === 'PENDING' && (
                          <span className="text-yellow-400 font-bold flex items-center gap-0.5 animate-pulse">
                            ● Under review
                          </span>
                        )}
                        {app.status === 'CLARIFICATION_REQUIRED' && (
                          <span className="text-stitch-green font-bold flex items-center gap-0.5">
                            ● Awaiting reply
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Sectoral Risk Heatmap */}
        <div id="sector-risk-heatmap-card" className="bg-stitch-card rounded-3xl p-5 border border-stitch-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">Sectoral Credit Risk Map</h3>
              <p className="text-[10px] text-zinc-400 font-sans">Portfolio distribution & risk concentration matrix</p>
            </div>
            <Activity className="h-4 w-4 text-stitch-green animate-pulse" />
          </div>

          {/* Matrix Grid */}
          <div className="space-y-1.5 my-2.5">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-1.5 text-center">
              <div className="col-span-4" /> {/* empty space for sector names */}
              <div className="col-span-8 grid grid-cols-3 gap-1 text-[9px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                <div>High Risk (&lt;580)</div>
                <div>Moderate (580-680)</div>
                <div>Prime (&gt;680)</div>
              </div>
            </div>

            {/* Sector rows */}
            {heatmapSectors.map((s) => {
              return (
                <div key={s} className="grid grid-cols-12 gap-1.5 items-center">
                  {/* Row header: Sector Label */}
                  <div className="col-span-4 text-[10px] font-semibold text-zinc-300 truncate pr-1" title={s}>
                    {s}
                  </div>
                  {/* Grid cells representing each risk category */}
                  <div className="col-span-8 grid grid-cols-3 gap-1">
                    {heatmapRisks.map((r) => {
                      const cell = heatmapData.find(d => d.sector === s && d.riskLevel === r);
                      const count = cell ? cell.count : 0;
                      const avgScore = cell ? cell.avgScore : 0;

                      // Decide background color depending on Risk Category and whether count > 0
                      let bgClass = 'bg-zinc-900/40 border border-zinc-800/60';
                      let textClass = 'text-zinc-600';
                      let scoreTag = '';

                      if (count > 0) {
                        textClass = 'text-white font-bold';
                        if (r === 'High Risk') {
                          bgClass = 'bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20';
                          scoreTag = `Avg: ${avgScore}`;
                        } else if (r === 'Moderate') {
                          bgClass = 'bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20';
                          scoreTag = `Avg: ${avgScore}`;
                        } else {
                          bgClass = 'bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20';
                          scoreTag = `Avg: ${avgScore}`;
                        }
                      }

                      return (
                        <div
                          key={r}
                          className={`rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer text-center relative group ${bgClass}`}
                        >
                          <span className={`text-[10px] font-mono leading-none ${textClass}`}>{count} {count === 1 ? 'firm' : 'firms'}</span>
                          {count > 0 && (
                            <span className="text-[8px] font-mono text-zinc-400 mt-0.5">{scoreTag}</span>
                          )}

                          {/* Hover Tooltip overlay */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block z-45 w-44 bg-zinc-950 border border-stitch-border p-2 rounded-xl text-left pointer-events-none shadow-2xl">
                            <p className="text-[10px] font-bold text-gray-100">{s}</p>
                            <p className="text-[9px] text-zinc-400 mt-0.5">Risk Level: <span className="text-white font-mono font-bold">{r}</span></p>
                            <p className="text-[9px] text-zinc-400">Total Businesses: <span className="text-white font-mono font-bold">{count}</span></p>
                            {count > 0 && (
                              <p className="text-[9px] text-stitch-green">Avg Credit Score: <span className="font-mono font-bold">{avgScore}</span></p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Indicator */}
          <div className="flex justify-between items-center text-[9px] font-mono mt-3 pt-2.5 border-t border-stitch-border/30 text-zinc-500">
            <span>● Matrix shows firm counts in active underwriting</span>
            <span className="text-stitch-green">Grid updated real-time</span>
          </div>
        </div>

        {/* Recharts Sector Average Credit Score Heatmap */}
        <div id="recharts-portfolio-risk-concentration" className="bg-stitch-card rounded-3xl p-5 border border-stitch-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">Sectoral Health Heatmap</h3>
              <p className="text-[10px] text-zinc-400 font-sans">Average credit scores aggregated by industry sector</p>
            </div>
            <TrendingUp className="h-4 w-4 text-stitch-green" />
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartDataToUse}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[300, 900]}
                  stroke="#71717a"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#71717a"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  width={85}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-950 border border-stitch-border p-2.5 rounded-xl text-[10px] shadow-2xl">
                          <p className="font-bold text-white">{data.fullName}</p>
                          <p className="text-zinc-400 mt-1">Average Score: <span className="text-stitch-green font-mono font-bold">{data.avgScore}</span></p>
                          <p className="text-zinc-400 font-mono">Firms: {data.count} | Min-Max: {data.minScore}-{data.maxScore}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} barSize={12}>
                  {chartDataToUse.map((entry, index) => {
                    let cellColor = '#ef4444'; // Red (High Risk)
                    if (entry.avgScore >= 680) cellColor = '#ccff00'; // Stitch Green (Prime)
                    else if (entry.avgScore >= 580) cellColor = '#f59e0b'; // Amber (Moderate)

                    return <Cell key={`cell-${index}`} fill={cellColor} opacity={0.8} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-3 justify-center text-[8px] font-mono mt-2 pt-2 border-t border-stitch-border/30 text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" /> Prime (&gt;680)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Moderate (580-680)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> High Risk (&lt;580)
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Underwriting Intelligence Desk (col-span-8) */}
      <div
        id="lender-app-detail"
        className={`lg:col-span-8 flex flex-col space-y-6 ${
          highlightAppId && highlightAppId === selectedAppId
            ? 'ring-2 ring-stitch-green ring-offset-2 ring-offset-stitch-dark rounded-3xl'
            : ''
        }`}
      >
        {activeApp && activeMsme && activeVars && activeScoreDetails ? (
          <>
            {/* Quick Summary Banner */}
            <div className="bg-stitch-card rounded-3xl p-6 border border-stitch-border">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stitch-green font-mono tracking-widest bg-stitch-green/10 px-2 py-0.5 rounded-full border border-stitch-green/20 uppercase font-bold">
                      CREDIT CHECK PASS
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Application ID: {activeApp.id.substring(4, 9)}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold mt-1 text-white">{activeApp.msmeName}</h2>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">Based in {activeMsme.location} | Active registered entity since {activeMsme.establishedYear}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 font-mono">KREDO RISK SCORE</span>
                    <div className={`font-display text-3xl font-bold ${getScoreColor(activeScoreDetails.totalScore)}`}>
                      {activeScoreDetails.totalScore} <span className="text-xs font-normal text-zinc-400">/900</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl border text-center font-bold font-mono text-base ${getRatingBadge(activeScoreDetails.totalScore)}`}>
                    GRADE {activeScoreDetails.riskGrade}
                  </div>
                </div>
              </div>

              {/* Proposed Capital Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stitch-border/60 mt-6 pt-5">
                <div className="bg-stitch-dark p-3.5 rounded-2xl border border-stitch-border">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Requested Credit</span>
                  <span className="text-lg font-bold text-gray-100 font-mono mt-1 block">₹{(activeApp.requestedAmount).toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Tenure: {activeApp.tenureMonths} Months</span>
                </div>

                <div className="bg-stitch-dark p-3.5 rounded-2xl border border-stitch-border">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Kredo Algorithmic Cap</span>
                  <span className="text-lg font-bold text-gray-100 font-mono mt-1 block">
                    {activeScoreDetails.approvedLimit > 0 ? `₹${(activeScoreDetails.approvedLimit).toLocaleString()}` : 'Declined (HR)'}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Max risk-graded line limit</span>
                </div>

                <div className="bg-stitch-dark p-3.5 rounded-2xl border border-stitch-border">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Suggested Rate</span>
                  <span className="text-lg font-bold text-gray-100 font-mono mt-1 block">
                    {activeScoreDetails.approvedLimit > 0 ? `${activeScoreDetails.suggestedInterestRate.toFixed(1)}%` : 'Rejected'}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Interest charge per annum</span>
                </div>
              </div>
            </div>

            {/* AI Deep Credit Intelligence assessment */}
            <div className="bg-stitch-card rounded-3xl p-6 border border-stitch-border relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,255,102,0.02),transparent)] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-stitch-green/10 p-2 rounded-xl text-stitch-green shadow-md shadow-stitch-green/5">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      Gemini Cognitive Credit Underwriter
                    </h3>
                    <p className="text-xs text-zinc-400">Advanced AI risk evaluation of alternate digital compliance footprints</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    id="generate-ai-report-btn"
                    onClick={handleGenerateAIReport}
                    disabled={isGeneratingAi}
                    className="bg-stitch-green hover:bg-stitch-green-hover disabled:opacity-50 text-black text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-stitch-green/10 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Analyzing Alternate Footprints...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{activeApp.underwritingReport ? 'Re-Generate Report' : 'Compile AI Underwriting Report'}</span>
                      </>
                    )}
                  </button>
                  <button
                    id="export-ai-report-pdf-btn"
                    onClick={() => exportReportToPDF(activeApp, activeMsme, activeScoreDetails)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <FileText className="h-4.5 w-4.5 text-stitch-green" />
                    <span>Export Credit Report PDF</span>
                  </button>
                </div>
              </div>

              {/* AI Report Content Container */}
              <AnimatePresence mode="wait">
                {isGeneratingAi ? (
                  <motion.div
                    key="ai-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-stitch-dark p-8 rounded-2xl border border-stitch-border text-center flex flex-col items-center justify-center space-y-4"
                  >
                    <Loader2 className="h-8 w-8 text-stitch-green animate-spin" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-200">Retrieving Alternate Footprints...</p>
                      <p className="text-[11px] text-zinc-500 italic max-w-sm">
                        Ingesting live GST filing history, compiling merchant UPI payment density, analyzing Account Aggregator bank summaries, and verifying EPFO payroll consistency...
                      </p>
                    </div>
                  </motion.div>
                ) : activeApp.underwritingReport ? (
                  <motion.div
                    key="ai-report-loaded"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 bg-stitch-dark border border-stitch-border p-5 rounded-2xl relative"
                  >
                    {aiReportWarning && (
                      <div className="bg-stitch-green/10 border border-stitch-green/20 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-stitch-green">
                        <Info className="h-3.5 w-3.5 shrink-0" />
                        <span>{aiReportWarning}</span>
                      </div>
                    )}

                    {/* Executive Summary */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-200 font-mono uppercase tracking-wider mb-1">Executive Recommendation Report</h4>
                      <p className="text-xs text-gray-300 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-stitch-border/50">
                        {activeApp.underwritingReport.executiveSummary}
                      </p>
                    </div>

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-emerald-950/10 border border-emerald-500/15 p-3.5 rounded-xl">
                        <h5 className="text-[11px] font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <ShieldCheck className="h-4 w-4" /> Credit Strengths
                        </h5>
                        <ul className="space-y-1.5 text-xs text-gray-300 list-disc pl-4 leading-relaxed">
                          {activeApp.underwritingReport.strengths.map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-rose-950/10 border border-rose-500/15 p-3.5 rounded-xl">
                        <h5 className="text-[11px] font-bold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="h-4 w-4" /> Credit Weaknesses / Risks
                        </h5>
                        <ul className="space-y-1.5 text-xs text-gray-300 list-disc pl-4 leading-relaxed">
                          {activeApp.underwritingReport.weaknesses.map((weak, idx) => (
                            <li key={idx}>{weak}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Cash Flow Assessment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stitch-border/40 pt-4">
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-300 font-mono uppercase tracking-wider mb-1.5">Cash Flow Velocity</h5>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {activeApp.underwritingReport.cashFlowAssessment}
                        </p>
                      </div>

                      <div>
                        <h5 className="text-[11px] font-bold text-gray-300 font-mono uppercase tracking-wider mb-1.5">Underwriting Risk Mitigants</h5>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {activeApp.underwritingReport.riskMitigants}
                        </p>
                      </div>
                    </div>

                    {/* Pro Expert Recommended Line Parameters */}
                    <div className="mt-2 bg-stitch-green/10 border border-stitch-green/25 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-stitch-green font-semibold font-mono">
                        <Sparkles className="h-4 w-4 text-stitch-green" /> COGNITIVE RECOMMENDATION CAP
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-zinc-400 mr-1.5">Proposed Limit:</span>
                          <span className="font-bold text-gray-100 font-mono text-sm">₹{(activeApp.underwritingReport.recommendedLimitINR).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 mr-1.5">Proposed Rate:</span>
                          <span className="font-bold text-gray-100 font-mono text-sm">{activeApp.underwritingReport.recommendedRatePercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ai-prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-stitch-dark/40 p-6 rounded-2xl border border-stitch-border text-center flex flex-col items-center justify-center space-y-3"
                  >
                    <Bot className="h-10 w-10 text-zinc-600" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-300">Underwriting Report Not Compiled</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                        Click the compile button to run a deep alternate credit analysis on GST filing cycles, UPI transactional flows, bank balances, and EPFO pay sheets.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Raw Alternate Compliance Ingest Analyzer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GST & UPI Raw Checks */}
              <div className="bg-stitch-card rounded-3xl p-5 border border-stitch-border">
                <h4 className="text-xs font-bold text-gray-200 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-stitch-green" /> TAX & UPI MERCHANT INTEGRATIONS
                </h4>
                
                <div className="space-y-4">
                  {/* GST */}
                  <div className="bg-stitch-dark p-3 rounded-xl border border-stitch-border">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-gray-300">GSTR Compliance Status</span>
                      <span className="text-[11px] text-stitch-green font-mono">{activeScoreDetails.subScores.gstCompliance}% compliant</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">GST delays</span>
                        <b className="text-gray-200 block mt-1 text-xs font-mono">{activeVars.gstDelayedFilingsRatio}% late</b>
                      </div>
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">6M Turnover</span>
                        <b className="text-gray-200 block mt-1 text-xs font-mono">₹22.4 Lakhs</b>
                      </div>
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">Status check</span>
                        <b className="text-emerald-400 block mt-1 text-xs font-semibold">ACTIVE</b>
                      </div>
                    </div>
                  </div>

                  {/* UPI */}
                  <div className="bg-stitch-dark p-3 rounded-xl border border-stitch-border">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-gray-300">UPI Payment Flow Integrity</span>
                      <span className="text-[11px] text-stitch-green font-mono">{activeScoreDetails.subScores.upiFlowStability}% score</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">Monthly Vol</span>
                        <b className="text-gray-200 block mt-1 text-xs font-mono">₹{(activeVars.upiMonthlyVolume / 1000).toFixed(0)}k</b>
                      </div>
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">UPI failure rate</span>
                        <b className="text-gray-200 block mt-1 text-xs font-mono">{activeVars.upiFailureRate}%</b>
                      </div>
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">Txn Stability</span>
                        <b className={activeVars.upiFailureRate > 3.5 ? 'text-rose-400 block mt-1 text-xs font-bold' : 'text-emerald-400 block mt-1 text-xs font-bold'}>
                          {activeVars.upiFailureRate > 3.5 ? 'VOLATILE' : 'STABLE'}
                        </b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank AA & EPFO Raw Checks */}
              <div className="bg-stitch-card rounded-3xl p-5 border border-stitch-border">
                <h4 className="text-xs font-bold text-gray-200 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-stitch-green" /> ACCOUNT AGGREGATOR & PAYROLL
                </h4>

                <div className="space-y-4">
                  {/* Account Aggregator */}
                  <div className="bg-stitch-dark p-3 rounded-xl border border-stitch-border">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-gray-300">Liquid Reserves (Bank Feed)</span>
                      <span className="text-[11px] text-stitch-green font-mono">{activeScoreDetails.subScores.bankingLiquidity}% rating</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">Avg Monthly Bal</span>
                        <b className="text-gray-200 block mt-1 text-xs font-mono">₹{(activeVars.bankAvgBalance / 1000).toFixed(0)}k</b>
                      </div>
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">Ledger bounces</span>
                        <b className={activeVars.bankBounceCount6M > 1 ? 'text-rose-400 block mt-1 text-xs font-mono' : 'text-gray-200 block mt-1 text-xs font-mono'}>
                          {activeVars.bankBounceCount6M} bounces
                        </b>
                      </div>
                      <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                        <span className="text-zinc-400 block">Leverage ratio</span>
                        <b className="text-gray-200 block mt-1 text-xs font-mono">1.06</b>
                      </div>
                    </div>
                  </div>

                  {/* EPFO Payroll */}
                  <div className="bg-stitch-dark p-3 rounded-xl border border-stitch-border">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-gray-300">EPFO Corporate Registration</span>
                      <span className="text-[11px] text-stitch-green font-mono">
                        {activeMsme.employeeCount > 0 ? `${activeScoreDetails.subScores.payrollConsistency}% score` : 'EXEMPT'}
                      </span>
                    </div>
                    {activeMsme.employeeCount > 0 ? (
                      <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
                        <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                          <span className="text-zinc-400 block">EPFO delay</span>
                          <b className="text-gray-200 block mt-1 text-xs font-mono">{activeVars.epfoDelayMonths} months</b>
                        </div>
                        <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                          <span className="text-zinc-400 block">Workforce shift</span>
                          <b className="text-gray-200 block mt-1 text-xs font-mono">{activeVars.epfoHeadcountGrowth}% growth</b>
                        </div>
                        <div className="bg-zinc-900 p-1.5 rounded-lg text-center">
                          <span className="text-zinc-400 block">Headcount</span>
                          <b className="text-emerald-400 block mt-1 text-xs font-bold">{activeMsme.employeeCount} active</b>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-zinc-900/40 p-2 text-center text-[10px] text-zinc-500 rounded-xl mt-2 italic border border-stitch-border/30">
                        No employees registered. Standard composition rules apply (score weights redistributed).
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision panel & Clarification Messaging Desk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stitch-border/40 pt-4">
              
              {/* Decision Action panel */}
              <div className="bg-stitch-card rounded-3xl p-5 border border-stitch-border flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200 font-mono uppercase tracking-wider mb-2">
                    Underwriting Decision panel
                  </h4>
                  <p className="text-[11px] text-zinc-400 mb-4">Confirm lending limit parameters or dispatch clarification requirements</p>

                  {/* Decision select buttons */}
                  {activeApp.status === 'APPROVED' || activeApp.status === 'REJECTED' ? (
                    <div className="bg-stitch-dark p-4 rounded-xl border border-stitch-border text-center">
                      <p className="text-xs text-gray-300">This application is completed and resolved.</p>
                      <div className="mt-3 flex justify-center gap-2">
                        {activeApp.status === 'APPROVED' ? (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono font-bold">
                            ✓ APPROVED AT ₹{(activeApp.approvedAmount || 0).toLocaleString()} ({activeApp.interestRate}% rate)
                          </span>
                        ) : (
                          <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full font-mono font-bold">
                            ✗ LOAN COMPLIANCE DECLINED
                          </span>
                        )}
                      </div>
                    </div>
                  ) : decisionMode ? (
                    <form onSubmit={handleSubmitDecision} className="space-y-3 bg-stitch-dark/40 p-3.5 rounded-xl border border-stitch-border">
                      <div className="flex justify-between items-center pb-2 border-b border-stitch-border mb-2">
                        <span className="text-xs font-bold text-stitch-green font-mono">
                          {decisionMode === 'APPROVE' ? 'GRANT CREDIT LINE' : decisionMode === 'REJECT' ? 'DECLINE CAPITAL REQ' : 'DEMAND CASH FLOW INSIGHTS'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDecisionMode(null)}
                          className="text-[10px] text-zinc-400 hover:text-white"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      {decisionMode === 'APPROVE' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-zinc-400 font-medium mb-1">Approved Limit (INR)</label>
                            <input
                              id="lender-approved-amount-input"
                              type="number"
                              placeholder={`Suggested: ₹${activeScoreDetails.approvedLimit}`}
                              value={approvedAmount}
                              onChange={(e) => setApprovedAmount(e.target.value)}
                              className="w-full bg-stitch-dark border border-stitch-border rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green font-mono"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 font-medium mb-1">Interest Rate (% p.a.)</label>
                            <input
                              id="lender-interest-rate-input"
                              type="number"
                              step="0.1"
                              placeholder={`Suggested: ${activeScoreDetails.suggestedInterestRate}%`}
                              value={interestRate}
                              onChange={(e) => setInterestRate(e.target.value)}
                              className="w-full bg-stitch-dark border border-stitch-border rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green font-mono"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {decisionMode === 'APPROVE' || decisionMode === 'REJECT' ? (
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-medium mb-1">Auditing and Decision Logs</label>
                          <textarea
                            id="lender-comments-input"
                            rows={2}
                            placeholder="State rationale for loan audit logs..."
                            value={decisionComments}
                            onChange={(e) => setDecisionComments(e.target.value)}
                            className="w-full bg-stitch-dark border border-stitch-border rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green"
                            required
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-medium mb-1">Question to Borrower</label>
                          <textarea
                            id="lender-clarification-input"
                            rows={3}
                            placeholder="e.g. Please clarify why you experienced ledger check bounces during May..."
                            value={clarifyQuestion}
                            onChange={(e) => setClarifyQuestion(e.target.value)}
                            className="w-full bg-stitch-dark border border-stitch-border rounded-lg px-2.5 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green"
                            required
                          />
                        </div>
                      )}

                      <button
                        id="submit-decision-btn"
                        type="submit"
                        disabled={isSubmittingDecision}
                        className="w-full bg-stitch-green hover:bg-stitch-green-hover text-black text-xs font-bold py-1.5 rounded-xl transition-colors shadow-sm"
                      >
                        {isSubmittingDecision ? 'Posting Decision...' : 'Commit and Dispatch Decision'}
                      </button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        id="approve-action-btn"
                        onClick={() => {
                          setDecisionMode('APPROVE');
                          setApprovedAmount(String(activeScoreDetails.approvedLimit));
                          setInterestRate(String(activeScoreDetails.suggestedInterestRate));
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Approve</span>
                      </button>

                      <button
                        id="reject-action-btn"
                        onClick={() => setDecisionMode('REJECT')}
                        className="bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Decline</span>
                      </button>

                      <button
                        id="clarify-action-btn"
                        onClick={() => setDecisionMode('CLARIFY')}
                        className="bg-stitch-green/10 hover:bg-stitch-green/15 border border-stitch-green/20 text-stitch-green py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Ask Clarify</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Integration for ongoing Clarifications */}
              <div className="bg-stitch-card rounded-3xl p-5 border border-stitch-border flex flex-col h-[230px]">
                <h4 className="text-xs font-bold text-gray-200 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 shrink-0">
                  <MessageSquare className="h-4 w-4 text-stitch-green" /> Active Clarification Chat
                </h4>

                {/* Chat History Panel */}
                <div className="flex-1 overflow-y-auto pr-1 my-2 flex flex-col space-y-2.5">
                  {activeApp.chatHistory.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 text-center italic my-auto">No clarification chat active.</p>
                  ) : (
                    activeApp.chatHistory.map((msg) => {
                      const isLender = msg.sender === 'LENDER';
                      const isSystem = msg.sender === 'SYSTEM';
                      return (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] rounded-xl p-2 text-[11px] ${
                            isSystem
                              ? 'bg-stitch-dark border border-stitch-border text-zinc-400 mx-auto text-center'
                              : isLender
                              ? 'bg-stitch-green text-black font-semibold self-end'
                              : 'bg-zinc-900 border border-stitch-border text-gray-200 self-start'
                          }`}
                        >
                          {!isSystem && (
                            <div className="text-[8px] font-mono opacity-85 mb-0.5 flex justify-between gap-4">
                              <span className={isLender ? 'text-zinc-800' : 'text-zinc-300'}>{isLender ? 'You' : 'Borrower'}</span>
                              <span className={isLender ? 'text-zinc-700' : 'text-zinc-500'}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                          <p className="leading-relaxed">{msg.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSendChat} className="flex gap-2 shrink-0">
                  <input
                    id="lender-chat-message-input"
                    type="text"
                    disabled={activeApp.status === 'APPROVED' || activeApp.status === 'REJECTED'}
                    placeholder="Enter message to borrower..."
                    value={lenderChatMessage}
                    onChange={(e) => setLenderChatMessage(e.target.value)}
                    className="flex-1 bg-stitch-dark border border-stitch-border rounded-xl px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-stitch-green disabled:opacity-40"
                  />
                  <button
                    id="lender-send-chat-btn"
                    type="submit"
                    disabled={activeApp.status === 'APPROVED' || activeApp.status === 'REJECTED' || !lenderChatMessage.trim()}
                    className="bg-stitch-green hover:bg-stitch-green-hover text-black p-1.5 rounded-xl transition-colors shrink-0 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </>
        ) : (
          <div className="bg-stitch-card rounded-3xl p-12 border border-stitch-border text-center flex flex-col items-center justify-center space-y-4">
            <Info className="h-10 w-10 text-zinc-600" />
            <div>
              <h3 className="font-display text-lg font-bold text-gray-300">No Application Selected</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Choose an alternate cash-flow credit application from the underwriting funnel pool to proceed with auditing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {/* Aggregate Portfolio KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-stitch-card border border-stitch-border p-5 rounded-3xl">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Total Portfolio Exposure</span>
              <span className="text-2xl font-bold text-white font-mono mt-2 block">
                ₹{applications.reduce((acc, app) => acc + (app.status === 'APPROVED' ? app.requestedAmount : 0), 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 mt-1 block">Active approved loan volume</span>
            </div>

            <div className="bg-stitch-card border border-stitch-border p-5 rounded-3xl">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Average Portfolio Rating</span>
              <span className="text-2xl font-bold text-stitch-green font-mono mt-2 block">
                {Math.round(msmes.reduce((acc, m) => acc + ((m as any).scoreDetails?.totalScore || 600), 0) / msmes.length)}
              </span>
              <span className="text-[10px] text-zinc-400 mt-1 block">Across {msmes.length} verified MSMEs</span>
            </div>

            <div className="bg-stitch-card border border-stitch-border p-5 rounded-3xl">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Prime Tier Proportion</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono mt-2 block">
                {Math.round((msmes.filter(m => ((m as any).scoreDetails?.totalScore || 600) >= 680).length / msmes.length) * 100)}%
              </span>
              <span className="text-[10px] text-zinc-400 mt-1 block">Firms in excellent credit grade</span>
            </div>

            <div className="bg-stitch-card border border-stitch-border p-5 rounded-3xl">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Funnel Clearance Rate</span>
              <span className="text-2xl font-bold text-amber-400 font-mono mt-2 block">
                {Math.round((applications.filter(app => app.status !== 'PENDING').length / (applications.length || 1)) * 100)}%
              </span>
              <span className="text-[10px] text-zinc-400 mt-1 block">Decided vs active pipeline</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Heatmaps and Charts Panel */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
              {/* Heatmap with ScatterChart */}
              <div className="bg-stitch-card rounded-3xl p-6 border border-stitch-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-stitch-green" /> Portfolio Credit Risk Concentration Heatmap
                    </h3>
                    <p className="text-xs text-zinc-400">Heatmap coordinates: Industry Sector (Y-Axis) vs Risk Level Grade (X-Axis). Bubble volume indicates firm density.</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-stitch-dark border border-stitch-border px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Recharts Visualization
                  </span>
                </div>

                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <XAxis type="category" dataKey="xVal" name="Risk level" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis type="category" dataKey="yVal" name="Industry Sector" stroke="#71717a" fontSize={10} width={130} tickLine={false} />
                      <ZAxis type="number" dataKey="count" range={[60, 600]} name="Firms" />
                      <RechartsTooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-zinc-950 border border-stitch-border p-3 rounded-xl text-[11px] shadow-2xl">
                                <p className="font-bold text-white">{data.sector}</p>
                                <p className="text-zinc-400 mt-1">Risk Category: <span className="text-white font-mono font-bold">{data.riskLevel}</span></p>
                                <p className="text-zinc-400">Total Registered: <span className="text-white font-mono font-bold">{data.count} {data.count === 1 ? 'firm' : 'firms'}</span></p>
                                {data.count > 0 && (
                                  <p className="text-stitch-green">Avg Credit Score: <span className="font-mono font-bold">{data.avgScore}</span></p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Portfolio Distribution" data={heatmapData} fill="#ccff00">
                        {heatmapData.map((entry, index) => {
                          let color = '#ef4444'; // High Risk
                          if (entry.riskLevel === 'Prime') color = '#ccff00'; // Stitch Green (Prime)
                          else if (entry.riskLevel === 'Moderate') color = '#f59e0b'; // Amber
                          return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.7} stroke={color} strokeWidth={1.5} />;
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-4 justify-center text-[9px] font-mono mt-4 pt-3 border-t border-stitch-border/30 text-zinc-500">
                  <span>● Bubble size represents firm counts</span>
                  <span className="text-zinc-700">|</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" /> Prime (&gt;680)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Moderate (580-680)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> High Risk (&lt;580)
                  </span>
                </div>
              </div>

              {/* Bar Chart representing average scores and min/max scores by sector */}
              <div className="bg-stitch-card rounded-3xl p-6 border border-stitch-border">
                <div>
                  <h3 className="font-display text-base font-bold text-white">Sectoral Credit Health Benchmarks</h3>
                  <p className="text-xs text-zinc-400">Comparing average alternate credit rating limits across different industry clusters.</p>
                </div>

                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartDataToUse}
                      margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
                    >
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={[300, 900]} />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-zinc-950 border border-stitch-border p-3 rounded-xl text-[11px] shadow-2xl">
                                <p className="font-bold text-white">{data.fullName}</p>
                                <p className="text-zinc-400 mt-1">Average Score: <span className="text-stitch-green font-mono font-bold">{data.avgScore}</span></p>
                                <p className="text-zinc-400">Rating Range: <span className="text-gray-200 font-mono">{data.minScore} - {data.maxScore}</span></p>
                                <p className="text-zinc-400">Total Registered: <span className="text-gray-200 font-mono">{data.count}</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="avgScore" radius={[6, 6, 0, 0]} barSize={32}>
                        {chartDataToUse.map((entry, index) => {
                          let cellColor = '#ef4444'; // Red
                          if (entry.avgScore >= 680) cellColor = '#ccff00'; // Stitch Green
                          else if (entry.avgScore >= 580) cellColor = '#f59e0b'; // Amber

                          return <Cell key={`cell-${index}`} fill={cellColor} opacity={0.75} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Panel: Portfolio Firms Directory */}
            <div className="lg:col-span-4 flex flex-col space-y-6">
              <div className="bg-stitch-card rounded-3xl p-5 border border-stitch-border flex flex-col h-[520px]">
                <div>
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Portfolio Registry</h3>
                  <p className="text-[11px] text-zinc-400">Summary list of all verified MSME borrowers</p>
                </div>

                <div className="flex-grow overflow-y-auto mt-4 space-y-3 pr-1">
                  {msmes.map((m) => {
                    const score = (m as any).scoreDetails?.totalScore || 600;
                    const grade = (m as any).scoreDetails?.riskGrade || 'B';
                    return (
                      <div key={m.id} className="bg-stitch-dark/60 border border-stitch-border p-3 rounded-2xl flex flex-col space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-gray-200 truncate max-w-[160px]">{m.name}</h4>
                            <p className="text-[9px] text-zinc-500 font-mono">{m.sector}</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${getRatingBadge(score)}`}>
                            {score} / {grade}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] border-t border-stitch-border/30 pt-1.5 text-zinc-400">
                          <span>Est. {m.establishedYear}</span>
                          <span>{m.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-zinc-950/40 border border-stitch-border/60 p-3 rounded-2xl text-[10px] text-zinc-400 leading-relaxed mt-4 shrink-0">
                  <p className="font-bold text-gray-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-stitch-green" /> Compliance Anchor
                  </p>
                  These MSME records represent cryptographically synchronized data sourced via consent-based GSTR, Account Aggregator, UPI, and EPFO networks.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
