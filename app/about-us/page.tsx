"use client";

import { motion } from "framer-motion";
import { fadeIn } from "../lib/animation";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      <div className="w-full max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-[#B19CD7] mb-6 text-center"
          {...fadeIn}
        >
          About Us
        </motion.h1>
        
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-purple-200 shadow-lg"
          {...fadeIn}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#5B4B8A] text-lg leading-relaxed mb-6">
            Welcome to UnLoQ1, your trusted partner in smart financial planning.
          </p>
          
          <p className="text-[#5B4B8A] text-lg leading-relaxed mb-6">
            We are dedicated to helping you make informed decisions about your loans
            and financial future. Our mission is to empower individuals with the tools
            and knowledge they need to save money and achieve their financial goals.
          </p>
          
          <p className="text-[#5B4B8A] text-lg leading-relaxed">
            This page is currently under development. More information coming soon!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
