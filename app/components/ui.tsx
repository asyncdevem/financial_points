"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function PageHeader({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-[#2a313d] bg-[#141820] p-5 text-[#f0f2f5]">
      <div className="flex items-start gap-3">
        <div className="grid size-11 place-items-center rounded-md bg-[#002d22] text-[#00d395]">
          <Icon name={icon} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#7a8696]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#2a313d] bg-[#141820] p-4 text-[#f0f2f5] lg:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon name={icon} />
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function KpiCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: IconName;
  label: string;
  value: string;
  detail: string;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const colors = {
    success: "bg-[#002d22] text-[#00d395]",
    warning: "bg-[#2a2112] text-[#f2b84b]",
    danger: "bg-[#351719] text-[#ff4d4f]",
    info: "bg-[#1a202b] text-[#f0f2f5]",
    neutral: "bg-[#1a202b] text-[#7a8696]",
  };

  return (
    <section className="rounded-lg border border-[#2a313d] bg-[#141820] p-4 text-[#f0f2f5]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.04em] text-[#7a8696]">{label}</p>
        <div className={`grid size-9 place-items-center rounded-lg ${colors[tone]}`}>
          <Icon name={icon} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-normal">{value}</p>
      <p className="mt-2 text-sm text-[#7a8696]">{detail}</p>
    </section>
  );
}

export function SmallState({ label }: { label: string }) {
  const state =
    label === "Live"
      ? "bg-[#002d22] text-[#00d395]"
      : label === "Locked"
        ? "bg-[#1a202b] text-[#7a8696]"
        : label === "Wiped"
          ? "bg-[#351719] text-[#ff4d4f]"
          : "bg-[#2a2112] text-[#f2b84b]";

  const icon: IconName =
    label === "Live"
      ? "shield"
      : label === "Locked"
        ? "lock"
        : label === "Wiped"
          ? "eraser"
          : "clock";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${state}`}>
      <Icon name={icon} size={14} />
      {label}
    </span>
  );
}

export function InfoTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#2a313d] bg-[#0b0e13] p-3">
      <dt className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

export function LabelInput({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: IconName;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
        {label}
      </span>
      <span className="flex h-11 items-center gap-2 rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5]">
        <Icon name={icon} />
        <input
          className="w-full bg-transparent text-sm outline-none"
          defaultValue={value}
        />
      </span>
    </label>
  );
}

export function LabelSelect({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
        {label}
      </span>
      <select
        className="h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] outline-none focus:border-[#00d395]"
        defaultValue={value}
      >
        <option>{value}</option>
        <option>Dining</option>
        <option>Grocery</option>
        <option>Travel</option>
        <option>Fuel</option>
      </select>
    </label>
  );
}
