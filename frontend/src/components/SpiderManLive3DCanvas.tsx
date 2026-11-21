"use client";

import React, { useEffect, useRef } from "react";
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
  typingProgress = 0,
  className = "",
}: SpiderManLive3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync refs so requestAnimationFrame always reads freshest state without tearing
  const stateRef = useRef(actionState);
  stateRef.current = actionState;

  const typingProgressRef = useRef(typingProgress);
  typingProgressRef.current = typingProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mountRef.current;
    if (!canvas || !container) return;

    // 1. PROCEDURAL HIGH-RESOLUTION SPIDER-MAN SUIT WEBBED TEXTURE
    const createSuitTexture = () => {
      const texCanvas = document.createElement("canvas");
      texCanvas.width = 512;
      texCanvas.height = 512;
      const ctx = texCanvas.getContext("2d");
      if (!ctx) return null;

      // Base Red Superhero Fabric
      ctx.fillStyle = "#DC2626";
      ctx.fillRect(0, 0, 512, 512);

      // Micro fabric cross-weave
      ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      for (let x = 0; x < 512; x += 4) {
        ctx.fillRect(x, 0, 2, 512);
      }
      for (let y = 0; y < 512; y += 4) {
        ctx.fillRect(0, y, 512, 2);
      }

      // Crisp Black Web Grid Lines
      ctx.strokeStyle = "#1A0505";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      // Radial web lines radiating from center
      const cx = 256;
      const cy = 256;
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 320, cy + Math.sin(angle) * 320);
        ctx.stroke();
      }

      // Concentric web loops
      for (let r = 30; r < 320; r += 36) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.6, 1.6);
      return texture;
    };

    // 2. PROCEDURAL SOFT CONTACT GROUND SHADOW TEXTURE
    const createGroundShadowTexture = () => {
      const sCanvas = document.createElement("canvas");
      sCanvas.width = 256;
      sCanvas.height = 256;
      const sCtx = sCanvas.getContext("2d");
      if (!sCtx) return null;

      const gradient = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      gradient.addColorStop(0, "rgba(2, 6, 23, 0.75)");
      gradient.addColorStop(0.35, "rgba(2, 6, 23, 0.50)");
      gradient.addColorStop(0.7, "rgba(2, 6, 23, 0.18)");
      gradient.addColorStop(1, "rgba(2, 6, 23, 0)");

      sCtx.fillStyle = gradient;
      sCtx.beginPath();
      sCtx.arc(128, 128, 120, 0, Math.PI * 2);
      sCtx.fill();

      return new THREE.CanvasTexture(sCanvas);
    };

    const suitWebTexture = createSuitTexture();
    const groundShadowTexture = createGroundShadowTexture();

    // 3. SCENE, CAMERA & TRANSPARENT RENDERER
    const scene = new THREE.Scene();
    scene.background = null; // 100% transparent to float directly on the website background!

    const initialW = container.clientWidth || 560;
    const initialH = container.clientHeight || 640;

    // Full-body perspective camera (captures head to boots)
    const camera = new THREE.PerspectiveCamera(34, initialW / initialH, 0.1, 50);
    camera.position.set(-0.1, 1.05, 3.8);
    camera.lookAt(-0.1, 0.95, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true, // Transparent WebGL scene
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0); // 0 alpha clear color
      renderer.setSize(initialW, initialH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
    } catch {
      return;
    }

    // 4. SOFT CONTACT GROUND SHADOW PLANE
    if (groundShadowTexture) {
      const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: groundShadowTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
      groundShadow.rotation.x = -Math.PI / 2;
      groundShadow.position.set(-0.25, 0.01, 0);
      scene.add(groundShadow);
    }

    // 5. CINEMATIC SUPERHERO LIGHTING
    const ambientLight = new THREE.AmbientLight(0x0e2a47, 2.8);
    scene.add(ambientLight);

    // Key Light - Electric Cyan Rim
    const keyLight = new THREE.SpotLight(0x06b6d4, 11, 16, Math.PI / 4, 0.3, 1);
    keyLight.position.set(3, 3.5, 3);
    scene.add(keyLight);

    // Rim Light - Spider-Man Red Glow
    const rimLight = new THREE.DirectionalLight(0xef4444, 6.5);
    rimLight.position.set(-3.5, 2.5, -2);
    scene.add(rimLight);

    // Upward Fill
    const fillLight = new THREE.PointLight(0x38bdf8, 3.8, 8);
    fillLight.position.set(0, -0.2, 2.2);
    scene.add(fillLight);

    // Floating Cyber Particles
    const particleCount = 75;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 5;
      particlePositions[i + 1] = Math.random() * 3.5 + 0.1;
      particlePositions[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 6. SUIT MATERIALS
    const suitRedMat = new THREE.MeshStandardMaterial({
      color: 0xdb2777,
      map: suitWebTexture || undefined,
      roughness: 0.38,
      metalness: 0.18,
    });

    const suitBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.32,
      metalness: 0.28,
    });

    const bootSoleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1,
    });

    const eyeLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.95,
      roughness: 0.05,
      metalness: 0.05,
    });

    const blackWebMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    // 7. ASSEMBLE 3D SPIDER-MAN CHARACTER
    const characterRoot = new THREE.Group();
    // Ground level: Spider-Man stands firmly with boots at y=0.01!
    characterRoot.position.set(-0.25, 0.02, 0);
    scene.add(characterRoot);

    // Pelvis & Hips
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.92;
    characterRoot.add(pelvis);

    const pelvisMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.19, 0.22, 16),
      suitBlueMat
    );
    pelvis.add(pelvisMesh);

    // Spine & Torso
    const spine = new THREE.Group();
    spine.position.y = 0.16;
    pelvis.add(spine);

    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.28;
    spine.add(chestGroup);

    // Muscular Sculpted Pectorals & Lats
    const chestCenter = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.42, 0.28),
      suitRedMat
    );
    chestGroup.add(chestCenter);

    const leftLat = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.38, 0.25), suitBlueMat);
    leftLat.position.x = -0.2;
    chestGroup.add(leftLat);

    const rightLat = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.38, 0.25), suitBlueMat);
    rightLat.position.x = 0.2;
    chestGroup.add(rightLat);

    // 3D Spider Insignia on Chest
    const spiderEmblem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.075, 0),
      blackWebMat
    );
    spiderEmblem.position.set(0, 0.06, 0.146);
    spiderEmblem.scale.set(1.4, 2.0, 0.25);
    chestGroup.add(spiderEmblem);

    // Neck & Head
    const neck = new THREE.Group();
    neck.position.y = 0.26;
    chestGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.16;
    neck.add(headGroup);

    // Cranial Mask Mesh
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 28, 24),
      suitRedMat
    );
    headMesh.scale.set(0.92, 1.15, 1.05);
    headGroup.add(headMesh);

    // Expressive Eye Lenses with Metallic Black Bezel Frames
    const createEye = (isRight: boolean) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(isRight ? 0.086 : -0.086, 0.03, 0.242);
      eyeGroup.rotation.z = isRight ? -0.22 : 0.22;
      eyeGroup.rotation.y = isRight ? 0.24 : -0.24;

      const frame = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.086, 18),
        blackWebMat
      );
      frame.scale.set(1, 1.45, 1);
      eyeGroup.add(frame);

      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.08, 18),
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
    leftShoulder.position.set(-0.26, 0.17, 0);
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

    // Right Arm (Pointer & Web-Shooter)
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.26, 0.17, 0);
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

    // Articulated index pointer finger
    const rightPointerFinger = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.12, 8),
      suitRedMat
    );
    rightPointerFinger.position.set(0.03, -0.09, 0.01);
    rightHand.add(rightPointerFinger);

    // Wrist Web-Shooter Gauntlet Nozzle
    const webShooterNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 })
    );
    webShooterNozzle.position.set(0, 0.03, 0.03);
    webShooterNozzle.rotation.x = Math.PI / 2;
    rightHand.add(webShooterNozzle);

    // LEGS & BOOTS
    // Left Leg
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.13, -0.08, 0);
    pelvis.add(leftHip);

    const leftThigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.068, 0.44, 12),
      suitBlueMat
    );
    leftThigh.position.y = -0.22;
    leftHip.add(leftThigh);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -0.44;
    leftHip.add(leftKnee);

    const leftCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.056, 0.4, 12),
      suitRedMat
    );
    leftCalf.position.y = -0.2;
    leftKnee.add(leftCalf);

    // Left Boot planted on ground
    const leftBootFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.07, 0.18),
      suitRedMat
    );
    leftBootFoot.position.set(0, -0.42, 0.04);
    leftKnee.add(leftBootFoot);

    const leftSole = new THREE.Mesh(
      new THREE.BoxGeometry(0.092, 0.02, 0.19),
      bootSoleMat
    );
    leftSole.position.set(0, -0.45, 0.04);
    leftKnee.add(leftSole);

    // Right Leg
    const rightHip = new THREE.Group();
    rightHip.position.set(0.13, -0.08, 0);
    pelvis.add(rightHip);

    const rightThigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.068, 0.44, 12),
      suitBlueMat
    );
    rightThigh.position.y = -0.22;
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -0.44;
    rightHip.add(rightKnee);

    const rightCalf = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.056, 0.4, 12),
      suitRedMat
    );
    rightCalf.position.y = -0.2;
    rightKnee.add(rightCalf);

    // Right Boot planted on ground
    const rightBootFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.07, 0.18),
      suitRedMat
    );
    rightBootFoot.position.set(0, -0.42, 0.04);
    rightKnee.add(rightBootFoot);

    const rightSole = new THREE.Mesh(
      new THREE.BoxGeometry(0.092, 0.02, 0.19),
      bootSoleMat
    );
    rightSole.position.set(0, -0.45, 0.04);
    rightKnee.add(rightSole);

    // Confident Athletic Grounded Stance
    leftHip.rotation.z = 0.12;
    leftKnee.rotation.x = 0.08;
    rightHip.rotation.z = -0.15;
    rightKnee.rotation.x = 0.15;
    characterRoot.rotation.y = 0.28;

    // 8. 3D LUMINOUS WEB STRAND
    const webPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.6, 0.15, 0),
      new THREE.Vector3(1.4, -0.05, 0),
      new THREE.Vector3(2.5, 0.1, 0),
    ];
    const webCurve = new THREE.CatmullRomCurve3(webPoints);
    let webTubeGeom = new THREE.TubeGeometry(webCurve, 20, 0.016, 6, false);
    const webMesh = new THREE.Mesh(
      webTubeGeom,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 })
    );
    webMesh.visible = false;
    scene.add(webMesh);

    // 9. RESIZEOBSERVER (Prevents Canvas Distortion)
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

    // Mouse Tracking for natural eye & head following
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 10. ANIMATION LOOP (Live 60 FPS requestAnimationFrame)
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

      // Continuous Idle Breathing (Smooth organic expansion)
      const breath = 1 + Math.sin(elapsed * 2.5) * 0.03;
      chestGroup.scale.set(breath, breath, breath);
      pelvis.position.y = 0.92 + Math.sin(elapsed * 2.5) * 0.01;

      // Subtle particle drift
      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = Math.sin(elapsed * 0.06) * 0.08;

      // Natural eye blinking
      blinkTimer += delta;
      if (blinkTimer > 3.6) {
        isBlinking = true;
        if (blinkTimer > 3.78) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }
      const eyeScaleY = isBlinking ? 0.08 : 1.0;
      leftEye.eyeGroup.scale.y = THREE.MathUtils.lerp(leftEye.eyeGroup.scale.y, eyeScaleY, 0.45);
      rightEye.eyeGroup.scale.y = THREE.MathUtils.lerp(rightEye.eyeGroup.scale.y, eyeScaleY, 0.45);

      // Rotations & Poses
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

      const lookFollowX = Math.max(-0.4, Math.min(0.4, mouseX * 0.32));
      const lookFollowY = Math.max(-0.3, Math.min(0.3, mouseY * 0.22));

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
          targetBodyRotY = 0.36;
          targetHeadRotY = 0.45 + progress * 0.16;
          targetHeadRotX = Math.sin(elapsed * 6) * 0.07;
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
          rightEye.eyeGroup.scale.x = 1.35;
          break;

        case "look_button":
          targetBodyRotY = 0.4;
          targetHeadRotY = 0.52;
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
          characterRoot.position.y = 0.02 + Math.abs(Math.sin(elapsed * 5)) * 0.35;
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

      // Smooth Skeletal Lerp
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

      // Web mesh updates
      webMesh.visible = showWeb;
      if (showWeb) {
        const wristPos = new THREE.Vector3();
        webShooterNozzle.getWorldPosition(wristPos);
        webPoints[0].copy(wristPos);
        webPoints[1].set(wristPos.x + 0.6, wristPos.y + 0.15, wristPos.z);
        webPoints[2].set(wristPos.x + 1.4, wristPos.y - 0.05, wristPos.z);
        webPoints[3].set(wristPos.x + 2.4, 1.2, 0);
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

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[540px] sm:h-[620px] lg:h-[700px] overflow-visible pointer-events-none select-none ${className}`}
    >
      {/* 100% Transparent WebGL Canvas with NO enclosing box or borders */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-auto"
      />
    </div>
  );
}
