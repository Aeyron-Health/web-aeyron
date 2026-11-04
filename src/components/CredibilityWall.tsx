import { type ReactNode } from "react";

/**
 * A clean, uniform credibility wall. The old source logos were inconsistent
 * (colored SVGs with white backgrounds, low-res PNGs, old-brand teal) and never
 * unified under a grayscale filter. Instead we render every affiliation as a
 * single-color wordmark at one optical weight, with crisp monochrome glyphs for
 * the few universally recognizable marks. Everything inherits `currentColor`, so
 * it sits perfectly in the footer's mist tone and brightens on hover.
 */

const glyphs: Record<string, ReactNode> = {
  Microsoft: (
    <svg
      viewBox="0 0 23 23"
      className="h-[15px] w-[15px] shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect width="10.4" height="10.4" />
      <rect x="12.6" width="10.4" height="10.4" />
      <rect y="12.6" width="10.4" height="10.4" />
      <rect x="12.6" y="12.6" width="10.4" height="10.4" />
    </svg>
  ),
  "Y Combinator": (
    <svg
      viewBox="0 0 24 24"
      className="h-[16px] w-[16px] shrink-0"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="22" height="22" rx="4.5" fill="currentColor" />
      <path
        d="M12 17.4 V13.2 M12 13.2 L8.7 8.4 M12 13.2 L15.3 8.4"
        fill="none"
        stroke="var(--color-night-deep)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export function CredibilityWall({ names }: { names: string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-7 gap-y-4 sm:gap-x-9">
      {names.map((name) => (
        <li key={name}>
          <span className="inline-flex items-center gap-2 text-mist/70 transition-colors duration-200 hover:text-mist">
            {glyphs[name]}
            <span className="font-display text-[0.98rem] font-medium tracking-tight">
              {name}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
