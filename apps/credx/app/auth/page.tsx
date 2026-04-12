"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

type Tab = "signin" | "signup";

function getPasswordStrength(password: string): { label: string; score: number; color: string } {
  if (!password) return { label: "", score: 0, color: "bg-gray-200" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { label: "Weak", score: 1, color: "bg-red-400" };
  if (score <= 3) return { label: "Medium", score: 2, color: "bg-amber-400" };
  return { label: "Strong", score: 3, color: "bg-green-500" };
}

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const strength = getPasswordStrength(password);
  const signUpValid =
    tab !== "signup" ||
    (mobileNumber && password && confirmPassword && password === confirmPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "signup" && !signUpValid) return;
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center min-h-screen bg-auth-fintech">
      {/* Auth window: 60% of viewport */}
      <div className="w-[90%] sm:w-[60vw] max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md border border-[#E6E4F5]/80 flex flex-col">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#1C1C78] via-[#2E2E8F] to-[#4A4ABF] bg-clip-text text-transparent tracking-tight">
            Unloqs
          </h1>
          <p className="text-sm font-medium text-[#0F0F5C] mt-1 tracking-tight">
            Money Matters
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EEEDF8] px-6">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "signin"
                ? "text-[#0F0F5C] border-b-2 border-[#4A4ABF]"
                : "text-gray-500 hover:text-[#0F0F5C]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "signup"
                ? "text-[#0F0F5C] border-b-2 border-[#4A4ABF]"
                : "text-gray-500 hover:text-[#0F0F5C]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mobile number */}
          <div>
            <label htmlFor="auth-mobile" className="sr-only">
              Mobile number
            </label>
            <input
              id="auth-mobile"
              type="tel"
              inputMode="numeric"
              placeholder="Mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-[#EEEDF8] bg-white text-[#0F0F5C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/30 focus:border-[#4A4ABF]"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="sr-only">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-[#EEEDF8] bg-white text-[#0F0F5C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/30 focus:border-[#4A4ABF]"
            />
            {tab === "signin" && (
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#1C1C78] hover:text-[#0F0F5C] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          {/* Confirm Password (Sign Up only) */}
          {tab === "signup" && (
            <>
              <div>
                <label htmlFor="auth-confirm" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="auth-confirm"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#EEEDF8] bg-white text-[#0F0F5C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/30 focus:border-[#4A4ABF]"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.score ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#0F0F5C]">{strength.label}</p>
                </div>
              )}
            </>
          )}

          {/* Continue button */}
          <button
            type="submit"
            disabled={tab === "signup" && !signUpValid}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#1C1C78] to-[#4A4ABF] hover:from-[#161666] hover:to-[#3E3EA8] focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight size={18} weight="bold" />
          </button>
        </form>

        {/* Footer */}
        <p className="px-6 pb-4 text-center text-xs text-[#0F0F5C]/90">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#1C1C78]">
            Terms of Service
          </Link>{" "}
          &{" "}
          <Link href="/privacy" className="underline hover:text-[#1C1C78]">
            Privacy Policy
          </Link>
        </p>
        <p className="px-6 pb-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#0F0F5C]/80 hover:text-[#1C1C78] hover:underline"
          >
            Skip for now <ArrowRight size={12} weight="bold" className="inline-block ml-0.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
