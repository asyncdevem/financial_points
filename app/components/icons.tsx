import type { ReactNode } from "react";

export type IconName =
  | "layout"
  | "shield"
  | "lock"
  | "clock"
  | "refresh"
  | "bank"
  | "card"
  | "reward"
  | "trendDown"
  | "chart"
  | "tags"
  | "download"
  | "settings"
  | "logout"
  | "user"
  | "check"
  | "eraser"
  | "search"
  | "filter"
  | "file"
  | "trash"
  | "calendar";

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, ReactNode> = {
    layout: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    shield: <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" />,
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 00-14-5l-2 2" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8 8 0 0014 5l2-2" />
        <path d="M20 20v-4h-4" />
      </>
    ),
    bank: (
      <>
        <path d="M3 10l9-6 9 6" />
        <path d="M5 10h14" />
        <path d="M7 10v8" />
        <path d="M12 10v8" />
        <path d="M17 10v8" />
        <path d="M4 18h16" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </>
    ),
    reward: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10" />
        <path d="M9 9.5c0-1.2 1-2 3-2s3 .8 3 2-1 2-3 2-3 .8-3 2 1 2 3 2 3-.8 3-2" />
      </>
    ),
    trendDown: (
      <>
        <path d="M3 7l6 6 4-4 8 8" />
        <path d="M17 17h4v-4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h18" />
        <path d="M8 16V9" />
        <path d="M13 16V7" />
        <path d="M18 16v-5" />
      </>
    ),
    tags: (
      <>
        <path d="M20 13l-7 7-9-9V4h7l9 9z" />
        <circle cx="8.5" cy="8.5" r="1.5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="M7 10l5 5 5-5" />
        <path d="M5 20h14" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 00-1.7-1L14.5 3h-4l-.3 3a8 8 0 00-1.7 1L6.1 6 4.1 9.5 6 11a7 7 0 000 2l-1.9 1.5 2 3.5 2.4-1a8 8 0 001.7 1l.3 3h4l.3-3a8 8 0 001.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 4v16" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0116 0" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </>
    ),
    eraser: (
      <>
        <path d="M4 16l8-8 7 7-5 5H8l-4-4z" />
        <path d="M12 20h9" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M16 16l5 5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    file: (
      <>
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M10 13h6" />
        <path d="M10 17h4" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 10h16" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}
