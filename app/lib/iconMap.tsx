"use client";

import type { ComponentType, CSSProperties } from "react";
import {
  ForkKnife,
  Hamburger,
  Lightning,
  Rocket,
  Basket,
  Package,
  ShoppingCart,
  TShirt,
  Sparkle,
  DeviceMobile,
  FilmSlate,
  AirplaneTilt,
  Confetti,
  NotePencil,
  Trophy,
  Coins,
  Alarm,
  Fire,
  Users,
  Gift,
  Medal,
  Diamond,
  Star,
  TrendUp,
  Barbell,
  Storefront,
} from "@phosphor-icons/react";

type IconProps = {
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
  style?: React.CSSProperties;
};

const iconMap: Record<string, ComponentType<IconProps>> = {
  // Merchant logos
  swiggy: ForkKnife,
  zomato: Hamburger,
  blinkit: Lightning,
  zepto: Rocket,
  bigbasket: Basket,
  amazon: Package,
  flipkart: ShoppingCart,
  myntra: TShirt,
  nykaa: Sparkle,
  croma: DeviceMobile,
  bookmyshow: FilmSlate,
  makemytrip: AirplaneTilt,
  // Earn actions
  signup: Confetti,
  complete_profile: NotePencil,
  first_prepayment: Trophy,
  per_1k_prepaid: Coins,
  set_reminder: Alarm,
  monthly_streak: Fire,
  referral: Users,
  friend_first_prepay: Gift,
  // Tier icons
  bronze: Medal,
  silver: Medal,
  gold: Medal,
  platinum: Diamond,
  // Score tiers
  excellent: Trophy,
  good: Star,
  fair: TrendUp,
  needs_work: Barbell,
  // Generic fallbacks
  money: Coins,
  fire: Fire,
  coin: Coins,
  store: Storefront,
};

// Brand colors for merchant icons — used for automatic coloring
const brandColorMap: Record<string, string> = {
  swiggy: "#fc8019",
  zomato: "#e23744",
  blinkit: "#f8c93e",
  zepto: "#4A4ABF",
  bigbasket: "#84c225",
  amazon: "#ff9900",
  flipkart: "#2874f0",
  myntra: "#ff3e6c",
  nykaa: "#fc2779",
  croma: "#00a651",
  bookmyshow: "#c4242b",
  makemytrip: "#eb2026",
  // Earn actions
  signup: "#4A4ABF",
  complete_profile: "#3b82f6",
  first_prepayment: "#f59e0b",
  per_1k_prepaid: "#f59e0b",
  set_reminder: "#6366f1",
  monthly_streak: "#ef4444",
  referral: "#06b6d4",
  friend_first_prepay: "#ec4899",
  // Tier icons
  bronze: "#cd7f32",
  silver: "#94a3b8",
  gold: "#eab308",
  platinum: "#4A4ABF",
  // Score tiers
  excellent: "#10b981",
  good: "#3b82f6",
  fair: "#f59e0b",
  needs_work: "#ef4444",
  // Fallbacks
  money: "#f59e0b",
  fire: "#ef4444",
  coin: "#f59e0b",
  store: "#64748b",
};

export function getBrandColor(name: string): string | undefined {
  return brandColorMap[name];
}

export function AppIcon({
  name,
  size = 20,
  weight = "duotone",
  className,
  colored = false,
}: {
  name: string;
  size?: number;
  weight?: IconProps["weight"];
  className?: string;
  colored?: boolean;
}) {
  const Icon = iconMap[name] ?? Coins;
  const style = colored ? { color: brandColorMap[name] } : undefined;
  return <Icon size={size} weight={weight} className={className} style={style} />;
}

export default iconMap;
