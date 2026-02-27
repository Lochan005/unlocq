"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white/80 backdrop-blur-sm border-t border-[#E6E4F5] mt-8">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
          {/* Left: Copyright */}
          <div className="text-xs text-gray-600 order-1 md:order-none">
            © 2026 UNLOQ1. All rights reserved.
          </div>

          {/* Center: Data Privacy Message */}
          <div className="text-xs text-gray-600 text-center order-2 md:order-none">
            Your data never leaves your device.
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-4 text-xs text-gray-600 order-3 md:order-none">
            <Link
              href="#"
              className="hover:text-[#4A4ABF] transition-colors"
            >
              About
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="#"
              className="hover:text-[#4A4ABF] transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center pt-3 border-t border-[#EEEDF8]">
          <p className="text-xs text-gray-500">
            Calculations are estimates only. Verify with your lender before making financial decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
