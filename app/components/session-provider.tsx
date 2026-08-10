"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSessionMeta, type SessionState } from "../lib/session";

type SessionContextValue = {
  sessionState: SessionState;
  session: ReturnType<typeof getSessionMeta>;
  refreshOpen: boolean;
  openRefresh: () => void;
  closeRefresh: () => void;
  completeRefresh: () => void;
  wipeSession: () => void;
  secondsUntilTimeout: number;
  timedOut: boolean;
  userEmail: string | null;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>("live");
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [lastActivityAt, setLastActivityAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const session = useMemo(() => getSessionMeta(sessionState), [sessionState]);
  const secondsUntilTimeout = Math.max(
    0,
    Math.ceil((lastActivityAt + 15 * 60 * 1000 - now) / 1000),
  );

  // Fetch user session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.user?.email || null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    const activityEvents = ["click", "keydown", "mousemove", "touchstart"];

    function handleActivity() {
      setLastActivityAt(Date.now());
      setTimedOut(false);
    }

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, handleActivity),
    );

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, handleActivity),
      );
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (secondsUntilTimeout === 0 && sessionState !== "wiped") {
      handleSessionTimeout();
    }
  }, [secondsUntilTimeout, sessionState]);

  async function handleSessionTimeout() {
    setSessionState("wiped");
    setRefreshOpen(false);
    setTimedOut(true);
    
    // Call logout API to clear session
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function handleWipeSession() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSessionState("wiped");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const value = {
    sessionState,
    session,
    refreshOpen,
    userEmail,
    openRefresh: () => {
      setRefreshOpen(true);
      setSessionState("locked");
    },
    closeRefresh: () => setRefreshOpen(false),
    completeRefresh: () => {
      setSessionState("live");
      setRefreshOpen(false);
      setTimedOut(false);
      setLastActivityAt(Date.now());
    },
    wipeSession: handleWipeSession,
    secondsUntilTimeout,
    timedOut,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionState() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionState must be used inside SessionProvider");
  }

  return context;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
