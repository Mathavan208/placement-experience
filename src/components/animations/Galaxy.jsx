// src/components/animations/Galaxy.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Galaxy({
  starsCount = 12000,
  starSize = 0.7,
  speed = 0.0006,
}) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      5000
    );
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // create stars
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = -Math.random() * 1000;

      const c = new THREE.Color();
      c.setHSL(0.6 + Math.random() * 0.4, 0.7, 0.5 + Math.random() * 0.5);
      colors[i3 + 0] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: starSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frameId;
    function animate() {
      points.rotation.y += speed;
      points.rotation.x += speed * 0.3;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [starsCount, starSize, speed]);

  return <div ref={mountRef} className="absolute inset-0 -z-30 w-full h-full" />;
}
