/**
 * AEYRON device section: load PebbleDevice.stl, fit 250×370 frame, drag to rotate.
 */
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const DEG = Math.PI / 180;

function fitMeshToPivot(meshWrapper, pivot) {
    meshWrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(meshWrapper);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
    const scale = 1.55 / maxDim;
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
    const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 200);
    camera.position.set(0, 0.08, 2.35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    wrap.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.52));
    const key = new THREE.DirectionalLight(0xffffff, 0.92);
    key.position.set(1.1, 1.8, 1.2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb8d4ff, 0.38);
    rim.position.set(-1.4, 0.2, -1.1);
    scene.add(rim);

    const pivot = new THREE.Group();
    scene.add(pivot);

    let rotX = 0;
    let rotY = 0;
    const sens = 0.45;
    const maxX = 25;
    const baseX = -16 * DEG;
    const baseY = 20 * DEG;

    function applyRotation() {
        pivot.rotation.set(baseX + rotX * DEG, baseY + rotY * DEG, 0, 'YXZ');
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
                color: 0xededed,
                metalness: 0.14,
                roughness: 0.44
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

    function onFrame() {
        requestAnimationFrame(onFrame);
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
        rotX = Math.max(-maxX, Math.min(maxX, rotX));
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
