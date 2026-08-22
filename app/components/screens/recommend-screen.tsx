"use client";

import { useState, useEffect } from "react";
import { Icon } from "../icons";
import { PageHeader, Panel } from "../ui";
import { calculateBestCard, formatPoints, formatCurrency } from "../../lib/points-engine";

interface Card {
  id: number;
  bank_name: string;
  last_four: string;
  base_reward_rate: number;
  category_multipliers: Record<string, number>;
}

const CATEGORIES = [
  { value: "dining", label: "Dining" },
  { value: "groceries", label: "Groceries" },
  { value: "fuel", label: "Fuel" },
  { value: "travel", label: "Travel" },
  { value: "shopping", label: "Shopping" },
  { value: "bills", label: "Bills" },
  { value: "entertainment", label: "Entertainment" }
];

export function RecommendScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [amount, setAmount] = useState("5000");
  const [category, setCategory] = useState("dining");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
        if (data.cards && data.cards.length > 0) {
          setSelectedCard(data.cards[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    }
  };

  const calculateRecommendations = () => {
    if (!amount || cards.length === 0) return;

    setLoading(true);
    const amountNum = parseFloat(amount);

    // Use centralized calculation engine
    const rankedCards = calculateBestCard(amountNum, category, cards);

    // Map to component format
    const recommendations = rankedCards.map(card => ({
      card,
      pointsEarned: card.calculated_points,
      estimatedValue: card.calculated_value_pkr,
      multiplier: card.calculated_multiplier
    }));

    setRecommendations(recommendations);
    setLoading(false);
  };

  const bestCard = recommendations.length > 0 ? recommendations[0] : null;
  const currentCard = selectedCard ? recommendations.find(r => r.card.id === selectedCard) : null;
  const missedValue = bestCard && currentCard && bestCard.card.id !== currentCard.card.id
    ? bestCard.pointsEarned - currentCard.pointsEarned
    : 0;

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <PageHeader
        icon="shield"
        title="Purchase Recommendation"
        description="Compare cards before making a purchase to maximize your rewards and track opportunity cost"
      />

      <div className="grid gap-5 xl:grid-cols-[0.6fr_1.4fr]">
        {/* Input Panel */}
        <Panel title="Purchase Details" icon="card">
          <form onSubmit={(e) => { e.preventDefault(); calculateRecommendations(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Amount (PKR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                min="1"
                required
                className="mt-2 block h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5] placeholder:text-[#7a8696] focus:border-[#00d395] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 block h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5] focus:border-[#00d395] focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#f0f2f5]">
                Current Card (Optional)
              </label>
              <select
                value={selectedCard || ""}
                onChange={(e) => setSelectedCard(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-2 block h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-[#f0f2f5] focus:border-[#00d395] focus:outline-none"
              >
                <option value="">None selected</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.bank_name} •••• {card.last_four}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || cards.length === 0}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#00d395] text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
            >
              <Icon name="chart" />
              {loading ? "Calculating..." : "Calculate Recommendation"}
            </button>
          </form>

          {cards.length === 0 && (
            <div className="mt-4 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-sm text-[#7a8696]">
              Add cards to get personalized recommendations
            </div>
          )}
        </Panel>

        {/* Results Panel */}
        <div className="space-y-5">
          {/* Best Recommendation */}
          {bestCard && (
            <Panel title="Recommended Card" icon="check">
              <div className="rounded-lg border border-[#00d395] bg-[#002d22] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#f0f2f5]">
                      {bestCard.card.bank_name}
                    </h3>
                    <p className="mt-1 text-sm text-[#7a8696]">
                      •••• {bestCard.card.last_four}
                    </p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-[#00d395] text-[#0b0e13]">
                    <Icon name="check" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-[#7a8696]">Points Earned</p>
                    <p className="mt-1 text-lg font-bold text-[#00d395]">
                      {bestCard.pointsEarned.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#7a8696]">Est. Value</p>
                    <p className="mt-1 text-lg font-bold text-[#f0f2f5]">
                      PKR {bestCard.estimatedValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#7a8696]">Multiplier</p>
                    <p className="mt-1 text-lg font-bold text-[#f0f2f5]">
                      {bestCard.multiplier}x
                    </p>
                  </div>
                </div>

                {missedValue > 0 && (
                  <div className="mt-4 rounded-md border border-[#6f2528] bg-[#351719] p-3">
                    <p className="text-sm font-semibold text-[#ff4d4f]">
                      ⚠️ Opportunity Cost: {missedValue} points
                    </p>
                    <p className="mt-1 text-xs text-[#7a8696]">
                      You would miss out on {missedValue} points (≈ PKR {missedValue}) by using {currentCard?.card.bank_name}
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Card Rankings */}
          {recommendations.length > 0 && (
            <Panel title="All Cards Ranked" icon="chart">
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={rec.card.id}
                    className={`rounded-lg border p-3 ${
                      index === 0
                        ? "border-[#00d395] bg-[#002d22]"
                        : "border-[#2a313d] bg-[#0b0e13]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? "bg-[#00d395] text-[#0b0e13]"
                            : "bg-[#2a313d] text-[#7a8696]"
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[#f0f2f5]">
                            {rec.card.bank_name}
                          </p>
                          <p className="text-xs text-[#7a8696]">
                            •••• {rec.card.last_four} • {rec.multiplier}x multiplier
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#00d395]">
                          {rec.pointsEarned.toLocaleString()} pts
                        </p>
                        <p className="text-xs text-[#7a8696]">
                          ≈ PKR {rec.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

