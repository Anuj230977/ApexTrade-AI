import { createContext, useContext, useState, useEffect } from 'react';
import { api, getApiMode, setApiMode } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('apex_token'));
  const [userId, setUserId] = useState(localStorage.getItem('apex_user_id'));
  const [username, setUsername] = useState(localStorage.getItem('apex_username'));
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiMode, setApiModeState] = useState(getApiMode());

  useEffect(() => {
    const syncApiMode = () => setApiModeState(getApiMode());

    syncApiMode();
    window.addEventListener('apex-api-mode-changed', syncApiMode);

    return () => window.removeEventListener('apex-api-mode-changed', syncApiMode);
  }, []);

  const toggleApiMode = () => {
    const nextMode = apiMode === 'LIVE' ? 'SANDBOX' : 'LIVE';
    setApiMode(nextMode);
    setApiModeState(nextMode);
    localStorage.setItem('apex_api_mode', nextMode);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await api.user.getProfile();
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load user profile, token might be invalid/expired.', err);
      // If we failed and are NOT in sandbox, let's keep profile null or handle offline
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      if (token) {
        await refreshProfile();
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('apex_token', res.token);
      localStorage.setItem('apex_user_id', res.userId);
      localStorage.setItem('apex_username', res.username);
      setToken(res.token);
      setUserId(res.userId);
      setUsername(res.username);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(username, email, password);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user_id');
    localStorage.removeItem('apex_username');
    setToken(null);
    setUserId(null);
    setUsername(null);
    setUserProfile(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        username,
        userProfile,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        apiMode,
        toggleApiMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
