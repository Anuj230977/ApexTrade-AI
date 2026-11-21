import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';

// This component protects the dashboard from unauthenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// This component prevents logged-in users from going back to the login page
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center font-mono text-xs text-[#94a3b8] select-none">
    <div className="flex space-x-2 mb-4">
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
    </div>
    <span className="tracking-widest uppercase text-emerald-400">Synchronizing with ApexTrade Gateway...</span>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><AuthPage /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Catch-all: redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}