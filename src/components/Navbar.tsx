import React from 'react';
import { MSMEProfile } from '../types';
import { ShieldCheck, ArrowRightLeft, Building2, UserCircle2, RefreshCw } from 'lucide-react';

interface NavbarProps {
  msmes: MSMEProfile[];
  selectedMsmeId: string;
  onSelectMsme: (id: string) => void;
  role: 'MSME' | 'LENDER' | 'DEVELOPER';
  onChangeRole: (role: 'MSME' | 'LENDER' | 'DEVELOPER') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  msmes,
  selectedMsmeId,
  onSelectMsme,
  role,
  onChangeRole
}) => {
  const activeMsme = msmes.find(m => m.id === selectedMsmeId);

  return (
    <header className="sticky top-0 z-50 bg-stitch-card border-b border-stitch-border backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-stitch-dark border border-stitch-border p-2.5 rounded-xl shadow-lg shadow-black/40">
            <ShieldCheck className="h-6 w-6 text-stitch-green" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Kredo <span className="text-xs bg-stitch-green/10 text-stitch-green font-mono font-semibold px-2 py-0.5 rounded-full border border-stitch-green/20">Credit Intelligence</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans tracking-wide uppercase">COLLATERAL-FREE MSME HEALTH PLATFORM</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* MSME Profile Switcher */}
          <div className="flex items-center space-x-2 bg-stitch-dark p-1.5 rounded-xl border border-stitch-border">
            <span className="text-xs text-zinc-400 font-mono pl-2">
              {role === 'LENDER' ? 'Review Business:' : 'Active Business:'}
            </span>
            <select
              id="active-business-select"
              value={selectedMsmeId}
              onChange={(e) => onSelectMsme(e.target.value)}
              className="bg-stitch-card text-xs font-semibold text-gray-100 rounded-lg px-2.5 py-1.5 border border-stitch-border focus:outline-none focus:border-stitch-green transition-colors cursor-pointer"
            >
              {msmes.map((msme) => (
                <option key={msme.id} value={msme.id}>
                  {msme.name} ({msme.sector.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex items-center bg-stitch-dark p-1 rounded-xl border border-stitch-border">
            <button
              id="role-msme-btn"
              onClick={() => onChangeRole('MSME')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'MSME'
                  ? 'bg-stitch-green text-black shadow-md shadow-stitch-green/15'
                  : 'text-zinc-400 hover:text-gray-200'
              }`}
            >
              <UserCircle2 className="h-3.5 w-3.5" />
              <span>MSME Portal</span>
            </button>
            <button
              id="role-lender-btn"
              onClick={() => onChangeRole('LENDER')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'LENDER'
                  ? 'bg-stitch-green text-black shadow-md shadow-stitch-green/15'
                  : 'text-zinc-400 hover:text-gray-200'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Underwriter View</span>
            </button>
            <button
              id="role-dev-btn"
              onClick={() => onChangeRole('DEVELOPER')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'DEVELOPER'
                  ? 'bg-stitch-green text-black shadow-md shadow-stitch-green/15'
                  : 'text-zinc-400 hover:text-gray-200'
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>API Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-3 flex flex-wrap gap-2">
        {['RBI AA Framework', 'OCEN 1.2', 'ULI Compatible'].map((badge) => (
          <span
            key={badge}
            className="text-[9px] font-mono text-zinc-500 border border-stitch-border/60 px-2 py-0.5 rounded-full"
          >
            {badge}
          </span>
        ))}
      </div>
    </header>
  );
};
