"use client";

import Link from "next/link";
import { deals, lifecycle, providers } from "../../lib/mock-data";
import { Icon } from "../icons";
import { useSessionState } from "../session-provider";
import { InfoTerm, KpiCard, Panel, SmallState } from "../ui";

export function DashboardScreen() {
  const { sessionState, session, openRefresh } = useSessionState();
  const wiped = sessionState === "wiped";

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <section className="rounded-lg border border-[#2a313d] bg-[#141820] p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className={`grid size-11 place-items-center rounded-lg ${session.bg}`}>
              <Icon name={session.icon} />
            </div>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
                Current data state
              </p>
              <h2 className="text-2xl font-bold tracking-normal">
                {session.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#7a8696]">
                {session.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="flex h-10 items-center gap-2 rounded-md bg-[#00d395] px-3 text-sm font-semibold text-[#0b0e13] hover:bg-[#35e6b5]"
              onClick={openRefresh}
            >
              <Icon name="refresh" />
              Secure Refresh
            </button>
            <Link
              className="flex h-10 items-center gap-2 rounded-md border border-[#2a313d] bg-[#141820] px-3 text-sm font-semibold text-[#f0f2f5] hover:bg-[#1a202b]"
              href="/reports"
            >
              <Icon name="download" />
              Snapshot
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="reward"
          label="Total reward value"
          value={wiped ? "Cleared" : "PKR 32,120"}
          detail={wiped ? "Session data wiped" : "+ PKR 1,420 this month"}
          tone={wiped ? "danger" : "success"}
        />
        <KpiCard
          icon="chart"
          label="Total points"
          value={wiped ? "0" : "70,750"}
          detail="Across connected providers"
          tone="info"
        />
        <KpiCard
          icon="bank"
          label="Connected providers"
          value="3"
          detail="2 live, 1 locked"
          tone="neutral"
        />
        <KpiCard
          icon="trendDown"
          label="Missed value"
          value={wiped ? "Cleared" : "PKR 3,840"}
          detail="Opportunity cost detected"
          tone="warning"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Provider Status" icon="bank">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-[#2a313d] font-mono text-xs uppercase tracking-[0.04em] text-[#7a8696]">
                <tr>
                  <th className="py-3 font-semibold">Provider</th>
                  <th className="py-3 font-semibold">Product</th>
                  <th className="py-3 font-semibold">Points</th>
                  <th className="py-3 font-semibold">Value</th>
                  <th className="py-3 font-semibold">State</th>
                  <th className="py-3 font-semibold">Refresh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a313d]">
                {providers.map((provider) => (
                  <tr key={provider.name}>
                    <td className="py-3 font-medium">{provider.name}</td>
                    <td className="py-3 text-[#7a8696]">{provider.product}</td>
                    <td className="py-3">
                      {wiped ? "0" : provider.points.toLocaleString()}
                    </td>
                    <td className="py-3">{wiped ? "Cleared" : provider.value}</td>
                    <td className="py-3">
                      <SmallState
                        label={
                          wiped
                            ? "Wiped"
                            : provider.status === "Live"
                              ? "Live"
                              : "Locked"
                        }
                      />
                    </td>
                    <td className="py-3 text-[#7a8696]">
                      {wiped ? "Session ended" : provider.refreshed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Rewards Breakdown" icon="chart">
          <div className="space-y-4">
            {[
              ["Cards", 64, "#00d395"],
              ["Dining", 42, "#f0f2f5"],
              ["Travel", 30, "#7a8696"],
              ["Groceries", 24, "#f2b84b"],
            ].map(([label, width, color]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-[#7a8696]">
                    {wiped ? "0%" : `${width}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#1a202b]">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: wiped ? "0%" : `${width}%`,
                      background: String(color),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Panel title="Best Next Purchase" icon="card">
          <DecisionCard />
        </Panel>
        <Panel title="Recent Public Deals" icon="tags">
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.title}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{deal.title}</p>
                  <p className="mt-1 text-xs text-[#7a8696]">
                    {deal.bank} - {deal.category}
                  </p>
                </div>
                <span className="rounded-md bg-[#002d22] px-2 py-1 text-xs font-bold text-[#00d395]">
                  {deal.value}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Volatile Lifecycle" icon="shield">
          <ol className="space-y-3">
            {lifecycle.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#002d22] text-xs font-bold text-[#00d395]">
                  {index + 1}
                </span>
                <span className="leading-6 text-[#7a8696]">{item}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </section>
    </div>
  );
}

export function DecisionCard({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
            Recommended card
          </p>
          <h3 className="mt-2 text-xl font-bold">HBL Visa Signature</h3>
        </div>
        <div className="grid size-10 place-items-center rounded-md bg-[#002d22] text-[#00d395]">
          <Icon name="check" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoTerm label="Expected points" value="1,840" />
        <InfoTerm label="Reward value" value="PKR 920" />
        <InfoTerm label="Opportunity cost" value="PKR 472" />
      </div>
      {expanded && (
        <p className="mt-4 text-sm leading-6 text-[#7a8696]">
          Using Meezan Platinum for this dining purchase would earn fewer
          points. The recommendation engine compares reward rate, category
          multiplier, and estimated cash value.
        </p>
      )}
    </div>
  );
}
