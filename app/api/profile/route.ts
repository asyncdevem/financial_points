import { NextResponse } from "next/server";
import { getSessionFromCookie } from "../../lib/auth";
import { sql } from "../../lib/db";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../lib/database-helpers";
import { validatePakistaniPhone } from "../../lib/card-validation";

/**
 * GET /api/profile - Retrieve user profile
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
    
    const profile = await getUserProfile(session.user.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile - Create user profile
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { full_name, phone, address, date_of_birth, income_bracket } = data;
    
    // Validation
    if (!full_name || !phone || !address || !date_of_birth || !income_bracket) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    
    if (full_name.length < 2 || full_name.length > 255) {
      return NextResponse.json(
        { error: "Full name must be between 2 and 255 characters" },
        { status: 400 }
      );
    }
    
    if (!validatePakistaniPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid Pakistani phone number format" },
        { status: 400 }
      );
    }
    
    if (address.length < 10) {
      return NextResponse.json(
        { error: "Address must be at least 10 characters" },
        { status: 400 }
      );
    }
    
    // Validate date of birth (must be 18+ years old)
    const dob = new Date(date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      return NextResponse.json(
        { error: "You must be at least 18 years old" },
        { status: 400 }
      );
    }
    
    if (dob > today) {
      return NextResponse.json(
        { error: "Date of birth cannot be in the future" },
        { status: 400 }
      );
    }
    
    const validIncomeBrackets = [
      "Under 50k",
      "50k - 100k",
      "100k - 200k",
      "200k - 500k",
      "500k - 1M",
      "Above 1M",
      "Prefer not to say"
    ];
    
    if (!validIncomeBrackets.includes(income_bracket)) {
      return NextResponse.json(
        { error: "Invalid income bracket" },
        { status: 400 }
      );
    }
    
    // Check if profile already exists
    const existingProfile = await getUserProfile(session.user.id);
    
    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PATCH to update." },
        { status: 409 }
      );
    }
    
    // Create profile
    const profile = await createUserProfile(session.user.id, {
      full_name,
      phone,
      address,
      date_of_birth: dob,
      income_bracket,
    });
    
    return NextResponse.json(
      { success: true, profile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile - Update user profile
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
    
    // Validate provided fields
    if (data.full_name !== undefined) {
      if (data.full_name.length < 2 || data.full_name.length > 255) {
        return NextResponse.json(
          { error: "Full name must be between 2 and 255 characters" },
          { status: 400 }
        );
      }
    }
    
    if (data.phone !== undefined) {
      if (!validatePakistaniPhone(data.phone)) {
        return NextResponse.json(
          { error: "Invalid Pakistani phone number format" },
          { status: 400 }
        );
      }
    }
    
    if (data.address !== undefined) {
      if (data.address.length < 10) {
        return NextResponse.json(
          { error: "Address must be at least 10 characters" },
          { status: 400 }
        );
      }
    }
    
    if (data.date_of_birth !== undefined) {
      const dob = new Date(data.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age < 18) {
        return NextResponse.json(
          { error: "You must be at least 18 years old" },
          { status: 400 }
        );
      }
      
      if (dob > today) {
        return NextResponse.json(
          { error: "Date of birth cannot be in the future" },
          { status: 400 }
        );
      }
      
      data.date_of_birth = dob;
    }
    
    if (data.income_bracket !== undefined) {
      const validIncomeBrackets = [
        "Under 50k",
        "50k - 100k",
        "100k - 200k",
        "200k - 500k",
        "500k - 1M",
        "Above 1M",
        "Prefer not to say"
      ];
      
      if (!validIncomeBrackets.includes(data.income_bracket)) {
        return NextResponse.json(
          { error: "Invalid income bracket" },
          { status: 400 }
        );
      }
    }
    
    // Handle spending preferences update
    if (data.spending_preferences !== undefined) {
      // Update user_preferences table
      const { sql } = await import("../../lib/db");
      await sql`
        UPDATE user_preferences
        SET preferences = jsonb_set(
          COALESCE(preferences, '{}'::jsonb),
          '{spending_preferences}',
          ${JSON.stringify(data.spending_preferences)}::jsonb
        )
        WHERE user_id = ${session.user.id}
      `;
      
      // Don't try to update user_profiles with this field
      delete data.spending_preferences;
    }
    
    // Only update user_profiles if there are profile fields
    let profile = null;
    if (Object.keys(data).length > 0) {
      profile = await updateUserProfile(session.user.id, data);
    }
    
    return NextResponse.json({ 
      success: true, 
      profile: profile || await getUserProfile(session.user.id)
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
