import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Customized,
  CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, Layers, BarChart3, RefreshCw } from 'lucide-react';

const CandleLayer = ({ xAxisMap, yAxisMap, data }) => {
  const xAxis = Object.values(xAxisMap || {})[0];
  const yAxis = Object.values(yAxisMap || {})[0];
  const xScale = xAxis?.scale;
  const yScale = yAxis?.scale;

  if (!xScale || !yScale) return null;

  const bandwidth = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 18;
  const candleWidth = Math.max(8, bandwidth * 0.55);

  return (
    <g>
      {(data || []).map((item) => {
        const xValue = xScale(item.date);
        const xCenter = typeof xValue === 'number' ? xValue + bandwidth / 2 : 0;
        const yOpen = yScale(item.open);
        const yClose = yScale(item.close);
        const yHigh = yScale(item.high);
        const yLow = yScale(item.low);
        if ([xCenter, yOpen, yClose, yHigh, yLow].some((value) => Number.isNaN(value))) {
          return null;
        }
        const rising = item.close >= item.open;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
        const fill = rising ? '#10b981' : '#ef4444';

        return (
          <g key={item.date}>
            <line
              x1={xCenter}
              x2={xCenter}
              y1={yHigh}
              y2={yLow}
              stroke={fill}
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 6px ${rising ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)'})` }}
            />
            <rect
              x={xCenter - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              rx={4}
              fill={fill}
              opacity="0.92"
              style={{ filter: `drop-shadow(0 0 8px ${rising ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)'})` }}
            />
          </g>
        );
      })}
    </g>
  );
};

export const CandleChart = ({
  symbol,
  historyData,
  isLoading,
  period,
  interval,
  onPeriodChange,
  onIntervalChange,
  onRefresh,
}) => {
  const [chartType, setChartType] = useState('candle');

  const chartData = useMemo(
    () =>
      (historyData || []).map((item, index) => ({
        ...item,
        date: item.date || item.timestamp || item.time || item.label || `point-${index}`,
      })),
    [historyData]
  );

  const lastPrice = chartData[chartData.length - 1]?.close || 0;
  const firstPrice = chartData[0]?.close || 0;
  const priceDiff = lastPrice - firstPrice;
  const pctChange = firstPrice > 0 ? (priceDiff / firstPrice) * 100 : 0;
  const isPositive = priceDiff >= 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1e293b] border border-[#334155] p-3 rounded shadow-xl text-xs font-mono">
          <p className="text-[#94a3b8] mb-1 font-sans font-semibold">{data.date}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Open:</span><span className="text-right text-white">${data.open.toFixed(2)}</span>
            <span>High:</span><span className="text-right text-white">${data.high.toFixed(2)}</span>
            <span>Low:</span><span className="text-right text-white">${data.low.toFixed(2)}</span>
            <span>Close:</span><span className={`text-right font-semibold ${data.close >= data.open ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>${data.close.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 flex flex-col h-full w-full" style={{ minHeight: '500px' }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-[#334155] px-2 py-0.5 rounded text-[#94a3b8] font-mono">USD</span>
            <h2 className="text-xl font-bold text-white font-sans">{symbol} Historical Chart</h2>
          </div>
          {historyData.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-3xl font-bold text-white">${lastPrice.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 text-xs font-semibold font-mono px-1.5 py-0.5 rounded-sm ${isPositive ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#0f172a] p-1 rounded-md border border-[#334155] text-xs">
            <button onClick={() => setChartType('candle')} className={`flex items-center gap-1 px-2.5 py-1 rounded-sm transition ${chartType === 'candle' ? 'bg-[#334155] text-white' : 'text-[#94a3b8]'}`}><BarChart3 size={14} /><span>Candles</span></button>
            <button onClick={() => setChartType('area')} className={`flex items-center gap-1 px-2.5 py-1 rounded-sm transition ${chartType === 'area' ? 'bg-[#334155] text-white' : 'text-[#94a3b8]'}`}><Layers size={14} /><span>Area</span></button>
          </div>
          <select value={period} onChange={(e) => onPeriodChange(e.target.value)} className="bg-[#0f172a] text-xs text-white border border-[#334155] px-2 py-1 rounded font-mono"><option value="5d">5D</option><option value="1mo">1M</option><option value="3mo">3M</option><option value="1y">1Y</option></select>
          <button onClick={onRefresh} disabled={isLoading} className="p-1.5 text-[#94a3b8] bg-[#0f172a] border border-[#334155] rounded"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full relative" style={{ minHeight: '420px' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e293b]/70 z-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} orientation="right" tickFormatter={(val) => `$${val}`} />
            <Tooltip content={<CustomTooltip />} />

            {chartType === 'candle' ? (
              <Customized component={CandleLayer} />
            ) : (
              <Area type="monotone" dataKey="close" stroke={isPositive ? '#10b981' : '#ef4444'} fillOpacity={0.2} fill={isPositive ? '#10b981' : '#ef4444'} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};