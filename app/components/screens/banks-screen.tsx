"use client";

import { providers } from "../../lib/mock-data";
import { Icon } from "../icons";
import { useSessionState } from "../session-provider";
import { InfoTerm, PageHeader, SmallState } from "../ui";

export function BanksScreen() {
  const { sessionState, openRefresh, wipeSession } = useSessionState();

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <PageHeader
        icon="bank"
        title="Mock Bank Connections"
        description="Store only connection metadata. Live balances and points stay volatile."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {providers.map((provider, index) => (
          <section
            key={provider.name}
            className="rounded-lg border border-[#2a313d] bg-[#141820] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-[#1a202b] text-[#00d395]">
                  <Icon name="bank" />
                </div>
                <div>
                  <h3 className="font-semibold">{provider.name}</h3>
                  <p className="text-sm text-[#7a8696]">{provider.product}</p>
                </div>
              </div>
              <SmallState
                label={
                  sessionState === "wiped"
                    ? "Wiped"
                    : index === 2
                      ? "Locked"
                      : "Live"
                }
              />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <InfoTerm label="Metadata" value="Stored" />
              <InfoTerm
                label="Live data"
                value={sessionState === "wiped" ? "Cleared" : "RAM only"}
              />
              <InfoTerm label="Last refresh" value={index === 2 ? "Pending" : "2 min ago"} />
              <InfoTerm label="Credential" value="Mock key" />
            </dl>
            <div className="mt-5 flex gap-2">
              <button
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#00d395] px-3 text-sm font-semibold text-[#0b0e13]"
                onClick={openRefresh}
              >
                <Icon name="refresh" />
                Refresh
              </button>
              <button
                aria-label={`Remove ${provider.name}`}
                className="grid size-10 place-items-center rounded-md border border-[#6f2528] text-[#ff4d4f] hover:bg-[#351719]"
                onClick={wipeSession}
              >
                <Icon name="trash" />
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
