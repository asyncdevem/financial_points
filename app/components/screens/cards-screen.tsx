"use client";

import { useState, useEffect } from "react";
import { Icon } from "../icons";
import { useSessionState } from "../session-provider";
import { PageHeader, SmallState } from "../ui";

interface Card {
  id: number;
  bank_name: string;
  bank_slug: string;
  card_type: string;
  last_four: string;
  expiry_date: string;
  card_nickname: string | null;
  base_reward_rate: number;
  category_multipliers: Record<string, number>;
  is_active: boolean;
  created_at: string;
}

export function CardsScreen() {
  const { sessionState, openRefresh, wipeSession } = useSessionState();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Are you sure you want to remove this card? This action cannot be undone.")) {
      return;
    }

    setDeletingCardId(cardId);
    
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the cards list
        await fetchCards();
      } else {
        alert("Failed to delete card. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete card:", error);
      alert("Failed to delete card. Please try again.");
    } finally {
      setDeletingCardId(null);
    }
  };

  const getTopCategories = (multipliers: Record<string, number>) => {
    return Object.entries(multipliers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, mult]) => ({ category, multiplier: mult }));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-5">
        <PageHeader
          icon="card"
          title="My Cards"
          description="Manage your bank cards and track rewards"
        />
        <div className="flex items-center justify-center py-12 text-[#7a8696]">
          <Icon name="clock" />
          <span className="ml-2">Loading cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <PageHeader
        icon="card"
        title="My Cards"
        description="Manage your bank cards and track rewards. Card data is encrypted and secure."
      />

      {/* Add Card Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddCard(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e]"
        >
          <Icon name="card" size={16} />
          Add New Card
        </button>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-12 text-center">
          <Icon name="card" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-[#f0f2f5]">No Cards Yet</h3>
          <p className="mt-2 text-sm text-[#7a8696]">
            Add your first bank card to start tracking rewards and points
          </p>
          <button
            onClick={() => setShowAddCard(true)}
            className="mt-6 flex h-10 items-center justify-center gap-2 rounded-md bg-[#00d395] px-6 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] mx-auto"
          >
            <Icon name="card" size={16} />
            Add Your First Card
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => {
            const topCategories = getTopCategories(card.category_multipliers);
            const isLocked = sessionState === "wiped" || sessionState === "locked";

            return (
              <section
                key={card.id}
                className="rounded-lg border border-[#2a313d] bg-[#141820] p-4 hover:border-[#00d395] transition-colors"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="grid size-10 place-items-center rounded-md bg-[#1a202b] text-[#00d395]">
                      <Icon name="card" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#f0f2f5] truncate">
                        {card.bank_name}
                      </h3>
                      <p className="text-sm text-[#7a8696]">{card.card_type}</p>
                    </div>
                  </div>
                  <SmallState
                    label={
                      sessionState === "wiped"
                        ? "Wiped"
                        : sessionState === "locked"
                          ? "Locked"
                          : "Live"
                    }
                  />
                </div>

                {/* Card Number */}
                <div className="mt-4 rounded-md bg-[#0b0e13] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                    Card Number
                  </p>
                  <p className="mt-1 font-mono text-lg text-[#f0f2f5]">
                    •••• •••• •••• {card.last_four}
                  </p>
                  {card.card_nickname && (
                    <p className="mt-1 text-xs text-[#7a8696]">
                      {card.card_nickname}
                    </p>
                  )}
                </div>

                {/* Card Details */}
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                      Expires
                    </dt>
                    <dd className="mt-1 text-[#f0f2f5]">{card.expiry_date}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                      Base Rate
                    </dt>
                    <dd className="mt-1 text-[#f0f2f5]">{card.base_reward_rate}x</dd>
                  </div>
                </dl>

                {/* Top Categories */}
                {topCategories.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8696]">
                      Best Categories
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {topCategories.map(({ category, multiplier }) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1 rounded-md bg-[#002d22] px-2 py-1 text-xs font-semibold capitalize text-[#00d395]"
                        >
                          {category} {multiplier}x
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-[#00d395] px-3 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e]"
                    onClick={openRefresh}
                  >
                    <Icon name="refresh" size={14} />
                    Refresh
                  </button>
                  <button
                    aria-label={`Remove ${card.bank_name} card`}
                    disabled={deletingCardId === card.id}
                    className="grid size-9 place-items-center rounded-md border border-[#6f2528] text-[#ff4d4f] hover:bg-[#351719] disabled:opacity-50"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    {deletingCardId === card.id ? (
                      <Icon name="clock" size={16} />
                    ) : (
                      <Icon name="trash" size={16} />
                    )}
                  </button>
                </div>

                {/* Added Date */}
                <p className="mt-3 text-center text-xs text-[#7a8696]">
                  Added {new Date(card.created_at).toLocaleDateString()}
                </p>
              </section>
            );
          })}
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <AddCardModal
          onClose={() => setShowAddCard(false)}
          onSuccess={() => {
            setShowAddCard(false);
            fetchCards(); // Refresh the cards list
          }}
        />
      )}
    </div>
  );
}

interface AddCardModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddCardModal({ onClose, onSuccess }: AddCardModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [error, setError] = useState("");
  const [banks, setBanks] = useState<any[]>([]);
  
  const [selectedBank, setSelectedBank] = useState("");
  const [cardType, setCardType] = useState("Credit Card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardNickname, setCardNickname] = useState("");
  
  const [cardNumberError, setCardNumberError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");

  useEffect(() => {
    async function fetchBanks() {
      try {
        const response = await fetch("/api/banks");
        if (response.ok) {
          const data = await response.json();
          setBanks(data.banks || []);
        }
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      } finally {
        setLoadingBanks(false);
      }
    }
    
    fetchBanks();
  }, []);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join(" ");
  };

  const validateCardNumber = (number: string) => {
    // Luhn algorithm
    if (!/^\d{13,19}$/.test(number)) return false;
    let sum = 0;
    let isEven = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (expiry: string) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [month, year] = expiry.split("/").map(Number);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    return true;
  };

  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 19);
    const formatted = formatCardNumber(limited);
    setCardNumber(formatted);
    
    if (limited.length >= 13) {
      if (!validateCardNumber(limited)) {
        setCardNumberError("Invalid card number");
      } else {
        setCardNumberError("");
      }
    } else {
      setCardNumberError("");
    }
  };

  const handleExpiryChange = (value: string) => {
    let cleaned = value.replace(/\D/g, "");
    
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    
    setExpiryDate(cleaned.slice(0, 5));
    
    if (cleaned.length === 5) {
      if (!validateExpiry(cleaned)) {
        setExpiryError("Invalid or expired date");
      } else {
        setExpiryError("");
      }
    } else {
      setExpiryError("");
    }
  };

  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setCvv(cleaned);
    
    if (cleaned.length >= 3) {
      if (!validateCVV(cleaned)) {
        setCvvError("Invalid CVV");
      } else {
        setCvvError("");
      }
    } else {
      setCvvError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const cleanedNumber = cardNumber.replace(/\s/g, "");
    
    if (!validateCardNumber(cleanedNumber)) {
      setCardNumberError("Invalid card number");
      return;
    }
    
    if (!validateExpiry(expiryDate)) {
      setExpiryError("Invalid or expired date");
      return;
    }
    
    if (!validateCVV(cvv)) {
      setCvvError("CVV must be 3 or 4 digits");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_id: parseInt(selectedBank),
          card_type: cardType,
          card_number: cleanedNumber,
          expiry_date: expiryDate,
          cvv,
          card_nickname: cardNickname || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add card");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-[#2a313d] bg-[#141820] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon name="card" />
            <h3 className="text-xl font-bold text-[#f0f2f5]">Add New Card</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#7a8696] hover:text-[#f0f2f5] disabled:opacity-50"
          >
            <Icon name="eraser" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-[#6f2528] bg-[#351719] p-3 text-sm text-[#ff4d4f]">
              {error}
            </div>
          )}

          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#f0f2f5]">
              Select Bank <span className="text-[#ff4d4f]">*</span>
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              required
              disabled={loading || loadingBanks}
              className="mt-2 h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
            >
              <option value="">
                {loadingBanks ? "Loading banks..." : "Choose your bank"}
              </option>
              {banks.map((bank: any) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Card Type */}
          <div>
            <label className="block text-sm font-semibold text-[#f0f2f5]">
              Card Type <span className="text-[#ff4d4f]">*</span>
            </label>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setCardType("Credit Card")}
                disabled={loading}
                className={`flex h-11 flex-1 items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors ${
                  cardType === "Credit Card"
                    ? "border-[#00d395] bg-[#002d22] text-[#00d395]"
                    : "border-[#2a313d] text-[#7a8696] hover:bg-[#1a202b]"
                } disabled:opacity-50`}
              >
                Credit Card
              </button>
              <button
                type="button"
                onClick={() => setCardType("Debit Card")}
                disabled={loading}
                className={`flex h-11 flex-1 items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors ${
                  cardType === "Debit Card"
                    ? "border-[#00d395] bg-[#002d22] text-[#00d395]"
                    : "border-[#2a313d] text-[#7a8696] hover:bg-[#1a202b]"
                } disabled:opacity-50`}
              >
                Debit Card
              </button>
            </div>
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-sm font-semibold text-[#f0f2f5]">
              Card Number <span className="text-[#ff4d4f]">*</span>
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="1234 5678 9012 3456"
              required
              disabled={loading}
              className={`mt-2 h-11 w-full rounded-md border bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:outline-none disabled:opacity-50 ${
                cardNumberError
                  ? "border-[#ff4d4f] focus:border-[#ff4d4f]"
                  : "border-[#2a313d] focus:border-[#00d395]"
              }`}
            />
            {cardNumberError && (
              <p className="mt-1 text-xs text-[#ff4d4f]">{cardNumberError}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Expiry Date <span className="text-[#ff4d4f]">*</span>
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                required
                disabled={loading}
                className={`mt-2 h-11 w-full rounded-md border bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:outline-none disabled:opacity-50 ${
                  expiryError
                    ? "border-[#ff4d4f] focus:border-[#ff4d4f]"
                    : "border-[#2a313d] focus:border-[#00d395]"
                }`}
              />
              {expiryError && (
                <p className="mt-1 text-xs text-[#ff4d4f]">{expiryError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                CVV <span className="text-[#ff4d4f]">*</span>
              </label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                placeholder="123"
                required
                disabled={loading}
                maxLength={4}
                className={`mt-2 h-11 w-full rounded-md border bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:outline-none disabled:opacity-50 ${
                  cvvError
                    ? "border-[#ff4d4f] focus:border-[#ff4d4f]"
                    : "border-[#2a313d] focus:border-[#00d395]"
                }`}
              />
              {cvvError && (
                <p className="mt-1 text-xs text-[#ff4d4f]">{cvvError}</p>
              )}
            </div>
          </div>

          {/* Card Nickname */}
          <div>
            <label className="block text-sm font-semibold text-[#f0f2f5]">
              Card Nickname <span className="text-[#7a8696]">(Optional)</span>
            </label>
            <input
              type="text"
              value={cardNickname}
              onChange={(e) => setCardNickname(e.target.value)}
              placeholder="e.g., My Rewards Card"
              disabled={loading}
              maxLength={100}
              className="mt-2 h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Security Notice */}
          <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-sm text-[#7a8696]">
            <div className="flex items-start gap-2">
              <Icon name="lock" size={16} />
              <p>
                Your card details are encrypted with AES-256. We never store your CVV in plain text.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-11 flex-1 items-center justify-center rounded-md border border-[#2a313d] text-sm font-semibold text-[#f0f2f5] hover:bg-[#1a202b] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingBanks || !selectedBank}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon name="clock" />
                  Adding Card...
                </>
              ) : (
                <>
                  <Icon name="check" />
                  Add Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
