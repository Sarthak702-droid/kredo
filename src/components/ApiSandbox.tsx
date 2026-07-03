import React, { useState } from 'react';
import { Terminal, Send, Copy, Check, FileJson, Cpu } from 'lucide-react';

export const ApiSandbox: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'GET_MSMES' | 'GET_MSME_DETAIL' | 'POST_SIMULATE' | 'GET_APPLICATIONS'>('GET_MSMES');
  const [reqBody, setReqBody] = useState<string>('{}');
  const [responsePayload, setResponsePayload] = useState<string>('// Trigger an API call below to inspect live ledger logs...');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const getEndpointUrl = () => {
    switch (selectedEndpoint) {
      case 'GET_MSMES': return 'GET /api/msmes';
      case 'GET_MSME_DETAIL': return 'GET /api/msmes/msme-1';
      case 'POST_SIMULATE': return 'POST /api/msmes/msme-1/simulate';
      case 'GET_APPLICATIONS': return 'GET /api/applications';
    }
  };

  const getEndpointDescription = () => {
    switch (selectedEndpoint) {
      case 'GET_MSMES': return 'Retrieves all registered MSMEs with their real-time calculated credit ratings, risk grades, and financial sub-scores.';
      case 'GET_MSME_DETAIL': return 'Fetches a detailed credit report of a single MSME (e.g., msme-1) including raw historical GSTR-1 filings, UPI merchant streams, AA bank ledger balances, and EPFO payroll records.';
      case 'POST_SIMULATE': return 'Dynamically simulates risk parameters (such as check bounces, UPI failure rates, late GST filings) and returns the recalculated Kredo Score, risk grade, and credit caps.';
      case 'GET_APPLICATIONS': return 'Retrieves the complete credit underwriting funnel applications pool, listing requested limits, decision states, and clarification chats.';
    }
  };

  const loadDefaultBody = (endpoint: typeof selectedEndpoint) => {
    setSelectedEndpoint(endpoint);
    if (endpoint === 'POST_SIMULATE') {
      setReqBody(JSON.stringify({
        gstDelayedFilingsRatio: 10,
        upiFailureRate: 0.8,
        upiMonthlyVolume: 180000,
        bankAvgBalance: 250000,
        bankBounceCount6M: 0,
        epfoDelayMonths: 0,
        epfoHeadcountGrowth: 15
      }, null, 2));
    } else {
      setReqBody('{}');
    }
  };

  const handleTriggerApi = async () => {
    setIsQuerying(true);
    setResponsePayload('// Resolving network handshake with Kredo ledger systems...');
    
    let path = '';
    let method = 'GET';
    let body: any = null;

    switch (selectedEndpoint) {
      case 'GET_MSMES':
        path = '/api/msmes';
        method = 'GET';
        break;
      case 'GET_MSME_DETAIL':
        path = '/api/msmes/msme-1';
        method = 'GET';
        break;
      case 'POST_SIMULATE':
        path = '/api/msmes/msme-1/simulate';
        method = 'POST';
        try {
          body = JSON.parse(reqBody);
        } catch (e) {
          setResponsePayload('// Error: Invalid JSON format in Request Body');
          setIsQuerying(false);
          return;
        }
        break;
      case 'GET_APPLICATIONS':
        path = '/api/applications';
        method = 'GET';
        break;
    }

    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(path, options);
      const data = await response.json();
      setResponsePayload(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponsePayload(`// Network Error: ${error.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(responsePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-8 max-w-7xl mx-auto">
      {/* LEFT COLUMN: Endpoint Selection */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel rounded-3xl p-6 border border-gray-800">
          <div className="flex items-center gap-2.5 mb-4">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="font-display text-lg font-bold text-white">OCEN / Open Bank Integration</h3>
              <p className="text-xs text-gray-400">Sandbox Client for programmatic Credit Intelligence querying</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-5">
            Kredo implements an open banking interface. Lenders and fintech aggregators can interact with MSME ratings, compile alternate compliance ledgers, and trigger credit underwriting decisions programmatically via REST APIs.
          </p>

          <div className="space-y-3">
            <h4 className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase font-semibold">Available API Endpoints</h4>
            
            {/* GET MSMES */}
            <button
              onClick={() => loadDefaultBody('GET_MSMES')}
              className={`w-full p-3 rounded-2xl border text-left flex flex-col space-y-1.5 transition-all ${
                selectedEndpoint === 'GET_MSMES'
                  ? 'bg-indigo-950/25 border-indigo-500/80 text-white'
                  : 'bg-gray-950/60 border-gray-800/80 hover:bg-gray-900/40 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-indigo-400">GET /api/msmes</span>
                <span className="text-[9px] text-gray-500 font-normal">Score Indexes</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-1">Retrieves all MSMEs with computed scores.</p>
            </button>

            {/* GET MSME DETAIL */}
            <button
              onClick={() => loadDefaultBody('GET_MSME_DETAIL')}
              className={`w-full p-3 rounded-2xl border text-left flex flex-col space-y-1.5 transition-all ${
                selectedEndpoint === 'GET_MSME_DETAIL'
                  ? 'bg-indigo-950/25 border-indigo-500/80 text-white'
                  : 'bg-gray-950/60 border-gray-800/80 hover:bg-gray-900/40 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-indigo-400">GET /api/msmes/:id</span>
                <span className="text-[9px] text-gray-500 font-normal">Footprints</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-1">Fetches granular GST, UPI, AA, and EPFO feeds.</p>
            </button>

            {/* POST SIMULATE */}
            <button
              onClick={() => loadDefaultBody('POST_SIMULATE')}
              className={`w-full p-3 rounded-2xl border text-left flex flex-col space-y-1.5 transition-all ${
                selectedEndpoint === 'POST_SIMULATE'
                  ? 'bg-indigo-950/25 border-indigo-500/80 text-white'
                  : 'bg-gray-950/60 border-gray-800/80 hover:bg-gray-900/40 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-indigo-400">POST /api/msmes/:id/simulate</span>
                <span className="text-[9px] text-gray-500 font-normal">Computation</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-1">Dynamically triggers rating score recalculation.</p>
            </button>

            {/* GET APPLICATIONS */}
            <button
              onClick={() => loadDefaultBody('GET_APPLICATIONS')}
              className={`w-full p-3 rounded-2xl border text-left flex flex-col space-y-1.5 transition-all ${
                selectedEndpoint === 'GET_APPLICATIONS'
                  ? 'bg-indigo-950/25 border-indigo-500/80 text-white'
                  : 'bg-gray-950/60 border-gray-800/80 hover:bg-gray-900/40 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-indigo-400">GET /api/applications</span>
                <span className="text-[9px] text-gray-500 font-normal">Credit Funnels</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-1">Lists current underwriting files and decision trees.</p>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Code Sandbox Terminals */}
      <div className="lg:col-span-7 flex flex-col space-y-6">
        <div className="glass-panel rounded-3xl p-6 border border-gray-800 flex flex-col h-full relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 mb-4 gap-3">
            <div>
              <span className="text-xs bg-gray-950 border border-gray-800 px-3 py-1 rounded-xl text-gray-300 font-mono font-bold">
                {getEndpointUrl()}
              </span>
              <p className="text-[11px] text-gray-400 mt-2 max-w-md">{getEndpointDescription()}</p>
            </div>

            <button
              id="trigger-api-btn"
              onClick={handleTriggerApi}
              disabled={isQuerying}
              className="bg-indigo-600 hover:bg-indigo-750 disabled:opacity-50 text-white text-xs font-semibold px-4.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5 font-mono shrink-0"
            >
              {isQuerying ? (
                <span>QUERYING LEDGER...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>SEND REQUEST</span>
                </>
              )}
            </button>
          </div>

          {/* Request Body Editor (For POST endpoints) */}
          {selectedEndpoint === 'POST_SIMULATE' && (
            <div className="mb-4">
              <h4 className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mb-1.5">Request Body (JSON)</h4>
              <textarea
                id="api-request-body"
                rows={6}
                value={reqBody}
                onChange={(e) => setReqBody(e.target.value)}
                className="w-full bg-gray-950 border border-gray-850 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Live Response Code Editor Console */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <h4 className="text-[10px] text-gray-400 font-mono tracking-wider uppercase flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" /> LIVE HTTP RESPONSE LEDGER
              </h4>
              <button
                id="copy-api-response-btn"
                onClick={handleCopyCode}
                className="text-gray-400 hover:text-white text-[10px] flex items-center gap-1 bg-gray-950 px-2.5 py-1 rounded-lg border border-gray-850"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="flex-1 bg-gray-950 border border-gray-850 rounded-2xl p-4 overflow-auto max-h-[360px] text-xs font-mono text-gray-300 leading-relaxed scrollbar-thin">
              <code>{responsePayload}</code>
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
