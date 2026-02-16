"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-auth-fintech">
      <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-md border border-purple-200 p-8 text-center">
        <h1 className="text-xl font-bold text-[#5B4B8A] mb-2">Reset password</h1>
        <p className="text-[#5B4B8A]/90 text-sm mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg border-2 border-purple-100 text-[#5B4B8A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B19CD7]/30 focus:border-[#B19CD7] mb-4"
        />
        <button
          type="button"
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#7C5CBF] to-[#B19CD7] hover:from-[#6B4CAF] hover:to-[#9B8CC7] focus:outline-none"
        >
          Send reset link
        </button>
        <Link
          href="/auth"
          className="mt-4 inline-block text-sm text-[#7C5CBF] hover:underline"
        >
          <ArrowLeft size={14} weight="bold" className="inline-block mr-0.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
