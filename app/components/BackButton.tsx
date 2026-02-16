"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { transitionPresets } from "../lib/animation";
import { ArrowLeft } from "@phosphor-icons/react";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({
  href = "/",
  label = "Back to Home",
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
    >
      {/* Arrow */}
      <motion.span
        whileHover={{ x: -4 }}
        transition={transitionPresets.snappy}
      >
        <ArrowLeft size={18} weight="bold" />
      </motion.span>

      {/* Text */}
      <span className="hover:underline transition-opacity group-hover:opacity-90">
        {label}
      </span>
    </Link>
  );
}
