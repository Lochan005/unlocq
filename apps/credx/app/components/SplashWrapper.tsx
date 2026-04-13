"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SplashScreen from "./SplashScreen1";

type Phase = "animating" | "deciding" | "hidden";

const decidingBackdropStyle: CSSProperties = {
  backgroundColor: "#F8F6FD",
  backgroundImage:
    "radial-gradient(circle, #E2E8F0 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

export default function SplashWrapper() {
  const [phase, setPhase] = useState<Phase>("animating");
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();

  const handleSplashComplete = useCallback(() => {
    setPhase("deciding");
  }, []);

  useEffect(() => {
    if (phase !== "deciding") return;
    if (pathname !== "/") {
      setPhase("hidden");
      return;
    }
    if (status === "loading") return;
    if (status === "authenticated") {
      setPhase("hidden");
      return;
    }
    router.replace("/auth");
  }, [phase, pathname, status, router]);

  useEffect(() => {
    if (phase !== "deciding") return;
    if (pathname === "/auth") {
      setPhase("hidden");
    }
  }, [phase, pathname]);

  if (phase === "hidden") return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {phase === "animating" ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <div
          className="absolute inset-0"
          style={decidingBackdropStyle}
          aria-hidden
        />
      )}
    </div>
  );
}
