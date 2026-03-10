import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import { setAccessToken } from "../api/httpClient";

type AuthState = {
  user: authApi.User | null;
  displayUser: authApi.User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<authApi.User>;
  register: (input: { name: string; email: string; password: string }) => Promise<authApi.User>;
  logout: () => void;
  switchViewRole?: (role: authApi.Role) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<authApi.User | null>(null);
  const [displayUser, setDisplayUser] = useState<authApi.User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Run ONCE on mount to restore session from the stored refresh token
  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Only try to refresh if we have a stored token (avoids 401 spam)
      const stored = authApi.loadRefreshToken();
      if (!stored) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const { accessToken: newToken } = await authApi.refresh();
        if (!cancelled && newToken) {
          setAccessToken(newToken);
          setAccessTokenState(newToken);
          const { user } = await authApi.me();
          if (!cancelled) {
            setUser(user);
            setDisplayUser(user);
          }
        }
      } catch {
        // no valid session - clear stored token
        authApi.clearRefreshToken();
        if (!cancelled) {
          setAccessToken(null);
          setAccessTokenState(null);
          setUser(null);
          setDisplayUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []); // <-- empty array: run ONCE on mount only

  const value = useMemo<AuthState>(
    () => ({
      user,
      displayUser: displayUser || user,
      accessToken,
      isLoading,
      login: async (input) => {
        const { user, accessToken } = await authApi.login(input);
        setAccessToken(accessToken);
        setAccessTokenState(accessToken);
        setUser(user);
        setDisplayUser(user);
        return user;
      },
      register: async (input) => {
        const { user, accessToken } = await authApi.register(input);
        setAccessToken(accessToken);
        setAccessTokenState(accessToken);
        setUser(user);
        setDisplayUser(user);
        return user;
      },
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        }
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
        setDisplayUser(null);
      },
      switchViewRole: (role: authApi.Role) => {
        if (user?.role === "ADMIN") {
          setDisplayUser({ ...user, role });
        }
      }
    }),
    [accessToken, isLoading, user, displayUser]
  );

  // keep http client header in sync
  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
