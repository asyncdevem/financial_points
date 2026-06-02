"use client";

import { cardRankings } from "../../lib/mock-data";
import { Icon } from "../icons";
import { DecisionCard } from "./dashboard-screen";
import { LabelInput, LabelSelect, PageHeader, Panel } from "../ui";

export function RecommendScreen() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-5">
        <PageHeader
          icon="card"
          title="Purchase Recommendation"
          description="Compare card reward rules before a purchase and estimate missed value."
        />
        <Panel title="Purchase Input" icon="filter">
          <form className="space-y-4">
            <LabelInput label="Amount" value="PKR 18,400" icon="reward" />
            <LabelSelect label="Category" value="Dining" />
            <LabelSelect label="Current card" value="Meezan Platinum" />
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#00d395] text-sm font-semibold text-[#0b0e13]"
            >
              <Icon name="chart" />
              Calculate recommendation
            </button>
          </form>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Recommended Decision" icon="check">
          <DecisionCard expanded />
        </Panel>
        <Panel title="Card Ranking" icon="chart">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-[#2a313d] font-mono text-xs uppercase tracking-[0.04em] text-[#7a8696]">
                <tr>
                  <th className="py-3">Card</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Points</th>
                  <th className="py-3">Reward Value</th>
                  <th className="py-3">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a313d]">
                {cardRankings.map((row) => (
                  <tr key={row.card}>
                    <td className="py-3 font-medium">{row.card}</td>
                    <td className="py-3 text-[#7a8696]">{row.category}</td>
                    <td className="py-3">{row.points}</td>
                    <td className="py-3">{row.value}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-[#1a202b] px-2 py-1 text-xs font-semibold text-[#f0f2f5]">
                        {row.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
