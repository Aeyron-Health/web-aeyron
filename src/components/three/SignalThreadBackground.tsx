import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

const SignalThread3D = lazy(() => import("./SignalThread3D"));

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

class Boundary extends Component<
  { children: ReactNode },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? null : this.props.children;
  }
}

/**
 * The persistent "Signal Thread" backbone. A single fixed canvas on a dark base,
 * behind all content (content sits in a `relative z-10` layer above it). Opaque
 * light sections cover it; transparent dark sections reveal it - so the thread
 * "comes up" as you scroll through the dark interludes. Loaded ~after first
 * paint so it never delays LCP; disabled (just the dark base) under reduced
 * motion or without WebGL.
 */
export function SignalThreadBackground() {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
    const id = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(id);
  }, []);

  // Only run the continuous 3D on large screens. Phones/tablets get the calm
  // dark base instead, avoiding the battery/GPU cost of an always-on canvas.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLarge(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const show = !reduced && webgl && ready && isLarge;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-night-deep"
    >
      {show && (
        <Boundary>
          <Suspense fallback={null}>
            <SignalThread3D />
          </Suspense>
        </Boundary>
      )}
    </div>
  );
}
