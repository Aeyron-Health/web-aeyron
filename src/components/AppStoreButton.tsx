import { brand } from "../content/site";

/**
 * Link to Aeyron on the App Store. A plain button rather than Apple's badge
 * artwork (not in this repo); swap in the official badge SVG if it's added.
 */
export function AppStoreButton({
  compact = false,
  className = "",
  onClick,
}: {
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={brand.appStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-black font-medium text-white transition-[transform,background-color] duration-150 hover:bg-night-raise active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 ${
        compact ? "min-h-[42px] px-5 text-[0.9rem]" : "min-h-[48px] px-6 text-[0.95rem]"
      } ${className}`}
    >
      <svg width={compact ? 16 : 18} height={compact ? 16 : 18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v12m0 0-5-5m5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Download on the App Store
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
