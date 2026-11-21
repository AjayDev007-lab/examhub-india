"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, 
  Eye, EyeOff, CheckCircle2, Film, ChevronRight, Award
} from "lucide-react";

export type MascotState = 
  | "welcome"          // Scene 1: 0-4s
  | "email"            // Scene 2: 4-8s
  | "password_hide"    // Scene 3: 8-12s
  | "password_peek"    // Scene 4: 12-16s
  | "waiting"          // Scene 5: 16-20s
  | "success";         // Scene 6: 20-25s

interface Student3DMascotProps {
  currentState: MascotState;
  onStateChange?: (state: MascotState) => void;
  typingProgress?: number; // 0 to 1 for pupil follow
  showCinemaReelControl?: boolean;
  className?: string;
}

export const SCENE_DEFINITIONS: {
  id: MascotState;
  title: string;
  timeRange: string;
  startSec: number;
  endSec: number;
  emotion: string;
  description: string;
}[] = [
  {
    id: "welcome",
    title: "Scene 1 – Welcome",
    timeRange: "0:00 – 0:04",
    startSec: 0,
    endSec: 4,
    emotion: "Happy & Welcoming",
    description: "Looks directly at camera, smiles warmly, waves one hand, blinks naturally.",
  },
  {
    id: "email",
    title: "Scene 2 – Email Entry",
    timeRange: "0:04 – 0:08",
    startSec: 4,
    endSec: 8,
    emotion: "Curious & Attentive",
    description: "Turns eyes towards email field, slight head movement follows typing, curious smile.",
  },
  {
    id: "password_hide",
    title: "Scene 3 – Password Entry",
    timeRange: "0:08 – 0:12",
    startSec: 8,
    endSec: 12,
    emotion: "Funny & Playful",
    description: "Covers both eyes with hands, smiles playfully, respects password privacy.",
  },
  {
    id: "password_peek",
    title: "Scene 4 – Show Password",
    timeRange: "0:12 – 0:16",
    startSec: 12,
    endSec: 16,
    emotion: "Cute & Humorous",
    description: "Slowly parts fingers to peek through gap with funny surprised expression.",
  },
  {
    id: "waiting",
    title: "Scene 5 – Login Button",
    timeRange: "0:16 – 0:20",
    startSec: 16,
    endSec: 20,
    emotion: "Excited & Hopeful",
    description: "Lowers hands, looks towards button, leans forward waiting for authentication.",
  },
  {
    id: "success",
    title: "Scene 6 – Successful Login",
    timeRange: "0:20 – 0:25",
    startSec: 20,
    endSec: 25,
    emotion: "Ecstatic & Celebratory",
    description: "Jumps happily, raises both hands in victory, celebrated with floating confetti & wave.",
  },
];

const MASCOT_RENDER_PATHS: Record<MascotState, string> = {
  welcome: "/images/mascot/mascot_welcome.jpg",
  email: "/images/mascot/mascot_email.jpg",
  password_hide: "/images/mascot/mascot_password_hide.jpg",
  password_peek: "/images/mascot/mascot_password_peek.jpg",
  waiting: "/images/mascot/mascot_waiting.jpg",
  success: "/images/mascot/mascot_success.jpg",
};

export default function Student3DMascot({
  currentState,
  onStateChange,
  typingProgress = 0,
  showCinemaReelControl = true,
  className = "",
}: Student3DMascotProps) {
  // Cinema Reel Timeline State
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [reelTime, setReelTime] = useState(0); // 0 to 25 seconds
  const [blinking, setBlinking] = useState(false);
  const [activeMascotState, setActiveMascotState] = useState<MascotState>(currentState);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const activeImagePath = MASCOT_RENDER_PATHS[activeMascotState];
  const isImageAvailable = !imageErrorMap[activeImagePath];

  // Sync external state changes when not in cinema replay
  useEffect(() => {
    if (!isPlayingReel) {
      setActiveMascotState(currentState);
      const scene = SCENE_DEFINITIONS.find((s) => s.id === currentState);
      if (scene) {
        setReelTime(scene.startSec);
      }
    }
  }, [currentState, isPlayingReel]);

  // Periodic natural eye blink loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Cinema Reel Timer Animation Loop (25s total)
  useEffect(() => {
    if (!isPlayingReel) return;

    const interval = setInterval(() => {
      setReelTime((prev) => {
        const next = prev + 0.1;
        if (next >= 25.0) {
          setIsPlayingReel(false);
          return 25.0;
        }

        // Determine matching state by time
        const currentScene = SCENE_DEFINITIONS.find(
          (s) => next >= s.startSec && next < s.endSec
        );
        if (currentScene && currentScene.id !== activeMascotState) {
          setActiveMascotState(currentScene.id);
          onStateChange?.(currentScene.id);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlayingReel, activeMascotState, onStateChange]);

  const toggleCinemaPlay = () => {
    if (isPlayingReel) {
      setIsPlayingReel(false);
    } else {
      if (reelTime >= 24.9) {
        setReelTime(0);
        jumpToScene(SCENE_DEFINITIONS[0]);
      }
      setIsPlayingReel(true);
    }
  };

  const jumpToScene = (scene: typeof SCENE_DEFINITIONS[0]) => {
    setReelTime(scene.startSec);
    setActiveMascotState(scene.id);
    onStateChange?.(scene.id);
  };

  const currentSceneInfo = SCENE_DEFINITIONS.find((s) => s.id === activeMascotState) || SCENE_DEFINITIONS[0];

  // Head and eye tracking calculation based on typing or state
  const eyeOffset = activeMascotState === "email" ? 8 + typingProgress * 10 : 0;
  const headRotateY = activeMascotState === "email" ? 6 : activeMascotState === "waiting" ? -2 : 0;
  const headTranslateY = activeMascotState === "success" ? -14 : activeMascotState === "waiting" ? 4 : 0;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Character Viewport - 16:9 ratio feel with soft studio lighting */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-w-lg rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/10 via-sky-100/40 to-indigo-100/30 dark:from-[#0B1E38] dark:via-[#102D59]/60 dark:to-slate-900 border border-blue-200/60 dark:border-blue-900/50 shadow-2xl backdrop-blur-md flex items-center justify-center p-4">
        {/* Soft studio backdrop lighting aura */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 dark:bg-blue-600/25 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-1/4 right-1/4 w-52 h-52 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 dark:to-black/30" />
        </div>

        {/* Emotion / Scene Pill Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 shadow-sm text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">{currentSceneInfo.title}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-1.5">
            {currentSceneInfo.emotion}
          </span>
        </div>

        {/* Floating Confetti Layer for Scene 6 Success */}
        {activeMascotState === "success" && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-3 rounded-sm animate-bounce"
                style={{
                  backgroundColor: ["#3B82F6", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6"][i % 5],
                  left: `${(i * 13) % 95}%`,
                  top: `${(i * 17) % 70}%`,
                  transform: `rotate(${i * 35}deg)`,
                  animationDuration: `${1.2 + (i % 3) * 0.4}s`,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        )}

        {/* 3D Character Canvas / Render container */}
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1000px) rotateY(${headRotateY}deg) translateY(${headTranslateY}px)`,
          }}
        >
          {isImageAvailable ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={activeImagePath}
                alt={`ExamHub 3D Student Mascot - ${currentSceneInfo.title}`}
                className="w-full h-full object-contain filter drop-shadow-2xl transition-all duration-300 animate-in fade-in"
                onError={() => {
                  setImageErrorMap((prev) => ({ ...prev, [activeImagePath]: true }));
                }}
              />
            </div>
          ) : (
            /* Animated 3D Mascot Character Vector Fallback */
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Mascot Back: Yellow Backpack Straps */}
              <div className="absolute -top-2 w-44 h-48 rounded-[40px] bg-amber-400 dark:bg-amber-500 border-4 border-amber-600/60 shadow-lg -z-10 transform scale-90" />
              
              {/* Backpack Straps */}
              <div className="absolute top-12 left-8 w-5 h-28 bg-amber-500 dark:bg-amber-600 rounded-full border-2 border-amber-700/40 shadow-md" />
              <div className="absolute top-12 right-8 w-5 h-28 bg-amber-500 dark:bg-amber-600 rounded-full border-2 border-amber-700/40 shadow-md" />

              {/* Torso: Royal Blue Hoodie */}
              <div className="absolute bottom-0 w-48 h-32 bg-[#1E40AF] dark:bg-[#1D4ED8] rounded-t-[48px] border-4 border-blue-900 shadow-xl flex flex-col items-center justify-start pt-2">
                {/* Hoodie strings */}
                <div className="w-12 h-6 flex justify-between px-2 pt-1">
                  <div className="w-1.5 h-8 bg-white/80 rounded-full shadow-sm" />
                  <div className="w-1.5 h-8 bg-white/80 rounded-full shadow-sm" />
                </div>
                {/* White Graduation Cap Symbol on Hoodie Chest */}
                <div className="mt-1 flex flex-col items-center opacity-90">
                  <div className="w-7 h-3 bg-white transform rotate-45 rounded-sm shadow-sm" />
                  <div className="w-1.5 h-3 bg-white/70 -mt-1" />
                </div>
              </div>

              {/* Arms / Hands Layer */}
              {/* Scene 1: Welcome - Right Hand Waving */}
              {activeMascotState === "welcome" && (
                <div className="absolute top-20 -right-3 z-30 animate-[wave_1.5s_ease-in-out_infinite] origin-bottom-left">
                  <div className="w-10 h-10 rounded-full bg-[#8D5B4C] border-2 border-[#693F34] shadow-md flex items-center justify-center">
                    <div className="w-3 h-4 bg-[#8D5B4C] rounded-full -mt-2" />
                    <div className="w-2.5 h-3 bg-[#8D5B4C] rounded-full -mt-1 ml-1" />
                  </div>
                </div>
              )}

              {/* Scene 3: Password Hide - Both hands covering eyes */}
              {activeMascotState === "password_hide" && (
                <div className="absolute top-20 z-40 w-44 flex justify-between px-3 transition-all duration-300">
                  {/* Left hand covering left eye */}
                  <div className="w-14 h-12 rounded-2xl bg-[#8D5B4C] border-2 border-[#693F34] shadow-lg transform -rotate-12 flex items-center justify-center">
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                  </div>
                  {/* Right hand covering right eye */}
                  <div className="w-14 h-12 rounded-2xl bg-[#8D5B4C] border-2 border-[#693F34] shadow-lg transform rotate-12 flex items-center justify-center">
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                  </div>
                </div>
              )}

              {/* Scene 4: Password Peek - Hands parting with gap */}
              {activeMascotState === "password_peek" && (
                <div className="absolute top-20 z-40 w-52 flex justify-between px-1 transition-all duration-300">
                  {/* Left hand parted */}
                  <div className="w-14 h-12 rounded-2xl bg-[#8D5B4C] border-2 border-[#693F34] shadow-lg transform -rotate-25 -translate-x-2 flex items-center justify-center">
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5 ml-2" />
                  </div>
                  {/* Right hand parted */}
                  <div className="w-14 h-12 rounded-2xl bg-[#8D5B4C] border-2 border-[#693F34] shadow-lg transform rotate-25 translate-x-2 flex items-center justify-center">
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5 mr-2" />
                    <div className="w-2.5 h-5 bg-[#78473B] rounded-full mx-0.5" />
                  </div>
                </div>
              )}

              {/* Scene 5: Waiting - Hands clasped at chest */}
              {activeMascotState === "waiting" && (
                <div className="absolute bottom-12 z-30 w-24 h-12 rounded-full bg-[#8D5B4C] border-2 border-[#693F34] shadow-md flex items-center justify-center animate-pulse" />
              )}

              {/* Scene 6: Success - Both hands raised high in victory */}
              {activeMascotState === "success" && (
                <div className="absolute -top-4 w-60 z-30 flex justify-between animate-bounce">
                  <div className="w-12 h-14 rounded-full bg-[#8D5B4C] border-2 border-[#693F34] shadow-xl transform -rotate-45 flex items-center justify-center">
                    <span className="text-lg">✌️</span>
                  </div>
                  <div className="w-12 h-14 rounded-full bg-[#8D5B4C] border-2 border-[#693F34] shadow-xl transform rotate-45 flex items-center justify-center">
                    <span className="text-lg">👋</span>
                  </div>
                </div>
              )}

              {/* Head: Warm Brown Skin, Friendly Proportions */}
              <div className="absolute top-6 w-36 h-36 rounded-full bg-[#8D5B4C] border-4 border-[#693F34] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                {/* Short Stylish Dark Hair */}
                <div className="absolute -top-3 w-40 h-16 bg-[#1A1110] rounded-t-full shadow-inner transform scale-105" />
                <div className="absolute top-5 -left-1 w-8 h-8 bg-[#1A1110] rounded-full" />
                <div className="absolute top-5 -right-1 w-8 h-8 bg-[#1A1110] rounded-full" />

                {/* Eyebrows */}
                <div className="w-24 flex justify-between px-2 pt-7 z-10">
                  <div className={`w-6 h-1.5 bg-[#1A1110] rounded-full transition-transform ${
                    activeMascotState === "password_peek" ? "-rotate-12 translate-y-[-2px]" : 
                    activeMascotState === "waiting" ? "rotate-6 translate-y-[2px]" : "rotate-0"
                  }`} />
                  <div className={`w-6 h-1.5 bg-[#1A1110] rounded-full transition-transform ${
                    activeMascotState === "password_peek" ? "rotate-12 translate-y-[-2px]" : 
                    activeMascotState === "waiting" ? "-rotate-6 translate-y-[2px]" : "rotate-0"
                  }`} />
                </div>

                {/* Eyes Container */}
                <div className="w-24 flex justify-between px-3 mt-1 z-10">
                  {/* Left Eye */}
                  <div className={`w-7 h-8 bg-white rounded-full border-2 border-slate-900/20 overflow-hidden relative shadow-inner transition-all ${
                    blinking ? "scale-y-10" : "scale-y-100"
                  }`}>
                    <div 
                      className="w-4 h-4 bg-[#3E2319] rounded-full absolute top-2 transition-transform duration-150 flex items-center justify-center"
                      style={{ left: `${3 + eyeOffset * 0.3}px` }}
                    >
                      {/* Pupil spark reflection */}
                      <div className="w-1.5 h-1.5 bg-white rounded-full -mt-1 -ml-1" />
                    </div>
                  </div>

                  {/* Right Eye */}
                  <div className={`w-7 h-8 bg-white rounded-full border-2 border-slate-900/20 overflow-hidden relative shadow-inner transition-all ${
                    blinking ? "scale-y-10" : "scale-y-100"
                  }`}>
                    <div 
                      className="w-4 h-4 bg-[#3E2319] rounded-full absolute top-2 transition-transform duration-150 flex items-center justify-center"
                      style={{ left: `${3 + eyeOffset * 0.3}px` }}
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full -mt-1 -ml-1" />
                    </div>
                  </div>
                </div>

                {/* Cute Nose */}
                <div className="w-2.5 h-2 bg-[#754639] rounded-full mt-1 shadow-sm" />

                {/* Expressive Mouth */}
                <div className="mt-1">
                  {activeMascotState === "welcome" && (
                    <div className="w-9 h-4 bg-[#572418] rounded-b-full border-t border-[#3b1911] shadow-inner flex items-start justify-center">
                      <div className="w-6 h-1.5 bg-white rounded-b-sm" />
                    </div>
                  )}
                  {activeMascotState === "email" && (
                    <div className="w-7 h-3 bg-[#572418] rounded-b-full border-t border-[#3b1911] ml-2" />
                  )}
                  {activeMascotState === "password_hide" && (
                    <div className="w-6 h-2 rounded-full border-b-2 border-[#411b12] -mt-1" />
                  )}
                  {activeMascotState === "password_peek" && (
                    <div className="w-5 h-5 rounded-full bg-[#572418] border-2 border-[#3b1911] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-pink-300" />
                    </div>
                  )}
                  {activeMascotState === "waiting" && (
                    <div className="w-7 h-2 rounded-full border-b-2 border-[#411b12] animate-pulse" />
                  )}
                  {activeMascotState === "success" && (
                    <div className="w-12 h-6 bg-[#631c17] rounded-b-full border-2 border-[#411411] shadow-inner flex flex-col items-center justify-between py-0.5">
                      <div className="w-8 h-2 bg-white rounded-b-sm" />
                      <div className="w-4 h-2 bg-pink-400 rounded-t-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Scene Tracker Description at Bottom */}
        <div className="absolute bottom-3 left-4 right-4 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-[11px] flex items-center justify-between">
          <p className="text-slate-700 dark:text-slate-300 line-clamp-1 pr-2">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5">Mascot Reaction:</span>
            {currentSceneInfo.description}
          </p>
          <span className="font-mono text-[10px] text-slate-500 font-bold shrink-0">
            {currentSceneInfo.timeRange}
          </span>
        </div>
      </div>

      {/* Cinema Reel Controls Bar (0 - 25 seconds) */}
      {showCinemaReelControl && (
        <div className="w-full max-w-lg mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Film className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cinematic Login Mascot Reel (0–25s)</span>
            </div>
            <div className="font-mono text-blue-600 dark:text-blue-400 text-xs">
              {reelTime.toFixed(1)}s / 25.0s
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-blue-600 transition-all duration-100"
              style={{ width: `${(reelTime / 25) * 100}%` }}
            />
          </div>

          {/* Scene Jump Pills */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
            {SCENE_DEFINITIONS.map((scene, idx) => {
              const isActive = activeMascotState === scene.id;
              return (
                <button
                  key={scene.id}
                  onClick={() => jumpToScene(scene)}
                  className={`px-1.5 py-1.5 rounded-xl text-[10px] font-bold text-center transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title={scene.description}
                >
                  <span className="block truncate">S{idx + 1}</span>
                  <span className="block text-[8px] opacity-80">{scene.timeRange.split("–")[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Media Playback Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleCinemaPlay}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center space-x-1.5 transition-all"
            >
              {isPlayingReel ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingReel ? "Pause Reel" : "Play Full 25s Reel"}</span>
            </button>

            <button
              onClick={() => {
                setIsPlayingReel(false);
                setReelTime(0);
                jumpToScene(SCENE_DEFINITIONS[0]);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Reel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
