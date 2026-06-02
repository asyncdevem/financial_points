"use client";

import { Icon } from "./icons";
import { useSessionState } from "./session-provider";
import { LabelInput } from "./ui";

export function SecureRefreshModal() {
  const { refreshOpen, closeRefresh, completeRefresh } = useSessionState();

  if (!refreshOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b0e13]/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="refresh-title"
    >
      <section className="w-full max-w-[520px] rounded-lg border border-[#2a313d] bg-[#141820] p-5 text-[#f0f2f5] shadow-xl">
        <div className="flex items-start gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-[#002d22] text-[#00d395]">
            <Icon name="shield" />
          </div>
          <div>
            <h2 id="refresh-title" className="text-xl font-bold">
              Secure Refresh
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#7a8696]">
              Enter the mock OTP to fetch live points and balances into volatile
              memory for this session only.
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <LabelInput label="Mock OTP" value="482193" icon="lock" />
          <div className="rounded-lg border border-[#2a313d] bg-[#0b0e13] p-3 text-sm text-[#7a8696]">
            HBL Rewards and Meezan Bank will be refreshed. UBL remains locked
            until its mock credential is refreshed.
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="h-10 rounded-md border border-[#2a313d] px-3 text-sm font-semibold text-[#f0f2f5]"
            onClick={closeRefresh}
          >
            Cancel
          </button>
          <button
            className="flex h-10 items-center gap-2 rounded-md bg-[#00d395] px-3 text-sm font-semibold text-[#0b0e13]"
            onClick={completeRefresh}
          >
            <Icon name="refresh" />
            Fetch live data
          </button>
        </div>
      </section>
    </div>
  );
}
