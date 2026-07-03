import React, { useState, useEffect } from 'react';
import { MSMEProfile, LoanApplication, SimulatorVariables } from './types';
import { Navbar } from './components/Navbar';
import { MsmeDashboard } from './components/MsmeDashboard';
import { LenderDashboard } from './components/LenderDashboard';
import { ApiSandbox } from './components/ApiSandbox';
import { ShieldCheck, Info, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [msmes, setMsmes] = useState<MSMEProfile[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedMsmeId, setSelectedMsmeId] = useState<string>('msme-1');
  const [role, setRole] = useState<'MSME' | 'LENDER' | 'DEVELOPER'>('MSME');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // 1. Initial Data Fetching from full-stack Express API
  const fetchAllData = async (shouldSilence = false) => {
    if (!shouldSilence) setIsLoading(true);
    setNetworkError(null);
    try {
      // Fetch both MSMEs and current credit applications in parallel
      const [msmesRes, appsRes] = await Promise.all([
        fetch('/api/msmes'),
        fetch('/api/applications')
      ]);

      if (!msmesRes.ok || !appsRes.ok) {
        throw new Error('Failed to resolve alternate credit records from ledger.');
      }

      const msmesData: MSMEProfile[] = await msmesRes.json();
      const appsData: LoanApplication[] = await appsRes.json();

      setMsmes(msmesData);
      setApplications(appsData);

      // Set default selection if none exists
      if (msmesData.length > 0 && !selectedMsmeId) {
        setSelectedMsmeId(msmesData[0].id);
      }
    } catch (err: any) {
      console.error('Data loading failure:', err);
      setNetworkError(err.message || 'Unable to sync credit intelligence data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 2. Simulator variables updater (emits state update to backend)
  const handleUpdateSimVariables = async (updatedVars: SimulatorVariables) => {
    try {
      const res = await fetch(`/api/msmes/${selectedMsmeId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVars)
      });

      if (!res.ok) throw new Error('Rating calculation failed.');

      // Silently refresh MSME state to update computed scores globally
      await fetchAllData(true);
    } catch (err) {
      console.error('Simulation error:', err);
      throw err;
    }
  };

  // 3. New Loan Application submitter
  const handleSubmitLoan = async (loanData: { requestedAmount: number; purpose: string; tenureMonths: number }) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msmeId: selectedMsmeId,
          ...loanData
        })
      });

      if (!res.ok) throw new Error('Loan registration rejected.');

      // Refresh applications pipeline
      await fetchAllData(true);
    } catch (err) {
      console.error('Loan submission error:', err);
      throw err;
    }
  };

  // 4. Lender Credit decisioning (Approve/Decline)
  const handleApproveReject = async (
    appId: string,
    status: 'APPROVED' | 'REJECTED',
    data: { approvedAmount: number; interestRate: number; comments: string }
  ) => {
    try {
      const res = await fetch(`/api/applications/${appId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...data
        })
      });

      if (!res.ok) throw new Error('Decision registration failed.');

      await fetchAllData(true);
    } catch (err) {
      console.error('Credit decisioning error:', err);
      throw err;
    }
  };

  // 5. Ask for borrower clarification
  const handleAskClarification = async (appId: string, lenderQuestion: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lenderQuestion })
      });

      if (!res.ok) throw new Error('Clarification dispatch failed.');

      await fetchAllData(true);
    } catch (err) {
      console.error('Clarification desk error:', err);
      throw err;
    }
  };

  // 6. Post chat messages (MSME or Lender)
  const handleSendChatMessage = async (appId: string, message: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: role === 'LENDER' ? 'LENDER' : 'MSME',
          message
        })
      });

      if (!res.ok) throw new Error('Chat deposit failed.');

      await fetchAllData(true);
    } catch (err) {
      console.error('Clarification chat error:', err);
      throw err;
    }
  };

  // 7. Generate Gemini AI Credit Report (calls Node.js backend)
  const handleGenerateAiReport = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/analyze-gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Cognitive credit analysis failed.');

      const data = await res.json();
      await fetchAllData(true);
      return data;
    } catch (err) {
      console.error('Gemini underwriting report generation error:', err);
      throw err;
    }
  };

  // Resolve active MSME data for display
  const activeMsme = msmes.find(m => m.id === selectedMsmeId);

  return (
    <div className="flex flex-col min-h-screen bg-stitch-dark text-gray-100">
      {/* 1. Header and Navigation */}
      <Navbar
        msmes={msmes}
        selectedMsmeId={selectedMsmeId}
        onSelectMsme={(id) => setSelectedMsmeId(id)}
        role={role}
        onChangeRole={(newRole) => setRole(newRole)}
      />

      {/* 2. Loading state, error state, or main content */}
      <main className="flex-grow">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="h-8 w-8 text-stitch-green animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-200">Retrieving Alternate Credit Footprints...</p>
              <p className="text-xs text-gray-400 mt-1">Connecting to GSTR systems, UPI gateways, bank AA flows, and EPFO networks...</p>
            </div>
          </div>
        ) : networkError ? (
          <div className="max-w-md mx-auto my-12 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center space-y-4">
            <Info className="h-10 w-10 text-rose-400 mx-auto" />
            <div>
              <h3 className="font-display font-bold text-gray-100">Network Disconnect</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{networkError}</p>
            </div>
            <button
              onClick={() => fetchAllData()}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              Retry Network Handshake
            </button>
          </div>
        ) : (
          <>
            {/* Active Workspace Indicators */}
            <div className="bg-stitch-dark/60 border-b border-stitch-border px-6 py-2">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-stitch-green status-pulse" />
                  <span className="font-mono">KREDO LIVE LEDGER CONNECTED</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span>PORT: 3000</span>
                  <span>|</span>
                  <span>MODE: {role === 'MSME' ? 'BORROWER COMPLIANCE' : role === 'LENDER' ? 'LENDER RISK MANAGEMENT' : 'OCEN API TESTING'}</span>
                </div>
              </div>
            </div>

            {/* Active Role Dashboard View */}
            {role === 'MSME' && activeMsme && (
              <MsmeDashboard
                profile={activeMsme}
                metrics={(activeMsme as any).metrics}
                variables={(activeMsme as any).variables}
                scoreDetails={(activeMsme as any).scoreDetails}
                applications={applications.filter(app => app.msmeId === selectedMsmeId)}
                onUpdateSimVariables={handleUpdateSimVariables}
                onSubmitLoan={handleSubmitLoan}
                onSendChatMessage={handleSendChatMessage}
              />
            )}

            {role === 'LENDER' && (
              <LenderDashboard
                applications={applications}
                msmes={msmes}
                onApproveReject={handleApproveReject}
                onAskClarification={handleAskClarification}
                onSendChatMessage={handleSendChatMessage}
                onGenerateAiReport={handleGenerateAiReport}
              />
            )}

            {role === 'DEVELOPER' && (
              <ApiSandbox />
            )}
          </>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-stitch-dark border-t border-stitch-border py-6 px-6 text-center text-xs text-zinc-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Kredo Credit Intelligence Platform. Powered by GST, UPI, Account Aggregator, and EPFO Alternate Data.</p>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span className="text-gray-400">SECURE UNDER OCEN 1.2 PROTOCOLS</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">RBI REGISTERED AA ADAPTER</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
