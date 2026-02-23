"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderRewardsIndicator from "@/app/components/rewards/HeaderRewardsIndicator";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/about-us", label: "About us" },
    { href: "/rewards", label: "Rewards" },
    { href: "/get-in-touch", label: "Get in Touch" },
    { href: "/blog", label: "Blog" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200 min-h-[60px] py-2">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo + Tagline */}
        <div className="flex flex-col">
          <Link
            href="/"
            className="text-2xl font-bold leading-tight text-[#9678CD] hover:text-[#B19CD7] transition-colors"
          >
            UnLoQ1
          </Link>
          <span className="text-sm font-medium text-[#5B4B8A] tracking-tight mt-0.5">
            Money Matters ₹
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <>
            <HeaderRewardsIndicator />
            {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                isActive(link.href)
                  ? "text-[#B19CD7]"
                  : "text-[#5B4B8A] hover:text-[#B19CD7]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B19CD7]"></span>
              )}
            </Link>
          ))}
          </>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-[#5B4B8A] hover:text-[#B19CD7] transition-colors p-2"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-purple-200">
          <nav className="flex flex-col">
            <div
              className="border-b border-purple-100 px-4 py-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <HeaderRewardsIndicator />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b border-purple-100 ${
                  isActive(link.href)
                    ? "text-[#B19CD7] bg-purple-50"
                    : "text-[#5B4B8A] hover:text-[#B19CD7] hover:bg-purple-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
