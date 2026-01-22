"use client";

import { motion } from "framer-motion";
import { fadeIn } from "../lib/animation";

export default function Rewards() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      <div className="w-full max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-[#B19CD7] mb-6 text-center"
          {...fadeIn}
        >
          Rewards
        </motion.h1>
        
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-purple-200 shadow-lg"
          {...fadeIn}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Unlock amazing rewards with UnlocQ!
          </p>
          
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Earn points for every calculation you make, share your results, and refer
            friends. Redeem your points for exclusive benefits and discounts.
          </p>
          
          <p className="text-gray-700 text-lg leading-relaxed">
            Our rewards program is coming soon! Stay tuned for exciting updates.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
