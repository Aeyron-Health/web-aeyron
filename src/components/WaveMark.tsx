/**
 * The Aeyron mark: the app icon's three blue leaves, on a transparent
 * background (public/brand, from the app's aeyron-logo-transparent.png).
 * Every header, footer and page mark uses this, so the site and the app
 * always show the same logo. The name is kept so callers don't change.
 */
export function WaveMark({ className = "" }: { className?: string }) {
  return (
    <img
      className={`object-contain ${className}`}
      src="/brand/aeyron-mark-96.png"
      srcSet="/brand/aeyron-mark-96.png 96w, /brand/aeyron-mark.png 256w"
      sizes="28px"
      alt=""
      width={28}
      height={28}
      decoding="async"
    />
  );
}
