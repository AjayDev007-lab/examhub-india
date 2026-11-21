"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { soundEngine } from "@/lib/spidermanAudio";

export type SpiderManActionState = 
  | "idle"
  | "point_email"
  | "type_email"
  | "cover_eyes"
  | "peek"
  | "look_button"
  | "focused_login"
  | "celebrate"
  | "error";

interface SpiderManLive3DCanvasProps {
  actionState: SpiderManActionState;
  onStateChange?: (state: SpiderManActionState) => void;
  typingProgress?: number;
  className?: string;
}

export default function SpiderManLive3DCanvas({
  actionState,
  onStateChange,
  typingProgress = 0,
  className = "",
}: SpiderManLive3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGLStatus, setWebGLStatus] = useState<string>("Initializing 3D...");
  const [activeDebugState, setActiveDebugState] = useState<SpiderManActionState>(actionState);

  // Sync state
  const stateRef = useRef(actionState);
  stateRef.current = actionState;

  const typingProgressRef = useRef(typingProgress);
  typingProgressRef.current = typingProgress;

  useEffect(() => {
    setActiveDebugState(actionState);
  }, [actionState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mountRef.current;
    if (!canvas || !container) return;

    // 1. PROCEDURAL SPIDER-MAN SUIT WEBBED TEXTURE
    const createSuitTexture = () => {
      const texCanvas = document.createElement("canvas");
      texCanvas.width = 512;
      texCanvas.height = 512;
      const ctx = texCanvas.getContext("2d");
      if (!ctx) return null;

      // Base Red Fabric
      ctx.fillStyle = "#d41822";
      ctx.fillRect(0, 0, 512, 512);

      // Micro fabric weave
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      for (let x = 0; x < 512; x += 4) {
        ctx.fillRect(x, 0, 2, 512);
      }
      for (let y = 0; y < 512; y += 4) {
        ctx.fillRect(0, y, 512, 2);
      }

      // Black Web Grid Lines
      ctx.strokeStyle = "#140303";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      // Radial web lines
      const cx = 256;
      const cy = 256;
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 320, cy + Math.sin(angle) * 320);
        ctx.stroke();
      }

      // Concentric web arches
      for (let r = 35; r < 300; r += 38) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.5, 1.5);
      return texture;
    };

    const suitWebTexture = createSuitTexture();

    // 2. SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070f26, 0.04);

    const initialW = container.clientWidth || 500;
    const initialH = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(36, initialW / initialH, 0.1, 50);
    camera.position.set(0, 1.15, 3.4);
    camera.lookAt(0, 1.05, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(initialW, initialH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      setWebGLStatus("WebGL 3D Active (60 FPS)");
    } catch (err) {
      setWebGLStatus("WebGL Error");
      return;
    }

    // 3. CINEMATIC LIGHTING
    const ambientLight = new THREE.AmbientLight(0x102d59, 2.5);
    scene.add(ambientLight);

    // Key Light - Electric Cyan
    const keyLight = new THREE.SpotLight(0x06b6d4, 10, 15, Math.PI / 4, 0.3, 1);
    keyLight.position.set(2.8, 3.2, 3);
    scene.add(keyLight);

    // Rim Light - Vivid Spider-Man Red
    const rimLight = new THREE.DirectionalLight(0xff2222, 5.5);
    rimLight.position.set(-3.2, 2.2, -2);
    scene.add(rimLight);

    // Bounce fill
    const fillLight = new THREE.PointLight(0x38bdf8, 3.5, 8);
    fillLight.position.set(0, -0.8, 2);
    scene.add(fillLight);

    // 4. FLOATING 3D HOLOGRAPHIC PARTICLES
    const particleCount = 100;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = Math.random() * 4 - 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 5. MATERIALS
    const suitRedMat = new THREE.MeshStandardMaterial({
      color: 0xd91b24,
      map: suitWebTexture || undefined,
      roughness: 0.4,
      metalness: 0.15,
    });

    const suitBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b5c,
      roughness: 0.35,
      metalness: 0.25,
    });

    const eyeLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.9,
      roughness: 0.08,
      metalness: 0.05,
    });

    const blackWebMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

    // 6. ASSEMBLE 3D SPIDER-MAN SKELETAL RIG
    const characterRoot = new THREE.Group();
    characterRoot.position.set(-0.25, 0.15, 0);
    scene.add(characterRoot);

    // Pelvis & Hips
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.85;
    characterRoot.add(pelvis);

    const pelvisMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.2, 0.22, 16),
      suitBlueMat
    );
    pelvis.add(pelvisMesh);

    // Spine & Torso
    const spine = new THREE.Group();
    spine.position.y = 0.16;
    pelvis.add(spine);

    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.26;
    spine.add(chestGroup);

    // Sculpted Muscular Chest
    const chestCenter = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.4, 0.28),
      suitRedMat
    );
    chestGroup.add(chestCenter);

    const leftLat = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.36, 0.25), suitBlueMat);
    leftLat.position.x = -0.2;
    chestGroup.add(leftLat);

    const rightLat = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.36, 0.25), suitBlueMat);
    rightLat.position.x = 0.2;
    chestGroup.add(rightLat);

    // 3D Spider Emblem (Chest)
    const spiderEmblem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.075, 0),
      blackWebMat
    );
    spiderEmblem.position.set(0, 0.05, 0.145);
    spiderEmblem.scale.set(1.4, 1.9, 0.25);
    chestGroup.add(spiderEmblem);

    // Neck & Head
    const neck = new THREE.Group();
    neck.position.y = 0.25;
    chestGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.16;
    neck.add(headGroup);

    // 3D Mask Sphere (Sculpted oval)
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 20),
      suitRedMat
    );
    headMesh.scale.set(0.92, 1.14, 1.05);
    headGroup.add(headMesh);

    // Large Expressive White Eye Lenses (Protruding cleanly on mask surface)
    const createEye = (isRight: boolean) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(isRight ? 0.088 : -0.088, 0.03, 0.245);
      eyeGroup.rotation.z = isRight ? -0.22 : 0.22;
      eyeGroup.rotation.y = isRight ? 0.25 : -0.25;

      const frame = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.085, 16),
        blackWebMat
      );
      frame.scale.set(1, 1.45, 1);
      eyeGroup.add(frame);

      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.078, 16),
        eyeLensMat
      );
      lens.scale.set(0.92, 1.4, 1);
      lens.position.z = 0.006;
      eyeGroup.add(lens);

      return { eyeGroup, lens, frame };
    };

    const leftEye = createEye(false);
    const rightEye = createEye(true);
    headGroup.add(leftEye.eyeGroup);
    headGroup.add(rightEye.eyeGroup);

    // ARMS
    // Left Arm
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.26, 0.16, 0);
    chestGroup.add(leftShoulder);

    const leftUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.32, 12),
      suitBlueMat
    );
    leftUpperArm.position.y = -0.16;
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.y = -0.32;
    leftShoulder.add(leftElbow);

    const leftForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.05, 0.3, 12),
      suitRedMat
    );
    leftForearm.position.y = -0.15;
    leftElbow.add(leftForearm);

    const leftHand = new THREE.Group();
    leftHand.position.y = -0.3;
    leftElbow.add(leftHand);

    const leftHandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.05),
      suitRedMat
    );
    leftHand.add(leftHandMesh);

    // Right Arm (Interactive Pointer / Web Shooter)
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.26, 0.16, 0);
    chestGroup.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.32, 12),
      suitBlueMat
    );
    rightUpperArm.position.y = -0.16;
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.y = -0.32;
    rightShoulder.add(rightElbow);

    const rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.05, 0.3, 12),
      suitRedMat
    );
    rightForearm.position.y = -0.15;
    rightElbow.add(rightForearm);

    const rightHand = new THREE.Group();
    rightHand.position.y = -0.3;
    rightElbow.add(rightHand);

    const rightHandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.05),
      suitRedMat
    );
    rightHand.add(rightHandMesh);

    // Pointing finger
    const rightPointerFinger = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.12, 8),
      suitRedMat
    );
    rightPointerFinger.position.set(0.03, -0.09, 0.01);
    rightHand.add(rightPointerFinger);

    // Wrist Web Shooter Nozzle
    const webShooterNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
    );
    webShooterNozzle.position.set(0, 0.03, 0.03);
    webShooterNozzle.rotation.x = Math.PI / 2;
    rightHand.add(webShooterNozzle);

    // LEGS
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.14, -0.1, 0);
    pelvis.add(leftHip);

    const leftThigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.065, 0.42, 12),
      suitBlueMat
    );
    leftThigh.position.y = -0.21;
    leftHip.add(leftThigh);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -0.42;
    leftHip.add(leftKnee);

    const leftCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.4, 12),
      suitRedMat // Red boots
    );
    leftCalf.position.y = -0.2;
    leftKnee.add(leftCalf);

    const rightHip = new THREE.Group();
    rightHip.position.set(0.14, -0.1, 0);
    pelvis.add(rightHip);

    const rightThigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.065, 0.42, 12),
      suitBlueMat
    );
    rightThigh.position.y = -0.21;
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -0.42;
    rightHip.add(rightKnee);

    const rightCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.055, 0.4, 12),
      suitRedMat // Red boots
    );
    rightCalf.position.y = -0.2;
    rightKnee.add(rightCalf);

    // Initial athletic superhero posture
    leftHip.rotation.z = 0.15;
    leftKnee.rotation.x = 0.2;
    rightHip.rotation.z = -0.2;
    rightKnee.rotation.x = 0.35;
    characterRoot.rotation.y = 0.28;

    // 7. REAL 3D LUMINOUS WEB STRAND
    const webPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.7, 0.15, 0),
      new THREE.Vector3(1.5, -0.05, 0),
      new THREE.Vector3(2.6, 0.1, 0),
    ];
    const webCurve = new THREE.CatmullRomCurve3(webPoints);
    let webTubeGeom = new THREE.TubeGeometry(webCurve, 20, 0.016, 6, false);
    const webMesh = new THREE.Mesh(
      webTubeGeom,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 })
    );
    webMesh.visible = false;
    scene.add(webMesh);

    // 8. ROBUST RESIZEOBSERVER (Prevents 0x0 or Skewed Canvas)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 9. ANIMATION LOOP (Live 60 FPS requestAnimationFrame)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let lastAction = "";

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentAction = stateRef.current;

      // Audio triggers on state change
      if (currentAction !== lastAction) {
        if (currentAction === "point_email") {
          soundEngine.playWebShoot();
        } else if (currentAction === "celebrate") {
          soundEngine.playSuccessChime();
        } else if (currentAction === "error") {
          soundEngine.playErrorSound();
        } else {
          soundEngine.playWhoosh();
        }
        lastAction = currentAction;
      }

      // Continuous Idle Breathing & Movement (Never Frozen)
      const breath = 1 + Math.sin(elapsed * 2.8) * 0.035;
      chestGroup.scale.set(breath, breath, breath);
      pelvis.position.y = 0.85 + Math.sin(elapsed * 2.8) * 0.015;
      characterRoot.position.y = 0.15 + Math.sin(elapsed * 1.8) * 0.02;

      // Floating particles
      particles.rotation.y = elapsed * 0.05;
      particles.rotation.x = Math.sin(elapsed * 0.08) * 0.1;

      // Blinking cycle
      blinkTimer += delta;
      if (blinkTimer > 3.5) {
        isBlinking = true;
        if (blinkTimer > 3.68) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }
      const eyeScaleY = isBlinking ? 0.06 : 1.0;
      leftEye.eyeGroup.scale.y = THREE.MathUtils.lerp(leftEye.eyeGroup.scale.y, eyeScaleY, 0.45);
      rightEye.eyeGroup.scale.y = THREE.MathUtils.lerp(rightEye.eyeGroup.scale.y, eyeScaleY, 0.45);

      // Target Rotations
      let targetHeadRotY = 0.25;
      let targetHeadRotX = 0;
      let targetRShoulderX = 0;
      let targetRShoulderZ = -0.3;
      let targetRElbowX = 0;
      let targetLShoulderX = 0;
      let targetLShoulderZ = 0.3;
      let targetLElbowX = 0;
      let targetBodyRotY = 0.25;
      let showWeb = false;

      const lookFollowX = Math.max(-0.4, Math.min(0.4, mouseX * 0.35));
      const lookFollowY = Math.max(-0.3, Math.min(0.3, mouseY * 0.25));

      // Animation State Evaluation
      switch (currentAction) {
        case "point_email":
          targetBodyRotY = 0.42;
          targetHeadRotY = 0.58;
          targetHeadRotX = 0.05;
          targetRShoulderX = -1.55;
          targetRShoulderZ = -0.45;
          targetRElbowX = -0.2;
          targetLShoulderX = 0.2;
          targetLShoulderZ = 0.4;
          showWeb = true;
          break;

        case "type_email":
          const progress = typingProgressRef.current;
          targetBodyRotY = 0.35;
          targetHeadRotY = 0.45 + progress * 0.15;
          targetHeadRotX = Math.sin(elapsed * 6) * 0.08;
          targetRShoulderX = -1.2;
          targetRShoulderZ = -0.3;
          targetRElbowX = -0.5;
          targetLShoulderX = 0.1;
          targetLShoulderZ = 0.35;
          break;

        case "cover_eyes":
          targetBodyRotY = 0.15;
          targetHeadRotY = 0.05;
          targetHeadRotX = -0.1;
          targetRShoulderX = -2.2;
          targetRShoulderZ = 0.6;
          targetRElbowX = -1.6;
          targetLShoulderX = -2.2;
          targetLShoulderZ = -0.6;
          targetLElbowX = -1.6;
          break;

        case "peek":
          targetBodyRotY = 0.3;
          targetHeadRotY = 0.4;
          targetHeadRotX = 0.15;
          targetRShoulderX = -2.0;
          targetRShoulderZ = 0.35;
          targetRElbowX = -1.4;
          targetLShoulderX = -2.0;
          targetLShoulderZ = -0.35;
          targetLElbowX = -1.4;
          rightEye.eyeGroup.scale.x = 1.3;
          break;

        case "look_button":
          targetBodyRotY = 0.4;
          targetHeadRotY = 0.5;
          targetHeadRotX = -0.25;
          targetRShoulderX = -0.5;
          targetRShoulderZ = -0.2;
          targetRElbowX = -0.4;
          break;

        case "focused_login":
          targetBodyRotY = 0.2;
          targetHeadRotY = 0.3;
          targetHeadRotX = 0.1;
          targetRShoulderX = -0.9;
          targetRShoulderZ = -0.5;
          targetRElbowX = -1.1;
          targetLShoulderX = -0.9;
          targetLShoulderZ = 0.5;
          targetLElbowX = -1.1;
          break;

        case "celebrate":
          characterRoot.position.y = 0.45 + Math.abs(Math.sin(elapsed * 5)) * 0.35;
          targetBodyRotY = Math.sin(elapsed * 4) * 0.25;
          targetHeadRotY = 0;
          targetHeadRotX = 0.3;
          targetRShoulderX = -2.9;
          targetRShoulderZ = -0.4;
          targetRElbowX = 0.1;
          targetLShoulderX = -2.9;
          targetLShoulderZ = 0.4;
          targetLElbowX = 0.1;
          break;

        case "error":
          targetBodyRotY = 0.1;
          targetHeadRotY = -0.2;
          targetHeadRotX = 0.25;
          targetRShoulderX = -2.5;
          targetRShoulderZ = 0.3;
          targetRElbowX = -2.1;
          targetLShoulderX = 0;
          targetLShoulderZ = 0.4;
          break;

        case "idle":
        default:
          targetBodyRotY = 0.25 + lookFollowX * 0.3;
          targetHeadRotY = 0.25 + lookFollowX * 0.6;
          targetHeadRotX = lookFollowY;
          targetRShoulderX = Math.sin(elapsed * 1.5) * 0.08;
          targetRShoulderZ = -0.3 + Math.sin(elapsed * 1.2) * 0.05;
          targetRElbowX = -0.2;
          targetLShoulderX = Math.sin(elapsed * 1.5 + 1) * 0.08;
          targetLShoulderZ = 0.3 + Math.sin(elapsed * 1.2 + 1) * 0.05;
          targetLElbowX = -0.2;
          break;
      }

      // Lerp Skeleton
      const lerpSpeed = 0.14;
      characterRoot.rotation.y = THREE.MathUtils.lerp(characterRoot.rotation.y, targetBodyRotY, lerpSpeed);
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, lerpSpeed);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, lerpSpeed);

      rightShoulder.rotation.x = THREE.MathUtils.lerp(rightShoulder.rotation.x, targetRShoulderX, lerpSpeed);
      rightShoulder.rotation.z = THREE.MathUtils.lerp(rightShoulder.rotation.z, targetRShoulderZ, lerpSpeed);
      rightElbow.rotation.x = THREE.MathUtils.lerp(rightElbow.rotation.x, targetRElbowX, lerpSpeed);

      leftShoulder.rotation.x = THREE.MathUtils.lerp(leftShoulder.rotation.x, targetLShoulderX, lerpSpeed);
      leftShoulder.rotation.z = THREE.MathUtils.lerp(leftShoulder.rotation.z, targetLShoulderZ, lerpSpeed);
      leftElbow.rotation.x = THREE.MathUtils.lerp(leftElbow.rotation.x, targetLElbowX, lerpSpeed);

      // Web mesh positioning
      webMesh.visible = showWeb;
      if (showWeb) {
        const wristPos = new THREE.Vector3();
        webShooterNozzle.getWorldPosition(wristPos);
        webPoints[0].copy(wristPos);
        webPoints[1].set(wristPos.x + 0.6, wristPos.y + 0.15, wristPos.z);
        webPoints[2].set(wristPos.x + 1.3, wristPos.y - 0.05, wristPos.z);
        webPoints[3].set(wristPos.x + 2.2, 1.2, 0);
        webCurve.points = webPoints;
        webTubeGeom.dispose();
        webTubeGeom = new THREE.TubeGeometry(webCurve, 16, 0.016, 6, false);
        webMesh.geometry = webTubeGeom;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  const triggerManualAction = (state: SpiderManActionState) => {
    setActiveDebugState(state);
    onStateChange?.(state);
  };

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[480px] sm:h-[560px] overflow-hidden ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Live WebGL Engine Status Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 backdrop-blur-md shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>{webGLStatus}</span>
      </div>

      {/* Manual Action State Triggers (For immediate testing) */}
      <div className="absolute top-3 right-3 z-20 hidden sm:flex flex-wrap items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-md">
        {(["idle", "point_email", "cover_eyes", "peek", "celebrate"] as SpiderManActionState[]).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => triggerManualAction(st)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              activeDebugState === st
                ? "bg-cyan-500 text-black shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {st === "point_email" ? "Point" : st === "cover_eyes" ? "Hide" : st}
          </button>
        ))}
      </div>
    </div>
  );
}
