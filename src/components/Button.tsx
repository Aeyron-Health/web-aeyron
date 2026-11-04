import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Tone = "light" | "dark";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "min-h-[48px] px-6 text-[0.95rem] transition-[transform,background-color,border-color,color] " +
  "duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 cursor-pointer select-none";

function classesFor(variant: Variant, tone: Tone): string {
  if (variant === "primary") {
    return `${base} bg-signal text-white hover:bg-signal-deep shadow-[0_6px_22px_-8px_oklch(0.565_0.188_255/0.6)]`;
  }
  if (variant === "secondary") {
    return tone === "dark"
      ? `${base} bg-white/8 text-mist border border-line-dark hover:bg-white/14`
      : `${base} bg-ink text-canvas hover:bg-ink/85`;
  }
  // ghost
  return tone === "dark"
    ? `${base} text-mist border border-line-dark hover:bg-white/8`
    : `${base} text-ink border border-line-strong hover:bg-canvas-sunk`;
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  tone?: Tone;
  className?: string;
  type?: "button" | "submit";
  "aria-label"?: string;
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  tone = "light",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = `${classesFor(variant, tone)} ${className}`;
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
