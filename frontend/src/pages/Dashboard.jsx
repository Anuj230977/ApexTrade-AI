import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { CandleChart } from '../components/CandleChart';
import { SignalIntelligence } from '../components/SignalIntelligence';
import { TradingPanel } from '../components/TradingPanel';
import { PortfolioTable } from '../components/PortfolioTable';
import { TransactionHistory } from '../components/TransactionHistory';
import { Shield, Sparkles, CloudOff } from 'lucide-react';

export const Dashboard = () => {
  // State for current symbol being actively analyzed/traded
  const [symbol, setSymbol] = useState('AAPL');
  
  // Historical chart configs
  const [period, setPeriod] = useState('1mo');
  const [interval, setInterval] = useState('1d');

  // Backend Data States
  const [walletBalance, setWalletBalance] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [signalData, setSignalData] = useState(null);

  // Loading States
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSignalLoading, setIsSignalLoading] = useState(true);

  // Track connection failures to notify sandbox backup active
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [activeSection, setActiveSection] = useState('terminal');

  const terminalSectionRef = useRef(null);
  const analyticsSectionRef = useRef(null);
  const portfolioSectionRef = useRef(null);

  // 1. Fetch User Financial Records (Wallet, Portfolio, Transactions)
  const fetchUserRecords = async () => {
    setIsWalletLoading(true);
    setIsPortfolioLoading(true);
    setIsTransactionsLoading(true);

    try {
      const [walletRes, portfolioRes, transactionsRes] = await Promise.all([
        api.wallet.getBalance(),
        api.portfolio.getPortfolio(),
        api.transactions.getTransactions(),
      ]);

      setWalletBalance(walletRes);
      setPortfolio(portfolioRes);
      setTransactions(transactionsRes);
    } catch (err) {
      console.warn('[Dashboard] Error gathering financial records. Using fallback mode.', err);
      setIsBackendOffline(true);
      
      // Attempt once more to trigger local sandbox database fallback paths
      try {
        const walletRes = await api.wallet.getBalance();
        const portfolioRes = await api.portfolio.getPortfolio();
        const transactionsRes = await api.transactions.getTransactions();
        
        setWalletBalance(walletRes);
        setPortfolio(portfolioRes);
        setTransactions(transactionsRes);
      } catch (innerErr) {
        console.error('[Dashboard] Fatal Sandbox Fallback Failed', innerErr);
      }
    } finally {
      setIsWalletLoading(false);
      setIsPortfolioLoading(false);
      setIsTransactionsLoading(false);
    }
  };

  // 2. Fetch Market Data for Selected Symbol (Price history + AI Signal)
  const fetchMarketData = async () => {
    setIsHistoryLoading(true);
    setIsSignalLoading(true);

    try {
      const [historyRes, signalRes] = await Promise.all([
        api.market.getHistory(symbol, period, interval),
        api.market.getSignal(symbol),
      ]);

      setHistoryData(historyRes.data || []);
      setSignalData(signalRes);
    } catch (err) {
      console.warn(`[Dashboard] Error retrieving market details for ${symbol}. Using fallback mock data.`, err);
      setIsBackendOffline(true);

      // Attempt once more to trigger local sandbox mock generator paths
      try {
        const historyRes = await api.market.getHistory(symbol, period, interval);
        const signalRes = await api.market.getSignal(symbol);
        
        setHistoryData(historyRes.data || []);
        setSignalData(signalRes);
      } catch (innerErr) {
        console.error('[Dashboard] Fatal Market Fallback Failed', innerErr);
      }
    } finally {
      setIsHistoryLoading(false);
      setIsSignalLoading(false);
    }
  };

  // Dispatchers
  useEffect(() => {
    fetchUserRecords();
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [symbol, period, interval]);

  // Handler for successful trades: triggers instant reload of user balances/allocations
  const handleTradeSuccess = () => {
    fetchUserRecords();
  };

  const handleSectionNavigate = (section) => {
    setActiveSection(section);

    const refMap = {
      terminal: terminalSectionRef,
      analytics: analyticsSectionRef,
      portfolio: portfolioSectionRef,
    };

    refMap[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] text-slate-100 flex flex-col" id="dashboard-layout">
      {/* Top Navbar Header */}
      <Navbar activeSection={activeSection} onSectionNavigate={handleSectionNavigate} />

      {/* Main Body Grid */}
      <main className="flex-1 w-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 space-y-6" ref={terminalSectionRef}>
        
        {/* Offline Alert Bar */}
        {isBackendOffline && (
          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3 text-xs font-mono text-[#f59e0b] flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <CloudOff size={16} className="animate-bounce" />
              <span>
                <strong>System Information:</strong> Live Spring Boot API connection was offline or refused handshake. <strong>Local Sandbox Mode</strong> is now fully active so you can register, log in, trade assets, and explore charts seamlessly.
              </span>
            </div>
            <span className="text-[10px] bg-[#f59e0b]/15 px-2 py-0.5 rounded font-bold uppercase tracking-wider hidden md:inline">
              Sandbox Active
            </span>
          </div>
        )}

        {/* Quant Dashboard Status Ticker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e293b]/50 border border-[#334155]/30 rounded-lg px-4 py-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4 text-[#94a3b8]">
            <span className="flex items-center gap-1">
              <Shield size={13} className="text-[#3b82f6]" />
              SECURE TLS CLIENT GATEWAY
            </span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1 text-white">
              <Sparkles size={13} className="text-[#10b981]" />
              AI MODELS: DEEP-SENTIMENT ANALYSTS ACTIVE
            </span>
          </div>
          <div className="text-[#64748b] text-[10px] font-bold text-right">
            COORDINATES: UTC | PLATFORM TIME: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" ref={analyticsSectionRef}>
          
          {/* Main Chart Column (Occupies 2 fractions on widescreen) */}
          <div className="lg:col-span-2 space-y-6 self-start">
            <div className="h-[520px]">
              <CandleChart
                symbol={symbol}
                historyData={historyData}
                isLoading={isHistoryLoading}
                period={period}
                interval={interval}
                onPeriodChange={setPeriod}
                onIntervalChange={setInterval}
                onRefresh={fetchMarketData}
              />
            </div>

            {/* Portfolio Table and Unrealized P&L Calculations */}
            <div className="self-start" ref={portfolioSectionRef}>
              <PortfolioTable
                portfolio={portfolio}
                isLoading={isPortfolioLoading}
                onSelectSymbol={setSymbol}
                onRefresh={fetchUserRecords}
                activeSymbol={symbol}
              />
            </div>
          </div>

          {/* Right Action Desk Column (Occupies 1 fraction) */}
          <div className="space-y-6 self-start">
            {/* Executable order form panel */}
            <div className="self-start">
              <TradingPanel
                activeSymbol={symbol}
                onSymbolChange={setSymbol}
                walletBalance={walletBalance}
                portfolio={portfolio}
                onTradeSuccess={handleTradeSuccess}
              />
            </div>

            {/* AI forecast and analytical summaries */}
            <div className="self-start">
              <SignalIntelligence
                symbol={symbol}
                signalData={signalData}
                isLoading={isSignalLoading}
              />
            </div>
          </div>
        </div>

        {/* Chronological Transaction Audit Logs */}
        <div className="w-full">
          <TransactionHistory
            transactions={transactions}
            isLoading={isTransactionsLoading}
            onRefresh={fetchUserRecords}
          />
        </div>

      </main>
    </div>
  );
};
