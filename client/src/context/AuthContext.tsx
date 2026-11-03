import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { getErrorMessage } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isDonor: boolean;
  isRecipient: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updatedUser: User) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('foodbridge_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('foodbridge_token');
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verify session on mount if token exists
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('foodbridge_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('foodbridge_user', JSON.stringify(res.user));
          }
        } catch {
          // Token is invalid/expired
          localStorage.removeItem('foodbridge_token');
          localStorage.removeItem('foodbridge_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  const login = async (credentials: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('foodbridge_token', response.token);
        localStorage.setItem('foodbridge_user', JSON.stringify(response.user));
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('foodbridge_token', response.token);
        localStorage.setItem('foodbridge_user', JSON.stringify(response.user));
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    setUser(null);
    setToken(null);
    setError(null);
  };

  const updateCurrentUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('foodbridge_user', JSON.stringify(updatedUser));
  };

  const clearError = () => {
    setError(null);
  };

  const isDonor = user?.role === 'donor';
  const isRecipient = user?.role === 'recipient';
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isDonor,
        isRecipient,
        isAdmin,
        loading,
        error,
        login,
        register,
        logout,
        updateCurrentUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
