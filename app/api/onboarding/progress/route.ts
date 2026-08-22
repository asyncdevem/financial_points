import { NextResponse } from "next/server";
import { getSessionFromCookie } from "../../../lib/auth";
import { updateOnboardingProgress } from "../../../lib/database-helpers";

/**
 * PATCH /api/onboarding/progress - Update onboarding progress
 */
export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Validate data
    const allowedFields = [
      "profile_completed",
      "cards_completed",
      "preferences_completed",
      "tutorial_completed"
    ];
    
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (typeof data[field] !== "boolean") {
          return NextResponse.json(
            { error: `${field} must be a boolean` },
            { status: 400 }
          );
        }
        updates[field] = data[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }
    
    // Update progress
    const progress = await updateOnboardingProgress(session.user.id, updates);
    
    return NextResponse.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error("Update onboarding progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
