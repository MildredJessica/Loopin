"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";
import type { AuthResponse } from "./types";

const AUTH_KEY = "loopin.auth";
const TOKEN_KEY = "loopin.token";

interface AuthContextValue {
  user: AuthResponse | null;
  status: "loading" | "ready";
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<AuthResponse>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // corrupted storage — treat as logged out
    }
    setStatus("ready");
  }, []);

  function persist(next: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, next.token);
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setUser(next);
  }

  async function login(username: string, password: string) {
    persist(
      await api<AuthResponse>("/auth/login", {
        method: "POST",
        json: { username, password },
      })
    );
  }

  async function register(username: string, name: string, password: string) {
    persist(
      await api<AuthResponse>("/auth/register", {
        method: "POST",
        json: { username, name, password },
      })
    );
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }

  function updateUser(patch: Partial<AuthResponse>) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
