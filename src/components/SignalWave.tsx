import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

type SignalWaveProps = {
  className?: string;
  /** stroke color (CSS color); defaults to currentColor */
  color?: string;
  /** px height of the drawing box */
  height?: number;
  /** how "tremor-like" the line is: 0 = calm, 1 = active */
  intensity?: number;
  strokeWidth?: number;
  /** seconds for one drift cycle */
  speed?: number;
};

/**
 * The core brand motif: a continuous oscilloscope/biosignal line. Two stacked
 * copies drift left to create a seamless scroll; a faint baseline grid sits
 * behind. Static (centered, no animation) under prefers-reduced-motion.
 */
export function SignalWave({
  className = "",
  color = "currentColor",
  height = 120,
  intensity = 0.5,
  strokeWidth = 2,
  speed = 7,
}: SignalWaveProps) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const w = 600;
  const mid = height / 2;

  // Build a deterministic, signal-looking path across width `w`.
  const amp = (height / 2 - 6) * (0.35 + intensity * 0.6);
  const pts: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const k = i / steps;
    // mix of frequencies -> reads like a tremor trace, with quieter shoulders
    const env = Math.sin(k * Math.PI); // quiet at the ends so the loop is seamless
    const y =
      mid -
      env *
        amp *
        (0.6 * Math.sin(k * 22) +
          0.3 * Math.sin(k * 41 + 1.3) +
          0.25 * Math.sin(k * 7 + 0.6));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const d = `M ${pts.join(" L ")}`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${height}`}
      width="100%"
      height={height}
      fill="none"
      role="img"
      aria-label="Biosignal waveform"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`fade-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.15" stopColor={color} stopOpacity="1" />
          <stop offset="0.85" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line
        x1="0"
        y1={mid}
        x2={w}
        y2={mid}
        stroke={color}
        strokeOpacity="0.12"
        strokeWidth="1"
      />

      {reduced ? (
        <path d={d} stroke={`url(#fade-${id})`} strokeWidth={strokeWidth} strokeLinecap="round" />
      ) : (
        <motion.g
          animate={{ x: [0, -w] }}
          transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        >
          <path d={d} stroke={`url(#fade-${id})`} strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={d}
            stroke={`url(#fade-${id})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            transform={`translate(${w},0)`}
          />
        </motion.g>
      )}
    </svg>
  );
}
