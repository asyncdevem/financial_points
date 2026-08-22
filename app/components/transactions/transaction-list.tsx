"use client";

import { useState, useEffect } from "react";
import { Icon } from "../icons";

interface Transaction {
  id: number;
  card_id: number;
  merchant_name: string;
  category: string;
  amount: number;
  points_earned: number;
  transaction_date: string;
  is_user_added: boolean;
  bank_name?: string;
  last_four?: string;
}

interface TransactionListProps {
  limit?: number;
  showAddButton?: boolean;
  onAddTransaction?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  dining: "🍽️",
  groceries: "🛒",
  fuel: "⛽",
  travel: "✈️",
  shopping: "🛍️",
  bills: "💡",
  entertainment: "🎬"
};

export function TransactionList({ 
  limit = 10, 
  showAddButton = false,
  onAddTransaction 
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ count: 0, total_amount: 0, total_points: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setSummary(data.summary || { count: 0, total_amount: 0, total_points: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-PK", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-[#7a8696]">
        <Icon name="clock" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-8 text-center">
        <Icon name="download" size={48} />
        <h3 className="mt-4 text-lg font-semibold text-[#f0f2f5]">No Transactions Yet</h3>
        <p className="mt-2 text-sm text-[#7a8696]">
          Add your first transaction or seed mock data to get started
        </p>
        {showAddButton && onAddTransaction && (
          <button
            onClick={onAddTransaction}
            className="mt-6 flex h-10 items-center justify-center gap-2 rounded-md bg-[#00d395] px-6 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] mx-auto"
          >
            <Icon name="card" size={16} />
            Add Transaction
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      {summary.count > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
              Transactions
            </p>
            <p className="mt-1 text-2xl font-bold text-[#f0f2f5]">
              {summary.count}
            </p>
          </div>
          <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
              Total Spent
            </p>
            <p className="mt-1 text-2xl font-bold text-[#f0f2f5]">
              {formatAmount(summary.total_amount)}
            </p>
          </div>
          <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
              Points Earned
            </p>
            <p className="mt-1 text-2xl font-bold text-[#00d395]">
              {summary.total_points.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-lg border border-[#2a313d] bg-[#141820] p-4 hover:border-[#00d395] transition-colors"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Category Icon */}
              <div className="flex-shrink-0 text-2xl">
                {CATEGORY_ICONS[tx.category] || "💳"}
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-[#f0f2f5] truncate">
                    {tx.merchant_name}
                  </h4>
                  {tx.is_user_added && (
                    <span className="flex-shrink-0 rounded bg-[#002d22] px-2 py-0.5 text-xs font-semibold text-[#00d395]">
                      Manual
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#7a8696]">
                  <span className="capitalize">{tx.category}</span>
                  {tx.last_four && (
                    <>
                      <span>•</span>
                      <span>•••• {tx.last_four}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDate(tx.transaction_date)}</span>
                </div>
              </div>
            </div>

            {/* Amount and Points */}
            <div className="flex-shrink-0 text-right ml-4">
              <p className="font-semibold text-[#f0f2f5]">
                {formatAmount(tx.amount)}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#00d395]">
                +{tx.points_earned} pts
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Transaction Button */}
      {showAddButton && onAddTransaction && (
        <button
          onClick={onAddTransaction}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#2a313d] text-sm font-semibold text-[#7a8696] hover:border-[#00d395] hover:text-[#00d395] transition-colors"
        >
          <Icon name="card" size={16} />
          Add Transaction
        </button>
      )}
    </div>
  );
}
