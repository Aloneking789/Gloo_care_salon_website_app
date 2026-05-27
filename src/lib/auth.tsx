import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, clearToken, getStoredUser, setStoredUser, setToken } from './api';
import { toast } from 'sonner';
import type { AuthUser, LoginRequest, RegisterRequest } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginEmail: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
    const onLogout = () => {
      setUser(null);
      toast.error('Session expired. Please sign in again.');
      try {
        // Force navigation back to the login page so the user can re-authenticate.
        if (typeof window !== 'undefined') window.location.href = '/login';
      } catch {
        // ignore
      }
    };

    globalThis.addEventListener?.('gloocare:logged-out', onLogout as EventListener);
    return () => globalThis.removeEventListener?.('gloocare:logged-out', onLogout as EventListener);
  }, []);

  const persist = (u: AuthUser) => {
    setToken(u.token);
    setStoredUser(u);
    setUser(u);
  };

  const value: AuthContextValue = {
    user,
    loading,
    loginEmail: async (req) => {
      const u = await api.login(req);
      persist(u);
    },
    register: async (req) => {
      const u = await api.register(req);
      persist(u);
    },
    sendOtp: async (phone) => {
      await api.sendOtp(phone);
    },
    verifyOtp: async (phone, otp) => {
      const u = await api.verifyOtp(phone, otp);
      persist(u);
    },
    logout: () => {
      clearToken();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Defensive fallback: instead of throwing, return a safe stub so the UI
    // can render (typically it'll show a loading state) and we don't crash
    // entirely if the provider isn't mounted for some reason.
    // Also log a helpful warning to make debugging easier.
    // eslint-disable-next-line no-console
    console.warn('useAuth used outside AuthProvider — returning fallback stub. Ensure AuthProvider is mounted at the app root.');

    const noopAsync = async () => {};
    const stub = {
      user: null,
      loading: true,
      loginEmail: noopAsync,
      register: noopAsync,
      sendOtp: noopAsync,
      verifyOtp: noopAsync,
      logout: () => {},
    } as AuthContextValue;

    return stub;
  }
  return ctx;
}
