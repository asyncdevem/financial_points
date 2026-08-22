"use client";

import { useState } from "react";
import { Icon } from "../icons";

interface PreferencesStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

interface CategoryPreference {
  category: string;
  icon: string;
  frequency: number;
}

export function PreferencesStep({ onComplete, onBack, initialData }: PreferencesStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories: Array<{ name: string; icon: string; description: string }> = [
    { name: "dining", icon: "🍽️", description: "Restaurants, cafes, food delivery" },
    { name: "groceries", icon: "🛒", description: "Supermarkets, food & household items" },
    { name: "fuel", icon: "⛽", description: "Petrol pumps, gas stations" },
    { name: "travel", icon: "✈️", description: "Flights, hotels, ride-hailing" },
    { name: "shopping", icon: "🛍️", description: "Clothing, electronics, online shopping" },
    { name: "bills", icon: "📄", description: "Utilities, mobile, internet" },
    { name: "entertainment", icon: "🎬", description: "Movies, streaming, games" },
  ];

  const [preferences, setPreferences] = useState<Record<string, number>>(() => {
    if (initialData?.preferences) {
      return initialData.preferences;
    }
    
    // Initialize all categories to medium (3)
    const initial: Record<string, number> = {};
    categories.forEach(cat => {
      initial[cat.name] = 3;
    });
    return initial;
  });

  const frequencyLabels = [
    { value: 1, label: "Rarely", color: "#4a5568" },
    { value: 2, label: "Sometimes", color: "#7a8696" },
    { value: 3, label: "Often", color: "#00d395" },
    { value: 4, label: "Very Often", color: "#00b37e" },
    { value: 5, label: "Always", color: "#009966" },
  ];

  const handleFrequencyChange = (category: string, frequency: number) => {
    setPreferences(prev => ({
      ...prev,
      [category]: frequency,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Save preferences to user_preferences
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spending_preferences: preferences,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save preferences");
      }

      onComplete({ preferences });
    } catch (err: any) {
      setError(err.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Icon name="chart" />
          <h2 className="text-xl font-bold text-[#f0f2f5]">Spending Preferences</h2>
        </div>
        <p className="mt-1 text-sm text-[#7a8696]">
          Tell us how often you spend in each category. This helps us recommend the best cards for your lifestyle.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-[#6f2528] bg-[#351719] p-3 text-sm text-[#ff4d4f]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold capitalize text-[#f0f2f5]">
                    {category.name}
                  </h3>
                  <p className="text-xs text-[#7a8696]">{category.description}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#00d395]">
                {frequencyLabels[preferences[category.name] - 1]?.label}
              </span>
            </div>

            {/* Frequency Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={preferences[category.name]}
                onChange={(e) =>
                  handleFrequencyChange(category.name, parseInt(e.target.value))
                }
                disabled={loading}
                className="w-full h-2 bg-[#1a202b] rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #00d395 0%, #00d395 ${((preferences[category.name] - 1) / 4) * 100}%, #1a202b ${((preferences[category.name] - 1) / 4) * 100}%, #1a202b 100%)`,
                }}
              />
              <div className="mt-2 flex justify-between text-xs text-[#7a8696]">
                {frequencyLabels.map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => handleFrequencyChange(category.name, freq.value)}
                    disabled={loading}
                    className={`transition-colors hover:text-[#00d395] disabled:opacity-50 ${
                      preferences[category.name] === freq.value
                        ? "text-[#00d395] font-semibold"
                        : ""
                    }`}
                  >
                    {freq.value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
        <div className="flex items-start gap-2">
          <Icon name="chart" size={16} />
          <div className="text-sm">
            <p className="font-semibold text-[#f0f2f5]">Why we ask this</p>
            <p className="mt-1 text-[#7a8696]">
              Different cards offer better rewards for specific spending categories. 
              By understanding your habits, we can recommend cards that maximize your rewards.
            </p>
          </div>
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
          type="submit"
          disabled={loading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Icon name="clock" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <Icon name="arrow-right" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
