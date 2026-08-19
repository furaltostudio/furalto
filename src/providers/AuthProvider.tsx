"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiClientError, apiClient } from "@/lib/api/client";
import { isAdminRole, isStaffRole } from "@/lib/auth/roles";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginInput, RegisterInput, UserRole } from "@/types";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<string>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  verifyEmail: (token: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (!apiClient.getAccessToken()) {
        const refreshed = await apiClient.refreshAccessToken();
        if (!refreshed) {
          setUser(null);
          return;
        }
      }

      const response = await authService.me();
      setUser(response.data.user);
    } catch {
      const refreshed = await apiClient.refreshAccessToken();
      if (refreshed) {
        try {
          const response = await authService.me();
          setUser(response.data.user);
          return;
        } catch {
          // fall through
        }
      }

      apiClient.setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const hasRole = useCallback(
    (...roles: UserRole[]) => Boolean(user && roles.includes(user.role)),
    [user]
  );

  const login = useCallback(async (input: LoginInput) => {
    const response = await authService.login(input);
    apiClient.setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await authService.register(input);
    return response.data.message;
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const response = await authService.google(credential);
    apiClient.setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const response = await authService.verifyEmail(token);
    apiClient.setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API failures and clear local session anyway.
    } finally {
      apiClient.setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isStaff: isStaffRole(user?.role),
      isAdmin: isAdminRole(user?.role),
      hasRole,
      login,
      register,
      loginWithGoogle,
      verifyEmail,
      logout,
      refreshUser,
    }),
    [user, isLoading, hasRole, login, register, loginWithGoogle, verifyEmail, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    // Prefer the API message (e.g. "Invalid email or password").
    // Only use the session copy when the payload has no useful message.
    if (
      error.statusCode === 401 &&
      (!error.message || error.message.startsWith("API Error:"))
    ) {
      return "Session expired. Please sign in again.";
    }
    return error.message;
  }

  if (error instanceof Error) {
    if (
      error.message === "Failed to fetch" ||
      error.message.includes("NetworkError") ||
      error.message.includes("Load failed")
    ) {
      return "Cannot reach the API server. Make sure the backend is running on port 5000, then refresh.";
    }
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
