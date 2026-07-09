import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center font-mono text-xs text-[#94a3b8] select-none">
        <div className="flex space-x-2 mb-4">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="tracking-widest uppercase text-emerald-400">Initializing ApexTrade Cryptographic Gateways...</span>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
