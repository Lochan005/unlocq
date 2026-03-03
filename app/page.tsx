"use client";

import { motion } from "framer-motion";
import Decimal from "decimal.js";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import AnimatedCard from "./components/AnimatedCard";
import AnimatedNumber from "./components/AnimatedNumber";
import LoanSlider from "./components/LoanSlider";
import { fadeIn } from "./lib/animation";
import { calculateEMI, calculateNewTenure } from "./lib/calculator";
import { Coins, CalendarBlank, ArrowsClockwise, ChartBar, Lightbulb } from "@phosphor-icons/react";
import { FEATURE_FLAGS } from "./lib/featureFlags";

export default function Home() {
  // State for all 7 sliders
  const [originalLoanAmount, setOriginalLoanAmount] = useState<number | null>(
    null
  );
  const [outstandingBalance, setOutstandingBalance] = useState<number | null>(
    null
  );
  const [interestRate, setInterestRate] = useState<number | null>(null);
  const [remainingTenure, setRemainingTenure] = useState<number | null>(null); // months
  const [currentEMI, setCurrentEMI] = useState<number | null>(null);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number | null>(
    null
  );
  const [monthlyDiscretionaryExpenses, setMonthlyDiscretionaryExpenses] =
    useState<number | null>(null);

  // Display-only placeholders (NOT used for calculations)
  const placeholders = {
    originalLoanAmount: 5000000, // ₹50,00,000
    outstandingBalance: 4000000, // ₹40,00,000
    interestRate: 9, // 9%
    remainingTenure: 180, // 15 years
    currentEMI: 45000, // ₹45,000
    extraMonthlyPayment: 10000, // ₹10,000
    monthlyDiscretionaryExpenses: 15000, // ₹15,000
  };

  const formatIndian = (num: number): string => {
    if (!Number.isFinite(num)) return "0";
    return Math.round(num).toLocaleString("en-IN");
  };

  const formatTenure = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} months`;
    } else if (remainingMonths === 0) {
      return `${years} year${years > 1 ? "s" : ""}`;
    } else {
      return `${years} year${years > 1 ? "s" : ""} ${remainingMonths} month${
        remainingMonths > 1 ? "s" : ""
      }`;
    }
  };

  // Monthly interest rate: R = annual rate / 12 / 100
  const monthlyRate = useMemo(() => {
    if (interestRate === null) return new Decimal(0);
    return new Decimal(interestRate).div(12).div(100);
  }, [interestRate]);

  // Auto-update Current Monthly EMI when outstanding balance, interest rate, or remaining tenure change
  useEffect(() => {
    if (
      outstandingBalance != null &&
      interestRate != null &&
      remainingTenure != null &&
      outstandingBalance > 0 &&
      interestRate > 0 &&
      remainingTenure > 0
    ) {
      const emi = calculateEMI(outstandingBalance, interestRate, remainingTenure);
      setCurrentEMI(Math.round(emi.toNumber()));
    }
  }, [outstandingBalance, interestRate, remainingTenure]);

  // Auto-update Remaining Loan Tenure when outstanding balance, interest rate, or current EMI change
  useEffect(() => {
    if (
      outstandingBalance != null &&
      interestRate != null &&
      currentEMI != null &&
      outstandingBalance > 0 &&
      interestRate > 0 &&
      currentEMI > 0
    ) {
      const tenureDecimal = calculateNewTenure(
        outstandingBalance,
        interestRate,
        currentEMI,
        0
      );
      const months = tenureDecimal.toNumber();
      if (Number.isFinite(months) && months > 0) {
        const clamped = Math.max(24, Math.min(360, Math.ceil(months)));
        setRemainingTenure(clamped);
      }
    }
  }, [outstandingBalance, interestRate, currentEMI]);

  /**
   * UNIFIED SIMULATION ENGINE
   * 
   * Simulates loan amortization with proper partial last-month handling.
   * Both baseline and scenario must use this to ensure apples-to-apples comparison.
   * 
   * Key principles:
   * - EMI is ALWAYS constant (we never lower it even if principal drops)
   * - Last month payment is capped to (balance + interest) - no overpay
   * - Extra payments based on strategy: ONE_TIME (month 1 only) or 2_YEAR (months 1-24)
   */
  const simulateLoanUnified = (params: {
    principal: Decimal;
    emi: Decimal;
    rate: Decimal;
    extraPayment: Decimal;
    strategy: "BASELINE" | "ONE_TIME" | "2_YEAR";
    maxMonths?: number;
  }) => {
    const {
      principal,
      emi,
      rate,
      extraPayment,
      strategy,
      maxMonths = 1200,
    } = params;

    if (principal.lte(0) || emi.lte(0) || rate.lt(0)) {
      return {
        ok: false as const,
        months: 0,
        totalInterest: new Decimal(0),
      };
    }

    let balance = principal;
    let totalInterest = new Decimal(0);
    let monthsElapsed = 0;

    while (balance.gt(0) && monthsElapsed < maxMonths) {
      monthsElapsed++;

      // Calculate interest for this month
      const interest = balance.mul(rate);
      totalInterest = totalInterest.add(interest);

      // Determine extra payment based on strategy
      let extra = new Decimal(0);
      if (strategy === "ONE_TIME" && monthsElapsed === 1) {
        extra = extraPayment;
      } else if (strategy === "2_YEAR" && monthsElapsed <= 24) {
        extra = extraPayment;
      }
      // BASELINE: extra stays 0

      // CORE LOGIC: Payment is ALWAYS (Original EMI + Extra)
      // We never lower the EMI, even if principal drops.
      let payment = emi.add(extra);

      // Handle Last Month (Crucial for accuracy)
      // Cap payment to (balance + interest) - no overpaying
      const totalOwed = balance.add(interest);
      if (payment.gt(totalOwed)) {
        payment = totalOwed;
      }

      // If payment doesn't cover interest, loan will never amortize
      if (payment.lte(interest)) {
        return {
          ok: false as const,
          months: monthsElapsed,
          totalInterest,
        };
      }

      // Calculate principal component and reduce balance
      const principalPaid = payment.sub(interest);
      balance = balance.sub(principalPaid);

      if (balance.lt(0)) {
        balance = new Decimal(0);
      }
    }

    // Safety: if we hit maxMonths without paying off, return failure
    if (balance.gt(0)) {
      return {
        ok: false as const,
        months: monthsElapsed,
        totalInterest,
      };
    }

    return {
      ok: true as const,
      months: monthsElapsed,
      totalInterest,
    };
  };

  // Output 1: Interest saved by making ONE extra payment right now
  const calculateOneTimePaymentSavings = useMemo(() => {
    if (
      outstandingBalance === null ||
      currentEMI === null ||
      extraMonthlyPayment === null ||
      interestRate === null
    ) {
      return { savings: 0, tenureReduced: 0, newTenure: 0 };
    }

    const P = new Decimal(outstandingBalance);
    const EMI = new Decimal(currentEMI);
    const E = new Decimal(extraMonthlyPayment);
    const R = monthlyRate;

    // 1. Simulate BASELINE (no extra payments)
    const baseline = simulateLoanUnified({
      principal: P,
      emi: EMI,
      rate: R,
      extraPayment: new Decimal(0),
      strategy: "BASELINE",
    });

    if (!baseline.ok) {
      return { savings: 0, tenureReduced: 0, newTenure: 0 };
    }

    if (E.lte(0)) {
      return { savings: 0, tenureReduced: 0, newTenure: baseline.months };
    }

    // 2. Simulate ONE_TIME scenario (extra only in month 1)
    const scenario = simulateLoanUnified({
      principal: P,
      emi: EMI,
      rate: R,
      extraPayment: E,
      strategy: "ONE_TIME",
    });

    if (!scenario.ok) {
      return { savings: 0, tenureReduced: 0, newTenure: baseline.months };
    }

    // 3. Calculate savings: baseline interest - scenario interest
    const savings = baseline.totalInterest.sub(scenario.totalInterest);
    const tenureReduced = baseline.months - scenario.months;

    return {
      savings: Math.max(0, Math.round(savings.toNumber())),
      tenureReduced: Math.max(0, tenureReduced),
      newTenure: scenario.months,
    };
  }, [outstandingBalance, currentEMI, extraMonthlyPayment, interestRate, monthlyRate]);

  // Output 2: Interest saved by paying EMI + E for 24 months, then EMI only
  const calculateTwoYearRecurringSavings = useMemo(() => {
    if (
      outstandingBalance === null ||
      currentEMI === null ||
      extraMonthlyPayment === null ||
      interestRate === null
    ) {
      return {
        savings: 0,
        tenureReduced: 0,
        totalMonthsWithExtra: 0,
        newTotalTenure: 0,
      };
    }

    const P = new Decimal(outstandingBalance);
    const EMI = new Decimal(currentEMI);
    const E = new Decimal(extraMonthlyPayment);
    const R = monthlyRate;

    // 1. Simulate BASELINE (no extra payments)
    const baseline = simulateLoanUnified({
      principal: P,
      emi: EMI,
      rate: R,
      extraPayment: new Decimal(0),
      strategy: "BASELINE",
    });

    if (!baseline.ok) {
      return {
        savings: 0,
        tenureReduced: 0,
        totalMonthsWithExtra: 0,
        newTotalTenure: 0,
      };
    }

    if (E.lte(0)) {
      return {
        savings: 0,
        tenureReduced: 0,
        totalMonthsWithExtra: 0,
        newTotalTenure: baseline.months,
      };
    }

    // 2. Simulate 2_YEAR scenario (extra in months 1-24, then EMI only)
    const scenario = simulateLoanUnified({
      principal: P,
      emi: EMI,
      rate: R,
      extraPayment: E,
      strategy: "2_YEAR",
    });

    if (!scenario.ok) {
      return {
        savings: 0,
        tenureReduced: 0,
        totalMonthsWithExtra: 0,
        newTotalTenure: baseline.months,
      };
    }

    // 3. Calculate savings: baseline interest - scenario interest
    const savings = baseline.totalInterest.sub(scenario.totalInterest);
    const tenureReduced = baseline.months - scenario.months;

    return {
      savings: Math.max(0, Math.round(savings.toNumber())),
      tenureReduced: Math.max(0, tenureReduced),
      newTotalTenure: scenario.months,
      totalMonthsWithExtra: Math.min(24, scenario.months),
    };
  }, [outstandingBalance, currentEMI, extraMonthlyPayment, interestRate, monthlyRate]);

  // Nudge logic (Option 7 vs Option 6)
  const nudgeMessage = useMemo(() => {
    if (extraMonthlyPayment === null || monthlyDiscretionaryExpenses === null) {
      return {
        type: "neutral" as const,
        message: "Move the sliders to see personalized insights.",
      };
    }

    const E = extraMonthlyPayment;
    const S = monthlyDiscretionaryExpenses;

    if (S <= 0) {
      return {
        type: "neutral" as const,
        message: "Track your discretionary spending to get personalized insights.",
      };
    }

    const ratio = E / S;

    // Calculate potential savings using unified simulation engine
    const calculatePotentialSavings = (suggestedExtra: number) => {
      if (outstandingBalance === null || currentEMI === null || interestRate === null) {
        return 0;
      }

      const P = new Decimal(outstandingBalance);
      const EMI = new Decimal(currentEMI);
      const E2 = new Decimal(suggestedExtra);
      const R = monthlyRate;

      if (E2.lte(0)) return 0;

      // Use unified simulation for both baseline and scenario
      const baseline = simulateLoanUnified({
        principal: P,
        emi: EMI,
        rate: R,
        extraPayment: new Decimal(0),
        strategy: "BASELINE",
      });

      if (!baseline.ok) return 0;

      const scenario = simulateLoanUnified({
        principal: P,
        emi: EMI,
        rate: R,
        extraPayment: E2,
        strategy: "ONE_TIME",
      });

      if (!scenario.ok) return 0;

      const savings = baseline.totalInterest.sub(scenario.totalInterest);
      return Math.max(0, Math.round(savings.toNumber()));
    };

    if (ratio < 0.3) {
      const suggestedExtra = Math.round(S * 0.5);
      const potentialSavings = calculatePotentialSavings(suggestedExtra);
      return {
        type: "encourage" as const,
        message: `You spend ₹${formatIndian(S)} on discretionary items monthly. Diverting just 50% (₹${formatIndian(
          suggestedExtra
        )}) to your loan could save you ₹${formatIndian(potentialSavings)} in interest!`,
        suggestedAmount: suggestedExtra,
      };
    } else if (ratio < 0.8) {
      return {
        type: "positive" as const,
        message: `Great balance! You're putting ₹${formatIndian(E)} extra while keeping ₹${formatIndian(
          Math.max(0, S - E)
        )} for lifestyle. Smart move!`,
      };
    } else if (ratio <= 1) {
      return {
        type: "positive" as const,
        message: "You're maximizing your loan payments. This discipline will pay off significantly!",
      };
    }

    return {
      type: "warning" as const,
      message: `This is an aggressive repayment plan. Your extra payment (₹${formatIndian(
        E
      )}) exceeds your discretionary budget (₹${formatIndian(
        S
      )}). Ensure you're not cutting essential expenses.`,
    };
  }, [
    extraMonthlyPayment,
    monthlyDiscretionaryExpenses,
    outstandingBalance,
    monthlyRate,
    currentEMI,
    interestRate,
  ]);
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      {/* Hero Section */}
      <div className="w-full max-w-4xl mx-auto text-center mb-12 md:mb-16">
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold mb-4 drop-shadow-sm tracking-tight text-[#2E2E8F]"
          style={{ fontFamily: "var(--font-roboto)" }}
          {...fadeIn}
        >
          UNLOQ1
        </motion.h1>
        <p className="text-lg md:text-xl text-[#0F0F5C] max-w-2xl mx-auto">
          Discover how much interest you can reclaim today
        </p>
      </div>

      {/* Loan Analysis Sliders */}
      <motion.div
        className="w-full max-w-6xl mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-[#E6E4F5] shadow-lg">
          {/* Grid Layout: 3 columns on desktop, 1 column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Row 1 - First 3 sliders */}
            <div className="p-3 bg-white/50 rounded-lg border border-[#EEEDF8]">
              <LoanSlider
                label="Current Outstanding Balance"
                helper="Amount remaining on your loan today"
                min={0}
                max={50000000}
                step={50000}
                format="currency"
                value={outstandingBalance}
                displayPlaceholder={placeholders.outstandingBalance}
                onChange={setOutstandingBalance}
                disabled={false}
              />
            </div>

            <div className="p-3 bg-white/50 rounded-lg border border-[#EEEDF8]">
              <LoanSlider
                label="Original Loan Amount"
                helper="The total amount you borrowed"
                min={100000}
                max={50000000}
                step={50000}
                format="currency"
                value={originalLoanAmount}
                displayPlaceholder={placeholders.originalLoanAmount}
                onChange={setOriginalLoanAmount}
              />
            </div>

            <div className="p-3 bg-white/50 rounded-lg border border-[#EEEDF8]">
              <LoanSlider
                label="Current Interest Rate (% p.a.)"
                helper="As per your latest statement"
                min={5}
                max={20}
                step={0.1}
                format="percentage"
                value={interestRate}
                displayPlaceholder={placeholders.interestRate}
                onChange={setInterestRate}
              />
            </div>

            {/* Row 2 - Next 3 sliders */}
            <div className="p-3 bg-white/50 rounded-lg border border-[#EEEDF8]">
              <LoanSlider
                label="Remaining Loan Tenure"
                helper="Months left to pay off your loan"
                min={24}
                max={360}
                step={12}
                format="months"
                value={remainingTenure}
                displayPlaceholder={placeholders.remainingTenure}
                onChange={setRemainingTenure}
              />
            </div>

            <div className="p-3 bg-white/50 rounded-lg border border-[#EEEDF8]">
              <LoanSlider
                label="Current Monthly EMI"
                helper="As per your loan schedule"
                min={1000}
                max={500000}
                step={1000}
                format="currency"
                value={currentEMI}
                displayPlaceholder={placeholders.currentEMI}
                onChange={setCurrentEMI}
              />
            </div>

            <div className="p-3 bg-white/50 rounded-lg border border-[#EEEDF8]">
              <LoanSlider
                label="Extra Monthly Payment Capacity"
                helper="This will not change your EMI unless you choose to"
                min={1000}
                max={500000}
                step={1000}
                format="currency"
                value={extraMonthlyPayment}
                displayPlaceholder={placeholders.extraMonthlyPayment}
                onChange={setExtraMonthlyPayment}
              />
            </div>

            {/* Row 3 - Last slider (spans 1 column, centered on desktop) */}
            <div className="p-3 bg-white/50 rounded-lg border border-[#EEEDF8] md:col-start-2">
              <LoanSlider
                label="Monthly Living Expenses"
                helper="e.g. online shopping, dining, non-essential spends"
                min={1000}
                max={500000}
                step={1000}
                format="currency"
                value={monthlyDiscretionaryExpenses}
                displayPlaceholder={placeholders.monthlyDiscretionaryExpenses}
                onChange={setMonthlyDiscretionaryExpenses}
              />
            </div>
          </div>

          {/* Results Section (same container) */}
          <div className="mt-8 space-y-6">
            {/* Output 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E6E4F5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#0F0F5C] uppercase tracking-wide mb-2">
                  Interest Saved This Month
                </p>
                <div className="flex items-baseline gap-2">
                  <AnimatedNumber
                    value={calculateOneTimePaymentSavings.savings}
                    prefix="₹"
                    className="text-3xl md:text-4xl font-bold text-[#1C1C78]"
                  />
                </div>
                <p className="text-sm text-[#0F0F5C] mt-2">
                  By paying an extra{" "}
                  <span className="font-semibold">
                    ₹{formatIndian(extraMonthlyPayment ?? 0)}
                  </span>{" "}
                  this month, you eliminate this much future interest liability
                  instantly.
                </p>
                {calculateOneTimePaymentSavings.tenureReduced > 0 && (
                  <p className="text-xs text-[#4A4ABF] mt-1">
                    Tenure reduced by {calculateOneTimePaymentSavings.tenureReduced}{" "}
                    month
                    {calculateOneTimePaymentSavings.tenureReduced > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <Link
                href={`/pay-now?emi=${currentEMI ?? 0}&prepayment=${extraMonthlyPayment ?? 0}&savings=${calculateOneTimePaymentSavings.savings}`}
                className="shrink-0 px-6 py-3 rounded-lg font-semibold text-white bg-[#2E2E8F] hover:bg-[#1C1C78] focus:outline-none focus:ring-2 focus:ring-[#2E2E8F]/50 transition-colors text-center"
              >
                Pay now
              </Link>
            </div>

            {/* Output 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E6E4F5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#0F0F5C] uppercase tracking-wide mb-2">
                  Interest Saved Over 2 Years
                </p>
                <div className="flex items-baseline gap-2">
                  <AnimatedNumber
                    value={calculateTwoYearRecurringSavings.savings}
                    prefix="₹"
                    className="text-3xl md:text-4xl font-bold text-[#1C1C78]"
                  />
                </div>
                <p className="text-sm text-[#0F0F5C] mt-2">
                  If you continue paying{" "}
                  <span className="font-semibold">
                    ₹{formatIndian(extraMonthlyPayment ?? 0)}
                  </span>{" "}
                  extra every month for 2 years.
                </p>
                {calculateTwoYearRecurringSavings.tenureReduced > 0 && (
                  <p className="text-xs text-[#4A4ABF] mt-1">
                    You'll be debt-free{" "}
                    <span className="font-semibold text-[#1C1C78]">
                      {formatTenure(calculateTwoYearRecurringSavings.tenureReduced)}
                    </span>{" "}
                    earlier!
                  </p>
                )}
              </div>
              <button
                type="button"
                className="shrink-0 px-6 py-3 rounded-lg font-semibold text-white bg-[#2E2E8F] hover:bg-[#1C1C78] focus:outline-none focus:ring-2 focus:ring-[#2E2E8F]/50 transition-colors"
              >
                Set reminder
              </button>
            </div>

            {/* Nudge */}
            <div
              className={`rounded-xl p-4 ${
                nudgeMessage.type === "warning"
                  ? "bg-amber-50 border border-amber-200"
                  : nudgeMessage.type === "encourage"
                    ? "bg-[#F1F5F9] border border-[#E6E4F5]"
                    : nudgeMessage.type === "positive"
                      ? "bg-green-50 border border-green-200"
                      : "bg-white/60 border border-[#E6E4F5]"
              }`}
            >
              <p
                className={`text-sm ${
                  nudgeMessage.type === "warning"
                    ? "text-amber-800"
                    : nudgeMessage.type === "encourage"
                      ? "text-[#0F0F5C]"
                      : nudgeMessage.type === "positive"
                        ? "text-green-800"
                        : "text-[#0F0F5C]"
                }`}
              >
                <Lightbulb size={18} weight="duotone" className="inline-block mr-1 align-text-bottom" />{nudgeMessage.message}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

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
            className="text-5xl md:text-6xl font-bold text-[#4A4ABF]"
          />
        </div>
        <p className="text-lg text-gray-600 mt-4">using UNLOQ1</p>
      </motion.div>

      {FEATURE_FLAGS.SHOW_SCENARIO_OPTIONS && (
        <>
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
                className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-lg border border-[#E6E4F5] text-[#0F0F5C] hover:text-[#4A4ABF] hover:border-[#4A4ABF] transition-all duration-200 font-medium"
              >
                Lump Sum
              </Link>
              <Link
                href="/monthly-extra"
                className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-lg border border-[#E6E4F5] text-[#0F0F5C] hover:text-[#4A4ABF] hover:border-[#4A4ABF] transition-all duration-200 font-medium"
              >
                Monthly Extra
              </Link>
              <Link
                href="/refinance"
                className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-lg border border-[#E6E4F5] text-[#0F0F5C] hover:text-[#4A4ABF] hover:border-[#4A4ABF] transition-all duration-200 font-medium"
              >
                Refinance
              </Link>
            </div>
          </motion.div>

          {/* Scenario Selection Cards */}
          <div className="w-full max-w-6xl mx-auto mb-12">
            <h2 className="text-2xl font-semibold text-[#0F0F5C] mb-8 text-center">
              Choose your scenario:
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 - Lump Sum Prepayment */}
              <AnimatedCard
                href="/lump-sum"
                delay={0.5}
                className="group flex flex-col h-full p-6 md:p-8"
              >
                <div className="mb-4 text-[#4A4ABF]"><Coins size={40} weight="duotone" /></div>
                <h3 className="text-xl font-bold text-[#0F0F5C] mb-3">Lump Sum Prepayment</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Pay a one-time large amount to reduce your loan tenure or EMI
                </p>
                <div className="flex items-center text-[#4A4ABF] font-semibold group-hover:gap-2 transition-all">
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
                <div className="mb-4 text-[#4A4ABF]"><CalendarBlank size={40} weight="duotone" /></div>
                <h3 className="text-xl font-bold text-[#0F0F5C] mb-3">Monthly Extra Payment</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Add extra amount to your EMI every month and become debt-free faster
                </p>
                <div className="flex items-center text-[#4A4ABF] font-semibold group-hover:gap-2 transition-all">
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
                <div className="mb-4 text-[#4A4ABF]"><ArrowsClockwise size={40} weight="duotone" /></div>
                <h3 className="text-xl font-bold text-[#0F0F5C] mb-3">Refinance Comparison</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Should you switch to a lower rate? Compare staying, prepaying, refinancing, or doing both
                </p>
                <div className="flex items-center text-[#4A4ABF] font-semibold group-hover:gap-2 transition-all">
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
                  <span className="bg-[#EEEDF8] text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <div className="mb-4 opacity-50 text-[#4A4ABF]"><ChartBar size={40} weight="duotone" /></div>
                <h3 className="text-xl font-bold text-[#0F0F5C] mb-3 opacity-75">Compare All Scenarios</h3>
                <p className="text-gray-500 mb-6 flex-grow">
                  Not sure which option? Compare all scenarios side by side
                </p>
                <div className="flex items-center text-gray-500 font-semibold">
                  <span>Coming Soon</span>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </>
      )}

      {/* Trust Badges */}
      <motion.div
        className="w-full max-w-4xl mx-auto mt-8"
        {...fadeIn}
        transition={{ delay: 0.9 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#4A4ABF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm md:text-base">100% Free</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#4A4ABF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm md:text-base">No Sign-up Required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#4A4ABF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm md:text-base">Data Never Leaves Your Device</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
