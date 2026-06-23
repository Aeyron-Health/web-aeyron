/* AEYRON — Breath Engine
 * One bone-white waveform that owns the whole page.
 * - Full-bleed fixed canvas behind everything
 * - State machine driven by ScrollTrigger (rate / amplitude / color / mode)
 * - Reduced-motion: renders a single static cycle and stops
 * - Single RAF, GPU-friendly stroke + glow
 */
(function () {
    'use strict';

    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Config / palette ───────────────────────────────────────── */
    const PALETTE = {
        bone: '#F4EFE6',
        teal: '#00E5C8',
        tomato: '#FF4530',
    };

    /* ── State (mutable, lerped toward target each frame) ───────── */
    const state = {
        rate: 12,           // breaths per minute
        amplitude: 0.30,    // 0..1 of canvas half-height
        color: PALETTE.bone,
        glow: 0.7,          // 0..1
        chaos: 0,           // 0..1 — randomized noise on amplitude
        opacityFactor: 1,
        mode: 'calm',       // calm | strain | spike | flatline | recovered
    };

    const target = { ...state };

    /* ── Canvas setup ───────────────────────────────────────────── */
    const canvas = document.createElement('canvas');
    canvas.id = 'breath-bg';
    canvas.style.cssText = [
        'position:fixed', 'inset:0',
        'width:100vw', 'height:100vh',
        'pointer-events:none',
        'z-index:9999',
        'opacity:0.4',
    ].join(';');
    const ctx = canvas.getContext('2d', { alpha: true });

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addEventListener('resize', resize, { passive: true });

    function attach() {
        if (!document.body) return;
        document.body.insertBefore(canvas, document.body.firstChild);
        resize();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attach);
    } else {
        attach();
    }

    /* ── Spike timeline (manual fire) ───────────────────────────── */
    let spikeUntil = 0;
    let flatUntil = 0;
    let screenShakeUntil = 0;

    function fireSpike() {
        const now = performance.now();
        spikeUntil = now + 250;
        flatUntil = now + 1050;          // 800ms flatline after spike
        screenShakeUntil = now + 180;
        // tactile screen shake — momentary, never re-enters
        const root = document.documentElement;
        root.style.transition = 'transform 30ms';
        let shakes = 0;
        const id = setInterval(() => {
            const k = (1 - shakes / 6);
            root.style.transform = `translate(${(Math.random() - 0.5) * 10 * k}px, ${(Math.random() - 0.5) * 6 * k}px)`;
            if (++shakes > 6) { clearInterval(id); root.style.transform = ''; }
        }, 28);
    }
    window.AEYRON_BREATH_SPIKE = fireSpike;     // exposed for ScrollTrigger callbacks

    /* ── State setter (called by main.js scroll listeners) ──────── */
    function setMode(mode) {
        target.mode = mode;
        switch (mode) {
            case 'calm':       Object.assign(target, { rate: 12, amplitude: 0.30, color: PALETTE.bone, glow: 0.7, chaos: 0 }); break;
            case 'strain':     Object.assign(target, { rate: 22, amplitude: 0.22, color: PALETTE.bone, glow: 0.6, chaos: 0.25 }); break;
            case 'crisis':     Object.assign(target, { rate: 28, amplitude: 0.16, color: PALETTE.tomato, glow: 0.9, chaos: 0.5 }); break;
            case 'recovered':  Object.assign(target, { rate: 14, amplitude: 0.32, color: PALETTE.teal, glow: 1.0, chaos: 0 }); break;
            case 'flat':       Object.assign(target, { rate: 0, amplitude: 0.02, color: PALETTE.tomato, glow: 0.2, chaos: 0 }); break;
        }
    }
    window.AEYRON_BREATH_SET = setMode;

    /* ── Render ─────────────────────────────────────────────────── */
    let phase = 0;
    let last = performance.now();
    let lungEl = null;
    let lungAccentPaths = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function render(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        // smooth state interpolation
        state.rate       = lerp(state.rate,       target.rate,       0.04);
        state.amplitude  = lerp(state.amplitude,  target.amplitude,  0.05);
        state.glow       = lerp(state.glow,       target.glow,       0.05);
        state.chaos      = lerp(state.chaos,      target.chaos,      0.05);
        // color blends component-wise — quick approximate by step-fading
        state.color = target.color;

        // breaths per second → angular velocity
        const omega = (state.rate / 60) * Math.PI * 2;
        phase += omega * dt;

        const W = canvas.clientWidth;
        const H = canvas.clientHeight;

        ctx.clearRect(0, 0, W, H);

        // Vignette mask handled by CSS opacity on canvas
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = state.color;
        ctx.shadowColor = state.color;
        ctx.shadowBlur = 18 * state.glow;

        const isFlat = now < flatUntil && state.mode !== 'recovered';
        const isSpike = now < spikeUntil && state.mode !== 'recovered';

        ctx.beginPath();
        const yMid = H * 0.5;
        const ampPx = H * state.amplitude;
        const segs = Math.max(120, Math.floor(W / 8));

        for (let i = 0; i <= segs; i++) {
            const t = i / segs;
            const x = t * W;

            let y;
            if (isFlat) {
                y = yMid + (Math.random() - 0.5) * 0.5;   // hairline flatline
            } else {
                // base sine
                let sin = Math.sin(phase + t * Math.PI * 6);
                // chaotic harmonics for "strain"
                if (state.chaos > 0.01) {
                    sin += Math.sin(phase * 2.3 + t * Math.PI * 11) * 0.2 * state.chaos;
                    sin += (Math.random() - 0.5) * state.chaos * 0.4;
                }
                y = yMid + sin * ampPx;
            }

            // Spike injection at center of canvas
            if (isSpike) {
                const cx = 0.5;
                const dx = Math.abs(t - cx);
                if (dx < 0.04) {
                    const p = 1 - dx / 0.04;
                    y -= p * H * 0.32 * Math.sign(Math.sin(phase));
                }
            }

            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Sync lung SVG breathing
        if (!lungEl) lungEl = document.querySelector('.lung-wrap');
        if (lungEl) {
            const breathPulse = isFlat ? 0 : Math.sin(phase);
            const scale = 1 + breathPulse * 0.045 + state.chaos * (Math.random() - 0.5) * 0.01;
            lungEl.style.transform = `scale(${scale.toFixed(4)})`;
            lungEl.style.transformOrigin = 'center center';
            // tomato tint when in crisis
            if (state.color === PALETTE.tomato) {
                lungEl.style.filter = 'hue-rotate(-90deg) saturate(1.4)';
            } else if (state.color === PALETTE.teal) {
                lungEl.style.filter = '';
            } else {
                lungEl.style.filter = '';
            }
        }

        if (!REDUCE) requestAnimationFrame(render);
    }

    if (REDUCE) {
        // single static draw
        addEventListener('load', () => { resize(); render(performance.now()); });
    } else {
        requestAnimationFrame(render);
    }

    /* ── Scroll-driven mode switching (auto-wire to known sections) ─ */
    function autoWire() {
        if (!window.gsap || !window.ScrollTrigger) return;
        const ST = window.ScrollTrigger;
        ST.create({ trigger: '#s1',  start: 'top top',         end: 'bottom top',  onEnter: () => setMode('calm'),   onEnterBack: () => setMode('calm') });
        ST.create({ trigger: '#s2',  start: 'top 70%',         end: 'bottom top',  onEnter: () => setMode('strain'), onEnterBack: () => setMode('strain') });
        ST.create({ trigger: '#s3',  start: 'top 70%',         end: 'bottom top',  onEnter: () => setMode('crisis'), onEnterBack: () => setMode('crisis') });
        ST.create({ trigger: '#s4',  start: 'top 70%',         end: 'bottom top',  onEnter: () => setMode('crisis'), onEnterBack: () => setMode('crisis') });
        ST.create({ trigger: '#s5',  start: 'top 70%',         end: 'bottom top',  onEnter: () => setMode('crisis'), onEnterBack: () => setMode('crisis') });
        ST.create({ trigger: '#s6',  start: 'top 60%',         end: 'bottom top',  onEnter: () => setMode('recovered'), onEnterBack: () => setMode('recovered') });
        ST.create({ trigger: '#s9',  start: 'top 70%',         end: 'bottom bottom', onEnter: () => setMode('recovered'), onEnterBack: () => setMode('recovered') });
    }
    window.addEventListener('load', () => setTimeout(autoWire, 100));
})();
