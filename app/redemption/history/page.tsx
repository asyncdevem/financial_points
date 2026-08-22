"use client";

import { useState, useEffect } from "react";
import { Icon } from "../../components/icons";
import { PageHeader } from "../../components/ui";
import Link from "next/link";

interface Redemption {
  id: number;
  catalog_item_id: number;
  points_spent: number;
  status: "instant" | "pending" | "approved" | "completed" | "rejected";
  delivery_address: string | null;
  redemption_date: string;
  approved_at: string | null;
  completed_at: string | null;
  approval_notes: string | null;
  item_title: string;
  item_category: string;
  item_image_url: string | null;
  item_provider: string;
  estimated_delivery_days: number | null;
}

const STATUS_CONFIG = {
  instant: { label: "Instant", color: "text-[#00d395]", bg: "bg-[#002d22]", icon: "⚡" },
  pending: { label: "Pending", color: "text-[#f2b84b]", bg: "bg-[#3d2f1a]", icon: "⏳" },
  approved: { label: "Approved", color: "text-[#00d395]", bg: "bg-[#002d22]", icon: "✓" },
  completed: { label: "Completed", color: "text-[#7a8696]", bg: "bg-[#2a313d]", icon: "✓" },
  rejected: { label: "Rejected", color: "text-[#ff4d4f]", bg: "bg-[#351719]", icon: "✗" }
};

const CATEGORY_ICONS: Record<string, string> = {
  vouchers: "🎁",
  bills: "💡",
  cashback: "💰",
  products: "📦",
  charity: "❤️"
};

export default function RedemptionHistoryPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState<Redemption[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredRedemptions(redemptions);
    } else {
      setFilteredRedemptions(redemptions.filter(r => r.status === selectedStatus));
    }
  }, [selectedStatus, redemptions]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/redemption/history");
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data.redemptions || []);
        setFilteredRedemptions(data.redemptions || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch redemption history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (redemptionId: number) => {
    if (!confirm("Approve this redemption?")) return;

    setProcessingId(redemptionId);
    try {
      const response = await fetch("/api/redemption/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemption_id: redemptionId,
          action: "approve",
          notes: "Approved by user"
        })
      });

      if (response.ok) {
        await fetchHistory();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve redemption");
      }
    } catch (error) {
      alert("Failed to approve redemption");
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (redemptionId: number) => {
    if (!confirm("Mark this redemption as completed?")) return;

    setProcessingId(redemptionId);
    try {
      const response = await fetch("/api/redemption/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemption_id: redemptionId,
          action: "complete"
        })
      });

      if (response.ok) {
        await fetchHistory();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to complete redemption");
      }
    } catch (error) {
      alert("Failed to complete redemption");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="clock" />
        <span className="ml-2 text-[#7a8696]">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <PageHeader
        icon="download"
        title="Redemption History"
        description="View and manage your redemption requests and track their status"
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                Total Redemptions
              </p>
              <p className="mt-1 text-2xl font-bold text-[#f0f2f5]">
                {summary.total_redemptions}
              </p>
            </div>
            <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                Points Spent
              </p>
              <p className="mt-1 text-2xl font-bold text-[#ff4d4f]">
                {summary.total_points_spent.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                Pending Approvals
              </p>
              <p className="mt-1 text-2xl font-bold text-[#f2b84b]">
                {summary.status_counts.pending}
              </p>
            </div>
            <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                Completed
              </p>
              <p className="mt-1 text-2xl font-bold text-[#00d395]">
                {summary.status_counts.instant + summary.status_counts.completed}
              </p>
            </div>
          </div>
        )}

      {/* Status Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "pending", "approved", "instant", "completed", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`flex h-9 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-semibold transition-colors ${
                selectedStatus === status
                  ? "bg-[#00d395] text-[#0b0e13]"
                  : "border border-[#2a313d] bg-[#141820] text-[#7a8696] hover:border-[#00d395]"
              }`}
            >
              {status === "all" ? "All" : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
            </button>
          ))}
        </div>
        <Link
          href="/redemption"
          className="flex h-9 items-center gap-2 rounded-md border border-[#2a313d] bg-[#141820] px-3 text-sm font-semibold text-[#7a8696] hover:border-[#00d395] hover:text-[#00d395]"
        >
          <Icon name="reward" size={14} />
          Browse Catalog
        </Link>
      </div>

      {/* Redemptions List */}
      {filteredRedemptions.length === 0 ? (
        <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-12 text-center">
            <Icon name="download" size={48} />
            <h3 className="mt-4 text-lg font-semibold text-[#f0f2f5]">
              {selectedStatus === "all" ? "No Redemptions Yet" : `No ${selectedStatus} redemptions`}
            </h3>
            <p className="mt-2 text-sm text-[#7a8696]">
              {selectedStatus === "all" 
                ? "Visit the redemption catalog to start redeeming your points"
                : "Try selecting a different status filter"}
            </p>
            {selectedStatus === "all" && (
              <Link
                href="/redemption"
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-[#00d395] px-6 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e]"
              >
                <Icon name="reward" size={16} />
                Browse Catalog
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRedemptions.map((redemption) => {
              const statusInfo = STATUS_CONFIG[redemption.status];
              const categoryIcon = CATEGORY_ICONS[redemption.item_category] || "🎁";

              return (
                <div
                  key={redemption.id}
                  className="rounded-lg border border-[#2a313d] bg-[#141820] p-4 hover:border-[#00d395] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[#0b0e13] text-3xl">
                      {categoryIcon}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-[#f0f2f5]">
                              {redemption.item_title}
                            </h3>
                            <span className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                              <span>{statusInfo.icon}</span>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[#7a8696]">
                            {redemption.item_provider}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-[#7a8696]">
                            <span>Redeemed: {formatDate(redemption.redemption_date)}</span>
                            {redemption.approved_at && (
                              <span>• Approved: {formatDate(redemption.approved_at)}</span>
                            )}
                            {redemption.completed_at && (
                              <span>• Completed: {formatDate(redemption.completed_at)}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-[#7a8696]">Points Spent</p>
                          <p className="text-xl font-bold text-[#ff4d4f]">
                            {redemption.points_spent.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      {redemption.delivery_address && (
                        <div className="mt-3 rounded-md border border-[#2a313d] bg-[#0b0e13] p-3">
                          <p className="text-xs font-semibold text-[#7a8696]">Delivery Address</p>
                          <p className="mt-1 text-sm text-[#f0f2f5]">
                            {redemption.delivery_address}
                          </p>
                        </div>
                      )}

                      {/* Approval Notes */}
                      {redemption.approval_notes && (
                        <div className="mt-3 rounded-md border border-[#2a313d] bg-[#0b0e13] p-3">
                          <p className="text-xs font-semibold text-[#7a8696]">Approval Notes</p>
                          <p className="mt-1 text-sm text-[#f0f2f5]">
                            {redemption.approval_notes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons (Admin Controls) */}
                      {(redemption.status === "pending" || redemption.status === "approved") && (
                        <div className="mt-3 flex gap-2">
                          {redemption.status === "pending" && (
                            <button
                              onClick={() => handleApprove(redemption.id)}
                              disabled={processingId === redemption.id}
                              className="flex h-8 items-center gap-2 rounded-md bg-[#00d395] px-3 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
                            >
                              {processingId === redemption.id ? (
                                <>
                                  <Icon name="clock" size={14} />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Icon name="check" size={14} />
                                  Approve
                                </>
                              )}
                            </button>
                          )}
                          {redemption.status === "approved" && (
                            <button
                              onClick={() => handleComplete(redemption.id)}
                              disabled={processingId === redemption.id}
                              className="flex h-8 items-center gap-2 rounded-md border border-[#2a313d] bg-[#141820] px-3 text-sm font-semibold text-[#7a8696] hover:bg-[#1a202b] disabled:opacity-50"
                            >
                              {processingId === redemption.id ? (
                                <>
                                  <Icon name="clock" size={14} />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Icon name="check" size={14} />
                                  Mark Complete
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
