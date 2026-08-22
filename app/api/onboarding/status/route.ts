import { NextResponse } from "next/server";
import { getSessionFromCookie } from "../../../lib/auth";
import { getOnboardingProgress } from "../../../lib/database-helpers";

/**
 * GET /api/onboarding/status - Get user's onboarding progress
 */
export async function GET() {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const progress = await getOnboardingProgress(session.user.id);
    
    if (!progress) {
      return NextResponse.json(
        { 
          onboarding_completed: false,
          profile_completed: false,
          cards_completed: false,
          preferences_completed: false,
          tutorial_completed: false,
          completed_at: null
        }
      );
    }
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
