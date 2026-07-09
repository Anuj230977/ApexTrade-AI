import { Brain, Cpu, ShieldAlert, Sparkles, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

export const SignalIntelligence = ({
  symbol,
  signalData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full animate-pulse self-start" id="signal-loading">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-[#334155] w-1/3 rounded"></div>
          <div className="h-5 bg-[#334155] w-8 rounded"></div>
        </div>
        <div className="flex items-center justify-between py-6 border-b border-[#334155]/50">
          <div className="space-y-2 w-1/2">
            <div className="h-7 bg-[#334155] w-3/4 rounded"></div>
            <div className="h-4 bg-[#334155] w-1/2 rounded"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#334155]"></div>
        </div>
        <div className="space-y-2 mt-4 flex-1">
          <div className="h-3 bg-[#334155] w-full rounded"></div>
          <div className="h-3 bg-[#334155] w-11/12 rounded"></div>
          <div className="h-3 bg-[#334155] w-4/5 rounded"></div>
        </div>
      </div>
    );
  }

  if (!signalData) {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col items-center justify-center text-center h-full self-start" id="signal-empty">
        <HelpCircle size={40} className="text-[#64748b] mb-2" />
        <h3 className="text-sm font-semibold text-white">No AI Signal Loaded</h3>
        <p className="text-xs text-[#94a3b8] mt-1">Select a ticker to analyze with ApexTrade AI</p>
      </div>
    );
  }

  const { signal, confidence, reasoning, price } = signalData;

  // Visual assets matching signals
  let badgeColor = 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40';
  let textColor = 'text-[#f59e0b]';
  let icon = <Sparkles className="text-[#f59e0b]" size={16} />;
  let glowColor = 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]';

  if (signal === 'BUY') {
    badgeColor = 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40';
    textColor = 'text-[#10b981]';
    icon = <TrendingUp className="text-[#10b981]" size={16} />;
    glowColor = 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]';
  } else if (signal === 'SELL') {
    badgeColor = 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40';
    textColor = 'text-[#ef4444]';
    icon = <TrendingDown className="text-[#ef4444]" size={16} />;
    glowColor = 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.25)]';
  }

  // Circular progress calculations for confidence
  const pctConfidence = Math.min(Math.max(confidence * 100, 0), 100);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pctConfidence / 100) * circumference;

  return (
    <div
      className={`bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full self-start transition-all duration-300 ${glowColor}`}
      id="signal-intelligence-card"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#334155]/50 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-[#3b82f6]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
            AI Signal Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#64748b]">
          <Cpu size={10} className="text-[#64748b]" />
          GROQ MODEL ACTIVE
        </div>
      </div>

      {/* Main Signal Display */}
      <div className="flex items-center justify-between py-2 mb-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">
            SYSTEM RECOMMENDATION
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className={`text-lg font-extrabold font-sans tracking-widest px-3 py-1 border rounded-md uppercase ${badgeColor} flex items-center gap-1.5`}
            >
              {icon}
              {signal}
            </span>
            <div className="text-xs text-[#94a3b8] font-mono">
              at <span className="text-white font-semibold">${price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Circular Confidence Meter */}
        <div className="flex items-center gap-3 bg-[#0f172a]/40 border border-[#334155]/30 p-2 rounded-lg">
          <div className="relative flex items-center justify-center w-14 h-14">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-[#334155]"
                strokeWidth="4.5"
                fill="transparent"
              />
              {/* Animated Foreground circle */}
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="transition-all duration-1000 ease-out"
                stroke={signal === 'BUY' ? '#10b981' : signal === 'SELL' ? '#ef4444' : '#f59e0b'}
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-white">
              {Math.round(pctConfidence)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#64748b] uppercase tracking-wider leading-none">
              AI TRUST
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">SCORE</span>
          </div>
        </div>
      </div>

      {/* Reasoning Typography Block */}
      <div className="flex-1 bg-[#0f172a] border border-[#334155] rounded-md p-4 flex flex-col justify-start overflow-y-auto max-h-[160px] md:max-h-none">
        <div>
          <span className="text-[9px] font-mono text-[#64748b] uppercase tracking-wider block mb-2">
            ANALYST REASONING LOG
          </span>
          <p className="text-xs text-[#cbd5e1] leading-relaxed font-sans select-none">
            {reasoning}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-[#475569] mt-3 pt-2 border-t border-[#334155]/40">
          <ShieldAlert size={10} />
          Trading involves high risk. AI signals are indicative only.
        </div>
      </div>
    </div>
  );
};
