"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../icons";

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/signup" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0e13] p-4 text-[#f0f2f5]">
      <section className="w-full max-w-[440px] rounded-lg border border-[#2a313d] bg-[#141820] p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-[#00d395] text-[#0b0e13]">
            <Icon name="shield" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
              FinPoints
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              {isRegister ? "Create account" : "Sign in"}
            </h1>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
              <Icon name="user" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#7a8696]">
              <Icon name="lock" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? "Min. 8 characters" : "Enter your password"}
              required
              minLength={isRegister ? 8 : undefined}
              disabled={loading}
              className="h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-md border border-[#6f2528] bg-[#351719] p-3 text-sm text-[#ff4d4f]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#00d395] text-sm font-semibold text-[#0b0e13] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Icon name="clock" />
                {isRegister ? "Creating account..." : "Signing in..."}
              </>
            ) : (
              <>
                <Icon name="check" />
                {isRegister ? "Create profile" : "Open dashboard"}
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#7a8696]">
          {isRegister ? "Already have an account?" : "New to FinPoints?"}{" "}
          <Link
            className="font-semibold text-[#00d395] hover:underline"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "Sign in" : "Register"}
          </Link>
        </p>
      </section>
    </main>
  );
}
