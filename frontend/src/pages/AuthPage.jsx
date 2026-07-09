import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Terminal, Lock, Mail, User, Info, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';

export const AuthPage = () => {
  const { login, register, apiMode } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const res = await register(username, email, password);
        setSuccess(`${res.message || 'Registration successful!'} Please proceed to login with your credentials.`);
        setIsLogin(true); // Toggle to login
        setPassword(''); // clear password
      }
    } catch (err) {
      console.error('Authentication error', err);
      setError(err?.error || err?.message || 'Authentication rejected by security provider.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none" id="auth-page-container">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)] pointer-events-none"></div>
      
      {/* Floating System Mode Selector */}
      <div className="absolute top-6 right-6">
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
          <Radio size={12} className={apiMode === 'LIVE' ? 'animate-pulse' : ''} />
          <span>{apiMode === 'LIVE' ? 'API: LIVE GATEWAY' : 'API: SANDBOX SIMULATOR'}</span>
        </button>
      </div>

      <div className="w-full max-w-xl bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl p-10 relative z-10" id="auth-card">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl mb-3 text-emerald-400">
            <Terminal size={28} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight uppercase text-[#f8fafc]">
            ApexTrade <span className="text-emerald-500">AI</span>
          </h2>
          <p className="text-xs font-mono text-[#64748b] tracking-wider mt-1 uppercase">SECURE PORTAL INTERFACE</p>
        </div>

        {/* Notice Info Box */}
        <div className="bg-[#0a0f1d] border border-[#334155]/60 rounded-lg p-4 mb-6 text-sm font-mono text-[#94a3b8] leading-relaxed flex gap-2.5">
          <Info size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-semibold">Security Note:</span> New accounts are automatically provisioned with <span className="text-emerald-400 font-bold">$10,000.00</span> in paper trading cash.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input (Only on register) */}
          {!isLogin && (
            <div>
              <label htmlFor="reg-username" className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
                Username
              </label>
              <div className="flex bg-[#0a0f1d] border border-[#334155] rounded-md focus-within:border-emerald-500 transition overflow-hidden">
                <span className="pl-3.5 flex items-center text-[#64748b]">
                  <User size={14} />
                </span>
                <input
                  id="reg-username"
                  type="text"
                  required
                  placeholder="quant_trader_99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none py-3 px-3.5 text-sm text-white focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="auth-email" className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Email Address
            </label>
            <div className="flex bg-[#0a0f1d] border border-[#334155] rounded-md focus-within:border-emerald-500 transition overflow-hidden">
              <span className="pl-3.5 flex items-center text-[#64748b]">
                <Mail size={14} />
              </span>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="trader@apextrade.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-3.5 text-sm text-white focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="auth-password" className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Secure Credentials
            </label>
            <div className="flex bg-[#0a0f1d] border border-[#334155] rounded-md focus-within:border-emerald-500 transition overflow-hidden">
              <span className="pl-3.5 flex items-center text-[#64748b]">
                <Lock size={14} />
              </span>
              <input
                id="auth-password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-3.5 text-sm text-white focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded text-xs text-rose-400 font-mono flex gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded text-xs text-emerald-400 font-mono flex gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-sm font-bold font-mono tracking-widest rounded shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'ESTABLISHING HANDSHAKE...' : isLogin ? 'AUTHORIZE & INITIALIZE' : 'PROVISION ACCOUNT'}
          </button>
        </form>

        {/* Mode Switch Trigger */}
        <div className="text-center mt-6 pt-5 border-t border-[#334155]/40">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
            }}
            className="text-sm font-mono text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer bg-transparent border-none"
          >
            {isLogin
              ? "New here? Provision a secure quant trading terminal"
              : "Already provisioned? Authorize session details"}
          </button>
        </div>
      </div>
    </div>
  );
};
