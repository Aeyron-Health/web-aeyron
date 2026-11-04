/**
 * Evolved Aeyron mark: the wave-in-a-ring, redrawn flat and crisp.
 * Inherits color from `currentColor` (ring) with the signal accent on the wave.
 */
export function WaveMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <path
        d="M5 16 Q9 8 13 16 Q16 22 19 16 Q23 8 27 16"
        stroke="var(--color-signal-hi)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
