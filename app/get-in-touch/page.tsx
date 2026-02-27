"use client";

import { motion } from "framer-motion";
import { fadeIn } from "../lib/animation";
import { EnvelopeSimple } from "@phosphor-icons/react";

export default function GetInTouch() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      <div className="w-full max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-[#4A4ABF] mb-6 text-center"
          {...fadeIn}
        >
          Get in Touch
        </motion.h1>
        
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-[#E6E4F5] shadow-lg"
          {...fadeIn}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            We'd love to hear from you!
          </p>
          
          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            Have questions, feedback, or suggestions? Reach out to us and we'll get
            back to you as soon as possible.
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EEEDF8] rounded-full flex items-center justify-center">
                <EnvelopeSimple size={24} weight="duotone" className="text-[#1C1C78]" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-[#0F0F5C] font-medium">contact@unloq1.app</p>
              </div>
            </div>
          </div>
          
          <p className="text-[#0F0F5C] text-lg leading-relaxed mt-8">
            Contact form and additional details coming soon!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
