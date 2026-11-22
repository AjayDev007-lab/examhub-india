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
  typingProgress = 0,
  className = "",
}: SpiderManLive3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Sync refs so requestAnimationFrame always reads freshest state without tearing
  const stateRef = useRef(actionState);
  stateRef.current = actionState;

  const typingProgressRef = useRef(typingProgress);
  typingProgressRef.current = typingProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mountRef.current;
    if (!canvas || !container) return;

    let isDisposed = false;
    let animationFrameId: number;

    // 1. SCENE, CAMERA & TRANSPARENT RENDERER
    const scene = new THREE.Scene();
    scene.background = null; // 100% transparent: floats directly on website background

    const initialW = container.clientWidth || 560;
    const initialH = container.clientHeight || 640;

    // Full-body perspective camera (captures movie-quality character head to toe)
    const camera = new THREE.PerspectiveCamera(36, initialW / initialH, 0.1, 50);
    camera.position.set(-0.15, 1.05, 3.5);
    camera.lookAt(-0.15, 0.95, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true, // Transparent WebGL scene
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(initialW, initialH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
    } catch {
      setLoadError(true);
      return;
    }

    // 2. CINEMATIC SUPERHERO LIGHTING
    // Cool Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(ambientLight);

    // Key Light: Crisp frontal sunlight illuminating red fabric & suit webs
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(2.5, 4.0, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Electric Cyan Rim Light: Edge highlight along Spider-Man's silhouette
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 3.2);
    rimLight.position.set(-3.0, 3.0, -2.5);
    scene.add(rimLight);

    // Warm Suit Fill: Subtle red bounce light from the superhero chest emblem
    const fillLight = new THREE.PointLight(0xef4444, 1.5, 6);
    fillLight.position.set(0, 1.2, 1.8);
    scene.add(fillLight);

    // 3. SOFT CONTACT GROUND SHADOW PLANE
    const createGroundShadowTexture = () => {
      const sCanvas = document.createElement("canvas");
      sCanvas.width = 256;
      sCanvas.height = 256;
      const sCtx = sCanvas.getContext("2d");
      if (!sCtx) return null;

      const gradient = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      gradient.addColorStop(0, "rgba(2, 6, 23, 0.85)");
      gradient.addColorStop(0.35, "rgba(2, 6, 23, 0.55)");
      gradient.addColorStop(0.7, "rgba(2, 6, 23, 0.20)");
      gradient.addColorStop(1, "rgba(2, 6, 23, 0)");

      sCtx.fillStyle = gradient;
      sCtx.beginPath();
      sCtx.arc(128, 128, 120, 0, Math.PI * 2);
      sCtx.fill();

      return new THREE.CanvasTexture(sCanvas);
    };

    const groundShadowTexture = createGroundShadowTexture();
    if (groundShadowTexture) {
      const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: groundShadowTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
      groundShadow.rotation.x = -Math.PI / 2;
      groundShadow.position.set(-0.15, 0.005, 0);
      scene.add(groundShadow);
    }

    // 4. DYNAMIC GLOWING CYAN WEB STRAND (Connecting Wrist Shooter to Login Card)
    const webPoints = [
      new THREE.Vector3(-0.05, 1.05, 0.4),
      new THREE.Vector3(0.6, 1.15, 0.3),
      new THREE.Vector3(1.3, 1.1, 0.1),
      new THREE.Vector3(2.2, 1.2, 0.0),
    ];
    const webCurve = new THREE.CatmullRomCurve3(webPoints);
    let webTubeGeom = new THREE.TubeGeometry(webCurve, 24, 0.016, 8, false);
    const webMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const webMesh = new THREE.Mesh(webTubeGeom, webMat);
    webMesh.visible = false;
    scene.add(webMesh);

    // 5. MOUSE TRACKING
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = Math.max(-1, Math.min(1, x));
      mouseY = Math.max(-1, Math.min(1, y));
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 6. RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      if (isDisposed || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 7. LOAD RIGGED SPIDER-MAN GLB MODEL VIA GLTFLoader
    let mixer: THREE.AnimationMixer | null = null;
    let characterModel: THREE.Group | null = null;
    const timer = new THREE.Timer();
    if (typeof document !== "undefined") {
      timer.connect(document);
    }

    // Bone references
    let headBone: THREE.Object3D | null = null;
    let spineBone: THREE.Object3D | null = null;
    let leftUpperArm: THREE.Object3D | null = null;
    let leftForearm: THREE.Object3D | null = null;
    let leftHand: THREE.Object3D | null = null;
    let rightUpperArm: THREE.Object3D | null = null;
    let rightForearm: THREE.Object3D | null = null;
    let rightHand: THREE.Object3D | null = null;

    import("three/examples/jsm/loaders/GLTFLoader.js").then(({ GLTFLoader }) => {
      if (isDisposed) return;
      const loader = new GLTFLoader();

      loader.load(
        "/models/spiderman-mini.glb",
        (gltf) => {
          if (isDisposed) return;
          characterModel = gltf.scene;

          // Compute bounding box & normalize scale
          const box = new THREE.Box3().setFromObject(characterModel);
          const size = new THREE.Vector3();
          box.getSize(size);

          // Standardize height to 1.95m
          const targetHeight = 1.95;
          const scale = size.y > 0 ? targetHeight / size.y : 0.066;
          characterModel.scale.set(scale, scale, scale);

          // Center horizontally, place feet precisely on ground plane (y=0)
          characterModel.position.set(-0.15, 0.0, 0.0);
          characterModel.rotation.y = 0.28; // Natural 15-degree welcoming angle towards login card

          // Enable shadows and enhance materials
          characterModel.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mesh = node as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.roughness = 0.55;
                mat.metalness = 0.15;
              }
            }
          });

          // Identify skeletal bones for dynamic interactive poses
          headBone = characterModel.getObjectByName("head_050") || null;
          spineBone = characterModel.getObjectByName("spine.005_049") || characterModel.getObjectByName("spine_044") || null;
          leftUpperArm = characterModel.getObjectByName("upper_arm.L_00") || null;
          leftForearm = characterModel.getObjectByName("forearm.L_052") || null;
          leftHand = characterModel.getObjectByName("hand.L_03") || null;
          rightUpperArm = characterModel.getObjectByName("upper_arm.R_054") || null;
          rightForearm = characterModel.getObjectByName("forearm.R_055") || null;
          rightHand = characterModel.getObjectByName("hand.R_024") || null;

          // Setup AnimationMixer & play embedded skeletal idle animation
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(characterModel);
            const idleClip = gltf.animations.find((a) => a.name.includes("idle")) || gltf.animations[0];
            const idleAction = mixer.clipAction(idleClip);
            idleAction.play();
          }

          scene.add(characterModel);
          setLoading(false);
        },
        undefined,
        (err) => {
          console.error("Failed to load Spider-Man 3D model:", err);
          setLoading(false);
          setLoadError(true);
        }
      );
    });

    // 8. RENDER LOOP WITH PROCEDURAL SKELETAL INTERACTION LAYER
    let prevAction: SpiderManActionState = "idle";

    const animate = (timestamp?: number) => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      timer.update(timestamp);
      const delta = timer.getDelta();
      const elapsed = timer.getElapsed();

      // Update skeletal animation mixer
      if (mixer) {
        mixer.update(delta);
      }

      const currentAction = stateRef.current;
      const progress = typingProgressRef.current;

      // Audio trigger on state transition
      if (currentAction !== prevAction) {
        switch (currentAction) {
          case "point_email":
            soundEngine.playWebShoot();
            break;
          case "cover_eyes":
            soundEngine.playWhoosh();
            break;
          case "peek":
            soundEngine.playWhoosh();
            break;
          case "celebrate":
            soundEngine.playSuccessChime();
            break;
          case "error":
            soundEngine.playErrorSound();
            break;
          default:
            break;
        }
        prevAction = currentAction;
      }

      // Smooth mouse follow target coordinates
      const targetLookX = mouseX * 0.45;
      const targetLookY = -mouseY * 0.35;

      // Procedural skeletal offsets applied on top of the base rigged animation
      if (characterModel) {
        let targetBodyRotY = 0.28;
        let targetHeadRotY = targetLookX;
        let targetHeadRotX = targetLookY;
        let showWeb = false;

        switch (currentAction) {
          case "point_email":
            targetBodyRotY = 0.42; // Turns further towards the card
            targetHeadRotY = 0.50; // Looks towards the email field
            targetHeadRotX = -0.05;
            showWeb = true;
            if (rightUpperArm) {
              rightUpperArm.rotation.x = THREE.MathUtils.lerp(rightUpperArm.rotation.x, -1.35, 0.15);
              rightUpperArm.rotation.z = THREE.MathUtils.lerp(rightUpperArm.rotation.z, -0.4, 0.15);
            }
            if (rightForearm) {
              rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, -0.6, 0.15);
            }
            break;

          case "type_email":
            targetBodyRotY = 0.38;
            targetHeadRotY = 0.45;
            // Head tracks typing cadence with subtle nodding
            targetHeadRotX = 0.12 + Math.sin(progress * 18) * 0.08;
            break;

          case "cover_eyes":
            targetHeadRotX = 0.22;
            // Both hands raise to cover eyes
            if (leftUpperArm && rightUpperArm) {
              leftUpperArm.rotation.x = THREE.MathUtils.lerp(leftUpperArm.rotation.x, -1.85, 0.18);
              leftUpperArm.rotation.z = THREE.MathUtils.lerp(leftUpperArm.rotation.z, 0.65, 0.18);
              rightUpperArm.rotation.x = THREE.MathUtils.lerp(rightUpperArm.rotation.x, -1.85, 0.18);
              rightUpperArm.rotation.z = THREE.MathUtils.lerp(rightUpperArm.rotation.z, -0.65, 0.18);
            }
            if (leftForearm && rightForearm) {
              leftForearm.rotation.x = THREE.MathUtils.lerp(leftForearm.rotation.x, -1.45, 0.18);
              rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, -1.45, 0.18);
            }
            break;

          case "peek":
            // One hand covers, other lowers playfully to peek
            targetHeadRotY = 0.35;
            targetHeadRotX = -0.15;
            if (leftUpperArm) {
              leftUpperArm.rotation.x = THREE.MathUtils.lerp(leftUpperArm.rotation.x, -1.85, 0.18);
              leftUpperArm.rotation.z = THREE.MathUtils.lerp(leftUpperArm.rotation.z, 0.65, 0.18);
            }
            if (rightUpperArm) {
              rightUpperArm.rotation.x = THREE.MathUtils.lerp(rightUpperArm.rotation.x, -0.85, 0.18);
              rightUpperArm.rotation.z = THREE.MathUtils.lerp(rightUpperArm.rotation.z, -0.25, 0.18);
            }
            break;

          case "look_button":
            targetBodyRotY = 0.45;
            targetHeadRotY = 0.55;
            targetHeadRotX = 0.28; // Looking down at button
            if (rightUpperArm) {
              rightUpperArm.rotation.x = THREE.MathUtils.lerp(rightUpperArm.rotation.x, -0.75, 0.15);
              rightUpperArm.rotation.z = THREE.MathUtils.lerp(rightUpperArm.rotation.z, -0.3, 0.15);
            }
            break;

          case "celebrate":
            // Jumping joyfully with both arms raised high
            characterModel.position.y = Math.abs(Math.sin(elapsed * 5.5)) * 0.25;
            targetHeadRotX = -0.3; // Looking up proudly
            if (leftUpperArm && rightUpperArm) {
              leftUpperArm.rotation.x = THREE.MathUtils.lerp(leftUpperArm.rotation.x, -2.85, 0.2);
              leftUpperArm.rotation.z = THREE.MathUtils.lerp(leftUpperArm.rotation.z, 0.45, 0.2);
              rightUpperArm.rotation.x = THREE.MathUtils.lerp(rightUpperArm.rotation.x, -2.85, 0.2);
              rightUpperArm.rotation.z = THREE.MathUtils.lerp(rightUpperArm.rotation.z, -0.45, 0.2);
            }
            break;

          case "error":
            targetHeadRotY = -0.25;
            targetHeadRotX = 0.2;
            targetBodyRotY = 0.15;
            if (rightUpperArm) {
              rightUpperArm.rotation.x = THREE.MathUtils.lerp(rightUpperArm.rotation.x, -2.1, 0.15);
              rightUpperArm.rotation.z = THREE.MathUtils.lerp(rightUpperArm.rotation.z, 0.35, 0.15);
            }
            break;

          case "idle":
          default:
            characterModel.position.y = 0.0;
            targetBodyRotY = 0.28 + targetLookX * 0.2;
            break;
        }

        // Apply lerped rotations
        const lerpSpeed = 0.12;
        characterModel.rotation.y = THREE.MathUtils.lerp(characterModel.rotation.y, targetBodyRotY, lerpSpeed);

        if (headBone) {
          headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, targetHeadRotY, lerpSpeed);
          headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, targetHeadRotX, lerpSpeed);
        }

        // Dynamic web mesh update
        webMesh.visible = showWeb;
        if (showWeb) {
          webMat.opacity = 0.65 + Math.sin(elapsed * 12) * 0.25; // Pulsing electric glow
          const wristPos = new THREE.Vector3();
          if (rightHand) {
            rightHand.getWorldPosition(wristPos);
          } else {
            wristPos.set(-0.05, 1.1, 0.4);
          }
          webPoints[0].copy(wristPos);
          webPoints[1].set(wristPos.x + 0.6, wristPos.y + 0.1, wristPos.z);
          webPoints[2].set(wristPos.x + 1.3, wristPos.y - 0.05, wristPos.z);
          webPoints[3].set(wristPos.x + 2.4, 1.25, 0);
          webCurve.points = webPoints;
          webTubeGeom.dispose();
          webTubeGeom = new THREE.TubeGeometry(webCurve, 20, 0.016, 6, false);
          webMesh.geometry = webTubeGeom;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      timer.dispose();
      if (mixer) mixer.stopAllAction();
      groundShadowTexture?.dispose();
      webTubeGeom.dispose();
      webMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[540px] sm:h-[620px] lg:h-[700px] overflow-visible pointer-events-none select-none ${className}`}
    >
      {/* Subtle glowing loading state until WebGL model renders */}
      {loading && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-400 space-y-3 z-0 pointer-events-none">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-300/80">
            Summoning Superhero Mascot...
          </span>
        </div>
      )}

      {/* 100% Transparent WebGL Canvas with NO enclosing box, NO video frame, NO borders */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-auto"
      />
    </div>
  );
}
