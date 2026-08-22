"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../icons";

interface CompletionStepProps {
  profileData: any;
  cardData: any;
  preferencesData: any;
}

export function CompletionStep({ profileData, cardData, preferencesData }: CompletionStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Mark onboarding as complete
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to complete onboarding");
      }
      
      // Redirect to tutorial
      router.push("/onboarding/tutorial");
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const getTopCategories = () => {
    if (!preferencesData?.preferences) return [];
    
    const prefs = preferencesData.preferences;
    const categories = Object.entries(prefs)
      .map(([name, freq]) => ({ name, freq: freq as number }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 3);
    
    return categories;
  };

  const topCategories = getTopCategories();

  return (
    <div className="space-y-5">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="grid size-20 place-items-center rounded-full bg-[#002d22] text-[#00d395]">
          <Icon name="check" size={40} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#f0f2f5]">
          {profileData?.full_name ? `Welcome, ${profileData.full_name.split(" ")[0]}!` : "All Set!"}
        </h2>
        <p className="mt-2 text-[#7a8696]">
          Your profile is complete. Let's take a quick tour to help you get started.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-[#6f2528] bg-[#351719] p-3 text-sm text-[#ff4d4f]">
          {error}
        </div>
      )}

      {/* Setup Summary */}
      <div className="space-y-3 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a8696]">
          Setup Summary
        </h3>
        
        {/* Profile */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Icon name="check" size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#f0f2f5]">Profile Created</p>
            <p className="text-sm text-[#7a8696]">
              {profileData?.full_name || "User"} • {profileData?.phone || "Phone number added"}
            </p>
          </div>
        </div>
        
        {/* Card */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Icon name={cardData ? "check" : "clock"} size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#f0f2f5]">Bank Card</p>
            <p className="text-sm text-[#7a8696]">
              {cardData 
                ? `Card ending in ${cardData.last_four || "****"} added`
                : "You can add cards anytime from the Cards page"}
            </p>
          </div>
        </div>
        
        {/* Preferences */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Icon name="check" size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#f0f2f5]">Spending Preferences</p>
            {topCategories.length > 0 ? (
              <p className="text-sm text-[#7a8696]">
                Top categories: {topCategories.map(c => c.name).join(", ")}
              </p>
            ) : (
              <p className="text-sm text-[#7a8696]">
                Preferences set for personalized recommendations
              </p>
            )}
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Icon name="layout" size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#f0f2f5]">What's Next?</p>
            <p className="mt-1 text-sm leading-relaxed text-[#7a8696]">
              We'll guide you through the main features of FinPoints:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[#7a8696]">
              <li className="flex items-center gap-2">
                <span className="text-[#00d395]">•</span>
                Dashboard overview and session management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00d395]">•</span>
                Tracking rewards across your cards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00d395]">•</span>
                Redeeming points for rewards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00d395]">•</span>
                Getting personalized card recommendations
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-center">
          <div className="text-2xl font-bold text-[#00d395]">15</div>
          <div className="mt-1 text-xs text-[#7a8696]">Supported Banks</div>
        </div>
        <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-center">
          <div className="text-2xl font-bold text-[#00d395]">50+</div>
          <div className="mt-1 text-xs text-[#7a8696]">Rewards Available</div>
        </div>
        <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-center">
          <div className="text-2xl font-bold text-[#00d395]">7</div>
          <div className="mt-1 text-xs text-[#7a8696]">Categories Tracked</div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleComplete}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Icon name="clock" />
            Please wait...
          </>
        ) : (
          <>
            Start Tutorial
            <Icon name="arrow-right" />
          </>
        )}
      </button>

      {/* Skip Tutorial Option */}
      <button
        onClick={() => router.push("/dashboard")}
        disabled={loading}
        className="flex h-10 w-full items-center justify-center gap-2 text-sm text-[#7a8696] hover:text-[#f0f2f5] disabled:opacity-50"
      >
        Skip tutorial and go to dashboard
      </button>
    </div>
  );
}
