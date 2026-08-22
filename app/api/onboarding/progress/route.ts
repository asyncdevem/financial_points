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
      "card_added",
      "preferences_set",
      "tutorial_completed",
      "current_step"
    ];
    
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === "current_step") {
          if (typeof data[field] !== "number" || data[field] < 1 || data[field] > 4) {
            return NextResponse.json(
              { error: "Invalid current_step value (must be 1-4)" },
              { status: 400 }
            );
          }
          updates[field] = data[field];
        } else {
          if (typeof data[field] !== "boolean") {
            return NextResponse.json(
              { error: `${field} must be a boolean` },
              { status: 400 }
            );
          }
          updates[field] = data[field];
        }
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
