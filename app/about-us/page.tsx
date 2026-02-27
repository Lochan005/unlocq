"use client";

import { motion } from "framer-motion";
import { fadeIn } from "../lib/animation";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      <div className="w-full max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-[#4A4ABF] mb-6 text-center"
          {...fadeIn}
        >
          About Us
        </motion.h1>
        
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-[#E6E4F5] shadow-lg"
          {...fadeIn}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            UNLOQ1 is a personal finance app built for India, created to help individuals understand their loan landscape and identify practical ways to save money through informed prepayments.
          </p>

          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            Founded in 2024 and headquartered in Bengaluru, Karnataka, India, we are inspired by the everyday realities of Indian households where loans are taken with long-term responsibility and hope. Our platform brings together loan details, repayment insights, and interest impact in a clear and easy-to-understand format.
          </p>

          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            At UNLOQ1, we believe financial confidence begins with understanding. By showing how small, timely prepayments can meaningfully reduce interest costs and loan tenure, we help users make better decisions on their own terms.
          </p>

          <p className="text-[#0F0F5C] text-lg leading-relaxed mb-6">
            We operate in accordance with applicable Indian laws and data-protection standards. UNLOQ1 is [registered / licensed / not required to be licensed] under [Applicable Act / Authority, if any], with registration number [Number, if applicable]. Where required, we work with regulated partners to ensure responsible handling of user information.
          </p>

          <p className="text-[#0F0F5C] text-lg leading-relaxed">
            Rooted in India and built for India&apos;s borrowers, UNLOQ1 aims to make loans more transparent, savings more visible, and the journey to debt freedom more achievable.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
