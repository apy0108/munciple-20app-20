import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@shared/api";

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("mcms_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = (name: string, role: UserRole) => {
    const next = { id: crypto.randomUUID(), name, role };
    setUser(next);
    localStorage.setItem("mcms_user", JSON.stringify(next));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mcms_user");
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
