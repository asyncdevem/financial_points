"use client";

import { Icon } from "../icons";
import { useSessionState } from "../session-provider";
import { InfoTerm, LabelInput, PageHeader, Panel } from "../ui";

export function SettingsScreen() {
  const { wipeSession } = useSessionState();

  return (
    <div className="mx-auto max-w-[960px] space-y-5">
      <PageHeader
        icon="settings"
        title="Settings"
        description="Manage persistent profile preferences and session safety behavior."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Profile" icon="user">
          <div className="space-y-4">
            <LabelInput label="Email" value="user@example.com" icon="user" />
            <LabelInput label="Password" value="************" icon="lock" />
            <button className="flex h-10 items-center gap-2 rounded-md bg-[#00d395] px-3 text-sm font-semibold text-[#0b0e13]">
              <Icon name="check" />
              Save profile
            </button>
          </div>
        </Panel>
        <Panel title="Session Controls" icon="shield">
          <div className="space-y-4">
            <InfoTerm label="Inactivity timeout" value="15 minutes" />
            <InfoTerm label="Live financial storage" value="Volatile memory only" />
            <InfoTerm label="Database storage" value="Profile and metadata only" />
            <button
              className="flex h-10 items-center gap-2 rounded-md border border-[#6f2528] bg-[#351719] px-3 text-sm font-semibold text-[#ff4d4f]"
              onClick={wipeSession}
            >
              <Icon name="eraser" />
              Clear volatile session
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
