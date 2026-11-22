import React, { useEffect, useRef, useState } from "react";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function SpiderMascot3D({ size = 320, interactive = true }) {
  const canvasRef = useRef(null);
  const [clickCount, setClickCount] = useState(0);
  const [mascotMessage, setMascotMessage] = useState("Hey Scholar! Ready to conquer your exams?");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrame;

    let mouseX = size / 2;
    let mouseY = size / 2;
    let time = 0;

    const onMouseMove = (e) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    if (interactive) {
      window.addEventListener("mousemove", onMouseMove);
    }

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      // Gentle floating physics
      const cy = size / 2 + Math.sin(time) * 10;

      // 1. Outer Neon Hologram Aura
      const auraGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 140);
      auraGrad.addColorStop(0, "rgba(6, 182, 212, 0.35)");
      auraGrad.addColorStop(0.5, "rgba(37, 99, 235, 0.15)");
      auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.fill();

      // 2. Geometric Hex Spider Web Shield
      ctx.save();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.lineWidth = 1.2;
      for (let r = 50; r <= 130; r += 40) {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3 + time * 0.1;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // 3. Mascot Body - Futuristic Superhero Headgear
      // Base Head
      ctx.save();
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.ellipse(cx, cy, 65, 82, 0, 0, Math.PI * 2);
      // Dark Midnight Navy Gradient
      const headGrad = ctx.createLinearGradient(cx - 50, cy - 70, cx + 50, cy + 70);
      headGrad.addColorStop(0, "#1e293b");
      headGrad.addColorStop(0.4, "#0f172a");
      headGrad.addColorStop(1, "#020617");
      ctx.fillStyle = headGrad;
      ctx.fill();

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 4. Sleek Cyber Web Lines on Mask
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.2;
      // Vertical central web meridian
      ctx.beginPath();
      ctx.moveTo(cx, cy - 82);
      ctx.quadraticCurveTo(cx - 10, cy, cx, cy + 82);
      ctx.stroke();

      // Lateral web bands
      for (let offset = -50; offset <= 50; offset += 25) {
        ctx.beginPath();
        ctx.moveTo(cx - 55, cy + offset);
        ctx.quadraticCurveTo(cx, cy + offset - 12, cx + 55, cy + offset);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Interactive Superhero Eyes (Target Cursor Vector)
      const lookDx = Math.max(-10, Math.min(10, (mouseX - cx) * 0.05));
      const lookDy = Math.max(-8, Math.min(8, (mouseY - cy) * 0.05));

      const drawEye = (isLeft) => {
        ctx.save();
        const eyeX = isLeft ? cx - 30 + lookDx : cx + 30 + lookDx;
        const eyeY = cy - 8 + lookDy;
        const eyeAngle = isLeft ? -0.22 : 0.22;

        ctx.translate(eyeX, eyeY);
        ctx.rotate(eyeAngle);

        // Black Eye Socket Border
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 15, isLeft ? -0.2 : 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "#020617";
        ctx.fill();
        ctx.strokeStyle = "#0ea5e9";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Glowing Cyan Inner Eye
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 11, isLeft ? -0.2 : 0.2, 0, Math.PI * 2);
        const eyeGrad = ctx.createLinearGradient(0, -10, 0, 10);
        eyeGrad.addColorStop(0, "#e0f2fe");
        eyeGrad.addColorStop(0.5, "#38bdf8");
        eyeGrad.addColorStop(1, "#0284c7");
        ctx.fillStyle = eyeGrad;
        ctx.fill();

        ctx.restore();
      };

      drawEye(true);
      drawEye(false);

      // 6. Cyber Graduation Cap / Superhero Crest
      ctx.save();
      ctx.fillStyle = "#06b6d4";
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 80);
      ctx.lineTo(cx - 28, cy - 95);
      ctx.lineTo(cx, cy - 110);
      ctx.lineTo(cx + 28, cy - 95);
      ctx.closePath();
      ctx.fill();

      // Gold Tassel with physics
      const tasselX = cx + 28;
      const tasselY = cy - 95 + Math.sin(time * 1.5) * 6;
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 95);
      ctx.lineTo(tasselX, tasselY);
      ctx.stroke();
      ctx.restore();

      // 7. Spider Emblem on Chest Collar
      ctx.save();
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(cx, cy + 96, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (interactive) window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [size, interactive]);

  const handleMascotClick = () => {
    setClickCount(prev => prev + 1);
    const messages = [
      "Target verified! Exam scores are fully encrypted.",
      "Spider-Sense tingling! JEE & NEET hall tickets are ready.",
      "Study smart, stay focused. You're destined for Rank 1!",
      "ExamHub India cybersecurity shield: 100% Active!",
      "Boom! Web-slinging your way to academic distinction!"
    ];
    setMascotMessage(messages[clickCount % messages.length]);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div 
        onClick={handleMascotClick}
        className="cursor-pointer transition-transform hover:scale-105 active:scale-95 relative"
        title="Click your Spider Academic Mentor!"
      >
        <canvas 
          ref={canvasRef} 
          width={size} 
          height={size}
          className="drop-shadow-2xl"
        />
        {/* Floating Notification Speech Bubble */}
        <div className="absolute -bottom-2 bg-midnight-900/90 border border-cyan-500/40 rounded-2xl px-4 py-2 text-xs font-semibold text-cyan-200 shadow-glow-cyan flex items-center space-x-2 backdrop-blur-md animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{mascotMessage}</span>
        </div>
      </div>
    </div>
  );
}
