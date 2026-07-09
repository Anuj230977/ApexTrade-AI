/**
 * ApexTrade AI - API Service Layer
 * Fully compliant with the Live Backend Blueprint.
 */

// =============================================================================
// CONFIGURATION: Change this to 'http://java-service:8080/api' if running in Docker
// =============================================================================
const BASE_URL = 'http://localhost:8080/api'; 
// =============================================================================

let isUsingSandbox = localStorage.getItem('apex_api_mode') === 'SANDBOX';

function notifyApiModeChange(mode) {
  localStorage.setItem('apex_api_mode', mode);
  window.dispatchEvent(new Event('apex-api-mode-changed'));
}

export function getApiMode() {
  return isUsingSandbox ? 'SANDBOX' : 'LIVE';
}

export function setApiMode(mode) {
  isUsingSandbox = mode === 'SANDBOX';
  notifyApiModeChange(getApiMode());
}

const getToken = () => localStorage.getItem('apex_token');

function logRequest(method, url, headers, body) {
  console.log(
    `%c[API OUTGOING REQUEST] %c${method} %c${url}`,
    'color: #38bdf8; font-weight: bold; background: #0f172a; padding: 2px 4px; border-radius: 4px;',
    'color: #f59e0b; font-weight: bold;',
    'color: #e2e8f0;',
    { headers, body: body ? JSON.parse(JSON.stringify(body)) : undefined }
  );
}

function logResponse(url, status, data, isSandbox = false) {
  console.log(
    `%c[API INCOMING RESPONSE] %c${status} %c${url} ${isSandbox ? '(SANDBOX)' : ''}`,
    'color: #10b981; font-weight: bold; background: #0f172a; padding: 2px 4px; border-radius: 4px;',
    status >= 200 && status < 300 ? 'color: #10b981;' : 'color: #ef4444;',
    'color: #e2e8f0;',
    { data: data ? JSON.parse(JSON.stringify(data)) : undefined }
  );
}

async function request(method, path, body, isPublic = false) {
  // FIXED: We no longer use window.location.origin. We use the fixed BASE_URL.
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (!isPublic) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  logRequest(method, url, headers, body);

  if (isUsingSandbox) {
    throw new Error('Sandbox mode active');
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: errorText };
      }
      logResponse(url, response.status, errorJson);
      throw { status: response.status, ...errorJson };
    }

    const data = await response.json();
    logResponse(url, response.status, data);
    return data;
  } catch (err) {
    if (err && err.status) {
      throw err;
    }
    console.warn(`[API Client] Live request failed, switching to sandbox fallback.`, err);
    setApiMode('SANDBOX');
    throw new Error('Backend offline, fallback initiated');
  }
}

// --- SANDBOX SIMULATED DATABASE ---
const initialSandboxDb = {
  users: [],
  wallets: {},
  portfolios: {},
  transactions: [],
};

function getSandboxDb() {
  const data = localStorage.getItem('apex_sandbox_db');
  if (!data) {
    localStorage.setItem('apex_sandbox_db', JSON.stringify(initialSandboxDb));
    return initialSandboxDb;
  }
  return JSON.parse(data);
}

function saveSandboxDb(db) {
  localStorage.setItem('apex_sandbox_db', JSON.stringify(db));
}

const STOCK_PRICES = {
  AAPL: 184.25,
  MSFT: 415.50,
  TSLA: 175.80,
  BTC: 68500.00,
  ETH: 3550.00,
  GOOGL: 152.30,
  NVDA: 875.20,
};

export const AVAILABLE_SYMBOLS = Object.keys(STOCK_PRICES);

function getMockPrice(symbol) {
  const basePrice = STOCK_PRICES[symbol.toUpperCase()] || 100.00;
  const randomFactor = 1 + (Math.random() - 0.5) * 0.002;
  return parseFloat((basePrice * randomFactor).toFixed(2));
}

export const api = {
  auth: {
    async register(username, email, password) {
      try {
        return await request('POST', '/auth/register', { username, email, password }, true);
      } catch (err) {
        if (isUsingSandbox) {
          const db = getSandboxDb();
          const userExists = db.users.some((u) => u.email === email);
          if (userExists) {
            logResponse('/api/auth/register', 400, { error: 'Email already exists' }, true);
            throw { status: 400, error: 'Email already exists' };
          }
          const userId = 'user_' + Math.random().toString(36).substr(2, 9);
          const newUser = { id: userId, username, email, role: 'USER', createdAt: new Date().toISOString() };
          db.users.push(newUser);
          db.wallets[userId] = { balance: 10000.00 };
          db.portfolios[userId] = { positions: [], cashBalance: 10000.00 };
          saveSandboxDb(db);
          const response = { message: 'User registered successfully', userId, username, walletBalance: 10000.00 };
          logResponse('/api/auth/register', 201, response, true);
          return response;
        }
        throw err;
      }
    },

    async login(email, password) {
      try {
        return await request('POST', '/auth/login', { email, password }, true);
      } catch (err) {
        if (isUsingSandbox) {
          const db = getSandboxDb();
          const user = db.users.find((u) => u.email === email);
          if (!user) {
            logResponse('/api/auth/login', 401, { error: 'Invalid email or password' }, true);
            throw { status: 401, error: 'Invalid email or password' };
          }
          const token = 'mock_jwt_token_for_' + user.id;
          const response = { token, userId: user.id, username: user.username };
          logResponse('/api/auth/login', 200, response, true);
          return response;
        }
        throw err;
      }
    },
  },

  market: {
    async getPrice(symbol) {
      try {
        return await request('GET', `/market/price/${symbol.toUpperCase()}`, undefined, true);
      } catch (err) {
        if (isUsingSandbox) {
          const price = getMockPrice(symbol);
          const response = { symbol: symbol.toUpperCase(), price, currency: 'USD' };
          logResponse(`/api/market/price/${symbol}`, 200, response, true);
          return response;
        }
        throw err;
      }
    },

    async getHistory(symbol, period = '1mo', interval = '1d') {
      try {
        return await request('GET', `/market/history/${symbol.toUpperCase()}?period=${period}&interval=${interval}`, undefined, true);
      } catch (err) {
        if (isUsingSandbox) {
          const basePrice = STOCK_PRICES[symbol.toUpperCase()] || 100.00;
          const data = [];
          let currentPrice = basePrice * 0.9;
          const days = period === '1mo' ? 30 : period === '3mo' ? 90 : period === '1y' ? 365 : period === '5d' ? 5 : 30;
          const now = new Date();
          for (let i = days; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dailyReturn = (Math.random() - 0.48) * 0.04;
            const open = parseFloat((currentPrice * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2));
            const close = parseFloat((open * (1 + dailyReturn)).toFixed(2));
            const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.015)).toFixed(2));
            const low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.015)).toFixed(2));
            const volume = Math.floor(1000000 + Math.random() * 9000000);
            data.push({ date: dateStr, open, high, low, close, volume });
            currentPrice = close;
          }
          const response = { symbol: symbol.toUpperCase(), period, interval, data };
          logResponse(`/api/market/history/${symbol}`, 200, response, true);
          return response;
        }
        throw err;
      }
    },

    async getSignal(symbol) {
      try {
        return await request('GET', `/market/signal/${symbol.toUpperCase()}`, undefined, true);
      } catch (err) {
        if (isUsingSandbox) {
          const price = getMockPrice(symbol);
          const signals = ['BUY', 'SELL', 'HOLD'];
          const signal = signals[Math.floor(Math.random() * signals.length)];
          const confidence = parseFloat((0.6 + Math.random() * 0.35).toFixed(2));
          let reasoning = signal === 'BUY' ? `Bullish momentum for ${symbol}...` : signal === 'SELL' ? `Correction imminent for ${symbol}...` : `Sideways consolidation...`;
          const response = { symbol: symbol.toUpperCase(), signal, confidence, reasoning, price };
          logResponse(`/api/market/signal/${symbol}`, 200, response, true);
          return response;
        }
        throw err;
      }
    },
  },

  portfolio: {
    async getPortfolio() {
      try {
        return await request('GET', '/portfolio');
      } catch (err) {
        if (isUsingSandbox) {
          const userId = localStorage.getItem('apex_user_id') || 'guest';
          const db = getSandboxDb();
          const portfolio = db.portfolios[userId] || { positions: [], cashBalance: 10000.00 };
          let totalPositionsValue = 0;
          const positions = portfolio.positions.map((pos) => {
            const currentPrice = getMockPrice(pos.symbol);
            const marketValue = parseFloat((pos.quantity * currentPrice).toFixed(2));
            const costBasis = pos.quantity * pos.averageCost;
            const unrealizedPnL = parseFloat((marketValue - costBasis).toFixed(2));
            totalPositionsValue += marketValue;
            return { symbol: pos.symbol, quantity: pos.quantity, averageCost: pos.averageCost, currentPrice, marketValue, unrealizedPnL };
          });
          const totalValue = parseFloat((portfolio.cashBalance + totalPositionsValue).toFixed(2));
          const totalCostBasis = portfolio.positions.reduce((acc, pos) => acc + (pos.quantity * pos.averageCost), 0) + portfolio.cashBalance;
          const totalReturnPercent = totalCostBasis > 0 ? parseFloat((((totalValue - totalCostBasis) / totalCostBasis) * 100).toFixed(2)) : 0.00;
          const response = { positions, cashBalance: portfolio.cashBalance, totalValue, totalReturnPercent };
          logResponse('/api/portfolio', 200, response, true);
          return response;
        }
        throw err;
      }
    },
  },

  wallet: {
    async getBalance() {
      try {
        return await request('GET', '/wallet/balance');
      } catch (err) {
        if (isUsingSandbox) {
          const userId = localStorage.getItem('apex_user_id') || 'guest';
          const db = getSandboxDb();
          const wallet = db.wallets[userId] || { balance: 10000.00 };
          const response = { userId, balance: wallet.balance };
          logResponse('/api/wallet/balance', 200, response, true);
          return response;
        }
        throw err;
      }
    },
  },

  transactions: {
    async getTransactions() {
      try {
        return await request('GET', '/transactions');
      } catch (err) {
        if (isUsingSandbox) {
          const userId = localStorage.getItem('apex_user_id') || 'guest';
          const db = getSandboxDb();
          const userTx = db.transactions.filter((tx) => tx.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const response = userTx.map((tx) => ({ id: tx.id, symbol: tx.symbol, type: tx.transactionType, quantity: tx.quantity, price: tx.price, totalAmount: tx.totalAmount, createdAt: tx.createdAt }));
          logResponse('/api/transactions', 200, response, true);
          return response;
        }
        throw err;
      }
    },
  },

  trade: {
    async buy(symbol, quantity) {
      try {
        return await request('POST', '/trade/buy', { symbol: symbol.toUpperCase(), quantity });
      } catch (err) {
        if (isUsingSandbox) {
          const userId = localStorage.getItem('apex_user_id') || 'guest';
          const db = getSandboxDb();
          const wallet = db.wallets[userId] || { balance: 10000.00 };
          const portfolio = db.portfolios[userId] || { positions: [], cashBalance: 10000.00 };
          const price = getMockPrice(symbol);
          const totalCost = parseFloat((price * quantity).toFixed(2));
          if (wallet.balance < totalCost) {
            logResponse('/api/trade/buy', 400, { error: 'Insufficient funds' }, true);
            throw { status: 400, error: 'Insufficient funds' };
          }
          wallet.balance = parseFloat((wallet.balance - totalCost).toFixed(2));
          portfolio.cashBalance = parseFloat((portfolio.cashBalance - totalCost).toFixed(2));
          const sym = symbol.toUpperCase();
          const existingPosIndex = portfolio.positions.findIndex((pos) => pos.symbol === sym);
          if (existingPosIndex > -1) {
            const existingPos = portfolio.positions[existingPosIndex];
            const newQty = existingPos.quantity + quantity;
            const newAvgCost = parseFloat((((existingPos.quantity * existingPos.averageCost) + totalCost) / newQty).toFixed(4));
            portfolio.positions[existingPosIndex] = { ...existingPos, quantity: newQty, averageCost: newAvgCost };
          } else {
            portfolio.positions.push({ id: 'pos_' + Math.random().toString(36).substr(2, 9), symbol: sym, quantity, averageCost: price });
          }
          const txId = 'tx_' + Math.random().toString(36).substr(2, 9);
          db.transactions.push({ id: txId, userId, symbol: sym, transactionType: 'BUY', quantity, price, totalAmount: totalCost, createdAt: new Date().toISOString() });
          saveSandboxDb(db);
          const response = { symbol: sym, quantity, price, totalCost, remainingBalance: wallet.balance };
          logResponse('/api/trade/buy', 200, response, true);
          return response;
        }
        throw err;
      }
    },

    async sell(symbol, quantity) {
      try {
        return await request('POST', '/trade/sell', { symbol: symbol.toUpperCase(), quantity });
      } catch (err) {
        if (isUsingSandbox) {
          const userId = localStorage.getItem('apex_user_id') || 'guest';
          const db = getSandboxDb();
          const wallet = db.wallets[userId] || { balance: 10000.00 };
          const portfolio = db.portfolios[userId] || { positions: [], cashBalance: 10000.00 };
          const sym = symbol.toUpperCase();
          const existingPosIndex = portfolio.positions.findIndex((pos) => pos.symbol === sym);
          if (existingPosIndex === -1 || portfolio.positions[existingPosIndex].quantity < quantity) {
            logResponse('/api/trade/sell', 400, { error: 'Insufficient quantity' }, true);
            throw { status: 400, error: 'Insufficient quantity' };
          }
          const price = getMockPrice(symbol);
          const totalProceeds = parseFloat((price * quantity).toFixed(2));
          portfolio.positions[existingPosIndex].quantity -= quantity;
          if (portfolio.positions[existingPosIndex].quantity === 0) portfolio.positions.splice(existingPosIndex, 1);
          wallet.balance = parseFloat((wallet.balance + totalProceeds).toFixed(2));
          portfolio.cashBalance = parseFloat((portfolio.cashBalance + totalProceeds).toFixed(2));
          const txId = 'tx_' + Math.random().toString(36).substr(2, 9);
          db.transactions.push({ id: txId, userId, symbol: sym, transactionType: 'SELL', quantity, price, totalAmount: totalProceeds, createdAt: new Date().toISOString() });
          saveSandboxDb(db);
          const response = { symbol: sym, quantity, price, totalProceeds, remainingBalance: wallet.balance };
          logResponse('/api/trade/sell', 200, response, true);
          return response;
        }
        throw err;
      }
    },
  },

  user: {
    async getProfile() {
      try {
        return await request('GET', '/user/profile');
      } catch (err) {
        if (isUsingSandbox) {
          const userId = localStorage.getItem('apex_user_id') || 'guest';
          const db = getSandboxDb();
          const user = db.users.find((u) => u.id === userId);
          const response = user || { id: userId, username: 'Guest Trader', email: 'guest@apextrade.ai', role: 'USER', createdAt: new Date().toISOString() };
          logResponse('/api/user/profile', 200, response, true);
          return response;
        }
        throw err;
      }
    },
  },
};