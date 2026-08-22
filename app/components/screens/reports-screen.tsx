"use client";

import { useState, useEffect } from "react";
import { Icon } from "../icons";
import { useSessionState } from "../session-provider";
import { PageHeader, Panel } from "../ui";

export function ReportsScreen() {
  const { sessionState } = useSessionState();
  const wiped = sessionState === "wiped";
  const [analytics, setAnalytics] = useState<any>(null);
  const [pointsData, setPointsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wiped) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [wiped]);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, pointsRes] = await Promise.all([
        fetch("/api/transactions/analytics?days=30"),
        fetch("/api/points")
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (pointsRes.ok) {
        const data = await pointsRes.json();
        setPointsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    alert("PDF export functionality would be implemented here. This would generate a comprehensive report with all your points, transactions, and analytics.");
  };

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <PageHeader
        icon="download"
        title="Reports & Analytics"
        description="View spending analytics, export session data, and track your rewards performance"
      />

      {wiped ? (
        <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-12 text-center">
          <Icon name="download" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-[#f0f2f5]">
            Session Data Cleared
          </h3>
          <p className="mt-2 text-sm text-[#7a8696]">
            Session data has been wiped. Start a new session to generate reports.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="clock" />
          <span className="ml-2 text-[#7a8696]">Loading analytics...</span>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {/* Snapshot Export */}
          <Panel title="Session Snapshot" icon="download">
            <div className="space-y-4">
              <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
                <p className="text-sm font-semibold text-[#7a8696]">Summary</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#7a8696]">Total Points:</span>
                    <span className="font-semibold text-[#f0f2f5]">
                      {pointsData?.total.balance.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a8696]">Est. Value:</span>
                    <span className="font-semibold text-[#00d395]">
                      PKR {pointsData?.total.estimated_value_pkr.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a8696]">Transactions:</span>
                    <span className="font-semibold text-[#f0f2f5]">
                      {analytics?.summary.total_transactions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a8696]">Total Spent:</span>
                    <span className="font-semibold text-[#f0f2f5]">
                      PKR {analytics?.summary.total_amount.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExportPDF}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e]"
              >
                <Icon name="download" />
                Export PDF Report
              </button>

              <p className="text-xs text-[#7a8696]">
                Export includes: transaction history, points breakdown, spending analytics, and redemption history.
              </p>
            </div>
          </Panel>

          {/* Spending Analytics */}
          {analytics && (
            <Panel title="Spending Overview (30 Days)" icon="chart">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3">
                    <p className="text-xs text-[#7a8696]">Avg Transaction</p>
                    <p className="mt-1 text-xl font-bold text-[#f0f2f5]">
                      PKR {analytics.summary.avg_transaction.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3">
                    <p className="text-xs text-[#7a8696]">Points Efficiency</p>
                    <p className="mt-1 text-xl font-bold text-[#00d395]">
                      {analytics.summary.points_efficiency} pts/PKR100
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-[#f0f2f5]">
                    Top Spending Categories
                  </p>
                  <div className="space-y-2">
                    {analytics.category_breakdown.slice(0, 5).map((cat: any) => (
                      <div key={cat.category}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="capitalize text-[#f0f2f5]">{cat.category}</span>
                          <span className="text-[#7a8696]">
                            PKR {cat.amount.toLocaleString()} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1a202b]">
                          <div
                            className="h-2 rounded-full bg-[#00d395]"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* Top Merchants */}
          {analytics && analytics.top_merchants.length > 0 && (
            <Panel title="Top Merchants" icon="tags">
              <div className="space-y-2">
                {analytics.top_merchants.slice(0, 5).map((merchant: any, index: number) => (
                  <div
                    key={merchant.merchant}
                    className="flex items-center justify-between rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2a313d] text-sm font-bold text-[#7a8696]">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-[#f0f2f5]">
                        {merchant.merchant}
                      </span>
                    </div>
                    <span className="text-sm text-[#7a8696]">
                      PKR {merchant.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Card Performance */}
          {analytics && analytics.card_performance.length > 0 && (
            <Panel title="Card Performance" icon="reward">
              <div className="space-y-3">
                {analytics.card_performance.slice(0, 5).map((perf: any) => (
                  <div
                    key={perf.card_id}
                    className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#f0f2f5]">Card #{perf.card_id}</p>
                      <p className="text-sm font-bold text-[#00d395]">
                        {perf.points.toLocaleString()} pts
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[#7a8696]">
                      <span>{perf.count} transactions</span>
                      <span>PKR {perf.amount.toLocaleString()} spent</span>
                      <span>{perf.avg_points_per_transaction} pts/tx</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
