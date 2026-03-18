"use client";

import { useState, useCallback } from "react";
import SplashScreen from "./SplashScreen1";

export default function SplashWrapper() {
  const [showSplash, setShowSplash] = useState(true);

  const handleComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!showSplash) return null;

  return <SplashScreen onComplete={handleComplete} />;
}
