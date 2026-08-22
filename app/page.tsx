"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Client-side redirect to dashboard
    // Middleware will handle authentication and onboarding checks
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0e13] text-[#f0f2f5]">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-[#00d395] text-[#0b0e13]">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold">FinPoints</h1>
        <p className="mt-2 text-sm text-[#7a8696]">Loading...</p>
      </div>
    </div>
  );
}
