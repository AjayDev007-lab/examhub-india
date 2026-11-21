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
  typingProgress?: number;
  className?: string;
  onWebFired?: () => void;
}

export default function SpiderManLive3DCanvas({
  actionState,
  typingProgress = 0,
  className = "",
  onWebFired,
}: SpiderManLive3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Store mutable refs for Three.js animation controller
  const stateRef = useRef(actionState);
  stateRef.current = actionState;

  const typingProgressRef = useRef(typingProgress);
  typingProgressRef.current = typingProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. WEBGL CAPABILITY TEST
    try {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch (e) {
      setWebGLSupported(false);
      return;
    }

    // 2. SCENE, CAMERA, RENDERER
    const width = mountRef.current?.clientWidth || 500;
    const height = mountRef.current?.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070f26, 0.05);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 3.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. LIGHTING (Cinematic Superhero Lighting)
    const ambientLight = new THREE.AmbientLight(0x0a1e3f, 1.8);
    scene.add(ambientLight);

    // Key Light - Electric Cyan
    const cyanKeyLight = new THREE.SpotLight(0x06b6d4, 8, 12, Math.PI / 4, 0.4, 1);
    cyanKeyLight.position.set(2.5, 3.5, 3);
    cyanKeyLight.castShadow = true;
    scene.add(cyanKeyLight);

    // Rim Light - Vivid Spider-Man Crimson Red
    const redRimLight = new THREE.DirectionalLight(0xef4444, 4.5);
    redRimLight.position.set(-3, 2, -2);
    scene.add(redRimLight);

    // Bottom Bounce Light - Deep Electric Blue
    const blueBounceLight = new THREE.PointLight(0x3b82f6, 3, 6);
    blueBounceLight.position.set(0, -1, 1.5);
    scene.add(blueBounceLight);

    // 4. FLOATING HOLOGRAPHIC PARTICLES
    const particleCount = 80;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = Math.random() * 4 - 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. MATERIALS
    // Spider-Man Suit Red Fabric with specular sheen
    const suitRedMat = new THREE.MeshStandardMaterial({
      color: 0xd91b24,
      roughness: 0.38,
      metalness: 0.15,
    });

    // Spider-Man Suit Royal / Navy Blue
    const suitBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b5c,
      roughness: 0.35,
      metalness: 0.25,
    });

    // Eye Lenses Material (Glowing White with Subtle Iridescence)
    const eyeLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xdbeafe,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.05,
    });

    // Eye Outer Black Frame
    const eyeFrameMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

    // Black Spider Emblem / Web lines
    const blackWebMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Glowing Cyan Web Strand Material
    const webStrandMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    // 6. BUILD SPIDER-MAN 3D RIGGED MESH HIERARCHY
    const characterRoot = new THREE.Group();
    characterRoot.position.set(-0.35, 0.2, 0);
    scene.add(characterRoot);

    // --- Pelvis / Hips ---
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.85;
    characterRoot.add(pelvis);

    const pelvisMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.2, 0.22, 16),
      suitBlueMat
    );
    pelvis.add(pelvisMesh);

    // --- Spine & Torso ---
    const spine = new THREE.Group();
    spine.position.y = 0.16;
    pelvis.add(spine);

    // Chest (Red Center + Blue Lat Wings)
    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.24;
    spine.add(chestGroup);

    const chestCenter = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.38, 0.26),
      suitRedMat
    );
    chestCenter.castShadow = true;
    chestGroup.add(chestCenter);

    // Blue side panels
    const leftLat = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.24), suitBlueMat);
    leftLat.position.x = -0.19;
    chestGroup.add(leftLat);

    const rightLat = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.24), suitBlueMat);
    rightLat.position.x = 0.19;
    chestGroup.add(rightLat);

    // Chest Spider Emblem
    const spiderEmblem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.065, 0),
      blackWebMat
    );
    spiderEmblem.position.set(0, 0.05, 0.135);
    spiderEmblem.scale.set(1.4, 1.8, 0.3);
    chestGroup.add(spiderEmblem);

    // --- Neck & Head ---
    const neck = new THREE.Group();
    neck.position.y = 0.24;
    chestGroup.add(neck);

    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12),
      suitRedMat
    );
    neck.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.16;
    neck.add(headGroup);

    // Head Mask Sphere (Slightly tapered)
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 20),
      suitRedMat
    );
    headMesh.scale.set(0.94, 1.12, 1.05);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 3D Expressive White Eye Lenses
    const createEye = (isRight: boolean) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(isRight ? 0.085 : -0.085, 0.04, 0.22);
      eyeGroup.rotation.z = isRight ? -0.18 : 0.18;
      eyeGroup.rotation.y = isRight ? 0.22 : -0.22;

      // Outer black frame
      const frame = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.082, 16),
        eyeFrameMat
      );
      frame.scale.set(1, 1.4, 1);
      eyeGroup.add(frame);

      // Inner glowing lens
      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.075, 16),
        eyeLensMat
      );
      lens.scale.set(0.9, 1.35, 1);
      lens.position.z = 0.005;
      eyeGroup.add(lens);

      return { eyeGroup, lens, frame };
    };

    const leftEye = createEye(false);
    const rightEye = createEye(true);
    headGroup.add(leftEye.eyeGroup);
    headGroup.add(rightEye.eyeGroup);

    // --- ARMS RIGGING ---
    // Left Shoulder & Arm
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.25, 0.15, 0);
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

    // Right Shoulder & Arm (Primary Interaction Arm)
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.25, 0.15, 0);
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

    // Right Hand & Wrist Web Shooter
    const rightHand = new THREE.Group();
    rightHand.position.y = -0.3;
    rightElbow.add(rightHand);

    const rightHandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.05),
      suitRedMat
    );
    rightHand.add(rightHandMesh);

    // Pointing finger geometry
    const rightPointerFinger = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.11, 8),
      suitRedMat
    );
    rightPointerFinger.position.set(0.03, -0.09, 0.01);
    rightHand.add(rightPointerFinger);

    // Wrist Web Shooter Node
    const webShooterNode = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8),
      blackWebMat
    );
    webShooterNode.position.set(0, 0.03, 0.03);
    webShooterNode.rotation.x = Math.PI / 2;
    rightHand.add(webShooterNode);

    // --- LEGS RIGGING ---
    // Left Leg
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
      suitRedMat // Red Boots
    );
    leftCalf.position.y = -0.2;
    leftKnee.add(leftCalf);

    // Right Leg
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
      suitRedMat // Red Boots
    );
    rightCalf.position.y = -0.2;
    rightKnee.add(rightCalf);

    // Initial Superhero Stance (Athletic Spider-Man Lean)
    leftHip.rotation.z = 0.15;
    leftKnee.rotation.x = 0.2;
    rightHip.rotation.z = -0.2;
    rightKnee.rotation.x = 0.35;
    characterRoot.rotation.y = 0.28; // Turned invitingly towards the form

    // 7. REAL 3D WEB STRAND GEOMETRY
    const webCurvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.6, 0.2, 0),
      new THREE.Vector3(1.4, -0.1, 0),
      new THREE.Vector3(2.5, 0, 0),
    ];
    const webCurve = new THREE.CatmullRomCurve3(webCurvePoints);
    const webGeometry = new THREE.TubeGeometry(webCurve, 20, 0.012, 6, false);
    const webMesh = new THREE.Mesh(
      webGeometry,
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: false,
      })
    );
    webMesh.visible = false;
    scene.add(webMesh);

    // Mouse Tracking Coordinates
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // 8. CONTINUOUS ANIMATION LOOP (Live WebGL Three.js RequestAnimationFrame)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let previousState = "";

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentAction = stateRef.current;

      // Detect state transition triggers
      if (currentAction !== previousState) {
        if (currentAction === "point_email") {
          soundEngine.playWebShoot();
          onWebFired?.();
        } else if (currentAction === "celebrate") {
          soundEngine.playSuccessChime();
        } else if (currentAction === "error") {
          soundEngine.playErrorSound();
        } else {
          soundEngine.playWhoosh();
        }
        previousState = currentAction;
      }

      // --- Natural Continuous Idle Dynamics (Never Frozen) ---
      // Breathing motion: Chest expands and contracts rhythmically
      const breathScale = 1 + Math.sin(elapsed * 2.8) * 0.035;
      chestGroup.scale.set(breathScale, breathScale, breathScale);

      // Idle vertical body bob and hip sway
      pelvis.position.y = 0.85 + Math.sin(elapsed * 2.8) * 0.02;
      characterRoot.position.y = 0.2 + Math.sin(elapsed * 1.8) * 0.025;

      // Particles gentle ambient drift
      particles.rotation.y = elapsed * 0.05;
      particles.rotation.x = Math.sin(elapsed * 0.08) * 0.1;

      // Periodic Eye Blink Mechanics
      blinkTimer += delta;
      if (blinkTimer > 3.6) {
        isBlinking = true;
        if (blinkTimer > 3.75) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }
      const eyeScaleY = isBlinking ? 0.08 : 1.0;
      leftEye.eyeGroup.scale.y = THREE.MathUtils.lerp(leftEye.eyeGroup.scale.y, eyeScaleY, 0.4);
      rightEye.eyeGroup.scale.y = THREE.MathUtils.lerp(rightEye.eyeGroup.scale.y, eyeScaleY, 0.4);

      // --- TARGET POSE VARIABLES (Interpolated with Lerp for Silk-Smooth Animation) ---
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

      // Cursor Eye & Head Following in Idle/Normal states
      const lookFollowX = Math.max(-0.4, Math.min(0.4, mouseX * 0.35));
      const lookFollowY = Math.max(-0.3, Math.min(0.3, mouseY * 0.25));

      // --- ACTION STATE CONTROLLER ---
      switch (currentAction) {
        case "point_email":
          // Extend right arm, point directly towards the email field on the right
          targetBodyRotY = 0.4;
          targetHeadRotY = 0.55;
          targetHeadRotX = 0.05;

          targetRShoulderX = -1.55; // Arm forward
          targetRShoulderZ = -0.45; // Arm pointing to right
          targetRElbowX = -0.2;     // Forearm straight
          rightHand.rotation.z = -0.3;

          targetLShoulderX = 0.2;
          targetLShoulderZ = 0.4;
          showWeb = true; // Trigger 3D web strand!
          break;

        case "type_email":
          // Curious attentive head tilt following typing progress
          const progress = typingProgressRef.current;
          targetBodyRotY = 0.35;
          targetHeadRotY = 0.45 + progress * 0.15;
          targetHeadRotX = Math.sin(elapsed * 6) * 0.08; // Curious rhythmic nodding

          targetRShoulderX = -1.2;
          targetRShoulderZ = -0.3;
          targetRElbowX = -0.5;

          targetLShoulderX = 0.1;
          targetLShoulderZ = 0.35;
          break;

        case "cover_eyes":
          // Both arms raise up, hands completely covering the white eye lenses (Password privacy)
          targetBodyRotY = 0.15;
          targetHeadRotY = 0.05;
          targetHeadRotX = -0.1; // Shy head down tilt

          targetRShoulderX = -2.2;
          targetRShoulderZ = 0.6;
          targetRElbowX = -1.6;

          targetLShoulderX = -2.2;
          targetLShoulderZ = -0.6;
          targetLElbowX = -1.6;
          break;

        case "peek":
          // Hands part slightly, head tilts sideways to peek between fingers
          targetBodyRotY = 0.3;
          targetHeadRotY = 0.4;
          targetHeadRotX = 0.15; // Tilted peek

          targetRShoulderX = -2.0;
          targetRShoulderZ = 0.35; // Hands parted
          targetRElbowX = -1.4;

          targetLShoulderX = -2.0;
          targetLShoulderZ = -0.35;
          targetLElbowX = -1.4;

          // One eye lens widens curiously
          rightEye.eyeGroup.scale.x = 1.25;
          break;

        case "look_button":
          // Lean forward, look down towards the SIGN IN button
          targetBodyRotY = 0.4;
          targetHeadRotY = 0.5;
          targetHeadRotX = -0.25; // Looking down

          targetRShoulderX = -0.5;
          targetRShoulderZ = -0.2;
          targetRElbowX = -0.4;
          break;

        case "focused_login":
          // Focused ready pose (arms flexed, crouched tension)
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
          // Jumps in 3D air, both arms raised high in victory!
          characterRoot.position.y = 0.5 + Math.abs(Math.sin(elapsed * 5)) * 0.3; // Jumping!
          targetBodyRotY = Math.sin(elapsed * 4) * 0.25;
          targetHeadRotY = 0;
          targetHeadRotX = 0.3; // Looking up triumphantly

          targetRShoulderX = -2.9; // Arms straight up
          targetRShoulderZ = -0.4;
          targetRElbowX = 0.1;

          targetLShoulderX = -2.9;
          targetLShoulderZ = 0.4;
          targetLElbowX = 0.1;
          break;

        case "error":
          // Confused head scratch
          targetBodyRotY = 0.1;
          targetHeadRotY = -0.2;
          targetHeadRotX = 0.25; // Sideways tilt

          targetRShoulderX = -2.5; // Hand behind head
          targetRShoulderZ = 0.3;
          targetRElbowX = -2.1;

          targetLShoulderX = 0;
          targetLShoulderZ = 0.4;
          break;

        case "idle":
        default:
          // Natural breathing idle, relaxed arms, cursor tracking
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

      // Smooth Lerp Interpolation on Skeleton Joints (Zero Jitter)
      const lerpSpeed = 0.12;
      characterRoot.rotation.y = THREE.MathUtils.lerp(characterRoot.rotation.y, targetBodyRotY, lerpSpeed);
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, lerpSpeed);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, lerpSpeed);

      rightShoulder.rotation.x = THREE.MathUtils.lerp(rightShoulder.rotation.x, targetRShoulderX, lerpSpeed);
      rightShoulder.rotation.z = THREE.MathUtils.lerp(rightShoulder.rotation.z, targetRShoulderZ, lerpSpeed);
      rightElbow.rotation.x = THREE.MathUtils.lerp(rightElbow.rotation.x, targetRElbowX, lerpSpeed);

      leftShoulder.rotation.x = THREE.MathUtils.lerp(leftShoulder.rotation.x, targetLShoulderX, lerpSpeed);
      leftShoulder.rotation.z = THREE.MathUtils.lerp(leftShoulder.rotation.z, targetLShoulderZ, lerpSpeed);
      leftElbow.rotation.x = THREE.MathUtils.lerp(leftElbow.rotation.x, targetLElbowX, lerpSpeed);

      // Web Strand Dynamic Position Update
      webMesh.visible = showWeb;
      if (showWeb) {
        // Connect wrist position to right login card coordinates in 3D
        const wristWorldPos = new THREE.Vector3();
        webShooterNode.getWorldPosition(wristWorldPos);
        webCurvePoints[0].copy(wristWorldPos);
        webCurvePoints[1].set(wristWorldPos.x + 0.6, wristWorldPos.y + 0.1, wristWorldPos.z);
        webCurvePoints[2].set(wristWorldPos.x + 1.2, wristWorldPos.y - 0.05, wristWorldPos.z);
        webCurvePoints[3].set(wristWorldPos.x + 2.2, 1.2, 0); // Attaches to login card
        webCurve.points = webCurvePoints;
        const newWebGeom = new THREE.TubeGeometry(webCurve, 16, 0.014, 6, false);
        webMesh.geometry.dispose();
        webMesh.geometry = newWebGeom;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. CLEANUP ON UNMOUNT
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  if (!webGLSupported) {
    return (
      <div className={`flex items-center justify-center p-8 bg-slate-900/60 rounded-3xl border border-cyan-500/30 text-xs text-cyan-300 ${className}`}>
        WebGL hardware acceleration is required to render the live 3D Spider-Man character.
      </div>
    );
  }

  return (
    <div ref={mountRef} className={`relative w-full h-full min-h-[460px] sm:min-h-[540px] ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
