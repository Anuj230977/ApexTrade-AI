import { History, ArrowUpRight, ArrowDownRight, RefreshCw, FileText } from 'lucide-react';

export const TransactionHistory = ({
  transactions,
  isLoading,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full animate-pulse self-start" id="transactions-loading">
        <div className="h-4 bg-[#334155] w-1/4 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-[#334155] rounded w-full"></div>
          <div className="h-8 bg-[#334155] rounded w-full"></div>
          <div className="h-8 bg-[#334155] rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Format date nicely
  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full self-start" id="transactions-card">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#334155]/50 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#3b82f6]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8]">
            Audit Logs (Newest First)
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-1 text-[#94a3b8] hover:text-white hover:bg-[#334155] rounded transition"
          title="Refresh Audit Logs"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Transaction Records List */}
      <div className="flex-1 overflow-y-auto max-h-[350px] scrollbar-thin">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center h-full text-[#64748b]">
            <FileText size={32} className="mb-2 opacity-60" />
            <p className="text-sm font-mono">No transaction records generated in current account context</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="border-b border-[#334155] text-[#64748b] text-xs font-bold uppercase tracking-wider">
                <th className="pb-2">TX ID</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Symbol</th>
                <th className="pb-2 text-right">Quantity</th>
                <th className="pb-2 text-right">Execution Price</th>
                <th className="pb-2 text-right">Total Outflow</th>
                <th className="pb-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isBuy = tx.type === 'BUY';
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-[#334155]/30 hover:bg-[#334155]/15 transition"
                  >
                    <td className="py-2 text-[#64748b] text-xs" title={tx.id}>
                      {tx.id.substring(0, 8)}...
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        }`}
                      >
                        {isBuy ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 font-sans font-bold text-white uppercase">
                      {tx.symbol}
                    </td>
                    <td className="py-2 text-right text-slate-300 font-medium">
                      {tx.quantity}
                    </td>
                    <td className="py-2 text-right text-slate-400">
                      ${tx.price.toFixed(2)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        isBuy ? 'text-slate-200' : 'text-emerald-400'
                      }`}
                    >
                      ${tx.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-right text-[#64748b] text-[10px]">
                      {formatDate(tx.createdAt)}
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
