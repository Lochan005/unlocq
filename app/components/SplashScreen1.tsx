"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
const PARTICLE_FADE_MS = 500;

const bounceEase = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// ============================================================
// Particle types & helpers
// ============================================================

interface Particle {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  size: number;
  baseOpacity: number;
  type: "coin" | "rupee" | "bill";
  rotation: number;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function spawnParticle(cx: number, cy: number, w: number, h: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.max(w, h) * 0.65 + Math.random() * 120;
  const startX = cx + Math.cos(angle) * dist;
  const startY = cy + Math.sin(angle) * dist;

  const jitter = 20;
  const targetX = cx + randomBetween(-jitter, jitter);
  const targetY = cy + randomBetween(-jitter, jitter) - 10;

  const roll = Math.random();
  const type: Particle["type"] = roll < 0.35 ? "coin" : roll < 0.7 ? "bill" : "rupee";

  return {
    x: startX,
    y: startY,
    startX,
    startY,
    targetX,
    targetY,
    progress: 0,
    speed: randomBetween(0.004, 0.012),
    size: randomBetween(10, 20),
    baseOpacity: randomBetween(0.45, 0.85),
    type,
    rotation: randomBetween(-0.4, 0.4),
  };
}

// ============================================================
// Component
// ============================================================

export default function SplashScreen1({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState(-1);
  const [brandVisible, setBrandVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(-1);
  const prevPhaseRef = useRef(-1);
  const brandVisibleRef = useRef(false);
  const brandVisibleAtRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    brandVisibleRef.current = brandVisible;
    if (brandVisible) brandVisibleAtRef.current = performance.now();
  }, [brandVisible]);

  // ---- Canvas particle loop ----
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2 - 30;

    for (let i = 0; i < 18; i++) {
      const p = spawnParticle(cx, cy, w, h);
      p.progress = Math.random() * 0.7;
      particlesRef.current.push(p);
    }

    function drawCoin(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number
    ) {
      const r = size / 2;
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      grad.addColorStop(0, `rgba(255, 210, 60, ${opacity})`);
      grad.addColorStop(0.45, `rgba(230, 175, 20, ${opacity})`);
      grad.addColorStop(1, `rgba(190, 140, 10, ${opacity * 0.85})`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(150, 110, 0, ${opacity * 0.7})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawBill(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number,
      rotation: number,
      progress: number
    ) {
      const bw = size * 1.6;
      const bh = size * 0.85;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + progress * 0.3);

      const grad = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
      grad.addColorStop(0, `rgba(100, 185, 90, ${opacity})`);
      grad.addColorStop(0.5, `rgba(65, 155, 65, ${opacity})`);
      grad.addColorStop(1, `rgba(40, 120, 45, ${opacity * 0.9})`);

      const r = 2;
      ctx.beginPath();
      ctx.moveTo(-bw / 2 + r, -bh / 2);
      ctx.lineTo(bw / 2 - r, -bh / 2);
      ctx.arcTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + r, r);
      ctx.lineTo(bw / 2, bh / 2 - r);
      ctx.arcTo(bw / 2, bh / 2, bw / 2 - r, bh / 2, r);
      ctx.lineTo(-bw / 2 + r, bh / 2);
      ctx.arcTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - r, r);
      ctx.lineTo(-bw / 2, -bh / 2 + r);
      ctx.arcTo(-bw / 2, -bh / 2, -bw / 2 + r, -bh / 2, r);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = `rgba(30, 90, 30, ${opacity * 0.6})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.font = `bold ${Math.round(size * 0.5)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
      ctx.fillText("₹", 0, 0);

      ctx.restore();
    }

    function drawRupee(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number
    ) {
      ctx.font = `${Math.round(size * 1.1)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(200, 160, 40, ${opacity})`;
      ctx.fillText("₹", x, y);
    }

    function tick(now: number) {
      ctx.clearRect(0, 0, w, h);

      let particleFadeFactor = 1;
      if (brandVisibleRef.current) {
        const elapsed = now - brandVisibleAtRef.current;
        particleFadeFactor = Math.max(0, 1 - elapsed / PARTICLE_FADE_MS);
        if (particleFadeFactor <= 0) {
          rafRef.current = 0;
          return;
        }
      }

      const currentPhase = phaseRef.current;
      if (currentPhase !== prevPhaseRef.current && currentPhase >= 0) {
        const burstCount = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < burstCount; i++) {
          const p = spawnParticle(cx, cy, w, h);
          p.speed = randomBetween(0.012, 0.022);
          p.baseOpacity = randomBetween(0.6, 0.9);
          particlesRef.current.push(p);
        }
        prevPhaseRef.current = currentPhase;
      }

      const particles = particlesRef.current;
      const targetCount = brandVisibleRef.current ? 0 : 20;

      if (particles.length < targetCount && currentPhase >= 0) {
        const toAdd = Math.min(2, targetCount - particles.length);
        for (let i = 0; i < toAdd; i++) {
          particles.push(spawnParticle(cx, cy, w, h));
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          if (brandVisibleRef.current) {
            particles.splice(i, 1);
            continue;
          }
          particles[i] = spawnParticle(cx, cy, w, h);
          continue;
        }

        const t = p.progress;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        p.x = p.startX + (p.targetX - p.startX) * ease;
        p.y = p.startY + (p.targetY - p.startY) * ease;

        const fadeIn = Math.min(1, t / 0.15);
        const fadeOut = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
        const shrink = 1 - t * 0.6;
        const opacity = p.baseOpacity * fadeIn * fadeOut * particleFadeFactor;
        const size = p.size * shrink;

        if (opacity <= 0.01) continue;

        if (p.type === "coin") {
          drawCoin(ctx, p.x, p.y, size, opacity);
        } else if (p.type === "bill") {
          drawBill(ctx, p.x, p.y, size, opacity, p.rotation, t);
        } else {
          drawRupee(ctx, p.x, p.y, size, opacity);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    initCanvas();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [initCanvas]);

  // ---- Phase timers ----
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase(0), 200));
    for (let i = 1; i < TOTAL_PHASES; i++) {
      timers.push(setTimeout(() => setPhase(i), 200 + i * PHASE_DURATION));
    }

    const buildEnd = 200 + TOTAL_PHASES * PHASE_DURATION;
    timers.push(setTimeout(() => setBrandVisible(true), buildEnd + 200));
    timers.push(
      setTimeout(() => setFadingOut(true), buildEnd + 200 + HOLD_DURATION)
    );
    timers.push(
      setTimeout(onComplete, buildEnd + 200 + HOLD_DURATION + FADE_DURATION)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const phaseStyle = (p: number) => ({
    opacity: phase >= p ? 1 : 0,
    transform:
      phase >= p ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
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
      {/* Layer 1: Money convergence canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Layer 2: House SVG */}
      <svg
        viewBox="0 0 280 260"
        width="280"
        height="260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative mb-8"
        style={{ zIndex: 1 }}
      >
        {/* Phase 0: Foundation */}
        <g style={phaseStyle(0)}>
          <line
            x1="30" y1="220" x2="250" y2="220"
            stroke="#0F0F5C" strokeWidth="3" strokeLinecap="round"
          />
          <rect x="60" y="200" width="160" height="20" rx="3"
            fill="#4A4ABF" stroke="#0F0F5C" strokeWidth="1.5"
          />
          <line x1="100" y1="200" x2="100" y2="220" stroke="#0F0F5C" strokeWidth="0.8" opacity="0.4" />
          <line x1="140" y1="200" x2="140" y2="220" stroke="#0F0F5C" strokeWidth="0.8" opacity="0.4" />
          <line x1="180" y1="200" x2="180" y2="220" stroke="#0F0F5C" strokeWidth="0.8" opacity="0.4" />
        </g>

        {/* Phase 1: Walls */}
        <g style={phaseStyle(1)}>
          <rect x="60" y="120" width="160" height="80"
            fill="#E6E4F5" stroke="#0F0F5C" strokeWidth="1.5"
          />
          {[0, 1, 2, 3].map((row) => (
            <g key={`brick-row-${row}`} opacity="0.15">
              <line x1="60" y1={132 + row * 18} x2="220" y2={132 + row * 18}
                stroke="#0F0F5C" strokeWidth="0.8"
              />
              {[0, 1, 2, 3].map((col) => (
                <line key={`brick-${row}-${col}`}
                  x1={80 + col * 40 + (row % 2 === 0 ? 0 : 20)}
                  y1={120 + row * 18}
                  x2={80 + col * 40 + (row % 2 === 0 ? 0 : 20)}
                  y2={132 + row * 18}
                  stroke="#0F0F5C" strokeWidth="0.8"
                />
              ))}
            </g>
          ))}
        </g>

        {/* Phase 2: Roof frame */}
        <g style={phaseStyle(2)}>
          <polygon points="140,55 50,120 230,120"
            fill="none" stroke="#0F0F5C" strokeWidth="2.5" strokeLinejoin="round"
          />
          <line x1="140" y1="55" x2="140" y2="120"
            stroke="#0F0F5C" strokeWidth="1.5" strokeDasharray="4 3"
          />
        </g>

        {/* Phase 3: Roof fill */}
        <g style={phaseStyle(3)}>
          <polygon points="140,55 50,120 230,120" fill="#2E2E8F" opacity="0.9" />
          {[0, 1, 2].map((i) => {
            const y = 75 + i * 16;
            const inset = ((y - 55) / (120 - 55)) * 90;
            return (
              <line key={`shingle-${i}`}
                x1={50 + inset} y1={y} x2={230 - inset} y2={y}
                stroke="#1C1C78" strokeWidth="1" opacity="0.5"
              />
            );
          })}
          <polygon points="140,55 50,120 230,120"
            fill="none" stroke="#0F0F5C" strokeWidth="2.5" strokeLinejoin="round"
          />
        </g>

        {/* Phase 4: Door & Windows */}
        <g style={phaseStyle(4)}>
          <rect x="122" y="155" width="36" height="45" rx="18" ry="18"
            fill="#1C1C78" stroke="#0F0F5C" strokeWidth="1.5"
          />
          <rect x="122" y="173" width="36" height="27"
            fill="#1C1C78" stroke="#0F0F5C" strokeWidth="1.5"
          />
          <circle cx="151" cy="183" r="2.5" fill="#E6E4F5" />

          <rect x="72" y="142" width="32" height="28" rx="2"
            fill="#4A4ABF" stroke="#0F0F5C" strokeWidth="1.5"
          />
          <line x1="88" y1="142" x2="88" y2="170" stroke="#0F0F5C" strokeWidth="1" />
          <line x1="72" y1="156" x2="104" y2="156" stroke="#0F0F5C" strokeWidth="1" />
          <rect x="74" y="144" width="12" height="10" rx="1" fill="white" opacity="0.25" />

          <rect x="176" y="142" width="32" height="28" rx="2"
            fill="#4A4ABF" stroke="#0F0F5C" strokeWidth="1.5"
          />
          <line x1="192" y1="142" x2="192" y2="170" stroke="#0F0F5C" strokeWidth="1" />
          <line x1="176" y1="156" x2="208" y2="156" stroke="#0F0F5C" strokeWidth="1" />
          <rect x="178" y="144" width="12" height="10" rx="1" fill="white" opacity="0.25" />
        </g>

        {/* Phase 5: Final touches */}
        <g style={phaseStyle(5)}>
          <rect x="180" y="60" width="18" height="35" rx="2"
            fill="#4A4ABF" stroke="#0F0F5C" strokeWidth="1.5"
          />
          <circle cx="189" cy="52" r="5" fill="#EEEDF8" opacity="0.7">
            <animate attributeName="cy" values="52;40;28" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.4;0" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="4;6;8" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="192" cy="46" r="4" fill="#EEEDF8" opacity="0.5">
            <animate attributeName="cy" values="46;34;22" dur="2.8s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="opacity" values="0.5;0.3;0" dur="2.8s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="r" values="3;5;7" dur="2.8s" repeatCount="indefinite" begin="0.6s" />
          </circle>

          {[0, 1, 2, 3].map((i) => (
            <ellipse key={`stone-${i}`}
              cx={140} cy={228 + i * 8}
              rx={10 + i * 2} ry={3}
              fill="#4A4ABF" opacity={0.5 - i * 0.08}
            />
          ))}

          <ellipse cx="50" cy="215" rx="16" ry="10" fill="#2E2E8F" opacity="0.5" />
          <ellipse cx="45" cy="212" rx="10" ry="7" fill="#4A4ABF" opacity="0.6" />
          <ellipse cx="230" cy="215" rx="16" ry="10" fill="#2E2E8F" opacity="0.5" />
          <ellipse cx="235" cy="212" rx="10" ry="7" fill="#4A4ABF" opacity="0.6" />

          <rect x="126" y="198" width="28" height="4" rx="1" fill="#1C1C78" opacity="0.7" />
        </g>
      </svg>

      {/* Brand name & tagline */}
      <div
        className="relative text-center"
        style={{
          zIndex: 1,
          opacity: brandVisible ? 1 : 0,
          transform: brandVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 500ms ease-out, transform 500ms ease-out",
        }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2E2E8F] drop-shadow-sm">
          UNLOQ1
        </h1>
        <p className="mt-1 text-sm font-medium text-[#0F0F5C] tracking-wide">
          Build your freedom
        </p>
      </div>

      {/* Progress area */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-56 flex flex-col items-center gap-3"
        style={{ zIndex: 1 }}
      >
        <p
          className="text-xs font-medium text-[#0F0F5C] h-4 text-center"
          style={{
            opacity: phase >= 0 && !brandVisible ? 1 : 0,
            transition: "opacity 300ms ease-out",
          }}
        >
          {phase >= 0 && phase < TOTAL_PHASES ? PHASE_LABELS[phase] : ""}
        </p>

        <div className="w-full h-1.5 rounded-full bg-[#E6E4F5] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressWidth}%`,
              background: "linear-gradient(90deg, #4A4ABF, #2E2E8F, #1C1C78)",
              transition: `width ${PHASE_DURATION}ms ${bounceEase}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
