"use client";

import { useState, useEffect } from "react";

const PHASE_LABELS = [
  "Laying the foundation…",
  "Raising the walls…",
  "Framing the roof…",
  "Adding the shingles…",
  "Installing doors & windows…",
  "Final touches…",
];

const PHASE_DURATION = 380;
const HOLD_DURATION = 1000;
const FADE_DURATION = 600;
const TOTAL_PHASES = 6;

const bounceEase = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function SplashScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState(-1);
  const [brandVisible, setBrandVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase(0), 200));

    for (let i = 1; i < TOTAL_PHASES; i++) {
      timers.push(setTimeout(() => setPhase(i), 200 + i * PHASE_DURATION));
    }

    const buildEnd = 200 + TOTAL_PHASES * PHASE_DURATION;
    timers.push(setTimeout(() => setBrandVisible(true), buildEnd + 200));
    timers.push(setTimeout(() => setFadingOut(true), buildEnd + 200 + HOLD_DURATION));
    timers.push(
      setTimeout(onComplete, buildEnd + 200 + HOLD_DURATION + FADE_DURATION)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const phaseStyle = (p: number) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
    transition: `opacity 350ms ${bounceEase}, transform 350ms ${bounceEase}`,
  });

  const progressWidth = phase >= 0 ? ((phase + 1) / TOTAL_PHASES) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#F8F6FD",
        backgroundImage:
          "radial-gradient(circle, #E0D8F0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: fadingOut ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease-out`,
      }}
    >
      {/* House SVG */}
      <svg
        viewBox="0 0 280 260"
        width="280"
        height="260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-8"
      >
        {/* Phase 0: Foundation */}
        <g style={phaseStyle(0)}>
          <line
            x1="30"
            y1="220"
            x2="250"
            y2="220"
            stroke="#5B4B8A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="60"
            y="200"
            width="160"
            height="20"
            rx="3"
            fill="#8E7BB8"
            stroke="#5B4B8A"
            strokeWidth="1.5"
          />
          <line x1="100" y1="200" x2="100" y2="220" stroke="#5B4B8A" strokeWidth="0.8" opacity="0.4" />
          <line x1="140" y1="200" x2="140" y2="220" stroke="#5B4B8A" strokeWidth="0.8" opacity="0.4" />
          <line x1="180" y1="200" x2="180" y2="220" stroke="#5B4B8A" strokeWidth="0.8" opacity="0.4" />
        </g>

        {/* Phase 1: Walls */}
        <g style={phaseStyle(1)}>
          <rect
            x="60"
            y="120"
            width="160"
            height="80"
            fill="#EBE8FC"
            stroke="#5B4B8A"
            strokeWidth="1.5"
          />
          {/* Brick pattern hints */}
          {[0, 1, 2, 3].map((row) => (
            <g key={`brick-row-${row}`} opacity="0.15">
              <line
                x1="60"
                y1={132 + row * 18}
                x2="220"
                y2={132 + row * 18}
                stroke="#5B4B8A"
                strokeWidth="0.8"
              />
              {[0, 1, 2, 3].map((col) => (
                <line
                  key={`brick-${row}-${col}`}
                  x1={80 + col * 40 + (row % 2 === 0 ? 0 : 20)}
                  y1={120 + row * 18}
                  x2={80 + col * 40 + (row % 2 === 0 ? 0 : 20)}
                  y2={132 + row * 18}
                  stroke="#5B4B8A"
                  strokeWidth="0.8"
                />
              ))}
            </g>
          ))}
        </g>

        {/* Phase 2: Roof frame */}
        <g style={phaseStyle(2)}>
          <polygon
            points="140,55 50,120 230,120"
            fill="none"
            stroke="#5B4B8A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line
            x1="140"
            y1="55"
            x2="140"
            y2="120"
            stroke="#5B4B8A"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </g>

        {/* Phase 3: Roof fill */}
        <g style={phaseStyle(3)}>
          <polygon
            points="140,55 50,120 230,120"
            fill="#9678CD"
            opacity="0.9"
          />
          {/* Shingle lines */}
          {[0, 1, 2].map((i) => {
            const y = 75 + i * 16;
            const inset = ((y - 55) / (120 - 55)) * 90;
            return (
              <line
                key={`shingle-${i}`}
                x1={50 + inset}
                y1={y}
                x2={230 - inset}
                y2={y}
                stroke="#7C5CBF"
                strokeWidth="1"
                opacity="0.5"
              />
            );
          })}
          <polygon
            points="140,55 50,120 230,120"
            fill="none"
            stroke="#5B4B8A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Phase 4: Door & Windows */}
        <g style={phaseStyle(4)}>
          {/* Door */}
          <rect x="122" y="155" width="36" height="45" rx="18" ry="18" fill="#7C5CBF" stroke="#5B4B8A" strokeWidth="1.5" />
          <rect x="122" y="173" width="36" height="27" fill="#7C5CBF" stroke="#5B4B8A" strokeWidth="1.5" />
          <circle cx="151" cy="183" r="2.5" fill="#EBE8FC" />

          {/* Left window */}
          <rect x="72" y="142" width="32" height="28" rx="2" fill="#B19CD7" stroke="#5B4B8A" strokeWidth="1.5" />
          <line x1="88" y1="142" x2="88" y2="170" stroke="#5B4B8A" strokeWidth="1" />
          <line x1="72" y1="156" x2="104" y2="156" stroke="#5B4B8A" strokeWidth="1" />
          <rect x="74" y="144" width="12" height="10" rx="1" fill="white" opacity="0.25" />

          {/* Right window */}
          <rect x="176" y="142" width="32" height="28" rx="2" fill="#B19CD7" stroke="#5B4B8A" strokeWidth="1.5" />
          <line x1="192" y1="142" x2="192" y2="170" stroke="#5B4B8A" strokeWidth="1" />
          <line x1="176" y1="156" x2="208" y2="156" stroke="#5B4B8A" strokeWidth="1" />
          <rect x="178" y="144" width="12" height="10" rx="1" fill="white" opacity="0.25" />
        </g>

        {/* Phase 5: Final touches */}
        <g style={phaseStyle(5)}>
          {/* Chimney */}
          <rect x="180" y="60" width="18" height="35" rx="2" fill="#8E7BB8" stroke="#5B4B8A" strokeWidth="1.5" />

          {/* Smoke puffs */}
          <circle cx="189" cy="52" r="5" fill="#D4C8F0" opacity="0.7">
            <animate attributeName="cy" values="52;40;28" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.4;0" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="4;6;8" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="192" cy="46" r="4" fill="#D4C8F0" opacity="0.5">
            <animate attributeName="cy" values="46;34;22" dur="2.8s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="opacity" values="0.5;0.3;0" dur="2.8s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="r" values="3;5;7" dur="2.8s" repeatCount="indefinite" begin="0.6s" />
          </circle>

          {/* Walkway stones */}
          {[0, 1, 2, 3].map((i) => (
            <ellipse
              key={`stone-${i}`}
              cx={140}
              cy={228 + i * 8}
              rx={10 + i * 2}
              ry={3}
              fill="#8E7BB8"
              opacity={0.5 - i * 0.08}
            />
          ))}

          {/* Left bush */}
          <ellipse cx="50" cy="215" rx="16" ry="10" fill="#9678CD" opacity="0.5" />
          <ellipse cx="45" cy="212" rx="10" ry="7" fill="#B19CD7" opacity="0.6" />

          {/* Right bush */}
          <ellipse cx="230" cy="215" rx="16" ry="10" fill="#9678CD" opacity="0.5" />
          <ellipse cx="235" cy="212" rx="10" ry="7" fill="#B19CD7" opacity="0.6" />

          {/* Welcome mat */}
          <rect x="126" y="198" width="28" height="4" rx="1" fill="#7C5CBF" opacity="0.7" />
        </g>
      </svg>

      {/* Brand name & tagline */}
      <div
        className="text-center"
        style={{
          opacity: brandVisible ? 1 : 0,
          transform: brandVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 500ms ease-out, transform 500ms ease-out",
        }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-[#5C6BC0] drop-shadow-sm">
          UnLoQ1
        </h1>
        <p className="mt-1 text-sm font-medium text-[#8E7BB8] tracking-wide">
          Building your freedom
        </p>
      </div>

      {/* Progress area */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-56 flex flex-col items-center gap-3">
        {/* Phase label */}
        <p
          className="text-xs font-medium text-[#8E7BB8] h-4 text-center"
          style={{
            opacity: phase >= 0 && !brandVisible ? 1 : 0,
            transition: "opacity 300ms ease-out",
          }}
        >
          {phase >= 0 && phase < TOTAL_PHASES ? PHASE_LABELS[phase] : ""}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#EBE8FC] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressWidth}%`,
              background: `linear-gradient(90deg, #B19CD7, #9678CD, #7C5CBF)`,
              transition: `width ${PHASE_DURATION}ms ${bounceEase}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
