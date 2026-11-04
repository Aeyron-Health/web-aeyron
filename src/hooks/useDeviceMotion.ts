import { useCallback, useEffect, useRef, useState } from "react";

export type MotionStatus = "idle" | "unsupported" | "denied" | "running";

export type MotionSample = { t: number; m: number };

/**
 * Reads the device accelerometer to power the live "feel your own tremor" demo.
 * Performance-first: raw samples land in a ring buffer (ref), NOT React state,
 * so the consuming component animates from `dataRef` in its own rAF loop and we
 * never re-render at sensor rate. Handles the iOS 13+ permission gesture.
 *
 * `m` is the gravity-removed acceleration magnitude (m/s^2) - a proxy for how
 * much the hand is shaking. This is a wellness demo of the signal we capture,
 * not a clinical measurement.
 */
export function useDeviceMotion(bufferSize = 256) {
  const [status, setStatus] = useState<MotionStatus>("idle");
  const dataRef = useRef<MotionSample[]>([]);
  const handlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  const supported =
    typeof window !== "undefined" &&
    typeof (window as unknown as { DeviceMotionEvent?: unknown })
      .DeviceMotionEvent !== "undefined";

  const start = useCallback(async () => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    const DME = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DME.requestPermission === "function") {
      try {
        const res = await DME.requestPermission();
        if (res !== "granted") {
          setStatus("denied");
          return;
        }
      } catch {
        setStatus("denied");
        return;
      }
    }

    const handler = (e: DeviceMotionEvent) => {
      const acc = e.acceleration;
      const accG = e.accelerationIncludingGravity;
      let m = 0;
      if (acc && acc.x != null) {
        m = Math.hypot(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
      } else if (accG && accG.x != null) {
        // Fallback: deviation of total magnitude from 1g
        const g = Math.hypot(accG.x ?? 0, accG.y ?? 0, accG.z ?? 0);
        m = Math.abs(g - 9.81);
      }
      const buf = dataRef.current;
      buf.push({ t: e.timeStamp, m });
      if (buf.length > bufferSize) buf.shift();
    };

    handlerRef.current = handler;
    window.addEventListener("devicemotion", handler);
    setStatus("running");
  }, [supported, bufferSize]);

  const stop = useCallback(() => {
    if (handlerRef.current) {
      window.removeEventListener("devicemotion", handlerRef.current);
      handlerRef.current = null;
    }
    dataRef.current = [];
    setStatus("idle");
  }, []);

  useEffect(
    () => () => {
      if (handlerRef.current)
        window.removeEventListener("devicemotion", handlerRef.current);
    },
    [],
  );

  /** Recent RMS magnitude - a simple "shakiness" readout (m/s^2). */
  const readRms = useCallback(() => {
    const buf = dataRef.current;
    if (!buf.length) return 0;
    const meanSq = buf.reduce((s, v) => s + v.m * v.m, 0) / buf.length;
    return Math.sqrt(meanSq);
  }, []);

  return { status, supported, start, stop, dataRef, readRms };
}
