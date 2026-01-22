"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedCard from "./components/AnimatedCard";
import AnimatedNumber from "./components/AnimatedNumber";
import { fadeIn } from "./lib/animation";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      {/* Hero Section */}
      <div className="w-full max-w-4xl mx-auto text-center mb-12 md:mb-16">
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold text-[#B19CD7] mb-4 drop-shadow-sm tracking-tight"
          {...fadeIn}
        >
          UnlocQ
        </motion.h1>
        <motion.p
          className="text-2xl md:text-3xl font-medium text-gray-800 mb-6 tracking-tight"
          {...fadeIn}
          transition={{ delay: 0.2 }}
        >
          Smart Loan Prepayment Calculator
        </motion.p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Discover how much you can save on your loan by prepaying smartly
        </p>
      </div>

      {/* AnimatedNumber Showcase */}
      <motion.div
        className="w-full max-w-4xl mx-auto text-center py-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-lg text-gray-600 mb-4">Users have saved over</p>
        <div className="relative inline-block glow-purple rounded-lg px-8 py-4 bg-white/50 backdrop-blur-sm">
          <AnimatedNumber
            value={11640000}
            className="text-5xl md:text-6xl font-bold text-[#B19CD7]"
          />
        </div>
        <p className="text-lg text-gray-600 mt-4">using UnlocQ calculators</p>
      </motion.div>

      {/* Calculator Navigation Links */}
      <motion.div
        className="w-full max-w-4xl mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link
            href="/lump-sum"
            className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200 text-gray-700 hover:text-[#B19CD7] hover:border-[#B19CD7] transition-all duration-200 font-medium"
          >
            Lump Sum
          </Link>
          <Link
            href="/monthly-extra"
            className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200 text-gray-700 hover:text-[#B19CD7] hover:border-[#B19CD7] transition-all duration-200 font-medium"
          >
            Monthly Extra
          </Link>
          <Link
            href="/refinance"
            className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200 text-gray-700 hover:text-[#B19CD7] hover:border-[#B19CD7] transition-all duration-200 font-medium"
          >
            Refinance
          </Link>
        </div>
      </motion.div>

      {/* Scenario Selection Cards */}
      <div className="w-full max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Choose your scenario:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 - Lump Sum Prepayment */}
          <AnimatedCard
            href="/lump-sum"
            delay={0.5}
            className="group flex flex-col h-full p-6 md:p-8"
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Lump Sum Prepayment</h3>
            <p className="text-gray-600 mb-6 flex-grow">
              Pay a one-time large amount to reduce your loan tenure or EMI
            </p>
            <div className="flex items-center text-[#B19CD7] font-semibold group-hover:gap-2 transition-all">
              <span>Get Started</span>
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </AnimatedCard>

          {/* Card 2 - Monthly Extra Payment */}
          <AnimatedCard
            href="/monthly-extra"
            delay={0.6}
            className="group flex flex-col h-full p-6 md:p-8"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Monthly Extra Payment</h3>
            <p className="text-gray-600 mb-6 flex-grow">
              Add extra amount to your EMI every month and become debt-free faster
            </p>
            <div className="flex items-center text-[#B19CD7] font-semibold group-hover:gap-2 transition-all">
              <span>Get Started</span>
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </AnimatedCard>

          {/* Card 3 - Refinance Comparison */}
          <AnimatedCard
            href="/refinance"
            delay={0.7}
            className="group flex flex-col h-full p-6 md:p-8"
          >
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Refinance Comparison</h3>
            <p className="text-gray-600 mb-6 flex-grow">
              Should you switch to a lower rate? Compare staying, prepaying, refinancing, or doing both
            </p>
            <div className="flex items-center text-[#B19CD7] font-semibold group-hover:gap-2 transition-all">
              <span>Get Started</span>
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </AnimatedCard>

          {/* Card 4 - Compare All (Coming Soon) */}
          <AnimatedCard
            delay={0.8}
            className="opacity-60 flex flex-col h-full p-6 md:p-8 relative"
            disableHover
          >
            <div className="absolute top-4 right-4">
              <span className="bg-purple-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="text-4xl mb-4 opacity-50">📊</div>
            <h3 className="text-xl font-bold text-gray-700 mb-3 opacity-75">Compare All Scenarios</h3>
            <p className="text-gray-500 mb-6 flex-grow">
              Not sure which option? Compare all scenarios side by side
            </p>
            <div className="flex items-center text-gray-500 font-semibold">
              <span>Coming Soon</span>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Trust Badges */}
      <motion.div
        className="w-full max-w-4xl mx-auto mt-8"
        {...fadeIn}
        transition={{ delay: 0.9 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#B19CD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm md:text-base">100% Free</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#B19CD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm md:text-base">No Sign-up Required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#B19CD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm md:text-base">Data Never Leaves Your Device</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
