import { type ReactNode } from "react";

/**
 * Reusable phone device frame with a screen slot. Used by the supercharged
 * symptoms device and the real-screenshot gallery. Subtle bezel + notch, no
 * faked OS chrome. `screenClassName` styles the inner screen surface.
 */
export function PhoneFrame({
  children,
  className = "",
  screenClassName = "bg-night-deep",
}: {
  children?: ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div
      className={`relative mx-auto aspect-[9/19] w-full rounded-[2.2rem] border border-line-dark bg-night-raise p-2 shadow-[0_40px_90px_-30px_oklch(0.13_0.016_255/0.7),inset_0_1px_0_oklch(1_0_0/0.06)] ${className}`}
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-[1.7rem] ${screenClassName}`}
      >
        {/* notch */}
        <div className="absolute left-1/2 top-2.5 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/50" />
        {children}
      </div>
    </div>
  );
}
