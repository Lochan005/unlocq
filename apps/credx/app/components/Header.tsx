"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderRewardsIndicator } from "./rewards";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0A0A4A] via-[#0F0F5C] to-[#1C1C78] backdrop-blur-sm border-b border-[#1C1C78] min-h-[60px] py-2">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo + Tagline */}
        <div className="flex flex-col items-start">
          <Link
            href="/"
            className="text-2xl font-bold leading-tight text-white hover:text-[#E6E4F5] transition-colors"
            style={{ fontFamily: "var(--font-roboto)" }}
          >
            Unloqs
          </Link>
          <span className="text-[11px] font-medium text-white/70 tracking-tight mt-0.5">
            Money Matters
          </span>
        </div>

        {/* Rewards Indicator + Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <HeaderRewardsIndicator />
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                  isActive(link.href)
                    ? "text-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white/80 hover:text-white transition-colors p-2"
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
        <div className="md:hidden bg-[#0F0F5C]/95 backdrop-blur-sm border-t border-[#1C1C78]">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b border-[#1C1C78] ${
                  isActive(link.href)
                    ? "text-white bg-[#1C1C78]"
                    : "text-white/80 hover:text-white hover:bg-[#1C1C78]"
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
