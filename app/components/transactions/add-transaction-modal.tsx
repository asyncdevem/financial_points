"use client";

import { useState, useEffect } from "react";
import { Icon } from "../icons";

interface Card {
  id: number;
  bank_name: string;
  last_four: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "dining", label: "Dining", icon: "🍽️" },
  { value: "groceries", label: "Groceries", icon: "🛒" },
  { value: "fuel", label: "Fuel", icon: "⛽" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "bills", label: "Bills", icon: "💡" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" }
];

export function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    card_id: "",
    merchant_name: "",
    category: "",
    amount: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: parseInt(formData.card_id),
          merchant_name: formData.merchant_name.trim(),
          category: formData.category,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Reset form
        setFormData({
          card_id: "",
          merchant_name: "",
          category: "",
          amount: ""
        });
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add transaction");
      }
    } catch (error) {
      setError("Failed to add transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTransactions = async () => {
    if (!confirm("This will add 30 mock transactions to your account. Continue?")) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seed",
          count: 30
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to seed transactions");
      }
    } catch (error) {
      setError("Failed to seed transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#2a313d] bg-[#141820] p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#f0f2f5]">Add Transaction</h3>
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

        {/* No Cards Warning */}
        {cards.length === 0 && (
          <div className="mt-4 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4 text-sm text-[#7a8696]">
            <p>You need to add at least one card before adding transactions.</p>
            <p className="mt-2">Go to the "My Cards" page to add your first card.</p>
          </div>
        )}

        {/* Form */}
        {cards.length > 0 && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Card Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Card
              </label>
              <select
                value={formData.card_id}
                onChange={(e) => setFormData({ ...formData, card_id: e.target.value })}
                required
                className="mt-2 block h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5] focus:border-[#00d395] focus:outline-none"
              >
                <option value="">Select a card</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.bank_name} •••• {card.last_four}
                  </option>
                ))}
              </select>
            </div>

            {/* Merchant Name */}
            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Merchant Name
              </label>
              <input
                type="text"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                placeholder="e.g., McDonald's, Imtiaz Super Market"
                required
                maxLength={100}
                className="mt-2 block h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5] placeholder:text-[#7a8696] focus:border-[#00d395] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Category
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-2 rounded-md border p-3 text-sm font-semibold transition-colors ${
                      formData.category === cat.value
                        ? "border-[#00d395] bg-[#002d22] text-[#00d395]"
                        : "border-[#2a313d] bg-[#0b0e13] text-[#7a8696] hover:border-[#00d395]"
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Amount (PKR)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                required
                min="1"
                max="1000000"
                step="1"
                className="mt-2 block h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5] placeholder:text-[#7a8696] focus:border-[#00d395] focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Icon name="clock" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Icon name="check" />
                    Add Transaction
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex h-11 items-center justify-center rounded-md border border-[#2a313d] px-4 text-sm font-semibold text-[#7a8696] hover:bg-[#1a202b] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Seed Option */}
        {cards.length > 0 && (
          <div className="mt-6 border-t border-[#2a313d] pt-6">
            <p className="text-sm font-semibold text-[#f0f2f5]">Quick Start</p>
            <p className="mt-1 text-xs text-[#7a8696]">
              Generate 30 mock transactions with realistic Pakistani merchants and amounts
            </p>
            <button
              onClick={handleSeedTransactions}
              disabled={loading}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#2a313d] text-sm font-semibold text-[#7a8696] hover:border-[#00d395] hover:text-[#00d395] disabled:opacity-50"
            >
              <Icon name="refresh" />
              Seed Mock Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
