import * as THREE from 'three';

// --- Setup Scene, Camera, Renderer ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010118);
scene.fog = new THREE.FogExp2(0x010118, 0.0008);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Deeltjes systeem ---
const particleCount = 4000;
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const radius = 5 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.8;
    const z = radius * Math.cos(phi) * 1.2;
    
    positions[i*3] = x;
    positions[i*3+1] = y * 1.5;
    positions[i*3+2] = z;
    
    const colorChoice = Math.random();
    if (colorChoice < 0.33) {
        colors[i*3] = 0.2 + Math.random()*0.5;
        colors[i*3+1] = 0.6 + Math.random()*0.4;
        colors[i*3+2] = 1.0;
    } else if (colorChoice < 0.66) {
        colors[i*3] = 0.8 + Math.random()*0.2;
        colors[i*3+1] = 0.2 + Math.random()*0.3;
        colors[i*3+2] = 0.8 + Math.random()*0.2;
    } else {
        colors[i*3] = 1.0;
        colors[i*3+1] = 0.9 + Math.random()*0.1;
        colors[i*3+2] = 0.8 + Math.random()*0.2;
    }
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const createParticleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.arc(16, 16, 14, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.arc(16, 16, 6, 0, 2 * Math.PI);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
};

const particleMaterial = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    map: createParticleTexture()
});

const particleSystem = new THREE.Points(geometry, particleMaterial);
scene.add(particleSystem);

// --- Glow punten ---
const glowGeometry = new THREE.BufferGeometry();
const glowCount = 200;
const glowPositions = new Float32Array(glowCount * 3);
for (let i = 0; i < glowCount; i++) {
    glowPositions[i*3] = (Math.random() - 0.5) * 14;
    glowPositions[i*3+1] = (Math.random() - 0.5) * 8;
    glowPositions[i*3+2] = (Math.random() - 0.5) * 12 - 5;
}
glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
const glowMaterial = new THREE.PointsMaterial({
    color: 0x88aaff,
    size: 0.25,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.4
});
const glowPoints = new THREE.Points(glowGeometry, glowMaterial);
scene.add(glowPoints);

// --- Ringen ---
const centerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.05, 64, 200),
    new THREE.MeshStandardMaterial({ color: 0x66ccff, emissive: 0x2266aa, emissiveIntensity: 0.8 })
);
scene.add(centerRing);

const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.03, 64, 200),
    new THREE.MeshStandardMaterial({ color: 0xff66cc, emissive: 0x551133, emissiveIntensity: 0.6 })
);
scene.add(ring2);

// --- Verlichting ---
const ambientLight = new THREE.AmbientLight(0x111122);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x88aaff, 1);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);
const backLight = new THREE.PointLight(0xff66aa, 0.8);
backLight.position.set(-2, -1, -5);
scene.add(backLight);

// --- Muis interactie ---
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    targetRotationY = mouseX * 0.5;
    targetRotationX = mouseY * 0.3;
    
    const glowCursor = document.querySelector('.cursor-glow');
    if (glowCursor) {
        glowCursor.style.left = event.clientX + 'px';
        glowCursor.style.top = event.clientY + 'px';
    }
});

// --- Toggle functie ---
let isParticleAnimationActive = true;
const toggleBtn = document.getElementById('toggleParticles');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        isParticleAnimationActive = !isParticleAnimationActive;
        toggleBtn.textContent = isParticleAnimationActive ? "✦ DEELTJES STOP ✦" : "✦ DEELTJES START ✦";
    });
}

// --- Animatie variabelen ---
let currentRotX = 0;
let currentRotY = 0;
let time = 0;

// --- Render Loop ---
function animate() {
    requestAnimationFrame(animate);
    time += 0.008;
    
    currentRotX += (targetRotationX - currentRotX) * 0.05;
    currentRotY += (targetRotationY - currentRotY) * 0.05;
    
    if (isParticleAnimationActive) {
        particleSystem.rotation.x = currentRotX * 0.5;
        particleSystem.rotation.y = currentRotY * 0.8;
        particleSystem.rotation.z = Math.sin(time * 0.2) * 0.1;
        
        glowPoints.rotation.x = currentRotX * 0.3;
        glowPoints.rotation.y = currentRotY * 0.5;
        
        centerRing.rotation.x = Math.sin(time * 0.5) * 0.3;
        centerRing.rotation.y = time * 0.6;
        ring2.rotation.x = Math.cos(time * 0.4) * 0.2;
        ring2.rotation.z = time * 0.4;
        
        camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
    } else {
        camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
    }
    
    pointLight.position.x = 2 + Math.sin(time) * 0.5;
    pointLight.intensity = 0.8 + Math.sin(time * 1.7) * 0.3;
    backLight.intensity = 0.6 + Math.cos(time * 1.2) * 0.3;
    
    renderer.render(scene, camera);
}

animate();

// --- Responsive ---
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
