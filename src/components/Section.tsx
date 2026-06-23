import { type ReactNode } from "react";

type Tone = "light" | "sunk" | "dark" | "night-deep" | "clear";

const toneClass: Record<Tone, string> = {
  light: "bg-canvas text-ink",
  sunk: "bg-canvas-sunk text-ink",
  dark: "bg-night text-mist",
  "night-deep": "bg-night-deep text-mist",
  // transparent: reveals the fixed Signal Thread backbone behind it
  clear: "bg-transparent text-mist",
};

type SectionProps = {
  id?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  /** vertical padding rhythm; "tight" for closing/short sections */
  pad?: "default" | "tight" | "none";
  full?: boolean;
  "aria-label"?: string;
};

/**
 * Semantic section wrapper. Owns the page's vertical rhythm and tone surfaces.
 * Inner content is constrained by `.shell` unless `full` is set.
 */
export function Section({
  id,
  tone = "light",
  children,
  className = "",
  pad = "default",
  full = false,
  ...rest
}: SectionProps) {
  const padding =
    pad === "none" ? "" : pad === "tight" ? "py-16 sm:py-20" : "py-24 sm:py-32";
  return (
    <section
      id={id}
      className={`relative ${toneClass[tone]} ${padding} ${className}`}
      {...rest}
    >
      {full ? children : <div className="shell">{children}</div>}
    </section>
  );
}
