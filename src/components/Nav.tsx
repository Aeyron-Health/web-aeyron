import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { nav, brand } from "../content/site";
import { Button } from "./Button";
import { WaveMark } from "./WaveMark";
import { AppStoreButton } from "./AppStoreButton";

/**
 * Slim sticky nav. Transparent over the dark hero, then resolves to a solid
 * canvas bar once scrolled. Mobile drawer with Esc + scroll-lock.
 */
export function Nav() {
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid
          ? "border-b border-line bg-canvas/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between" aria-label="Primary">
        <a
          href="#top"
          className={`flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight ${
            solid ? "text-ink" : "text-mist"
          }`}
        >
          <WaveMark className="h-7 w-7" />
          <span>{brand.wordmark}</span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 xl:flex">
          <ul className="flex items-center gap-7">
            {nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`text-[0.92rem] transition-colors ${
                    solid
                      ? "text-ink-soft hover:text-ink"
                      : "text-mist-soft hover:text-mist"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={nav.contact.href}
                className={`text-[0.92rem] transition-colors ${
                  solid
                    ? "text-ink-soft hover:text-ink"
                    : "text-mist-soft hover:text-mist"
                }`}
              >
                {nav.contact.label}
              </a>
            </li>
          </ul>
          <AppStoreButton compact />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className={`flex h-11 w-11 items-center justify-center xl:hidden ${
            solid ? "text-ink" : "text-mist"
          }`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="relative h-4 w-6">
            <span
              className={`absolute left-0 h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-6 bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-line bg-canvas xl:hidden"
          >
            <ul className="shell flex flex-col gap-1 py-4">
              {nav.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base text-ink hover:bg-canvas-sunk"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={nav.contact.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base text-ink hover:bg-canvas-sunk"
                >
                  {nav.contact.label}
                </a>
              </li>
              <li className="flex flex-col gap-3 px-3 pt-3">
                <AppStoreButton className="w-full" onClick={() => setOpen(false)} />
                <Button href={nav.cta.href} variant="ghost" className="w-full" onClick={() => setOpen(false)}>
                  {nav.cta.label}
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
