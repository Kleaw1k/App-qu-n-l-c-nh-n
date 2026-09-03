import * as THREE from 'three';
import './style.css';

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070b, 0.055);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 9);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const world = new THREE.Group();
scene.add(world);

const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.8, 5),
  new THREE.MeshPhysicalMaterial({
    color: 0x0a3b4e, metalness: 0.82, roughness: 0.18,
    emissive: 0x001d2a, emissiveIntensity: 0.8,
    clearcoat: 1, clearcoatRoughness: 0.12
  })
);
world.add(core);

const wire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.86, 3),
  new THREE.MeshBasicMaterial({ color: 0x28d8ff, wireframe: true, transparent: true, opacity: 0.11 })
);
world.add(wire);

const rings = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35 + i * 0.16, 0.008, 8, 100),
    new THREE.MeshBasicMaterial({ color: i === 1 ? 0x7beaff : 0x168ca9, transparent: true, opacity: 0.55 - i * 0.12 })
  );
  ring.rotation.set(i * 1.05, i * 0.55, i * 0.2);
  rings.add(ring);
}
world.add(rings);

const count = 800;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const radius = 3.5 + Math.random() * 4.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  particlesGeometry,
  new THREE.PointsMaterial({ color: 0x61dcff, size: 0.018, transparent: true, opacity: 0.72, sizeAttenuation: true })
);
scene.add(particles);

scene.add(new THREE.AmbientLight(0x19516a, 1.6));
const keyLight = new THREE.DirectionalLight(0xc2f5ff, 4);
keyLight.position.set(4, 3, 5);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x007da7, 18, 15);
rimLight.position.set(-4, -2, 2);
scene.add(rimLight);

let pointer = { x: 0, y: 0 };
let scrollProgress = 0;
addEventListener('pointermove', (event) => {
  pointer.x = event.clientX / innerWidth - 0.5;
  pointer.y = event.clientY / innerHeight - 0.5;
});
addEventListener('scroll', () => {
  scrollProgress = scrollY / Math.max(document.body.scrollHeight - innerHeight, 1);
}, { passive: true });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
});

const clock = new THREE.Clock();
function animate() {
  const elapsed = clock.getElapsedTime();
  world.rotation.y += (pointer.x * 0.55 - world.rotation.y) * 0.025;
  world.rotation.x += (-pointer.y * 0.28 - world.rotation.x) * 0.025;
  world.rotation.z = Math.sin(elapsed * 0.18) * 0.04;
  core.rotation.y += 0.0016;
  wire.rotation.y -= 0.0009;
  rings.rotation.y = elapsed * 0.12;
  particles.rotation.y = elapsed * 0.018;
  particles.rotation.x = scrollProgress * 0.45;
  camera.position.y += (-scrollProgress * 3.2 - camera.position.y) * 0.035;
  camera.position.z += (9 - scrollProgress * 2.2 - camera.position.z) * 0.035;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible'));
}, { threshold: 0.16 });
document.querySelectorAll('.feature-card, .statement-copy, .contact form').forEach((element) => observer.observe(element));
