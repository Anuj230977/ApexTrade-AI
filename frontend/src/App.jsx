import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_BASE = 'http://localhost:8080'
const AUTH_TOKEN_KEY = 'apextrade_jwt_token'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'trade', label: 'Trade' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'history', label: 'History' },
]

const CHART_COLORS = {
  grid: 'rgba(148, 163, 184, 0.16)',
  label: '#cbd5e1',
}

const TIMEFRAME_OPTIONS = [
  { label: '1H', period: '1d', interval: '5m' },
  { label: '1D', period: '5d', interval: '15m' },
  { label: '1W', period: '1mo', interval: '1d' },
  { label: '1M', period: '6mo', interval: '1d' },
]

const demoCandles = [
  { date: 'Mon', open: 180, high: 188, low: 176, close: 186 },
  { date: 'Tue', open: 186, high: 191, low: 181, close: 188 },
  { date: 'Wed', open: 188, high: 196, low: 184, close: 193 },
  { date: 'Thu', open: 193, high: 198, low: 189, close: 191 },
  { date: 'Fri', open: 191, high: 201, low: 188, close: 199 },
]

const demoPortfolio = [
  { symbol: 'AAPL', quantity: 12, avgCost: 179.2, currentPrice: 189.45, marketValue: 2273.4, pnl: 123.0 },
  { symbol: 'MSFT', quantity: 8, avgCost: 401.15, currentPrice: 412.6, marketValue: 3300.8, pnl: 91.6 },
  { symbol: 'NVDA', quantity: 6, avgCost: 114.75, currentPrice: 122.2, marketValue: 733.2, pnl: 44.7 },
]

const demoTransactions = [
  { id: 'tx-101', date: '2026-06-29 14:22', symbol: 'AAPL', type: 'BUY', quantity: 4, price: 187.22, total: 748.88 },
  { id: 'tx-102', date: '2026-06-29 12:04', symbol: 'MSFT', type: 'SELL', quantity: 2, price: 409.1, total: 818.2 },
  { id: 'tx-103', date: '2026-06-28 16:45', symbol: 'NVDA', type: 'BUY', quantity: 1, price: 121.5, total: 121.5 },
]

function money(value, digits = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0))
}

function percent(value) {
  const formatted = `${Number(value || 0).toFixed(2)}%`
  return value > 0 ? `+${formatted}` : formatted
}

function formatCompactPrice(value) {
  return money(value, 2)
}

function formatCompactChange(value) {
  const amount = Number(value || 0)
  const formatted = `${Math.abs(amount).toFixed(2)}%`
  return amount >= 0 ? `+${formatted}` : `-${formatted}`
}

function normalizeChartData(data) {
  return (Array.isArray(data) ? data : []).map((item, index) => ({
    ...item,
    date: item.date || item.timestamp || item.time || item.label || `point-${index}`,
  }))
}

// FIXED: CandleLayer now correctly accepts props from Recharts Customized component
function CandleLayer(props) {
  const { xAxisMap, yAxisMap, data } = props;
  
  const xAxis = Object.values(xAxisMap || {})[0]
  const yAxis = Object.values(yAxisMap || {})[0]
  const xScale = xAxis?.scale
  const yScale = yAxis?.scale

  if (!xScale || !yScale || !data) {
    return null
  }

  const bandwidth = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 18
  const candleWidth = Math.max(8, bandwidth * 0.55)

  return (
    <g>
      {data.map((item, i) => {
        const xCenter = xScale(item.date) + bandwidth / 2
        const yOpen = yScale(item.open)
        const yClose = yScale(item.close)
        const yHigh = yScale(item.high)
        const yLow = yScale(item.low)
        const rising = item.close >= item.open
        const bodyTop = Math.min(yOpen, yClose)
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen))
        const fill = rising ? '#22c55e' : '#ef4444'

        return (
          <g key={i}>
            <line
              x1={xCenter}
              x2={xCenter}
              y1={yHigh}
              y2={yLow}
              stroke={fill}
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 6px ${rising ? 'rgba(34, 197, 94, 0.75)' : 'rgba(239, 68, 68, 0.75)'})` }}
            />
            <rect
              x={xCenter - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              rx={4}
              fill={fill}
              opacity="0.9"
              style={{ filter: `drop-shadow(0 0 8px ${rising ? 'rgba(34, 197, 94, 0.55)' : 'rgba(239, 68, 68, 0.55)'})` }}
            />
          </g>
        )
      })}
    </g>
  )
}

function CandlestickChart({ data }) {
  const chartData = useMemo(() => normalizeChartData(data), [data])

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 12, bottom: 12, left: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke={CHART_COLORS.label} tickLine={false} axisLine={false} />
        <YAxis stroke={CHART_COLORS.label} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        {/* FIXED: Pass component reference, not element */}
        <Customized component={CandleLayer} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function AreaChartView({ data }) {
  const chartData = useMemo(() => normalizeChartData(data), [data])

  return (
    <ResponsiveContainer width="100%" height={360}>
      <AreaChart data={chartData} margin={{ top: 20, right: 12, bottom: 12, left: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke={CHART_COLORS.label} tickLine={false} axisLine={false} />
        <YAxis stroke={CHART_COLORS.label} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <defs>
          <linearGradient id="priceAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="close"
          stroke="#38bdf8"
          strokeWidth={2}
          fill="url(#priceAreaFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const candle = payload[0]?.payload

  if (!candle) {
    return null
  }

  const rising = candle.close >= candle.open

  return (
    <div className="glass-panel" style={{ minWidth: '220px', padding: '16px', borderRadius: '16px' }}>
      <div style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '10px' }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', color: '#cbd5e1', fontSize: '0.92rem' }}>
        <span>Open</span>
        <span style={{ color: '#f8fafc' }}>{formatCompactPrice(candle.open)}</span>
        <span>High</span>
        <span style={{ color: '#86efac' }}>{formatCompactPrice(candle.high)}</span>
        <span>Low</span>
        <span style={{ color: '#fca5a5' }}>{formatCompactPrice(candle.low)}</span>
        <span>Close</span>
        <span style={{ color: rising ? '#86efac' : '#fca5a5' }}>{formatCompactPrice(candle.close)}</span>
      </div>
    </div>
  )
}

function ChartShell({
  symbol,
  priceData,
  history,
  loading,
  onLoadHistory,
  onTrade,
}) {
  const [timeframe, setTimeframe] = useState('1W')

  const activeOption = TIMEFRAME_OPTIONS.find((option) => option.label === timeframe) || TIMEFRAME_OPTIONS[2]

  const chartData = useMemo(() => normalizeChartData(history), [history])

  useEffect(() => {
    void onLoadHistory(symbol, activeOption.period, activeOption.interval)
  }, [activeOption.interval, activeOption.period, onLoadHistory, symbol])

  const marketStats = useMemo(() => {
    const source = chartData.length ? chartData : normalizeChartData(demoCandles)
    const highs = source.map((item) => Number(item.high || 0))
    const lows = source.map((item) => Number(item.low || 0))
    const volumes = source.map((item) => Number(item.volume || 0))

    return {
      high: Math.max(...highs),
      low: Math.min(...lows),
      volume: volumes.length ? volumes.reduce((sum, value) => sum + value, 0) : 0,
    }
  }, [history])

  const currentPrice = Number(priceData?.price || history?.[history.length - 1]?.close || 0)
  const firstClose = Number(history?.[0]?.open || history?.[0]?.close || currentPrice || 0)
  const changePercent = firstClose ? ((currentPrice - firstClose) / firstClose) * 100 : 0
  const isPositive = changePercent >= 0

  return (
    <div className="chart-shell glass-panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Market chart</span>
          <h2 style={{ marginTop: '8px' }}>
            {symbol.toUpperCase()} <span className="muted" style={{ fontSize: '0.86rem', fontWeight: 500 }}>Live OHLC view</span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{formatCompactPrice(currentPrice)}</div>
          <div className={`signal-badge ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {formatCompactChange(changePercent)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {TIMEFRAME_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            className={timeframe === option.label ? 'primary-btn' : 'ghost-btn'}
            onClick={() => setTimeframe(option.label)}
            style={{ minWidth: '72px', padding: '10px 14px' }}
          >
            {option.label}
          </button>
        ))}
      </div>

        <CandlestickChart data={chartData} />

      <div className="section-card" style={{ padding: '16px', background: 'rgba(2, 6, 23, 0.35)', borderRadius: '18px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div>
            <span className="eyebrow">24h stats</span>
            <h2 style={{ marginTop: '8px', fontSize: '1.15rem' }}>Market activity</h2>
          </div>
        </div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <StatCard label="24h High" value={formatCompactPrice(marketStats.high)} detail="Session peak" tone="positive" />
          <StatCard label="24h Low" value={formatCompactPrice(marketStats.low)} detail="Session floor" tone="negative" />
          <StatCard label="24h Volume" value={marketStats.volume.toLocaleString('en-US')} detail="Aggregated volume" tone="neutral" />
        </div>
      </div>

      <div style={{ display: 'none' }} aria-hidden="true">
        <AreaChartView data={chartData} />
      </div>

      <div className="trade-actions" style={{ justifyContent: 'flex-start' }}>
        <button className="primary-btn buy" type="button" onClick={() => onTrade('buy')} disabled={loading.trade}>
          Buy
        </button>
        <button className="primary-btn sell" type="button" onClick={() => onTrade('sell')} disabled={loading.trade}>
          Sell
        </button>
      </div>
    </div>
  )
}

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || ''
}

async function apiFetch(path, options = {}, token = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  let payload
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message = payload?.error || payload?.detail || `Request failed (${response.status})`
    throw new Error(message)
  }

  return payload
}

function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const submitLabel = mode === 'login' ? 'Login' : 'Create account'

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body =
        mode === 'login'
          ? { email: form.email.trim(), password: form.password }
          : {
              username: form.username.trim(),
              email: form.email.trim(),
              password: form.password,
            }

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      let token = data.token || data.jwt || ''

      if (!token && mode === 'register') {
        const loginData = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        })

        token = loginData.token || loginData.jwt || ''
      }

      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
      }

      onAuthenticated(token)
    } catch (submissionError) {
      setError(submissionError.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-shell">
      <div
        className="auth-panel glass-panel"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 'auto auto 0 0',
            width: '500px',
            height: '500px',
            borderRadius: '999px',
            pointerEvents: 'none',
            transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
            transition: 'transform 100ms ease-out, opacity 180ms ease',
            opacity: isHovering ? 1 : 0,
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(99, 102, 241, 0.2) 34%, transparent 68%)',
            filter: 'blur(64px)',
          }}
        />
        <div className="brand-mark">
          <span className="brand-dot" />
          ApexTrade AI
        </div>
        <h1>Professional-grade trading dashboard</h1>
        <p className="muted">
          Secure portfolio workflows, AI signals, and market charts for fintech job-ready demos.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Username
              <input
                type="text"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                placeholder="fintech_pro"
                autoComplete="username"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Working...' : submitLabel}
          </button>
        </form>

        <button className="ghost-btn" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
        </button>
      </div>

      <div className="auth-side">
        <div className="feature-card glass-panel">
          <span className="eyebrow">Secure by design</span>
          <h2>Java gateway only</h2>
          <p>React talks to the Spring Boot backend at localhost:8080 only. No direct Python access.</p>
        </div>
        <div className="feature-card glass-panel">
          <span className="eyebrow">Production feel</span>
          <h2>Desktop-first, mobile-safe</h2>
          <p>Dark mode, data density, strong hierarchy, and controlled motion for a premium fintech look.</p>
        </div>
        <div className="feature-card glass-panel">
          <span className="eyebrow">Workflows</span>
          <h2>Auth, trade, review</h2>
          <p>Built for login, dashboard, trading, portfolio review, and transaction history in one flow.</p>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, detail, tone = 'neutral' }) {
  return (
    <article className={`stat-card glass-panel tone-${tone}`}>
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      <span className="muted">{detail}</span>
    </article>
  )
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <span className="eyebrow">{subtitle}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Dashboard({ token, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [symbol, setSymbol] = useState('AAPL')
  const [history, setHistory] = useState(demoCandles)
  const [marketSignal, setMarketSignal] = useState(null)
  const [priceData, setPriceData] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [transactions, setTransactions] = useState([])
  const [walletBalance, setWalletBalance] = useState(10000)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState({ price: false, trade: false, signal: false, portfolio: false, transactions: false })
  const [tradeForm, setTradeForm] = useState({ symbol: 'AAPL', quantity: 1 })

  const portfolioStats = useMemo(() => {
    const totalValue = portfolio.reduce((sum, item) => sum + Number(item.marketValue || 0), 0)
    const unrealized = portfolio.reduce((sum, item) => sum + Number(item.pnl || 0), 0)
    const returnPercent = walletBalance > 0 ? (unrealized / (totalValue + walletBalance)) * 100 : 0

    return {
      totalValue,
      unrealized,
      returnPercent,
      totalEquity: totalValue + Number(walletBalance || 0),
    }
  }, [portfolio, walletBalance])

  const activePositionCount = portfolio.length

  const loadWallet = useCallback(async () => {
    try {
      const data = await apiFetch('/api/wallet/balance', {}, token)
      setWalletBalance(Number(data.balance || 0))
    } catch {
      setWalletBalance(10000)
    }
  }, [token])

  const loadPortfolio = useCallback(async () => {
    setLoading((state) => ({ ...state, portfolio: true }))
    try {
      const data = await apiFetch('/api/portfolio', {}, token)
      setPortfolio(Array.isArray(data.positions) ? data.positions : data.items || [])
    } catch {
      setPortfolio(demoPortfolio)
    } finally {
      setLoading((state) => ({ ...state, portfolio: false }))
    }
  }, [token])

  const loadTransactions = useCallback(async () => {
    setLoading((state) => ({ ...state, transactions: true }))
    try {
      const data = await apiFetch('/api/transactions', {}, token)
      setTransactions(Array.isArray(data) ? data : data.transactions || [])
    } catch {
      setTransactions(demoTransactions)
    } finally {
      setLoading((state) => ({ ...state, transactions: false }))
    }
  }, [token])

  const loadHistory = useCallback(
    async (targetSymbol = symbol, period = '1mo', interval = '1d') => {
    if (!targetSymbol.trim()) return
    setLoading((state) => ({ ...state, price: true }))
    try {
      const data = await apiFetch(
        `/api/market/history/${encodeURIComponent(targetSymbol)}?period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`,
        {},
        token,
      )
      setHistory(data.data || demoCandles)
    } catch {
      setHistory(demoCandles)
    } finally {
      setLoading((state) => ({ ...state, price: false }))
    }
    },
    [symbol, token],
  )

  const loadSignal = useCallback(
    async (targetSymbol = symbol) => {
    if (!targetSymbol.trim()) return
    setLoading((state) => ({ ...state, signal: true }))
    try {
      const data = await apiFetch(`/api/market/signal/${encodeURIComponent(targetSymbol)}`, {}, token)
      setMarketSignal(data)
    } catch {
      setMarketSignal({
        symbol: targetSymbol.toUpperCase(),
        signal: 'HOLD',
        confidence: 'LOW',
        reasoning: 'Signal unavailable from backend. Using safe fallback until service responds.',
        price: 0,
      })
    } finally {
      setLoading((state) => ({ ...state, signal: false }))
    }
    },
    [symbol, token],
  )

  const loadPrice = useCallback(
    async (targetSymbol = symbol) => {
    if (!targetSymbol.trim()) return
    setLoading((state) => ({ ...state, price: true }))
    setMessage('')
    try {
      const data = await apiFetch(`/api/market/price/${encodeURIComponent(targetSymbol)}`, {}, token)
      setPriceData(data)
      setTradeForm((state) => ({ ...state, symbol: data.symbol || targetSymbol.toUpperCase() }))
      setMessage(`Live price updated for ${data.symbol || targetSymbol.toUpperCase()}`)
    } catch (error) {
      setMessage(error.message || 'Unable to fetch live price')
    } finally {
      setLoading((state) => ({ ...state, price: false }))
    }
    },
    [symbol, token],
  )

  const loadAll = useCallback(async () => {
    await Promise.all([loadWallet(), loadPortfolio(), loadTransactions(), loadPrice(symbol), loadHistory(symbol), loadSignal(symbol)])
  }, [loadHistory, loadPortfolio, loadPrice, loadSignal, loadTransactions, loadWallet, symbol])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAll()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadAll])

  const handleTrade = async (type) => {
    const targetSymbol = tradeForm.symbol.trim().toUpperCase()
    if (!targetSymbol) return

    setLoading((state) => ({ ...state, trade: true }))
    setMessage('')

    try {
      const data = await apiFetch(`/api/trade/${type}`, {
        method: 'POST',
        body: JSON.stringify({ symbol: targetSymbol, quantity: Number(tradeForm.quantity) }),
      }, token)

      setMessage(data.message || `${type.toUpperCase()} order submitted for ${targetSymbol}`)
      await Promise.all([loadWallet(), loadPortfolio(), loadTransactions(), loadPrice(targetSymbol), loadHistory(targetSymbol), loadSignal(targetSymbol)])
    } catch (error) {
      setMessage(error.message || 'Trade failed')
    } finally {
      setLoading((state) => ({ ...state, trade: false }))
    }
  }

  const currentSignalTone = marketSignal?.signal === 'BUY' ? 'positive' : marketSignal?.signal === 'SELL' ? 'negative' : 'neutral'

  return (
    <div className="app-shell">
      <aside className="sidebar glass-panel">
        <div>
          <div className="brand-mark">
            <span className="brand-dot" />
            ApexTrade AI
          </div>
          <p className="muted sidebar-copy">Premium fintech dashboard. Java backend only. Secure token flow.</p>
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeView === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="token-pill">JWT active</div>
          <button className="ghost-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <section className="hero-panel glass-panel">
          <div>
            <span className="eyebrow">ApexTrade AI dashboard</span>
            <h1>Institution-grade paper trading interface</h1>
            <p className="muted">
              Portfolio, signals, charts, and trade execution stitched into one production-style surface.
            </p>
          </div>
          <div className="hero-actions">
            <label className="inline-field">
              Symbol
              <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} placeholder="AAPL" />
            </label>
            <button className="primary-btn" type="button" onClick={() => loadAll()} disabled={loading.price || loading.signal}>
              Refresh market
            </button>
          </div>
        </section>

        {message ? <div className="status-banner glass-panel">{message}</div> : null}

        {activeView === 'dashboard' && (
          <>
            <section className="stats-grid">
              <StatCard label="Portfolio total" value={money(portfolioStats.totalValue)} detail="Market value of open positions" tone="positive" />
              <StatCard label="Cash balance" value={money(walletBalance)} detail="Available buying power" tone="neutral" />
              <StatCard label="Return %" value={percent(portfolioStats.returnPercent)} detail="Net gain on capital deployed" tone={portfolioStats.returnPercent >= 0 ? 'positive' : 'negative'} />
              <StatCard label="Open positions" value={String(activePositionCount)} detail="Active holdings in portfolio" tone="neutral" />
            </section>

            <section className="content-grid two-col">
              <div className="glass-panel section-card">
                <SectionHeader
                  title="Market pulse"
                  subtitle="Live quote"
                  action={
                    <button className="ghost-btn" type="button" onClick={() => loadPrice(symbol)}>
                      {loading.price ? 'Loading...' : 'Load quote'}
                    </button>
                  }
                />
                <div className="quote-row">
                  <div>
                    <strong>{priceData?.symbol || symbol.toUpperCase()}</strong>
                    <p className="muted">{priceData?.currency || 'USD'}</p>
                  </div>
                  <div className="quote-price">{priceData ? money(priceData.price) : '—'}</div>
                </div>
              </div>

              <div className="glass-panel section-card signal-card tone-positive">
                <SectionHeader title="AI signal" subtitle="RAG decisioning" />
                <div className={`signal-badge ${currentSignalTone}`}>{marketSignal?.signal || 'HOLD'}</div>
                <p className="confidence">Confidence: {marketSignal?.confidence || 'LOW'}</p>
                <p className="reasoning">{marketSignal?.reasoning || 'Signal unavailable. Refresh the market to generate one.'}</p>
              </div>
            </section>
          </>
        )}

        {activeView === 'trade' && (
          <section className="content-grid trade-grid">
            <div className="glass-panel section-card" style={{ alignSelf: 'start' }}>
              <SectionHeader title="Trading terminal" subtitle="Execute orders" />
              <div className="trade-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'flex-start' }}>
                <label>
                  Symbol
                  <input value={tradeForm.symbol} onChange={(event) => setTradeForm({ ...tradeForm, symbol: event.target.value.toUpperCase() })} />
                </label>
                <label>
                  Quantity
                  <input type="number" min="1" step="1" value={tradeForm.quantity} onChange={(event) => setTradeForm({ ...tradeForm, quantity: event.target.value })} />
                </label>
              </div>
            </div>

            <div className="stacked-grid">
              <div className="glass-panel section-card" style={{ alignSelf: 'start' }}>
                <SectionHeader title="Price history" subtitle="OHLC / Recharts" />
                <ChartShell
                  symbol={tradeForm.symbol || symbol}
                  priceData={priceData}
                  history={history}
                  loading={loading}
                  onLoadHistory={loadHistory}
                  onTrade={handleTrade}
                />
              </div>

              <div className="glass-panel section-card signal-card" style={{ alignSelf: 'start' }}>
                <SectionHeader title="Signal detail" subtitle="AI trade call" />
                <div className={`signal-badge ${currentSignalTone}`}>{marketSignal?.signal || 'HOLD'}</div>
                <p className="confidence">{marketSignal?.confidence || 'LOW'}</p>
                <p className="reasoning">{marketSignal?.reasoning || 'Signal reasoning will appear here after the backend responds.'}</p>
              </div>
            </div>
          </section>
        )}

        {activeView === 'portfolio' && (
          <section className="glass-panel section-card">
            <SectionHeader title="Portfolio holdings" subtitle="Positions & P&L" />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Avg cost</th>
                    <th>Current price</th>
                    <th>Market value</th>
                    <th>Unrealized P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.portfolio ? (
                    <tr>
                      <td colSpan="6">Loading portfolio...</td>
                    </tr>
                  ) : (
                    (portfolio.length ? portfolio : demoPortfolio).map((row) => (
                      <tr key={row.symbol}>
                        <td>{row.symbol}</td>
                        <td>{row.quantity}</td>
                        <td>{money(row.avgCost)}</td>
                        <td>{money(row.currentPrice)}</td>
                        <td>{money(row.marketValue)}</td>
                        <td className={Number(row.pnl || 0) >= 0 ? 'gain' : 'loss'}>{money(row.pnl || 0)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === 'history' && (
          <section className="glass-panel section-card">
            <SectionHeader title="Transaction history" subtitle="Trade ledger" />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading.transactions ? [] : transactions.length ? transactions : demoTransactions).map((row) => (
                    <tr key={row.id}>
                      <td>{row.date || row.createdAt || row.timestamp || '—'}</td>
                      <td>{row.symbol}</td>
                      <td>
                        <span className={`pill ${String(row.type || row.transactionType || '').toLowerCase()}`}>
                          {row.type || row.transactionType}
                        </span>
                      </td>
                      <td>{row.quantity}</td>
                      <td>{money(row.price)}</td>
                      <td>{money(row.total || row.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="footer-note muted">
          Backend: Java only at {API_BASE}. Protected routes require <code>Authorization: Bearer {'<jwt_token>'}</code>.
        </section>
      </main>
    </div>
  )
}

function App() {
  const [token, setToken] = useState(getStoredToken)

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    }
  }, [token])

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken('')
  }

  return token ? <Dashboard token={token} onLogout={handleLogout} /> : <AuthPanel onAuthenticated={setToken} />
}

export default App