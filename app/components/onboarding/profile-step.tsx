"use client";

import { useState } from "react";
import { Icon } from "../icons";

interface ProfileStepProps {
  onComplete: (data: any) => void;
  initialData?: any;
}

export function ProfileStep({ onComplete, initialData }: ProfileStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth || "");
  const [incomeBracket, setIncomeBracket] = useState(initialData?.income_bracket || "");

  const incomeBrackets = [
    "Under 50k",
    "50k - 100k",
    "100k - 200k",
    "200k - 500k",
    "500k - 1M",
    "Above 1M",
    "Prefer not to say",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        date_of_birth: dateOfBirth,
        income_bracket: incomeBracket,
      };

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save profile");
      }

      onComplete(data);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Icon name="user" />
          <h2 className="text-xl font-bold text-[#f0f2f5]">Your Profile</h2>
        </div>
        <p className="mt-1 text-sm text-[#7a8696]">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-[#6f2528] bg-[#351719] p-3 text-sm text-[#ff4d4f]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-[#f0f2f5]">
            Full Name <span className="text-[#ff4d4f]">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            minLength={2}
            maxLength={255}
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-[#f0f2f5]">
            Phone Number <span className="text-[#ff4d4f]">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XX XXXXXXX"
            required
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-[#7a8696]">
            Pakistani mobile format (e.g., 0300 1234567)
          </p>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-[#f0f2f5]">
            Address <span className="text-[#ff4d4f]">*</span>
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your complete address"
            required
            minLength={10}
            rows={3}
            disabled={loading}
            className="mt-2 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 py-2 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-semibold text-[#f0f2f5]">
            Date of Birth <span className="text-[#ff4d4f]">*</span>
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString()
              .split("T")[0]}
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] placeholder:text-[#4a5568] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-[#7a8696]">You must be 18 or older</p>
        </div>

        {/* Income Bracket */}
        <div>
          <label className="block text-sm font-semibold text-[#f0f2f5]">
            Monthly Income Bracket <span className="text-[#ff4d4f]">*</span>
          </label>
          <select
            value={incomeBracket}
            onChange={(e) => setIncomeBracket(e.target.value)}
            required
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md border border-[#2a313d] bg-[#0b0e13] px-3 text-sm text-[#f0f2f5] focus:border-[#00d395] focus:outline-none disabled:opacity-50"
          >
            <option value="">Select income bracket</option>
            {incomeBrackets.map((bracket) => (
              <option key={bracket} value={bracket}>
                {bracket === "Prefer not to say" ? bracket : `PKR ${bracket}`}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[#7a8696]">
            Helps us provide better card recommendations
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#00d395] px-4 text-sm font-semibold text-[#0b0e13] hover:bg-[#00b37e] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Icon name="clock" />
            Saving...
          </>
        ) : (
          <>
            Continue
            <Icon name="arrow-right" />
          </>
        )}
      </button>
    </form>
  );
}
