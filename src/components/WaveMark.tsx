/**
 * The Aeyron mark: the app icon itself (three blue leaves on a white rounded
 * tile, public/apple-touch-icon.png, from the iOS AppIcon-1024.png). The tile
 * keeps the darkest leaf visible on the site's dark background, and matches
 * the share image and the icon on people's home screens. Every header, footer
 * and page mark uses this. The name is kept so callers don't change.
 */
export function WaveMark({ className = "" }: { className?: string }) {
  return (
    <img
      className={`rounded-[22%] object-contain ${className}`}
      src="/apple-touch-icon.png"
      alt=""
      width={28}
      height={28}
      decoding="async"
    />
  );
}
