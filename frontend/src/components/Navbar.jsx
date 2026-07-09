import { useAuth } from '../hooks/useAuth';
import { LogOut, Radio } from 'lucide-react';

export const Navbar = ({ activeSection = 'terminal', onSectionNavigate }) => {
  const { username, logout, apiMode } = useAuth();

  return (
    <nav className="h-16 md:h-18 border-b border-[#334155] flex items-center justify-between px-6 bg-[#1e293b] shadow-lg shrink-0 select-none" id="main-navbar">
      {/* Left side brand logo */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-900">
          A
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-base md:text-lg font-semibold tracking-tight uppercase text-[#f8fafc]">
            ApexTrade <span className="text-emerald-500">AI</span>
          </h1>
          <span className="hidden sm:inline-block text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded uppercase tracking-wider">
            STABLE
          </span>
        </div>

        {/* Navigation */}
        <div className="hidden lg:flex gap-6 ml-8 text-sm uppercase tracking-wider font-semibold text-slate-400">
          <button
            type="button"
            onClick={() => onSectionNavigate?.('terminal')}
            className={`pb-4 pt-1 transition-colors ${activeSection === 'terminal' ? 'text-white border-b-2 border-emerald-500' : 'hover:text-white'}`}
          >
            Terminal
          </button>
          <button
            type="button"
            onClick={() => onSectionNavigate?.('portfolio')}
            className={`pb-4 pt-1 transition-colors ${activeSection === 'portfolio' ? 'text-white border-b-2 border-emerald-500' : 'hover:text-white'}`}
          >
            Portfolio
          </button>
          <button
            type="button"
            onClick={() => onSectionNavigate?.('analytics')}
            className={`pb-4 pt-1 transition-colors ${activeSection === 'analytics' ? 'text-white border-b-2 border-emerald-500' : 'hover:text-white'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Right side Profile & Settings */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Connection Status */}
        <button
          type="button"
          disabled
          title="Connection mode follows the live backend and automatic fallback only."
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold border transition cursor-default ${
            apiMode === 'LIVE'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <Radio size={11} className={apiMode === 'LIVE' ? 'animate-pulse' : ''} />
          <span className="hidden xs:inline">{apiMode === 'LIVE' ? 'GATEWAY: LIVE' : 'SANDBOX MODE'}</span>
          <span className="xs:hidden">{apiMode === 'LIVE' ? 'LIVE' : 'SANDBOX'}</span>
        </button>

        {/* Vertical divider */}
        <div className="hidden sm:block h-8 w-px bg-[#334155]"></div>

        {/* Profile Card */}
        {username && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs uppercase text-slate-400 tracking-wider font-bold">Authenticated</span>
                <span className="text-sm text-white font-semibold">{username}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-slate-300 font-bold text-xs font-mono uppercase">
              {username[0] || 'U'}
            </div>
          </div>
        )}

        {/* Vertical divider */}
        <div className="h-8 w-px bg-[#334155]"></div>

        {/* Logout Control */}
        <button
          onClick={logout}
          className="flex items-center gap-1 bg-transparent border border-[#334155] hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 text-[#94a3b8] px-3 py-1.5 rounded text-xs font-mono font-bold transition cursor-pointer"
          id="logout-btn"
        >
          <LogOut size={11} />
          <span className="hidden sm:inline">SIGN OUT</span>
        </button>
      </div>
    </nav>
  );
};
