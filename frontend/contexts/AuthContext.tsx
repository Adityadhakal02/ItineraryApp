"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, login as loginApi, register as registerApi } from "@/lib/api";

type User = { id: number; email: string; full_name: string | null } | null;

const AuthContext = createContext<{
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (t: string) => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("token", t);
      setToken(t);
      const me = await getMe();
      setUser(me);
    } catch {
      if (typeof window !== "undefined") localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (t) loadUser(t);
    else setLoading(false);
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await loginApi(email, password);
      await loadUser(access_token);
    },
    [loadUser]
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const { access_token } = await registerApi(email, password, fullName);
      await loadUser(access_token);
    },
    [loadUser]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
