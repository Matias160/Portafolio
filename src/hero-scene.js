/*
  HERO 3D SCENE - THREE.JS
  Floating retro 80s 3D motion design objects with cursor parallax tracking
*/

import * as THREE from 'three';

export function initHeroScene() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;
  const container = canvas.parentElement;

  const scene = new THREE.Scene();

  // Camera
  const width = container?.clientWidth || window.innerWidth;
  const height = container?.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 10);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 1.8);
  dirLight1.position.set(5, 8, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xec4899, 1.5);
  dirLight2.position.set(-5, -5, -2);
  scene.add(dirLight2);

  const pointLight = new THREE.PointLight(0xf59e0b, 2, 20);
  pointLight.position.set(0, 0, 4);
  scene.add(pointLight);

  // Group for floating objects
  const floatingGroup = new THREE.Group();
  scene.add(floatingGroup);

  // 1. Central Metallic Torus Knot (Retro Sculptural Ring)
  const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
  const knotMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    wireframe: false
  });
  const mainKnot = new THREE.Mesh(knotGeo, knotMat);
  mainKnot.position.set(0, 0.2, 0);
  floatingGroup.add(mainKnot);

  // 2. Translucent Glass Sphere
  const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xec4899,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 1.2,
    ior: 1.5,
    transparent: true,
    opacity: 0.8
  });
  const glassSphere = new THREE.Mesh(sphereGeo, glassMat);
  glassSphere.position.set(-3.2, 1.5, -1);
  floatingGroup.add(glassSphere);

  // 3. Retro Camera Box Model (Konica tribute mockup)
  const cameraGroup = new THREE.Group();
  const camBodyGeo = new THREE.BoxGeometry(1.4, 0.9, 0.5);
  const camBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.3 });
  const camBody = new THREE.Mesh(camBodyGeo, camBodyMat);
  cameraGroup.add(camBody);

  const lensGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.1 });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.3;
  cameraGroup.add(lens);

  cameraGroup.position.set(3.4, -1.2, 0.5);
  floatingGroup.add(cameraGroup);

  // 4. Retro Cassette Tape Mockup
  const cassetteGroup = new THREE.Group();
  const casGeo = new THREE.BoxGeometry(1.6, 1.0, 0.2);
  const casMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 });
  const casMesh = new THREE.Mesh(casGeo, casMat);
  cassetteGroup.add(casMesh);

  const holeGeo = new THREE.TorusGeometry(0.18, 0.05, 16, 32);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
  const hole1 = new THREE.Mesh(holeGeo, holeMat);
  hole1.position.set(-0.4, 0, 0.11);
  const hole2 = new THREE.Mesh(holeGeo, holeMat);
  hole2.position.set(0.4, 0, 0.11);
  cassetteGroup.add(hole1, hole2);

  cassetteGroup.position.set(-2.8, -1.8, -0.5);
  floatingGroup.add(cassetteGroup);

  // 5. Background Particle Field
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 20;
    particlePositions[i + 1] = (Math.random() - 0.5) * 20;
    particlePositions[i + 2] = (Math.random() - 0.5) * 15;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.6
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse Interactivity Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const onMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onMouseMove);

  // Resize Handler
  const onResize = () => {
    const nextWidth = container?.clientWidth || window.innerWidth;
    const nextHeight = container?.clientHeight || window.innerHeight;
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
  };
  window.addEventListener('resize', onResize);

  // Animation Loop
  const startTime = performance.now();
  let animationFrame = 0;

  function animate() {
    animationFrame = requestAnimationFrame(animate);
    const elapsedTime = (performance.now() - startTime) / 1000;

    // Rotate individual meshes
    mainKnot.rotation.x = elapsedTime * 0.4;
    mainKnot.rotation.y = elapsedTime * 0.6;

    glassSphere.position.y = 1.5 + Math.sin(elapsedTime * 1.5) * 0.25;
    glassSphere.rotation.z = elapsedTime * 0.3;

    cameraGroup.rotation.y = elapsedTime * 0.5;
    cameraGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.15;
    cameraGroup.position.y = -1.2 + Math.cos(elapsedTime * 1.8) * 0.2;

    cassetteGroup.rotation.x = elapsedTime * 0.3;
    cassetteGroup.rotation.y = elapsedTime * 0.4;
    cassetteGroup.position.y = -1.8 + Math.sin(elapsedTime * 2.0) * 0.15;

    particles.rotation.y = elapsedTime * 0.05;

    // Smooth Mouse Parallax Tracking
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    floatingGroup.rotation.y = targetX * 0.4;
    floatingGroup.rotation.x = -targetY * 0.4;

    renderer.render(scene, camera);
  }

  animate();

  return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    particleGeo.dispose();
    particleMat.dispose();
    knotGeo.dispose();
    knotMat.dispose();
    sphereGeo.dispose();
    glassMat.dispose();
    camBodyGeo.dispose();
    camBodyMat.dispose();
    lensGeo.dispose();
    lensMat.dispose();
    casGeo.dispose();
    casMat.dispose();
    holeGeo.dispose();
    holeMat.dispose();
  };
}
