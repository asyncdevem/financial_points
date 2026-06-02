"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { SecureRefreshModal } from "./secure-refresh-modal";
import { SessionProvider, useSessionState } from "./session-provider";

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "layout" },
  { href: "/banks", label: "Banks", icon: "bank" },
  { href: "/recommend", label: "Recommend", icon: "card" },
  { href: "/deals", label: "Deals", icon: "tags" },
  { href: "/reports", label: "Reports", icon: "download" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ShellContent>{children}</ShellContent>
      <SecureRefreshModal />
    </SessionProvider>
  );
}

function ShellContent({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const {
    session,
    openRefresh,
    wipeSession,
    secondsUntilTimeout,
    timedOut,
  } = useSessionState();

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  function handleLogout() {
    wipeSession();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0b0e13] text-[#f0f2f5]">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[#2a313d] bg-[#141820] transition-transform lg:static lg:translate-x-0 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center gap-3 border-b border-[#2a313d] px-5">
            <div className="grid size-9 place-items-center rounded-md bg-[#00d395] text-[#0b0e13]">
              <Icon name="shield" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-5">FinPoints</p>
              <p className="font-mono text-xs uppercase tracking-[0.04em] text-[#7a8696]">Zero persistence</p>
            </div>
          </div>

          <nav className="space-y-1 px-3 py-4" aria-label="Primary">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#002d22] text-[#00d395]"
                      : "text-[#7a8696] hover:bg-[#1a202b] hover:text-[#f0f2f5]"
                  }`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-[#2a313d] p-4">
            <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#f0f2f5]">
                <Icon name={session.icon} />
                Session rule
              </div>
              <p className="mt-2 text-xs leading-5 text-[#7a8696]">
                Live balances and points exist only in volatile memory and are
                wiped on logout or timeout.
              </p>
            </div>
          </div>
        </aside>

        {mobileNavOpen && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#2a313d] bg-[#0b0e13]/95 px-4 backdrop-blur lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Open navigation"
                className="grid size-10 place-items-center rounded-md border border-[#2a313d] bg-[#141820] lg:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Icon name="layout" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold leading-6 lg:text-xl">
                  Personal Financial Points Aggregator
                </h1>
                <p className="hidden font-mono text-xs uppercase tracking-[0.04em] text-[#7a8696] sm:block">
                  Unified rewards, live only for this session
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold sm:flex ${session.pill}`}
              >
                <Icon name={session.icon} />
                {session.short}
              </span>
              <span className="hidden h-10 items-center rounded-md border border-[#2a313d] px-3 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696] md:flex">
                {timedOut
                  ? "Timed out"
                  : `${Math.floor(secondsUntilTimeout / 60)}:${String(
                      secondsUntilTimeout % 60,
                    ).padStart(2, "0")}`}
              </span>
              <button
                className="hidden h-10 items-center gap-2 rounded-md bg-[#00d395] px-3 text-sm font-semibold text-[#0b0e13] hover:bg-[#35e6b5] sm:flex"
                onClick={openRefresh}
              >
                <Icon name="refresh" />
                Secure Refresh
              </button>
              <Link
                aria-label="Export snapshot"
                className="grid size-10 place-items-center rounded-md border border-[#2a313d] bg-[#141820] text-[#7a8696] hover:bg-[#1a202b] hover:text-[#f0f2f5]"
                href="/reports"
              >
                <Icon name="download" />
              </Link>
              <button
                aria-label="Logout and wipe session"
                className="grid size-10 place-items-center rounded-md border border-[#6f2528] bg-[#351719] text-[#ff4d4f] hover:bg-[#4a1c20]"
                onClick={handleLogout}
              >
                <Icon name="logout" />
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
