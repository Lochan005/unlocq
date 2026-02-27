"use client";

import { motion } from "framer-motion";
import { fadeIn } from "../lib/animation";

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      <div className="w-full max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-[#4A4ABF] mb-6 text-center"
          {...fadeIn}
        >
          Blog
        </motion.h1>
        
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-[#E6E4F5] shadow-lg"
          {...fadeIn}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            Welcome to the UNLOQ1 Blog!
          </p>
          
          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            Stay updated with the latest tips, insights, and guides on loan management,
            financial planning, and smart prepayment strategies.
          </p>
          
          <p className="text-[#0F0F5C] text-lg leading-relaxed">
            Our blog is coming soon! Check back later for valuable content and expert advice.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
