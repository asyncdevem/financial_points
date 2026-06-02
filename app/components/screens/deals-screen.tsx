"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deals as fallbackDeals } from "../../lib/mock-data";
import type { BankDeal } from "../../lib/bank-deal-scraper";
import { dealBanks } from "../../lib/banks";
import { Icon } from "../icons";
import { PageHeader, Panel } from "../ui";

type DealFeedState = {
  deals: BankDeal[];
  source: "scraped" | "fallback" | "loading";
};

export function DealsScreen() {
  return <BankDealsScreen />;
}

export function BankDealsScreen({
  bank,
  title = "Public Deals",
  description = "Browse public bank offers separately from private volatile financial data.",
}: {
  bank?: string;
  title?: string;
  description?: string;
}) {
  const [feed, setFeed] = useState<DealFeedState>({
    deals: fallbackDeals.map((deal) => ({
      ...deal,
      city: "Nationwide",
      sourceUrl: "local-fallback",
      scrapedAt: "",
    })),
    source: "loading",
  });
  const [bankFilter, setBankFilter] = useState("All banks");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [cityFilter, setCityFilter] = useState("All cities");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDeals() {
      try {
        const params = bank ? `?bank=${encodeURIComponent(bank)}` : "";
        const response = await fetch(`/api/deals${params}`);
        const payload = (await response.json()) as {
          deals: BankDeal[];
          source: "scraped" | "fallback";
        };

        if (active) {
          setFeed({ deals: payload.deals, source: payload.source });
        }
      } catch {
        if (active) {
          setFeed((current) => ({ ...current, source: "fallback" }));
        }
      }
    }

    loadDeals();

    return () => {
      active = false;
    };
  }, [bank]);

  const visibleDeals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return feed.deals
      .filter((deal) => bankFilter === "All banks" || deal.bank === bankFilter)
      .filter(
        (deal) =>
          categoryFilter === "All categories" ||
          deal.category === categoryFilter,
      )
      .filter((deal) => cityFilter === "All cities" || deal.city === cityFilter)
      .filter((deal) => {
        if (!query) {
          return true;
        }

        return `${deal.title} ${deal.bank} ${deal.category}`
          .toLowerCase()
          .includes(query);
      })
      .slice(0, 9);
  }, [bankFilter, categoryFilter, cityFilter, feed.deals, search]);

  const banks = useMemo(
    () => ["All banks", ...Array.from(new Set(feed.deals.map((deal) => deal.bank)))],
    [feed.deals],
  );
  const categories = useMemo(
    () => [
      "All categories",
      ...Array.from(new Set(feed.deals.map((deal) => deal.category))),
    ],
    [feed.deals],
  );
  const cities = useMemo(
    () => ["All cities", ...Array.from(new Set(feed.deals.map((deal) => deal.city)))],
    [feed.deals],
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <PageHeader icon="tags" title={title} description={description} />
      <div className="flex flex-wrap gap-2">
        <BankTab href="/deals" label="All banks" active={!bank} />
        {dealBanks.map((dealBank) => (
          <BankTab
            key={dealBank.slug}
            href={`/deals/${dealBank.slug}`}
            label={dealBank.name}
            active={bank === dealBank.name}
          />
        ))}
      </div>
      <Panel title="Filters" icon="filter">
        <div className="grid gap-3 md:grid-cols-5">
          {!bank && (
            <FilterSelect
              label="Bank"
              value={bankFilter}
              options={banks}
              onChange={setBankFilter}
            />
          )}
          <FilterSelect
            label="Category"
            value={categoryFilter}
            options={categories}
            onChange={setCategoryFilter}
          />
          <FilterSelect
            label="Expiry"
            value="Any expiry"
            options={["Any expiry", "See bank source"]}
            onChange={() => undefined}
          />
          <FilterSelect
            label="City"
            value={cityFilter}
            options={cities}
            onChange={setCityFilter}
          />
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
              Search
            </label>
            <div className="flex h-11 items-center gap-2 rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5]">
              <Icon name="search" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                value={search}
                aria-label="Search deals"
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>
      </Panel>
      <div className="flex items-center justify-between rounded-lg border border-[#2a313d] bg-[#141820] px-4 py-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
          Deal feed
        </span>
        <span className="rounded-md bg-[#002d22] px-2 py-1 text-xs font-semibold text-[#00d395]">
          {feed.source === "loading"
            ? "Loading scraper"
            : feed.source === "scraped"
              ? "Scraped from bank sources"
              : "Fallback feed"}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleDeals.map((deal, index) => (
          <section
            key={`${deal.title}-${index}`}
            className="rounded-lg border border-[#2a313d] bg-[#141820] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-[#002d22] text-[#00d395]">
                <Icon name="tags" />
              </div>
              <span className="rounded-md bg-[#002d22] px-2 py-1 text-xs font-semibold text-[#00d395]">
                {deal.value}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold">{deal.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#7a8696]">
              Available for {deal.bank} customers in {deal.city}. Category:
              {" "}
              {deal.category}.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[#2a313d] pt-3 text-sm">
              <span className="font-medium">{deal.bank}</span>
              <a
                className="flex items-center gap-2 text-[#7a8696] hover:text-[#00d395]"
                href={deal.sourceUrl === "local-fallback" ? undefined : deal.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="calendar" />
                {deal.expiry}
              </a>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function BankTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      className={`rounded-md border px-3 py-2 text-sm font-semibold ${
        active
          ? "border-[#00664d] bg-[#002d22] text-[#00d395]"
          : "border-[#2a313d] bg-[#141820] text-[#7a8696] hover:text-[#f0f2f5]"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
        {label}
      </span>
      <select
        className="h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] outline-none focus:border-[#00d395]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
