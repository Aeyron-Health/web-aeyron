import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three/examples/jsm/lines/Line2.js";

/**
 * The "Signal Field" backbone: several luminous biosignal traces flowing through
 * 3D space at different depths, plus a faint drifting particle haze. Each trace
 * is a HORIZONTAL oscilloscope-style line with BOUNDED depth weave - so it
 * always reads as a flowing signal and never collapses into a tangled coil.
 * Group rotation is kept to small angles (never end-on). Traces are energetic
 * and jittery near the top of the page (the unmonitored "problem") and resolve
 * into calm, confident waves lower down - driven by scroll via a ref, so there
 * are no per-frame React re-renders.
 */

const N = 200;
const SPAN = 12.5;

type ThreadCfg = {
  yOffset: number;
  zDepth: number;
  amp: number;
  f1: number;
  f2: number;
  f3: number;
  speed: number;
  phase: number;
  core: string;
  halo: string;
  coreOpacity: number;
  haloOpacity: number;
  coreWidth: number;
  haloWidth: number;
};

const THREADS: ThreadCfg[] = [
  // foreground hero trace (brightest)
  { yOffset: 0.1, zDepth: 0.3, amp: 0.95, f1: 1.0, f2: 2.2, f3: 1.0, speed: 0.85, phase: 0, core: "#79a6ff", halo: "#9cc0ff", coreOpacity: 0.95, haloOpacity: 0.18, coreWidth: 2, haloWidth: 6.5 },
  // mid trace
  { yOffset: -1.0, zDepth: -0.7, amp: 0.72, f1: 1.3, f2: 1.7, f3: 1.4, speed: 0.62, phase: 1.6, core: "#5685ee", halo: "#7ba2f3", coreOpacity: 0.6, haloOpacity: 0.11, coreWidth: 1.6, haloWidth: 5 },
  // far trace (faintest, deepest)
  { yOffset: 1.15, zDepth: -1.3, amp: 0.6, f1: 0.8, f2: 2.7, f3: 0.9, speed: 1.05, phase: 3.1, core: "#4673d8", halo: "#6791e6", coreOpacity: 0.42, haloOpacity: 0.07, coreWidth: 1.3, haloWidth: 4 },
];

function writeThread(out: Float32Array, time: number, energy: number, cfg: ThreadCfg) {
  const flow = time * cfg.speed;
  const drift = Math.sin(time * 0.18 + cfg.phase) * 0.18;
  // As the page resolves (energy -> 0), the traces converge toward center and
  // swell into one confident, coherent signal.
  const converge = 1 - energy;
  const yOff = cfg.yOffset * (1 - 0.55 * converge);
  const amp = cfg.amp * (1 + 0.22 * converge);
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const x = (u - 0.5) * SPAN;
    const env = Math.sin(u * Math.PI); // fade to nothing at the ends
    const y =
      yOff +
      drift +
      env *
        amp *
        (Math.sin(x * cfg.f1 + flow) +
          0.45 * Math.sin(x * cfg.f2 - flow * 0.7 + cfg.phase) +
          energy * 0.7 * Math.sin(x * cfg.f3 * 3 + flow * 2.4));
    const z = cfg.zDepth + env * 0.5 * Math.sin(x * 0.6 + flow * 0.7 + cfg.phase);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
}

function Thread({ cfg, energyRef }: { cfg: ThreadCfg; energyRef: React.MutableRefObject<number> }) {
  const coreRef = useRef<Line2>(null);
  const haloRef = useRef<Line2>(null);
  const buffer = useMemo(() => new Float32Array(N * 3), []);
  const initial = useMemo(() => {
    const b = new Float32Array(N * 3);
    writeThread(b, 0, 0, cfg);
    return Array.from(b);
  }, [cfg]);

  useFrame((state) => {
    writeThread(buffer, state.clock.elapsedTime, energyRef.current, cfg);
    const flat = Array.from(buffer);
    coreRef.current?.geometry.setPositions(flat);
    haloRef.current?.geometry.setPositions(flat);
  });

  return (
    <group>
      <Line ref={haloRef} points={initial} color={cfg.halo} lineWidth={cfg.haloWidth} transparent opacity={cfg.haloOpacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      <Line ref={coreRef} points={initial} color={cfg.core} lineWidth={cfg.coreWidth} transparent opacity={cfg.coreOpacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 320;
  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i * 3] = (((i * 73) % 100) / 100 - 0.5) * 16;
      a[i * 3 + 1] = (((i * 37) % 100) / 100 - 0.5) * 9;
      a[i * 3 + 2] = (((i * 53) % 100) / 100 - 0.5) * 5 - 1;
    }
    return a;
  }, []);

  useFrame((state) => {
    const p = ref.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    const arr = p.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] += 0.004 + (i % 5) * 0.0006; // slow drift
      if (arr[i * 3] > 8) arr[i * 3] = -8;
      arr[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0008;
    }
    p.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#6f97e8" transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const energyRef = useRef(1);
  const targetEnergy = useRef(1);
  const scrollRef = useRef(0); // eased 0..1 page progress
  const targetScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      targetScroll.current = Math.min(1, Math.max(0, p));
      // energetic near the top, calm lower down
      targetEnergy.current = Math.min(1, Math.max(0, 1 - (p - 0.04) / 0.5));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state) => {
    energyRef.current += (targetEnergy.current - energyRef.current) * 0.04;
    scrollRef.current += (targetScroll.current - scrollRef.current) * 0.06;
    const s = scrollRef.current;
    const t = state.clock.elapsedTime;

    // Cinematic camera journey: dolly in and rise as you descend the page, so
    // it feels like travelling INTO the resolving signal. Subtle, eased, bounded.
    const cam = state.camera;
    cam.position.z = 7.4 - s * 2.7; // 7.4 -> 4.7
    cam.position.y = -0.2 + s * 0.55 + Math.sin(t * 0.15) * 0.12;
    cam.position.x = Math.sin(t * 0.1) * 0.25;
    cam.lookAt(0, s * 0.2, 0);

    const g = groupRef.current;
    if (g) {
      // bounded motion only - never end-on, never tangles
      g.rotation.x = -0.12 + Math.sin(t * 0.1) * 0.05 + state.pointer.y * 0.06;
      g.rotation.y = Math.sin(t * 0.08) * 0.1 + state.pointer.x * 0.12 + s * 0.18;
      g.rotation.z = state.pointer.x * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <Particles />
      {THREADS.map((cfg, i) => (
        <Thread key={i} cfg={cfg} energyRef={energyRef} />
      ))}
    </group>
  );
}

export default function SignalThread3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
