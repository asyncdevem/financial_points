"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionState, setSessionState] = useState<SessionState>("live");
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [lastActivityAt, setLastActivityAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const session = useMemo(() => getSessionMeta(sessionState), [sessionState]);
  const secondsUntilTimeout = Math.max(
    0,
    Math.ceil((lastActivityAt + 15 * 60 * 1000 - now) / 1000),
  );

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
      setSessionState("wiped");
      setRefreshOpen(false);
      setTimedOut(true);
    }
  }, [secondsUntilTimeout, sessionState]);

  const value = {
    sessionState,
    session,
    refreshOpen,
    openRefresh: () => {
      setRefreshOpen(true);
      setSessionState("locked");
    },
    closeRefresh: () => setRefreshOpen(false),
    completeRefresh: () => {
      setSessionState("live");
      setRefreshOpen(false);
      setTimedOut(false);
    },
    wipeSession: () => {
      setSessionState("wiped");
      setRefreshOpen(false);
      setTimedOut(false);
    },
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
