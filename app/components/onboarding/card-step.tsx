"use client";

import { useState, useEffect } from "react";
import { Icon } from "../icons";
import {
  validateCardNumber,
  validateExpiry,
  validateCVV,
  formatCardNumber,
  detectCardType,
} from "../../lib/card-validation";

interface CardStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

interface Bank {
  id: number;
  name: string;
  slug: string;
  card_types: string[];
}

export function CardStep({ onComplete, onBack, initialData }: CardStepProps) {
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [error, setError] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  
  const [selectedBank, setSelectedBank] = useState(initialData?.bank_id || "");
  const [cardType, setCardType] = useState(initialData?.card_type || "Credit Card");
  const [cardNumber, setCardNumber] = useState(initialData?.card_number || "");
  const [expiryDate, setExpiryDate] = useState(initialData?.expiry_date || "");
  const [cvv, setCvv] = useState(initialData?.cvv || "");
  const [cardNickname, setCardNickname] = useState(initialData?.card_nickname || "");
  
  const [cardNumberError, setCardNumberError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");

  // Fetch banks on mount
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

  const handleCardNumberChange = (value: string) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, "");
    // Limit to 19 digits
    const limited = cleaned.slice(0, 19);
    // Format with spaces
    const formatted = formatCardNumber(limited);
    setCardNumber(formatted);
    
    // Validate on blur or when complete
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
    // Auto-format MM/YY
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
    
    // Final validation
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

      onComplete(result.card);
    } catch (err: any) {
      setError(err.message || "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete(null);
  };

  const detectedCardType = cardNumber.length >= 6 
    ? detectCardType(cardNumber.replace(/\s/g, "")) 
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Icon name="card" />
          <h2 className="text-xl font-bold text-[#f0f2f5]">Add Your Card</h2>
        </div>
        <p className="mt-1 text-sm text-[#7a8696]">
          Add your first bank card to start tracking rewards. Your card details are encrypted and secure.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-[#6f2528] bg-[#351719] p-3 text-sm text-[#ff4d4f]">
          {error}
        </div>
      )}

      <div className="space-y-4">
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
            {banks.map((bank) => (
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
              className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
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
              className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
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
          {detectedCardType && !cardNumberError && (
            <p className="mt-1 text-xs text-[#00d395]">
              Detected: {detectedCardType}
            </p>
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

        {/* Card Nickname (Optional) */}
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
      </div>

      {/* Security Notice */}
      <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-sm text-[#7a8696]">
        <div className="flex items-start gap-2">
          <Icon name="lock" size={16} />
          <p>
            Your card details are encrypted with AES-256 and stored securely. We never store your CVV in plain text.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[#2a313d] px-4 text-sm font-semibold text-[#f0f2f5] hover:bg-[#1a202b] disabled:opacity-50"
        >
          <Icon name="arrow-left" />
          Back
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[#2a313d] px-4 text-sm font-semibold text-[#7a8696] hover:bg-[#1a202b] disabled:opacity-50"
        >
          Skip for now
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
              Add Card
              <Icon name="arrow-right" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
