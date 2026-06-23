/**
 * AEYRON device section: load PebbleDevice.stl, fit 250×370 frame, drag to rotate.
 */
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const DEG = Math.PI / 180;

/** Smaller on-screen = more padding (matches reference framing). */
const FIT_SCALE = 1.06;

function fitMeshToPivot(meshWrapper, pivot) {
    meshWrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(meshWrapper);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
    const scale = FIT_SCALE / maxDim;
    meshWrapper.scale.setScalar(scale);
    meshWrapper.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(meshWrapper);
    const c = box2.getCenter(new THREE.Vector3());
    meshWrapper.position.sub(c);
    pivot.add(meshWrapper);
}

function init() {
    const root = document.getElementById('pebble-root');
    const wrap = document.getElementById('pebble-canvas-wrap');
    if (!root || !wrap)
        return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.02, 200);
    camera.position.set(0.06, 0.04, 2.72);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    wrap.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3038, 0.28));

    const key = new THREE.DirectionalLight(0xffffff, 0.78);
    key.position.set(0.4, 1.25, 0.55);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xf2f4f8, 0.28);
    fill.position.set(-0.85, 0.35, 0.45);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xc8d4e8, 0.18);
    rim.position.set(-0.2, -0.4, -1.2);
    scene.add(rim);

    /** Teal "breath" point light — pulses with global breath phase. */
    const breathLight = new THREE.PointLight(0x00E5C8, 0.0, 6, 1.6);
    breathLight.position.set(0, 0, 1.4);
    scene.add(breathLight);

    const pivot = new THREE.Group();
    scene.add(pivot);

    let rotX = 0;
    let rotY = 0;
    const sens = 0.45;
    /** Upright egg, ~18° Y to show front + left profile (reference). */
    const baseX = -9 * DEG;
    const baseY = 18 * DEG;
    /** Scroll-driven extra Y rotation through the s6 section. */
    let scrollOrbit = 0; // degrees, lerps in render loop

    function applyRotation() {
        pivot.rotation.set(
            baseX + rotX * DEG,
            baseY + (rotY + scrollOrbit) * DEG,
            0,
            'YXZ'
        );
    }

    applyRotation();

    const stlUrl = new URL('../PebbleDevice.stl', import.meta.url).href;
    const loader = new STLLoader();

    loader.load(
        stlUrl,
        (geometry) => {
            geometry.computeVertexNormals();
            geometry.center();
            const mat = new THREE.MeshStandardMaterial({
                color: 0xf7f7f6,
                metalness: 0.03,
                roughness: 0.78
            });
            const mesh = new THREE.Mesh(geometry, mat);
            const meshWrapper = new THREE.Group();
            meshWrapper.add(mesh);
            mesh.rotation.x = -Math.PI / 2;
            mesh.updateMatrixWorld(true);
            fitMeshToPivot(meshWrapper, pivot);
        },
        undefined,
        () => {
            wrap.innerHTML =
                '<img class="pebble-img pebble-img-fallback" src="prototype.png" alt="Respira pebble hardware prototype" width="250" height="370" draggable="false">';
        }
    );

    function resize() {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        if (w < 2 || h < 2)
            return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    /* ── Scroll-orbit + visibility gating ───────────────────────── */
    let inView = true;
    const s6 = document.getElementById('s6');
    if (s6 && 'IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { inView = e.isIntersecting; },
            { rootMargin: '200px 0px' }).observe(s6);
    }
    function updateScrollOrbit() {
        if (!s6) return;
        const r = s6.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
        const target = (p - 0.5) * 60; // -30deg → +30deg through section
        scrollOrbit += (target - scrollOrbit) * 0.08;
    }

    /* Drive breath-glow from global breath phase if available, else local sin */
    let breathPhase = 0;
    let lastT = performance.now();
    function onFrame(t) {
        requestAnimationFrame(onFrame);
        if (!inView) return;
        const dt = Math.min(0.05, ((t || performance.now()) - lastT) / 1000);
        lastT = t || performance.now();
        // 14 bpm "recovered" rate when device is shown
        breathPhase += (14 / 60) * Math.PI * 2 * dt;
        const pulse = 0.5 + 0.5 * Math.sin(breathPhase);
        breathLight.intensity = 0.6 + pulse * 1.2;
        updateScrollOrbit();
        applyRotation();
        renderer.render(scene, camera);
    }
    onFrame();

    let dragging = false;
    let lx = 0;
    let ly = 0;

    function onMove(e) {
        if (!dragging)
            return;
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        lx = e.clientX;
        ly = e.clientY;
        rotY += dx * sens;
        rotX -= dy * sens;
        applyRotation();
    }

    function onUp(e) {
        dragging = false;
        try {
            root.releasePointerCapture(e.pointerId);
        } catch (err) {}
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onUp);
    }

    function onDown(e) {
        if (e.pointerType === 'mouse' && e.button !== 0)
            return;
        dragging = true;
        lx = e.clientX;
        ly = e.clientY;
        root.setPointerCapture(e.pointerId);
        root.addEventListener('pointermove', onMove);
        root.addEventListener('pointerup', onUp);
        root.addEventListener('pointercancel', onUp);
    }

    root.addEventListener('pointerdown', onDown);
}

if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
else
    init();
