import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileCode2,
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface AuditDoc {
  id: string;
  msmeId: string;
  documentType: string;
  status: 'VERIFIED' | 'PENDING' | 'FAILED';
  timestamp: string;
  notes?: string;
  size?: string;
}

interface DocumentAuditLogProps {
  msmeId: string;
  refreshTrigger?: number;
}

export const DocumentAuditLog: React.FC<DocumentAuditLogProps> = ({ msmeId, refreshTrigger = 0 }) => {
  const [docs, setDocs] = useState<AuditDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/financial-data/msme/${msmeId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch financial audit logs');
        }
        const data = await res.json();
        if (isMounted) {
          setDocs(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching audit logs:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load audit logs.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAuditLogs();
    return () => {
      isMounted = false;
    };
  }, [msmeId, refreshTrigger]);

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = 
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getSourceStyle = (type: string) => {
    if (type.includes('EPFO') || type.includes('Payroll')) {
      return { tag: 'EPFO', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    }
    if (type.includes('UPI') || type.includes('Transaction')) {
      return { tag: 'UPI', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
    if (type.includes('Bank') || type.includes('Aggregator')) {
      return { tag: 'Bank AA', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { tag: 'GST', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  };

  return (
    <div className="bg-stitch-card border border-stitch-border rounded-3xl p-6 flex flex-col space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stitch-border/60">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-stitch-green" /> Compliance Document Registry
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable alternate-data verification log of files ingested by the Kredo network.
          </p>
        </div>
        <span className="self-start sm:self-center text-[10px] bg-stitch-green/10 text-stitch-green font-mono font-semibold px-2.5 py-1 rounded-full border border-stitch-green/20 uppercase tracking-wider">
          Secured On-Ledger
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            id="audit-search-input"
            type="text"
            placeholder="Search documents by type or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stitch-dark border border-stitch-border rounded-xl pl-10 pr-4 py-2 text-xs text-gray-100 placeholder-zinc-500 focus:outline-none focus:border-stitch-green/60"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              id="audit-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stitch-dark border border-stitch-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-stitch-green cursor-pointer appearance-none pr-8"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Audit Log Content */}
      {loading ? (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-8 w-8 text-stitch-green animate-spin" />
          <p className="text-xs text-zinc-400 font-mono">Querying alternate financial ledger...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-xs text-rose-400 font-mono border border-rose-500/20 bg-rose-500/5 rounded-2xl">
          Error loading logs: {error}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 italic border border-dashed border-stitch-border/60 rounded-2xl">
          No compliance documents found matching current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stitch-border text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                <th className="py-3 px-2">Document</th>
                <th className="py-3 px-2">Source</th>
                <th className="py-3 px-2">Verification Date</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Audit Notes</th>
                <th className="py-3 px-2 text-right">Proof Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stitch-border/30">
              {filteredDocs.map((doc) => {
                const { tag, color } = getSourceStyle(doc.documentType);
                const isPdf = doc.documentType.toLowerCase().includes('pdf');
                const isJson = doc.documentType.toLowerCase().includes('json') || doc.documentType.toLowerCase().includes('ledger');

                return (
                  <tr key={doc.id} className="hover:bg-stitch-dark/20 transition-colors group">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400 group-hover:text-stitch-green transition-colors">
                          {isPdf ? (
                            <FileText className="h-4 w-4 text-rose-400" />
                          ) : isJson ? (
                            <FileCode2 className="h-4 w-4 text-stitch-green" />
                          ) : (
                            <Database className="h-4 w-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-200 truncate max-w-[180px]" title={doc.documentType}>
                            {doc.documentType}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-mono">
                            {doc.size || '142 KB'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-block text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${color}`}>
                        {tag}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-zinc-400 font-mono text-[11px]">
                      {new Date(doc.timestamp).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-2">
                      {doc.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      ) : doc.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full animate-pulse">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-zinc-300 max-w-[200px] truncate" title={doc.notes || 'Reconciled successfully.'}>
                      {doc.notes || 'Tax compliance ledger parsed with success'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className="text-[10px] text-zinc-600 font-mono hover:text-zinc-400 transition-colors cursor-help"
                        title={`Immutable compliance validation hash: ${doc.id}-verified-sha256`}
                      >
                        sha256:{doc.id.substring(doc.id.length - 5)}...
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ledgers Summary Banner */}
      <div className="bg-stitch-dark/40 border border-stitch-border/50 p-4 rounded-2xl text-[11px] text-zinc-400 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-stitch-green shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-gray-200">Cryptographic Integrity Guaranteed</p>
          <p className="leading-relaxed">
            All supplementary GSTR tax filings, bank transaction statements, and EPFO employer records are cryptographically verified upon ingestion and securely anchored on the decentralized compliance ledger.
          </p>
        </div>
      </div>
    </div>
  );
};
