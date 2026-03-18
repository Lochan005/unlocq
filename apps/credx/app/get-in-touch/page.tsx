"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  Clock,
  Lightning,
  PaperPlaneTilt,
  Check,
  ChatCircle,
  LinkedinLogo,
  TwitterLogo,
  CaretDown,
  Lock,
  Flag,
} from "@phosphor-icons/react";
import { fadeIn, staggerContainer, staggerItem } from "@/app/lib/animation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUERY_MAX = 500;

const CONTACT_INFO = [
  { icon: EnvelopeSimple, label: "Email", value: "hello@unloqs.in" },
  { icon: Phone, label: "Phone", value: "+91-9845672040" },
  { icon: MapPin, label: "Office Address", value: "HSR Layout, Bengaluru, India" },
  { icon: Clock, label: "Working Hours", value: "24/7 available" },
  { icon: Lightning, label: "Response Time", value: "We typically respond within 2 hours" },
];

const CHANNELS = [
  { icon: EnvelopeSimple, label: "Email us", desc: "Send us an email anytime", href: "mailto:hello@unloq1.in" },
  { icon: ChatCircle, label: "WhatsApp", desc: "Chat with us instantly on WhatsApp", href: "https://wa.me/919876543210" },
  { icon: LinkedinLogo, label: "LinkedIn", desc: "Connect with us on LinkedIn", href: "https://linkedin.com/company/unloq1" },
  { icon: TwitterLogo, label: "Twitter / X", desc: "Follow us for updates", href: "https://x.com/unloq1" },
];

const FAQ_ITEMS = [
  { q: "How does UNLOQ1 help me save on my home loan?", a: "UNLOQ1 analyzes your loan and suggests optimal prepayment strategies—whether lump sum, monthly extra, or refinancing—so you pay less interest and become debt-free faster." },
  { q: "Is UNLOQ1 free to use?", a: "Yes. UNLOQ1's core calculator and insights are free. We may offer premium features later, but the core experience remains free for homeowners." },
  { q: "How do I connect my bank account?", a: "We don't connect to your bank directly. You enter your loan details manually, and we provide recommendations. Your data stays on your device." },
  { q: "Can banks or NBFCs partner with UNLOQ1?", a: "Absolutely. We're open to partnerships with banks and NBFCs to help their customers save on home loans. Reach out via the form above." },
];

export default function GetInTouch() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const emailValid = EMAIL_REGEX.test(email);
  const emailInvalid = emailTouched && email.length > 0 && !emailValid;
  const formValid = name.trim().length > 0 && emailValid && query.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || loading) return;
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly at hello@unloq1.in");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setQuery("");
    setEmailTouched(false);
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16 bg-gradient-to-b from-[#f0f4f8] via-[#e8edf2] to-white">
      <div className="w-full max-w-6xl mx-auto">
        {/* Section 1 — Hero */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          {...fadeIn}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e3a5f] mb-4">
            We&apos;d love to hear from you
          </h1>
          <p className="text-lg text-[#64748b] max-w-xl mx-auto">
            Drop us a line and we&apos;ll get back within 24 hours.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/80 border border-[#1e3a5f]/20 flex items-center justify-center shadow-sm">
              <EnvelopeSimple size={40} weight="duotone" className="text-[#1e3a5f]" />
            </div>
          </div>
        </motion.div>

        {/* Section 2 & 3 — Form + Contact Info (two-column on desktop) */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Contact Info — Left (40%) */}
          <motion.div className="lg:col-span-2 space-y-6" variants={staggerItem}>
            <div className="bg-white rounded-2xl p-6 border border-[#1e3a5f]/10 shadow-sm">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Contact Information</h3>
              <div className="space-y-4">
                {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center shrink-0">
                      <Icon size={20} weight="duotone" className="text-[#1e3a5f]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b] uppercase tracking-wide">{label}</p>
                      <p className="text-[#1e293b] font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form — Right (60%) */}
          <motion.div className="lg:col-span-3" variants={staggerItem}>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#1e3a5f]/10 shadow-sm">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#5ab0a8]/20 flex items-center justify-center mx-auto mb-4">
                      <Check size={32} weight="bold" className="text-[#5ab0a8]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1e293b] mb-2">Message Sent!</h3>
                    <p className="text-[#64748b] mb-6">We&apos;ll get back to you within 24 hours.</p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-[#1e3a5f] font-semibold hover:text-[#0f2440] underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {error && (
                      <div
                        className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                        role="alert"
                      >
                        {error}
                      </div>
                    )}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#1e293b] mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#e2e8f0] text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e3a5f] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#1e293b] mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          placeholder="you@example.com"
                          className={`w-full px-4 py-3 rounded-lg border-2 text-[#1e293b] placeholder-[#94a3b8] focus:outline-none transition-colors pr-10 ${
                            emailInvalid
                              ? "border-red-400 bg-red-50"
                              : emailValid
                                ? "border-[#5ab0a8] bg-[#5ab0a8]/5"
                                : "border-[#e2e8f0] focus:border-[#1e3a5f]"
                          }`}
                          required
                          aria-describedby={emailInvalid ? "email-error" : undefined}
                        />
                        {emailValid && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5ab0a8]">
                            <Check size={20} weight="bold" />
                          </span>
                        )}
                      </div>
                      {emailInvalid && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">
                          Please enter a valid email address.
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="query" className="block text-sm font-medium text-[#1e293b] mb-1">
                        Your Query <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value.slice(0, QUERY_MAX))}
                        placeholder="How can we help you?"
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#e2e8f0] text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e3a5f] transition-colors resize-y min-h-[100px]"
                        required
                      />
                      <p className="mt-1 text-xs text-[#64748b] text-right">
                        {query.length} / {QUERY_MAX}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={!formValid || loading}
                      className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#1e3a5f] to-[#0f2440] hover:from-[#0f2440] hover:to-[#0a1a2e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Message
                          <PaperPlaneTilt size={20} weight="fill" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 4 — Alternative Channels */}
        <motion.div className="mb-16" {...fadeIn}>
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 text-center">Other ways to reach us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHANNELS.map(({ icon: Icon, label, desc, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex flex-col items-center p-6 bg-white rounded-2xl border border-[#1e3a5f]/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-3">
                  <Icon size={24} weight="duotone" className="text-[#1e3a5f]" />
                </div>
                <span className="font-semibold text-[#1e293b]">{label}</span>
                <span className="text-sm text-[#64748b] text-center mt-1">{desc}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Section 5 — FAQ Teaser */}
        <motion.div className="mb-16" {...fadeIn}>
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 text-center">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#1e3a5f]/10 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f0f4f8]/50 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-[#1e293b]">{item.q}</span>
                  <CaretDown
                    size={20}
                    weight="bold"
                    className={`text-[#64748b] shrink-0 ml-2 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-[#64748b] text-sm leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <p className="text-center mt-4">
            <a href="/blog" className="text-[#1e3a5f] font-semibold hover:underline">
              View All FAQs →
            </a>
          </p>
        </motion.div>

        {/* Section 6 — Trust Signals */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-10 py-8 border-t border-[#e2e8f0]"
          {...fadeIn}
        >
          <span className="flex items-center gap-2 text-sm text-[#64748b]">
            <Lock size={18} weight="fill" className="text-[#5ab0a8]" />
            Your data is encrypted and secure
          </span>
          <span className="flex items-center gap-2 text-sm text-[#64748b]">
            <Flag size={18} weight="fill" className="text-[#5ab0a8]" />
            Made in India
          </span>
          <span className="text-sm text-[#64748b]">Aligned with Viksit Bharat 2047</span>
        </motion.div>
      </div>
    </div>
  );
}
