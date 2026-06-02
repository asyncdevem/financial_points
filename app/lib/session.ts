import type { IconName } from "../components/icons";

export type SessionState = "locked" | "live" | "stale" | "wiped";

export function getSessionMeta(state: SessionState) {
  const meta = {
    locked: {
      title: "Providers are locked",
      short: "Locked",
      description:
        "Connected banks are present, but live balances and points are hidden until Secure Refresh runs.",
      icon: "lock" as IconName,
      bg: "bg-[#1a202b] text-[#7a8696]",
      pill: "bg-[#1a202b] text-[#7a8696] border border-[#2a313d]",
    },
    live: {
      title: "Live volatile session",
      short: "Live",
      description:
        "Reward points and values are currently loaded in RAM and will be wiped on logout or inactivity timeout.",
      icon: "shield" as IconName,
      bg: "bg-[#002d22] text-[#00d395]",
      pill: "bg-[#002d22] text-[#00d395] border border-[#00664d]",
    },
    stale: {
      title: "Data is stale",
      short: "Stale",
      description:
        "The dashboard can still show the last session state, but a new Secure Refresh is recommended.",
      icon: "clock" as IconName,
      bg: "bg-[#2a2112] text-[#f2b84b]",
      pill: "bg-[#2a2112] text-[#f2b84b] border border-[#5b4316]",
    },
    wiped: {
      title: "Volatile data wiped",
      short: "Wiped",
      description:
        "The session ended or was manually cleared. Live financial values are no longer available in memory.",
      icon: "eraser" as IconName,
      bg: "bg-[#351719] text-[#ff4d4f]",
      pill: "bg-[#351719] text-[#ff4d4f] border border-[#6f2528]",
    },
  };

  return meta[state];
}
