"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../components/icons";
import { ProfileStep } from "../components/onboarding/profile-step";
import { CardStep } from "../components/onboarding/card-step";
import { PreferencesStep } from "../components/onboarding/preferences-step";
import { CompletionStep } from "../components/onboarding/completion-step";

type OnboardingStep = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [cardData, setCardData] = useState<any>(null);
  const [preferencesData, setPreferencesData] = useState<any>(null);

  // Check onboarding status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const [statusRes, profileRes, cardsRes] = await Promise.all([
          fetch("/api/onboarding/status"),
          fetch("/api/profile"),
          fetch("/api/cards"),
        ]);
        
        if (statusRes.ok) {
          const data = await statusRes.json();
          
          // If already completed, redirect to dashboard
          if (data.onboarding_completed) {
            router.push("/dashboard");
            return;
          }
          
          // Determine current step based on what's completed
          let step = 1;
          if (data.profile_completed && !data.cards_completed) {
            step = 2;
          } else if (data.profile_completed && data.cards_completed && !data.preferences_completed) {
            step = 3;
          } else if (data.profile_completed && data.cards_completed && data.preferences_completed) {
            step = 4;
          }
          
          setCurrentStep(step as OnboardingStep);
        }
        
        // Load existing profile data if available
        if (profileRes.ok) {
          const result = await profileRes.json();
          if (result.profile) {
            setProfileData({
              full_name: result.profile.full_name,
              phone: result.profile.phone,
              address: result.profile.address,
              date_of_birth: new Date(result.profile.date_of_birth).toISOString().split('T')[0],
              income_bracket: result.profile.income_bracket,
            });
          }
        }
        
        // Load existing cards if available
        if (cardsRes.ok) {
          const result = await cardsRes.json();
          if (result.cards && result.cards.length > 0) {
            // Just flag that cards exist, card step will load them
            setCardData({ hasCards: true });
          }
        }
        
      } catch (error) {
        console.error("Failed to fetch onboarding status:", error);
      } finally {
        setLoading(false);
      }
    }
    
    checkStatus();
  }, [router]);

  const handleStepComplete = async (stepNumber: OnboardingStep, data: any) => {
    // Update progress on server
    const updates: any = {};
    
    if (stepNumber === 1) {
      updates.profile_completed = true;
      setProfileData(data);
    } else if (stepNumber === 2) {
      updates.cards_completed = true;
      setCardData(data);
    } else if (stepNumber === 3) {
      updates.preferences_completed = true;
      setPreferencesData(data);
    }
    
    try {
      await fetch("/api/onboarding/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
    
    // Move to next step
    if (stepNumber < 4) {
      setCurrentStep((stepNumber + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0e13]">
        <div className="text-center">
          <Icon name="clock" />
          <p className="mt-2 text-[#7a8696]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e13] py-8">
      <div className="mx-auto max-w-[800px] px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#f0f2f5]">Welcome to FinPoints</h1>
          <p className="mt-2 text-[#7a8696]">
            Let's set up your account in a few simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-1 items-center">
                <div
                  className={`flex size-10 items-center justify-center rounded-full font-semibold ${
                    step <= currentStep
                      ? "bg-[#00d395] text-[#0b0e13]"
                      : "bg-[#1a202b] text-[#7a8696]"
                  }`}
                >
                  {step < currentStep ? <Icon name="check" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`mx-2 h-1 flex-1 rounded ${
                      step < currentStep ? "bg-[#00d395]" : "bg-[#1a202b]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#7a8696]">
            <span>Profile</span>
            <span>Card</span>
            <span>Preferences</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-6">
          {currentStep === 1 && (
            <ProfileStep
              onComplete={(data) => handleStepComplete(1, data)}
              initialData={profileData}
            />
          )}
          {currentStep === 2 && (
            <CardStep
              onComplete={(data) => handleStepComplete(2, data)}
              onBack={handleBack}
              initialData={cardData}
            />
          )}
          {currentStep === 3 && (
            <PreferencesStep
              onComplete={(data) => handleStepComplete(3, data)}
              onBack={handleBack}
              initialData={preferencesData}
            />
          )}
          {currentStep === 4 && (
            <CompletionStep
              profileData={profileData}
              cardData={cardData}
              preferencesData={preferencesData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
