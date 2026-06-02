"use client";

import { Icon } from "../icons";
import { useSessionState } from "../session-provider";
import { InfoTerm, PageHeader, Panel, SmallState } from "../ui";

export function ReportsScreen() {
  const { sessionState } = useSessionState();
  const wiped = sessionState === "wiped";

  return (
    <div className="mx-auto grid max-w-[1200px] gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <PageHeader
          icon="download"
          title="Session Snapshot"
          description="Create a user-approved PDF record before volatile data is wiped."
        />
        <Panel title="Snapshot Preview" icon="file">
          <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
                  Personal Financial Points Aggregator
                </p>
                <h3 className="mt-2 text-xl font-bold">Session Snapshot</h3>
                <p className="mt-2 text-sm text-[#7a8696]">
                  Generated from current volatile state.
                </p>
              </div>
              <SmallState label={wiped ? "Wiped" : "Live"} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTerm
                label="Reward value"
                value={wiped ? "Cleared" : "PKR 32,120"}
              />
              <InfoTerm label="Points" value={wiped ? "0" : "70,750"} />
              <InfoTerm label="Providers" value="3" />
            </div>
            <button
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] disabled:bg-[#2a313d] disabled:text-[#7a8696]"
              disabled={wiped}
            >
              <Icon name="download" />
              Export PDF
            </button>
          </div>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Opportunity Cost Report" icon="trendDown">
          <div className="space-y-4">
            <KpiInline
              label="Total missed rewards"
              value={wiped ? "Cleared" : "PKR 3,840"}
            />
            <KpiInline label="Largest missed category" value="Dining" />
            <KpiInline label="Recommended focus" value="Use HBL for dining" />
          </div>
        </Panel>
        <Panel title="Included Sections" icon="check">
          <ul className="space-y-3 text-sm text-[#7a8696]">
            {[
              "Provider reward summary",
              "Points valuation",
              "Opportunity-cost analytics",
              "Best card by category",
              "Volatile-session timestamp",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Icon name="check" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function KpiInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3">
      <span className="text-sm text-[#7a8696]">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
