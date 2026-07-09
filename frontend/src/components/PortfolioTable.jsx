import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export const PortfolioTable = ({
  portfolio,
  isLoading,
  onSelectSymbol,
  onRefresh,
  activeSymbol,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full animate-pulse self-start" id="portfolio-loading">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-[#334155] w-1/4 rounded"></div>
          <div className="h-4 bg-[#334155] w-8 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="h-14 bg-[#334155] rounded"></div>
          <div className="h-14 bg-[#334155] rounded"></div>
          <div className="h-14 bg-[#334155] rounded"></div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-10 bg-[#334155] w-full rounded"></div>
          <div className="h-10 bg-[#334155] w-full rounded"></div>
          <div className="h-10 bg-[#334155] w-full rounded"></div>
        </div>
      </div>
    );
  }

  const positions = portfolio?.positions || [];
  const cashBalance = portfolio?.cashBalance || 0;
  const totalValue = portfolio?.totalValue || 0;
  const totalReturnPercent = portfolio?.totalReturnPercent || 0;

  // Calculate total P&L manually from positions to ensure 100% precision
  const totalPnL = positions.reduce((acc, pos) => acc + pos.unrealizedPnL, 0);
  const isPortfolioPositive = totalPnL >= 0;

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full self-start" id="portfolio-card">
      {/* Portfolio Header */}
      <div className="flex items-center justify-between border-b border-[#334155]/50 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-[#3b82f6]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8]">
            Asset Portfolio & P&L Engine
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-1 text-[#94a3b8] hover:text-white hover:bg-[#334155] rounded transition"
          title="Refresh Portfolio"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Primary Analytics Row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#0f172a] border border-[#334155]/60 rounded-md p-3 font-mono">
          <span className="text-xs text-[#64748b] uppercase tracking-wider block">Total Net Value</span>
          <span className="text-white text-lg font-extrabold leading-none mt-1.5 block">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-[#0f172a] border border-[#334155]/60 rounded-md p-3 font-mono">
          <span className="text-xs text-[#64748b] uppercase tracking-wider block">Total Return</span>
          <span
            className={`text-lg font-extrabold leading-none mt-1.5 flex items-center gap-0.5 ${
              isPortfolioPositive ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}
          >
            {isPortfolioPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {isPortfolioPositive ? '+' : ''}
            {totalReturnPercent.toFixed(2)}%
          </span>
        </div>
        <div className="bg-[#0f172a] border border-[#334155]/60 rounded-md p-3 font-mono">
          <span className="text-xs text-[#64748b] uppercase tracking-wider block">Wallet Reserve</span>
          <span className="text-slate-300 text-lg font-extrabold leading-none mt-1.5 block">
            ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Positions Inventory Table */}
      <div className="flex-1 overflow-x-auto min-h-[180px]">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center h-full">
            <p className="text-sm text-[#64748b] font-mono">No active asset allocations held in record</p>
            <p className="text-xs text-[#475569] font-mono mt-1">Execute a BUY order to secure positions</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="border-b border-[#334155] text-[#64748b] text-xs font-bold uppercase tracking-wider">
                <th className="pb-2">Symbol</th>
                <th className="pb-2 text-right">Quantity</th>
                <th className="pb-2 text-right">Bought Price</th>
                <th className="pb-2 text-right">Current Price</th>
                <th className="pb-2 text-right">The Gap</th>
                <th className="pb-2 text-right">Market Value</th>
                <th className="pb-2 text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const gap = pos.currentPrice - pos.averageCost;
                const gapPercent = pos.averageCost > 0 ? (gap / pos.averageCost) * 100 : 0;
                const isBullish = gap >= 0;

                return (
                  <tr
                    key={pos.symbol}
                    onClick={() => onSelectSymbol(pos.symbol)}
                    className={`border-b border-[#334155]/30 hover:bg-[#334155]/25 cursor-pointer transition select-none ${
                      activeSymbol.toUpperCase() === pos.symbol.toUpperCase()
                        ? 'bg-[#334155]/40 border-l-2 border-l-[#3b82f6]'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 font-sans font-bold text-white text-base flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></span>
                      {pos.symbol}
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-300">
                      {pos.quantity}
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      ${pos.averageCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right text-slate-200">
                      ${pos.currentPrice.toFixed(2)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        isBullish ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                    >
                      {isBullish ? '+' : ''}
                      ${gap.toFixed(2)}
                      <span className="block text-[9px] font-medium opacity-80">
                        ({isBullish ? '+' : ''}
                        {gapPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-300">
                      ${pos.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      className={`py-2.5 text-right font-extrabold ${
                        pos.unrealizedPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                    >
                      {pos.unrealizedPnL >= 0 ? '+' : ''}
                      ${pos.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
