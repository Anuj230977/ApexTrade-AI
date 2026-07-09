import { useMemo, useState, useEffect } from 'react';
import { api, AVAILABLE_SYMBOLS } from '../services/api';
import { Landmark, CheckCircle2, AlertTriangle, ChevronDown, Search } from 'lucide-react';

export const TradingPanel = ({
  activeSymbol,
  onSymbolChange,
  walletBalance,
  portfolio,
  onTradeSuccess,
}) => {
  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [livePrice, setLivePrice] = useState(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [message, setMessage] = useState(null);
  const [symbolQuery, setSymbolQuery] = useState(activeSymbol);
  const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);

  const filteredSymbols = useMemo(() => {
    const query = symbolQuery.trim().toUpperCase();
    return AVAILABLE_SYMBOLS.filter((sym) => sym.toUpperCase().includes(query));
  }, [symbolQuery]);

  // Fetch live price when activeSymbol changes or upon refresh
  const fetchLivePrice = async () => {
    setIsFetchingPrice(true);
    try {
      const res = await api.market.getPrice(activeSymbol);
      setLivePrice(res.price);
    } catch (err) {
      console.error('Error fetching live price for ' + activeSymbol, err);
      // Fallback if price is not fetched yet
      setLivePrice(100.00);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  useEffect(() => {
    fetchLivePrice();
  }, [activeSymbol]);

  useEffect(() => {
    setSymbolQuery(activeSymbol);
  }, [activeSymbol]);

  // Calculations
  const priceToUse = livePrice || 0;
  const estimatedTotal = parseFloat((priceToUse * quantity).toFixed(2));
  const availableBalance = walletBalance?.balance || 0;

  // Check how many shares of activeSymbol are owned
  const ownedPosition = portfolio?.positions.find(
    (pos) => pos.symbol.toUpperCase() === activeSymbol.toUpperCase()
  );
  const ownedQuantity = ownedPosition?.quantity || 0;

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) return;
    
    setIsExecuting(true);
    setMessage(null);

    try {
      if (tradeType === 'BUY') {
        const res = await api.trade.buy(activeSymbol, quantity);
        setMessage({
          type: 'success',
          text: `Successfully bought ${quantity} ${activeSymbol} at $${res.price.toFixed(2)} for a total of $${res.totalCost.toFixed(2)}`,
        });
      } else {
        const res = await api.trade.sell(activeSymbol, quantity);
        setMessage({
          type: 'success',
          text: `Successfully sold ${quantity} ${activeSymbol} at $${res.price.toFixed(2)} for total proceeds of $${res.totalProceeds.toFixed(2)}`,
        });
      }
      onTradeSuccess();
      setQuantity(1); // Reset
    } catch (err) {
      console.error('Trade Execution Error', err);
      setMessage({
        type: 'error',
        text: err?.error || err?.message || 'Transaction declined by exchange gateway.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Quick quantity setters
  const handlePercentSelect = (percent) => {
    if (tradeType === 'BUY') {
      if (priceToUse > 0) {
        const maxAffordable = Math.floor(availableBalance / priceToUse);
        const targetQty = Math.floor(maxAffordable * (percent / 100));
        setQuantity(Math.max(1, targetQty));
      }
    } else {
      const targetQty = Math.floor(ownedQuantity * (percent / 100));
      setQuantity(Math.max(1, targetQty));
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full self-start" id="trading-panel-card">
      {/* Panel Title */}
      <div className="flex items-center justify-between border-b border-[#334155]/50 pb-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
          Execution Desk
        </h3>
        <div className="flex items-center gap-2">
          <Landmark size={12} className="text-[#94a3b8]" />
          <span className="text-[10px] font-mono text-white font-semibold">
            BALANCE: ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#0f172a] p-1.5 rounded-md border border-[#334155] text-sm mb-4">
        <button
          type="button"
          onClick={() => {
            setTradeType('BUY');
            setMessage(null);
          }}
          className={`py-2 px-4 rounded font-bold transition flex items-center justify-center gap-1.5 ${
            tradeType === 'BUY'
              ? 'bg-[#10b981] text-[#0f172a] shadow-md'
              : 'text-[#10b981] hover:bg-[#10b981]/5'
          }`}
        >
          BUY ORDER
        </button>
        <button
          type="button"
          onClick={() => {
            setTradeType('SELL');
            setMessage(null);
          }}
          className={`py-2 px-4 rounded font-bold transition flex items-center justify-center gap-1.5 ${
            tradeType === 'SELL'
              ? 'bg-[#ef4444] text-[#0f172a] shadow-md'
              : 'text-[#ef4444] hover:bg-[#ef4444]/5'
          }`}
        >
          SELL ORDER
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-6 justify-start">
        <div className="space-y-3">
          {/* Ticker Selector */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Select Instrument
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded px-3 py-2 focus-within:border-emerald-500 transition">
                <Search size={13} className="text-[#64748b] shrink-0" />
                <input
                  type="text"
                  value={symbolQuery}
                  onChange={(e) => {
                    setSymbolQuery(e.target.value);
                    setIsSymbolMenuOpen(true);
                  }}
                  onFocus={() => setIsSymbolMenuOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setIsSymbolMenuOpen(false), 150);
                  }}
                  placeholder="Search symbol or asset"
                  className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-[#64748b] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setIsSymbolMenuOpen((open) => !open)}
                  className="text-[#94a3b8] hover:text-white transition"
                  aria-label="Open instrument list"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {isSymbolMenuOpen && (
                <div className="absolute z-20 mt-2 w-full bg-[#0f172a] border border-[#334155] rounded-lg shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                  {filteredSymbols.length > 0 ? (
                    filteredSymbols.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          onSymbolChange(sym);
                          setSymbolQuery(sym);
                          setIsSymbolMenuOpen(false);
                          setMessage(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm font-mono uppercase transition border-b border-[#334155]/40 last:border-b-0 ${
                          activeSymbol.toUpperCase() === sym.toUpperCase()
                            ? 'bg-[#3b82f6]/15 text-white'
                            : 'text-[#94a3b8] hover:bg-[#334155]/20 hover:text-white'
                        }`}
                      >
                        {sym}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-xs font-mono text-[#64748b]">
                      No instruments match your search.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Pricing Widget */}
          <div className="bg-[#0f172a] border border-[#334155] rounded p-3 flex items-center justify-between font-mono">
            <div>
              <span className="text-[9px] text-[#64748b] uppercase tracking-wider block">Live Price</span>
              <span className="text-white text-md font-bold">
                {isFetchingPrice ? (
                  <span className="inline-block w-16 h-4 bg-[#334155]/50 rounded animate-pulse" />
                ) : (
                  `$${priceToUse.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#64748b] uppercase tracking-wider block">Inventory</span>
              <span className="text-white text-xs font-bold">
                {ownedQuantity} {activeSymbol}
              </span>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label htmlFor="qty-input" className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Order Quantity
            </label>
            <div className="flex bg-[#0f172a] border border-[#334155] rounded focus-within:border-emerald-500 transition overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white font-bold transition font-mono border-r border-[#334155]"
              >
                -
              </button>
              <input
                id="qty-input"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center bg-transparent border-none outline-none font-mono text-white text-sm focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white font-bold transition font-mono border-l border-[#334155]"
              >
                +
              </button>
            </div>
            
            {/* Percentage Quick-selectors */}
            <div className="grid grid-cols-4 gap-1.5 mt-2 text-[10px] font-mono font-bold">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentSelect(pct)}
                  className="bg-[#1e293b]/50 hover:bg-[#334155] text-[#94a3b8] hover:text-white py-1.5 rounded text-center transition border border-[#334155]/40"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="border-t border-[#334155]/40 pt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Total Leverage Cost:</span>
              <span className="text-white">${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-b border-[#334155]/30 pb-2">
              <span className="text-[#64748b]">Est. Remaining Liquidity:</span>
              <span className="text-white">
                ${(tradeType === 'BUY'
                  ? availableBalance - estimatedTotal
                  : availableBalance + estimatedTotal
                ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Messages & Submit Button */}
        <div className="mt-4 space-y-3">
          {message && (
            <div
              className={`p-3 rounded text-xs flex gap-2 border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 animate-bounce" />
              ) : (
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isExecuting ||
              isFetchingPrice ||
              (tradeType === 'BUY' && estimatedTotal > availableBalance) ||
              (tradeType === 'SELL' && ownedQuantity < quantity)
            }
            className={`w-full py-3 rounded text-sm font-bold tracking-widest text-[#0f172a] shadow-lg cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed ${
              tradeType === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400'
                : 'bg-rose-500 hover:bg-rose-400'
            }`}
          >
            {isExecuting
              ? 'ROUTE EXECUTION REQUEST...'
              : tradeType === 'BUY'
              ? estimatedTotal > availableBalance
                ? 'INSUFFICIENT FUNDS'
                : `BUY ${quantity} ${activeSymbol.toUpperCase()}`
              : ownedQuantity < quantity
              ? 'INSUFFICIENT POSITION'
              : `SELL ${quantity} ${activeSymbol.toUpperCase()}`}
          </button>
        </div>
      </form>
    </div>
  );
};
