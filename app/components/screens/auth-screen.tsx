"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "../icons";
import { LabelInput } from "../ui";

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";

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

        <form className="mt-6 space-y-4">
          <LabelInput label="Email" value="user@example.com" icon="user" />
          <LabelInput label="Password" value="************" icon="lock" />
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#00d395] text-sm font-semibold text-[#0b0e13]"
            onClick={() => router.push("/dashboard")}
          >
            <Icon name="check" />
            {isRegister ? "Create profile" : "Open dashboard"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#7a8696]">
          {isRegister ? "Already have an account?" : "New to FinPoints?"}{" "}
          <Link
            className="font-semibold text-[#00d395]"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "Sign in" : "Register"}
          </Link>
        </p>
      </section>
    </main>
  );
}
