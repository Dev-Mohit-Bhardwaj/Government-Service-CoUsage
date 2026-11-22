import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

/**
 * CIVIC ORBIT — Cinematic 3D Digital Globe
 * Pure Three.js implementation with holographic network nodes,
 * orbital paths, floating particles, and dual-theme (Dark Obsidian / Light Quartz) visuals.
 */
export default function CivicOrbitGlobe({ isEntering = false, onReady = null }) {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Theme palette mappings
    const fogColor = isDark ? 0x050816 : 0xF8FAFC;
    const wireframeColor = isDark ? 0x00D9FF : 0x0284C7;
    const innerColor = isDark ? 0x080D1C : 0xE2E8F0;
    const ringColor = isDark ? 0x6C63FF : 0x6366F1;
    const starColor = isDark ? 0x38BDF8 : 0x64748B;
    const connectionColor = isDark ? 0x00D9FF : 0x0284C7;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(fogColor, 0.0018);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 260);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(fogColor, 0);
    container.appendChild(renderer.domElement);

    // 4. Core Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 75;

    // A. Holographic Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 36);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.09 : 0.14,
    });
    const wireframeSphere = new THREE.Mesh(sphereGeo, wireframeMat);
    globeGroup.add(wireframeSphere);

    // B. Inner Atmospheric Glow Sphere
    const innerGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: innerColor,
      transparent: true,
      opacity: isDark ? 0.85 : 0.45,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // C. Glowing Latitude & Longitude Concentric Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: isDark ? 0.28 : 0.35,
    });
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = GLOBE_RADIUS * Math.sin(phi);
      const ringY = GLOBE_RADIUS * Math.cos(phi);
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(ringRadius * Math.cos(theta), ringY, ringRadius * Math.sin(theta)));
      }
      ringGeo.setFromPoints(points);
      const latRing = new THREE.Line(ringGeo, ringMat);
      globeGroup.add(latRing);
    }

    // D. Holographic Network Nodes
    const nodeCount = 30;
    const nodePositions = [];
    const nodeGroup = new THREE.Group();
    globeGroup.add(nodeGroup);

    const nodeGeometry = new THREE.SphereGeometry(1.4, 16, 16);
    const nodeMaterials = isDark ? [
      new THREE.MeshBasicMaterial({ color: 0x00D9FF }), // Cyan
      new THREE.MeshBasicMaterial({ color: 0x6C63FF }), // Violet
      new THREE.MeshBasicMaterial({ color: 0xA78BFA }), // Purple
      new THREE.MeshBasicMaterial({ color: 0xF5C76A }), // Gold
    ] : [
      new THREE.MeshBasicMaterial({ color: 0x0284C7 }), // Sapphire
      new THREE.MeshBasicMaterial({ color: 0x6366F1 }), // Royal Indigo
      new THREE.MeshBasicMaterial({ color: 0x8B5CF6 }), // Purple
      new THREE.MeshBasicMaterial({ color: 0xD97706 }), // Amber
    ];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const x = GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi);

      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      const mat = nodeMaterials[i % nodeMaterials.length];
      const nodeMesh = new THREE.Mesh(nodeGeometry, mat);
      nodeMesh.position.copy(pos);
      nodeGroup.add(nodeMesh);

      // Node aura glow ring
      const auraGeo = new THREE.RingGeometry(1.8, 2.6, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: mat.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.45 : 0.55,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.position.copy(pos.clone().multiplyScalar(1.02));
      aura.lookAt(pos.clone().multiplyScalar(2));
      nodeGroup.add(aura);
    }

    // E. Bezier Curved Connection Lines between Nodes
    const connectionMat = new THREE.LineBasicMaterial({
      color: connectionColor,
      transparent: true,
      opacity: isDark ? 0.35 : 0.45,
    });
    const connectionGroup = new THREE.Group();
    globeGroup.add(connectionGroup);

    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist > 30 && dist < 85) {
          const v1 = nodePositions[i];
          const v2 = nodePositions[j];
          const mid = v1.clone().add(v2).multiplyScalar(0.5);
          mid.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.22);

          const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
          const pts = curve.getPoints(24);
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const line = new THREE.Line(geo, connectionMat);
          connectionGroup.add(line);
        }
      }
    }

    // F. Animated Orbital Rings with Satellite Particles
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const orbitConfigs = isDark ? [
      { radius: 105, tiltX: 0.45, tiltZ: 0.2, speed: 0.008, color: 0x00D9FF, size: 2.2 },
      { radius: 118, tiltX: -0.6, tiltZ: -0.3, speed: -0.006, color: 0x6C63FF, size: 2.0 },
      { radius: 130, tiltX: 0.8, tiltZ: -0.5, speed: 0.005, color: 0xF5C76A, size: 1.8 },
    ] : [
      { radius: 105, tiltX: 0.45, tiltZ: 0.2, speed: 0.008, color: 0x0284C7, size: 2.2 },
      { radius: 118, tiltX: -0.6, tiltZ: -0.3, speed: -0.006, color: 0x6366F1, size: 2.0 },
      { radius: 130, tiltX: 0.8, tiltZ: -0.5, speed: 0.005, color: 0xD97706, size: 1.8 },
    ];

    const satellites = [];

    orbitConfigs.forEach((cfg) => {
      const ringPts = [];
      for (let i = 0; i <= 96; i++) {
        const angle = (i / 96) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(angle) * cfg.radius, 0, Math.sin(angle) * cfg.radius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
      const ringLineMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: isDark ? 0.22 : 0.3,
      });
      const orbitRing = new THREE.Line(ringGeo, ringLineMat);
      orbitRing.rotation.x = cfg.tiltX;
      orbitRing.rotation.z = cfg.tiltZ;
      orbitGroup.add(orbitRing);

      const satGeo = new THREE.SphereGeometry(cfg.size, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({ color: cfg.color });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.rotation.x = cfg.tiltX;
      satMesh.rotation.z = cfg.tiltZ;
      scene.add(satMesh);

      satellites.push({
        mesh: satMesh,
        radius: cfg.radius,
        tiltX: cfg.tiltX,
        tiltZ: cfg.tiltZ,
        speed: cfg.speed,
        angle: Math.random() * Math.PI * 2,
      });
    });

    // G. Ambient Background Floating Stars / Light Points
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 1800;
    const starCoords = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 800;
      starCoords[i + 1] = (Math.random() - 0.5) * 800;
      starCoords[i + 2] = (Math.random() - 0.5) * 600 - 50;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({
      color: starColor,
      size: isDark ? 1.2 : 1.4,
      transparent: true,
      opacity: isDark ? 0.65 : 0.5,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 5. Mouse Parallax Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseMove = (event) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = mouseX * 0.35;
      targetRotationX = -mouseY * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    if (onReady) {
      onReady();
    }

    // 7. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;
      globeGroup.rotation.x = currentRotationX;
      globeGroup.rotation.y += 0.0035 + currentRotationY * 0.02;

      starField.rotation.y += 0.0003;

      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        const localX = Math.cos(sat.angle) * sat.radius;
        const localZ = Math.sin(sat.angle) * sat.radius;

        const pos = new THREE.Vector3(localX, 0, localZ);
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.tiltX);
        pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), sat.tiltZ);
        sat.mesh.position.copy(pos);
      });

      if (isEntering) {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 360, 0.04);
        globeGroup.position.y = THREE.MathUtils.lerp(globeGroup.position.y, -40, 0.03);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      wireframeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringMat.dispose();
      connectionMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
    };
  }, [isEntering, onReady, isDark]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}
