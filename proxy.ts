import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy for onboarding redirect and authentication checks
 * 
 * Flow:
 * 1. Public routes (login, register) - always accessible
 * 2. Authenticated users - check onboarding status
 * 3. Incomplete onboarding - redirect to /onboarding (except onboarding routes)
 * 4. Complete onboarding - allow access to all protected routes
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Onboarding routes (accessible to authenticated users during onboarding)
  const onboardingRoutes = ["/onboarding", "/onboarding/tutorial"];
  const isOnboardingRoute = onboardingRoutes.some(route => pathname.startsWith(route));

  // Get session cookie
  const sessionCookie = request.cookies.get("fp_session");
  const isAuthenticated = !!sessionCookie?.value;

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated, check onboarding status for protected routes
  if (isAuthenticated && !isPublicRoute && !isOnboardingRoute) {
    try {
      // Check onboarding status via API
      const baseUrl = request.nextUrl.origin;
      const statusResponse = await fetch(`${baseUrl}/api/onboarding/status`, {
        headers: {
          Cookie: `fp_session=${sessionCookie.value}`
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        // If onboarding is not complete, redirect to onboarding
        if (!statusData.onboarding_completed) {
          const url = request.nextUrl.clone();
          url.pathname = "/onboarding";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // If status check fails, allow access (fail open for better UX)
      console.error("Onboarding status check failed:", error);
    }
  }

  // If authenticated and on onboarding route, check if already completed
  if (isAuthenticated && isOnboardingRoute) {
    try {
      const baseUrl = request.nextUrl.origin;
      const statusResponse = await fetch(`${baseUrl}/api/onboarding/status`, {
        headers: {
          Cookie: `fp_session=${sessionCookie.value}`
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        // If onboarding is already complete, redirect to dashboard
        if (statusData.onboarding_completed) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error("Onboarding status check failed:", error);
    }
  }

  return NextResponse.next();
}

/**
 * Configure which routes the proxy should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (*.svg, *.png, etc.)
     * - api routes (handled by route handlers)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
