"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../icons";
import { useSessionState } from "../session-provider";
import { PageHeader, Panel } from "../ui";

export function SettingsScreen() {
  const { wipeSession } = useSessionState();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout? All session data will be cleared.")) {
      return;
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST"
      });
      if (response.ok) {
        wipeSession();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleClearSession = () => {
    if (confirm("Clear all volatile session data? This will reset points, transactions, and redemptions to zero.")) {
      wipeSession();
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[960px]">
        <div className="flex items-center justify-center py-12">
          <Icon name="clock" />
          <span className="ml-2 text-[#7a8696]">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-5">
      <PageHeader
        icon="settings"
        title="Settings"
        description="Manage your profile, view session information, and control your account"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profile Information */}
        <Panel title="Profile Information" icon="user">
          {profile ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                  Full Name
                </label>
                <p className="mt-1 text-sm font-semibold text-[#f0f2f5]">
                  {profile.full_name}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                  Phone
                </label>
                <p className="mt-1 text-sm font-semibold text-[#f0f2f5]">
                  {profile.phone}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                  Address
                </label>
                <p className="mt-1 text-sm text-[#f0f2f5]">
                  {profile.address}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                    Date of Birth
                  </label>
                  <p className="mt-1 text-sm text-[#f0f2f5]">
                    {new Date(profile.date_of_birth).toLocaleDateString("en-PK")}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                    Income Bracket
                  </label>
                  <p className="mt-1 text-sm text-[#f0f2f5]">
                    {profile.income_bracket}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#7a8696]">No profile data available</p>
          )}
        </Panel>

        {/* Session Information */}
        <Panel title="Session Information" icon="shield">
          <div className="space-y-4">
            <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                Data Storage Policy
              </p>
              <p className="mt-2 text-sm text-[#f0f2f5]">
                Financial data (points, balances) stored in volatile memory only
              </p>
              <p className="mt-1 text-xs text-[#7a8696]">
                Profile, cards, and metadata persisted in database
              </p>
            </div>

            <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                Session Timeout
              </p>
              <p className="mt-2 text-sm text-[#f0f2f5]">
                15 minutes of inactivity
              </p>
              <p className="mt-1 text-xs text-[#7a8696]">
                Automatically clears session data
              </p>
            </div>

            <button
              onClick={handleClearSession}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#6f2528] bg-[#351719] px-3 text-sm font-semibold text-[#ff4d4f] hover:bg-[#4a1c20]"
            >
              <Icon name="eraser" />
              Clear Session Data
            </button>
          </div>
        </Panel>

        {/* Account Actions */}
        <Panel title="Account Actions" icon="settings">
          <div className="space-y-3">
            <button
              onClick={() => router.push("/onboarding")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#2a313d] bg-[#141820] px-3 text-sm font-semibold text-[#7a8696] hover:bg-[#1a202b]"
            >
              <Icon name="refresh" />
              Re-run Onboarding
            </button>

            <button
              onClick={() => router.push("/onboarding/tutorial")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#2a313d] bg-[#141820] px-3 text-sm font-semibold text-[#7a8696] hover:bg-[#1a202b]"
            >
              <Icon name="layout" />
              View Tutorial Again
            </button>

            <button
              onClick={handleLogout}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#6f2528] bg-[#351719] px-3 text-sm font-semibold text-[#ff4d4f] hover:bg-[#4a1c20]"
            >
              <Icon name="logout" />
              Logout & Clear All Data
            </button>
          </div>
        </Panel>

        {/* App Information */}
        <Panel title="Application Info" icon="shield">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#7a8696]">Version:</span>
              <span className="font-semibold text-[#f0f2f5]">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a8696]">Build:</span>
              <span className="font-mono text-xs text-[#7a8696]">2024-01-01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a8696]">Supported Banks:</span>
              <span className="font-semibold text-[#f0f2f5]">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a8696]">Redemption Categories:</span>
              <span className="font-semibold text-[#f0f2f5]">5</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
