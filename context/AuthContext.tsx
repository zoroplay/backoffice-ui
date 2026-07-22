"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getStoredSession, hasPermission, type AuthSession } from "@/utils/session";

type AuthContextValue = {
  session: AuthSession | null;
  isReady: boolean;
  isAuthenticated: boolean;
  refreshSession: () => void;
  signOut: () => void;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  requireAuth = false,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshSession = useCallback(() => {
    setSession(getStoredSession());
    setIsReady(true);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
    router.replace("/");
  }, [router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession, pathname]);

  useEffect(() => {
    if (isReady && requireAuth && !session?.token) {
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, pathname, requireAuth, router, session?.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isReady,
      isAuthenticated: Boolean(session?.token),
      refreshSession,
      signOut,
      can: (permission: string) => hasPermission(session, permission),
    }),
    [isReady, refreshSession, session, signOut]
  );

  if (requireAuth && (!isReady || !session?.token)) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          Checking session...
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      session: null,
      isReady: true,
      isAuthenticated: false,
      refreshSession: () => {},
      signOut: () => {},
      can: () => false,
    };
  }

  return context;
}
