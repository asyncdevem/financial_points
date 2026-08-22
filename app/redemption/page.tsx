"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "../components/icons";
import { PageHeader } from "../components/ui";

interface CatalogItem {
  id: number;
  title: string;
  description: string;
  category: string;
  points_cost: number;
  provider: string;
  image_url: string | null;
  requires_delivery: boolean;
  estimated_delivery_days: number | null;
  is_active: boolean;
}

interface PointsBalance {
  balance: number;
  earned: number;
  redeemed: number;
}

const CATEGORY_INFO: Record<string, { emoji: string; label: string }> = {
  vouchers: { emoji: "🎁", label: "Gift Vouchers" },
  bills: { emoji: "💡", label: "Bill Payments" },
  cashback: { emoji: "💰", label: "Cashback" },
  products: { emoji: "📦", label: "Products" },
  charity: { emoji: "❤️", label: "Charity" }
};

export default function RedemptionPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, items]);

  const fetchData = async () => {
    try {
      // Fetch catalog (public)
      const catalogRes = await fetch("/api/redemption/catalog");
      if (catalogRes.ok) {
        const catalogData = await catalogRes.json();
        console.log("Catalog data received:", catalogData);
        setItems(catalogData.items || []);
        setFilteredItems(catalogData.items || []);
      } else {
        console.error("Catalog API error:", catalogRes.status, await catalogRes.text());
      }

      // Try to fetch points (requires auth, but optional)
      try {
        const pointsRes = await fetch("/api/points");
        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          setPointsBalance(pointsData.total);
        } else if (pointsRes.status === 401) {
          // No session - user can still browse catalog
          console.log("No active session - browsing catalog in guest mode");
          setPointsBalance(null);
        } else {
          console.error("Points API error:", pointsRes.status);
        }
      } catch (pointsError) {
        // Points fetch failed, but catalog should still work
        console.log("Points API unavailable - continuing without balance");
        setPointsBalance(null);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (item: CatalogItem) => {
    setSelectedItem(item);
    setShowCheckout(true);
  };

  const categories = ["all", ...Object.keys(CATEGORY_INFO)];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="clock" />
        <span className="ml-2 text-[#7a8696]">Loading catalog...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <PageHeader
        icon="reward"
        title="Redemption Catalog"
        description="Browse and redeem your loyalty points for vouchers, bill payments, cashback, products, and charity donations"
      />

      {/* Points Balance Banner or Login Prompt */}
      {pointsBalance ? (
        <div className="rounded-lg border border-[#2a313d] bg-gradient-to-r from-[#002d22] to-[#141820] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#7a8696]">Available Points</p>
              <p className="mt-1 text-4xl font-bold text-[#00d395]">
                {pointsBalance.balance.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-[#7a8696]">
                Earned: {pointsBalance.earned.toLocaleString()} • 
                Redeemed: {pointsBalance.redeemed.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#7a8696]">Estimated Value</p>
              <p className="mt-1 text-2xl font-bold text-[#f0f2f5]">
                PKR {pointsBalance.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#2a313d] bg-gradient-to-r from-[#1a202b] to-[#141820] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-[#f0f2f5]">Browse Redemption Options</p>
              <p className="mt-2 text-sm text-[#7a8696]">
                Log in to view your points balance and redeem rewards
              </p>
            </div>
            <Link
              href="/login"
              className="flex h-10 items-center gap-2 rounded-md bg-[#00d395] px-6 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e]"
            >
              <Icon name="check" size={16} />
              Log In
            </Link>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#00d395] text-[#0b0e13]"
                    : "border border-[#2a313d] bg-[#141820] text-[#7a8696] hover:border-[#00d395]"
                }`}
              >
                {cat === "all" ? (
                  <>
                    <Icon name="layout" size={16} />
                    All Items
                  </>
                ) : (
                  <>
                    <span className="text-lg">{CATEGORY_INFO[cat].emoji}</span>
                    {CATEGORY_INFO[cat].label}
                  </>
                )}
              </button>
            ))}
          </div>
          <Link
            href="/redemption/history"
            className="flex h-10 items-center gap-2 rounded-md border border-[#2a313d] bg-[#141820] px-4 text-sm font-semibold text-[#7a8696] hover:border-[#00d395] hover:text-[#00d395]"
          >
            <Icon name="download" size={16} />
            View History
          </Link>
        </div>

      {/* Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-12 text-center">
          <Icon name="reward" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-[#f0f2f5]">
            No items in this category
          </h3>
          <p className="mt-2 text-sm text-[#7a8696]">
            Try selecting a different category
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const canAfford = pointsBalance ? pointsBalance.balance >= item.points_cost : false;
            const categoryInfo = CATEGORY_INFO[item.category] || { emoji: "🎁", label: item.category };

            return (
              <div
                  key={item.id}
                  className="flex flex-col rounded-lg border border-[#2a313d] bg-[#141820] overflow-hidden hover:border-[#00d395] transition-colors"
                >
                  {/* Image */}
                  <div className="flex h-40 items-center justify-center bg-[#0b0e13] text-5xl">
                    {categoryInfo.emoji}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-[#002d22] px-2 py-0.5 text-xs font-semibold text-[#00d395]">
                        {categoryInfo.label}
                      </span>
                      {item.requires_delivery && (
                        <span className="rounded bg-[#2a313d] px-2 py-0.5 text-xs font-semibold text-[#7a8696]">
                          Delivery
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-[#f0f2f5]">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-[#7a8696] line-clamp-2">
                      {item.description}
                    </p>

                    {item.provider && (
                      <p className="mt-2 text-xs text-[#7a8696]">by {item.provider}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#7a8696]">Points Cost</p>
                        <p className="text-xl font-bold text-[#00d395]">
                          {item.points_cost.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={!canAfford}
                        className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                          canAfford
                            ? "bg-[#00d395] text-[#0b0e13] hover:bg-[#00b37e]"
                            : "bg-[#2a313d] text-[#7a8696] cursor-not-allowed"
                        }`}
                      >
                        <Icon name="check" size={14} />
                        Redeem
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Checkout Modal */}
      {showCheckout && selectedItem && pointsBalance && (
        <CheckoutModal
          item={selectedItem}
          balance={pointsBalance.balance}
          onClose={() => {
            setShowCheckout(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            setShowCheckout(false);
            setSelectedItem(null);
            fetchData(); // Refresh data
          }}
        />
      )}
    </div>
  );
}

interface CheckoutModalProps {
  item: CatalogItem;
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
}

function CheckoutModal({ item, balance, onClose, onSuccess }: CheckoutModalProps) {
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const handleRedeem = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/redemption/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalog_item_id: item.id,
          delivery_address: deliveryAddress || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data);
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setError(data.error || "Failed to process redemption");
      }
    } catch (error) {
      setError("Failed to process redemption. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryInfo = CATEGORY_INFO[item.category] || { emoji: "🎁", label: item.category };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-md rounded-lg border border-[#00d395] bg-[#141820] p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#002d22] text-3xl">
            ✓
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#00d395]">Redemption Successful!</h3>
          <p className="mt-2 text-sm text-[#7a8696]">
            {success.redemption.status === "instant" 
              ? "Your redemption has been processed instantly."
              : "Your redemption is pending approval. We'll notify you once it's processed."}
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#7a8696]">Item:</span>
              <span className="font-semibold text-[#f0f2f5]">{success.item.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a8696]">Points Spent:</span>
              <span className="font-semibold text-[#00d395]">
                {success.balance.spent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7a8696]">Remaining Balance:</span>
              <span className="font-semibold text-[#f0f2f5]">
                {success.balance.remaining.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#7a8696]">Closing automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#2a313d] bg-[#141820] p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#f0f2f5]">Confirm Redemption</h3>
            <p className="mt-1 text-sm text-[#7a8696]">Review your redemption details</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#7a8696] hover:text-[#f0f2f5] disabled:opacity-50"
          >
            <Icon name="eraser" size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg border border-[#6f2528] bg-[#351719] p-3 text-sm text-[#ff4d4f]">
            {error}
          </div>
        )}

        {/* Item Details */}
        <div className="mt-6 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-[#141820] text-3xl">
              {categoryInfo.emoji}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#f0f2f5]">{item.title}</h4>
              <p className="mt-1 text-sm text-[#7a8696]">{item.description}</p>
              {item.provider && (
                <p className="mt-2 text-xs text-[#7a8696]">Provider: {item.provider}</p>
              )}
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="mt-4 space-y-2 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#7a8696]">Current Balance:</span>
            <span className="font-semibold text-[#f0f2f5]">{balance.toLocaleString()} pts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#7a8696]">Points Cost:</span>
            <span className="font-semibold text-[#ff4d4f]">-{item.points_cost.toLocaleString()} pts</span>
          </div>
          <div className="border-t border-[#2a313d] pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-[#f0f2f5]">New Balance:</span>
              <span className="text-lg font-bold text-[#00d395]">
                {(balance - item.points_cost).toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {item.requires_delivery && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-[#f0f2f5]">
              Delivery Address *
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your complete delivery address"
              required
              rows={3}
              className="mt-2 block w-full rounded-md border border-[#2a313d] bg-[#0b0e13] p-3 text-[#f0f2f5] placeholder:text-[#7a8696] focus:border-[#00d395] focus:outline-none"
            />
          </div>
        )}

        {/* Status Info */}
        <div className="mt-4 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-sm">
          <p className="text-[#7a8696]">
            {item.points_cost <= 5000 ? (
              <>
                <span className="font-semibold text-[#00d395]">Instant Redemption:</span> This
                item will be processed immediately.
              </>
            ) : (
              <>
                <span className="font-semibold text-[#f2b84b]">Pending Approval:</span> This
                redemption requires admin approval (typically within 24-48 hours).
              </>
            )}
          </p>
          {item.estimated_delivery_days && (
            <p className="mt-1 text-[#7a8696]">
              Estimated delivery: {item.estimated_delivery_days} business days after approval
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleRedeem}
            disabled={loading || (item.requires_delivery && !deliveryAddress.trim())}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Icon name="clock" />
                Processing...
              </>
            ) : (
              <>
                <Icon name="check" />
                Confirm Redemption
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-11 items-center justify-center rounded-md border border-[#2a313d] px-4 text-sm font-semibold text-[#7a8696] hover:bg-[#1a202b] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
