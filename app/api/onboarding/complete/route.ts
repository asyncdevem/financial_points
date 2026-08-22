import { NextResponse } from "next/server";
import { getSessionFromCookie } from "../../../lib/auth";
import { updateOnboardingProgress, getOnboardingProgress } from "../../../lib/database-helpers";

/**
 * POST /api/onboarding/complete - Mark onboarding as complete
 */
export async function POST() {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get current progress
    const progress = await getOnboardingProgress(session.user.id);
    
    if (!progress) {
      return NextResponse.json(
        { error: "Onboarding progress not found" },
        { status: 404 }
      );
    }
    
    // Verify all steps completed
    if (!progress.profile_completed || !progress.preferences_completed) {
      return NextResponse.json(
        { error: "Please complete all onboarding steps first" },
        { status: 400 }
      );
    }
    
    // Mark as complete
    const updated = await updateOnboardingProgress(session.user.id, {
      onboarding_completed: true,
      completed_at: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      progress: updated
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
