"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight } from "@phosphor-icons/react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });
      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }
      if (result?.ok) {
        window.location.href = result.url ?? "/";
        return;
      }
      setError("Sign in failed. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center min-h-screen bg-auth-fintech">
      <div className="w-[90%] sm:w-[60vw] max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md border border-[#E6E4F5]/80 flex flex-col">
        <div className="text-center pt-8 pb-6 px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#1C1C78] via-[#2E2E8F] to-[#4A4ABF] bg-clip-text text-transparent tracking-tight">
            Unloqs
          </h1>
          <p className="text-sm font-medium text-[#0F0F5C] mt-1 tracking-tight">
            Money Matters
          </p>
        </div>

        <div className="border-b border-[#EEEDF8] px-6 pb-3">
          <h2 className="text-center text-sm font-semibold text-[#0F0F5C]">
            Sign in
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="auth-email" className="sr-only">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-[#EEEDF8] bg-white text-[#0F0F5C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/30 focus:border-[#4A4ABF]"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="sr-only">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-[#EEEDF8] bg-white text-[#0F0F5C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/30 focus:border-[#4A4ABF]"
            />
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#1C1C78] hover:text-[#0F0F5C] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#1C1C78] to-[#4A4ABF] hover:from-[#161666] hover:to-[#3E3EA8] focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {pending ? "Signing in…" : "Continue"}
            {!pending && <ArrowRight size={18} weight="bold" />}
          </button>
        </form>

        <p className="px-6 pb-6 text-center text-xs text-[#0F0F5C]/90">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#1C1C78]">
            Terms of Service
          </Link>{" "}
          &{" "}
          <Link href="/privacy" className="underline hover:text-[#1C1C78]">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
