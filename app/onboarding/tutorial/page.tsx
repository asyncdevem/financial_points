"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../../components/icons";

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to FinPoints!",
    description: "Let's take a quick tour of the platform. You can skip this anytime and access it later from Settings.",
    icon: "👋",
  },
  {
    title: "Dashboard Overview",
    description: "Your dashboard shows your total points, reward value, and connected cards. All financial data is kept in volatile memory for security.",
    icon: "📊",
    highlight: "dashboard",
  },
  {
    title: "Session Management",
    description: "FinPoints uses a 15-minute session timeout. Use 'Secure Refresh' to load live data into memory. Your data is wiped on logout or timeout.",
    icon: "🔒",
    highlight: "session",
  },
  {
    title: "Cards & Banking",
    description: "Manage your bank cards, add new ones, and track rewards from each card. We support 15 major Pakistani banks.",
    icon: "💳",
    highlight: "cards",
  },
  {
    title: "Points Redemption",
    description: "Redeem your accumulated points for vouchers, bill payments, cash transfers, products, or charity donations.",
    icon: "🎁",
    highlight: "redemption",
  },
  {
    title: "Smart Recommendations",
    description: "Get personalized card recommendations based on your spending patterns. See which card gives you the best rewards for each purchase.",
    icon: "💡",
    highlight: "recommendations",
  },
  {
    title: "Track Deals & Offers",
    description: "Browse current bank offers and deals. Filter by category, bank, or location to find the best discounts.",
    icon: "🏷️",
    highlight: "deals",
  },
  {
    title: "You're All Set!",
    description: "That's everything you need to know to get started. Explore the platform and maximize your rewards!",
    icon: "✨",
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  useEffect(() => {
    // Mark tutorial as completed when user finishes
    if (isLastStep && !isCompleting) {
      markTutorialComplete();
    }
  }, [isLastStep, isCompleting]);

  const markTutorialComplete = async () => {
    try {
      await fetch("/api/onboarding/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorial_completed: true }),
      });
    } catch (error) {
      console.error("Failed to mark tutorial complete:", error);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, tutorialSteps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = async () => {
    await markTutorialComplete();
    router.push("/dashboard");
  };

  const handleFinish = async () => {
    setIsCompleting(true);
    await markTutorialComplete();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0e13] px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#1a202b]">
            <div
              className="h-full bg-[#00d395] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-[#7a8696]">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Tutorial Card */}
        <div className="rounded-lg border border-[#2a313d] bg-[#141820] p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="grid size-20 place-items-center rounded-full bg-[#1a202b] text-5xl">
              {currentStepData.icon}
            </div>
          </div>

          {/* Content */}
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-[#f0f2f5]">
              {currentStepData.title}
            </h2>
            <p className="mt-3 text-[#7a8696] leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Feature Highlights */}
          {currentStepData.highlight && (
            <div className="mt-6 rounded-lg border border-[#2a313d] bg-[#0b0e13] p-4">
              <div className="flex items-start gap-3">
                <Icon name="layout" size={18} />
                <div className="text-sm text-[#7a8696]">
                  {currentStepData.highlight === "dashboard" && (
                    <div>
                      <p className="font-semibold text-[#f0f2f5]">Key Features:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• View total points across all cards</li>
                        <li>• Check reward value in PKR</li>
                        <li>• Monitor session status</li>
                        <li>• Quick access to all features</li>
                      </ul>
                    </div>
                  )}
                  {currentStepData.highlight === "session" && (
                    <div>
                      <p className="font-semibold text-[#f0f2f5]">Security First:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Live data stored in RAM only</li>
                        <li>• Auto-wipe after 15 minutes</li>
                        <li>• Manual logout clears instantly</li>
                        <li>• No permanent storage of balances</li>
                      </ul>
                    </div>
                  )}
                  {currentStepData.highlight === "cards" && (
                    <div>
                      <p className="font-semibold text-[#f0f2f5]">Card Management:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Add unlimited cards per bank</li>
                        <li>• View reward rates & multipliers</li>
                        <li>• Track points earned per card</li>
                        <li>• AES-256 encrypted storage</li>
                      </ul>
                    </div>
                  )}
                  {currentStepData.highlight === "redemption" && (
                    <div>
                      <p className="font-semibold text-[#f0f2f5]">Redeem Options:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Gift vouchers (Daraz, Foodpanda, Amazon)</li>
                        <li>• Bill payments (K-Electric, PTCL, Jazz)</li>
                        <li>• Bank transfers (instant or approved)</li>
                        <li>• Charity donations (Edhi, SKMCH, TCF)</li>
                      </ul>
                    </div>
                  )}
                  {currentStepData.highlight === "recommendations" && (
                    <div>
                      <p className="font-semibold text-[#f0f2f5]">Smart Features:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Compare cards for each purchase</li>
                        <li>• See category-wise multipliers</li>
                        <li>• Calculate opportunity cost</li>
                        <li>• Maximize your rewards</li>
                      </ul>
                    </div>
                  )}
                  {currentStepData.highlight === "deals" && (
                    <div>
                      <p className="font-semibold text-[#f0f2f5]">Browse Deals:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Filter by bank & category</li>
                        <li>• City-wise offers</li>
                        <li>• Expiry date tracking</li>
                        <li>• Search by merchant</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                disabled={isCompleting}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[#2a313d] px-4 text-sm font-semibold text-[#f0f2f5] hover:bg-[#1a202b] disabled:opacity-50"
              >
                <Icon name="arrow-left" />
                Previous
              </button>
            )}
            
            {!isLastStep && (
              <button
                onClick={handleSkip}
                disabled={isCompleting}
                className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#2a313d] px-6 text-sm font-semibold text-[#7a8696] hover:bg-[#1a202b] disabled:opacity-50"
              >
                Skip Tutorial
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={isCompleting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
            >
              {isCompleting ? (
                <>
                  <Icon name="clock" />
                  Loading...
                </>
              ) : isLastStep ? (
                <>
                  Go to Dashboard
                  <Icon name="check" />
                </>
              ) : (
                <>
                  Next
                  <Icon name="arrow-right" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mt-6 flex justify-center gap-2">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              disabled={isCompleting}
              className={`size-2 rounded-full transition-all disabled:opacity-50 ${
                index === currentStep
                  ? "w-8 bg-[#00d395]"
                  : index < currentStep
                    ? "bg-[#00d395] opacity-50"
                    : "bg-[#1a202b]"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
