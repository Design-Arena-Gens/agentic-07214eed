"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

type Raindrop = {
  x: number;
  y: number;
  length: number;
  baseSpeed: number;
  sway: number;
  stagger: number;
};

type MistParticle = {
  x: number;
  y: number;
  radius: number;
  drift: number;
};

const RAIN_COUNT = 190;
const MIST_COUNT = 32;

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, height / 2, width / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawCat = (
  ctx: CanvasRenderingContext2D,
  options: {
    x: number;
    y: number;
    scale: number;
    palette: {
      fur: string;
      furShadow: string;
      ear: string;
      earInner: string;
      nose: string;
      eye: string;
    };
    tilt: number;
    cuddle?: boolean;
    pulse: number;
  },
) => {
  const { x, y, scale, palette, tilt, cuddle = false, pulse } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(tilt);

  const breathOffset = cuddle ? Math.sin(pulse) * 1.6 : Math.sin(pulse) * 1.1;

  // Body
  ctx.fillStyle = palette.fur;
  drawRoundedRect(ctx, -55, -10 + breathOffset, 110, 70, 32);
  ctx.fill();

  // Shadow
  ctx.fillStyle = palette.furShadow;
  ctx.globalAlpha = 0.65;
  drawRoundedRect(ctx, -50, 18 + breathOffset, 100, 32, 18);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Back
  ctx.beginPath();
  ctx.ellipse(25, -10 + breathOffset, 60, 36, 0, Math.PI, Math.PI * 2);
  ctx.fillStyle = palette.furShadow;
  ctx.fill();

  // Head
  ctx.save();
  ctx.translate(
    cuddle ? -32 + Math.cos(pulse) * 1.2 : -46 + Math.cos(pulse * 0.6),
    -30 + Math.sin(pulse * 0.7) * 1.5,
  );
  ctx.rotate(cuddle ? -0.25 + Math.sin(pulse * 0.4) * 0.04 : -0.12);

  ctx.fillStyle = palette.fur;
  drawRoundedRect(ctx, -28, -24, 56, 48, 18);
  ctx.fill();

  // Cheeks
  ctx.fillStyle = palette.furShadow;
  ctx.globalAlpha = 0.65;
  drawRoundedRect(ctx, -32, -6, 64, 24, 12);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Ears
  ctx.fillStyle = palette.ear;
  ctx.beginPath();
  ctx.moveTo(-20, -18);
  ctx.lineTo(-38, -42);
  ctx.lineTo(-10, -30);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(20, -18);
  ctx.lineTo(38, -42);
  ctx.lineTo(8, -30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.earInner;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(-18, -20);
  ctx.lineTo(-33, -38);
  ctx.lineTo(-11, -30);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(18, -20);
  ctx.lineTo(33, -38);
  ctx.lineTo(11, -30);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Eyes
  ctx.fillStyle = palette.eye;
  ctx.beginPath();
  ctx.ellipse(-12, -4, 6.5, 8.5, 0, 0, Math.PI * 2);
  ctx.ellipse(12, -6, 6.5, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(-9, -7, 2.1, 2.8, 0, 0, Math.PI * 2);
  ctx.ellipse(15, -9, 2.1, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = palette.nose;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-4, 6);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "rgba(30,20,20,0.6)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.quadraticCurveTo(-5, 10, -10, 14);
  ctx.moveTo(0, 6);
  ctx.quadraticCurveTo(5, 10, 10, 13);
  ctx.stroke();

  // Whiskers
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(-14, 2);
  ctx.lineTo(-38, 4);
  ctx.moveTo(-16, 8);
  ctx.lineTo(-42, 12);
  ctx.moveTo(14, 2);
  ctx.lineTo(38, 0);
  ctx.moveTo(16, 8);
  ctx.lineTo(44, 10);
  ctx.strokeStyle = "rgba(230,230,230,0.5)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();

  // Tail
  ctx.save();
  ctx.translate(45, 5 + breathOffset * 0.4);
  ctx.rotate(0.3 + Math.sin(pulse * 0.5) * 0.08);
  ctx.fillStyle = palette.fur;
  drawRoundedRect(ctx, -10, -8, 52, 22, 11);
  ctx.fill();
  ctx.restore();

  // Fore paws
  ctx.fillStyle = palette.furShadow;
  drawRoundedRect(ctx, -48, 42 + breathOffset, 20, 22, 9);
  drawRoundedRect(ctx, -24, 44 + breathOffset, 22, 20, 9);
  ctx.fill();

  // Back paw
  ctx.save();
  ctx.translate(42, 32 + breathOffset);
  ctx.rotate(Math.sin(pulse * 0.5) * 0.03 - 0.1);
  drawRoundedRect(ctx, -14, 0, 24, 20, 10);
  ctx.fillStyle = palette.furShadow;
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

const createRain = () =>
  Array.from({ length: RAIN_COUNT }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    length: 0.16 + Math.random() * 0.22,
    baseSpeed: 0.15 + Math.random() * 0.45,
    sway: (Math.random() - 0.5) * 0.0028,
    stagger: (index / RAIN_COUNT) * Math.PI * 2,
  }));

const createMist = () =>
  Array.from({ length: MIST_COUNT }, () => ({
    x: Math.random(),
    y: Math.random() * 0.25 + 0.65,
    radius: 120 + Math.random() * 180,
    drift: (Math.random() - 0.5) * 0.0006,
  }));

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let raindrops = createRain();
    const mist = createMist();
    let frameId = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();

    const handleResize = () => {
      resize();
      raindrops = createRain();
    };

    window.addEventListener("resize", handleResize);

    let lastTime = 0;

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 32);
      lastTime = time;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#05070d");
      sky.addColorStop(0.45, "#0b111d");
      sky.addColorStop(1, "#1a2431");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Vignette
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        Math.min(width, height) * 0.3,
        width * 0.5,
        height * 0.5,
        Math.max(width, height),
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Warm glow
      const glowX = width * 0.55;
      const glowY = height * 0.6;
      const glowGradient = ctx.createRadialGradient(glowX, glowY, 20, glowX, glowY, width * 0.5);
      glowGradient.addColorStop(0, "rgba(255,190,140,0.55)");
      glowGradient.addColorStop(0.3, "rgba(255,170,120,0.32)");
      glowGradient.addColorStop(1, "rgba(255,150,110,0)");
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // Ground
      ctx.fillStyle = "rgba(26,32,42,0.9)";
      ctx.fillRect(0, height * 0.75, width, height * 0.25);

      // Mist
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      mist.forEach((particle) => {
        particle.x += particle.drift * delta;
        if (particle.x > 1.05) particle.x = -0.05;
        if (particle.x < -0.05) particle.x = 1.05;
        const px = particle.x * width;
        const py = particle.y * height;
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, particle.radius);
        gradient.addColorStop(0, "rgba(255,215,195,0.05)");
        gradient.addColorStop(1, "rgba(255,215,195,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Rain
      ctx.lineWidth = 1.45;
      ctx.strokeStyle = "rgba(180,198,220,0.58)";
      ctx.lineCap = "round";
      raindrops.forEach((drop) => {
        const sway = Math.sin(time * 0.0008 + drop.stagger) * drop.sway * width;
        const speed = drop.baseSpeed * (0.55 + Math.sin(time * 0.0004 + drop.stagger) * 0.08);
        drop.y += (speed * delta) / 16;
        drop.x += (sway * delta) / 16;

        if (drop.y * height > height + 60) {
          drop.y = -Math.random() * 0.2;
          drop.x = Math.random();
        }

        ctx.beginPath();
        ctx.moveTo(drop.x * width, drop.y * height);
        ctx.lineTo(
          drop.x * width + sway * 0.9,
          drop.y * height + drop.length * height * 0.12,
        );
        ctx.stroke();
      });

      // Ripples
      const rippleY = height * 0.78;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "rgba(155,175,205,0.45)";
      for (let i = 0; i < 6; i += 1) {
        const radius = 35 + Math.sin(time * 0.001 + i) * 6;
        ctx.beginPath();
        ctx.ellipse(
          width * 0.52 + i * 18,
          rippleY + i * 3,
          radius,
          radius * 0.35,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      ctx.restore();

      const pulse = time * 0.0025;

      // Mother cat
      drawCat(ctx, {
        x: width * 0.54,
        y: height * 0.62,
        scale: width * 0.0019,
        palette: {
          fur: "#c07c54",
          furShadow: "#a46543",
          ear: "#915030",
          earInner: "#f2a887",
          nose: "#af6252",
          eye: "#2f1f1d",
        },
        tilt: Math.sin(pulse * 0.5) * 0.05 - 0.08,
        cuddle: true,
        pulse,
      });

      // Kitten
      drawCat(ctx, {
        x: width * 0.47,
        y: height * 0.68,
        scale: width * 0.00125,
        palette: {
          fur: "#d3c5c2",
          furShadow: "#b8a6a3",
          ear: "#9d7c71",
          earInner: "#f6c9c0",
          nose: "#c6847b",
          eye: "#29252d",
        },
        tilt: Math.sin(pulse * 0.7) * 0.12 + 0.22,
        cuddle: false,
        pulse,
      });

      // Shelter silhouette
      ctx.fillStyle = "rgba(12,16,24,0.65)";
      ctx.beginPath();
      ctx.moveTo(width * 0.32, height * 0.48);
      ctx.lineTo(width * 0.5, height * 0.32);
      ctx.lineTo(width * 0.68, height * 0.48);
      ctx.lineTo(width * 0.68, height * 0.8);
      ctx.lineTo(width * 0.32, height * 0.8);
      ctx.closePath();
      ctx.fill();

      // Highlight edges
      ctx.strokeStyle = "rgba(255,210,170,0.22)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.34);
      ctx.lineTo(width * 0.66, height * 0.48);
      ctx.moveTo(width * 0.5, height * 0.34);
      ctx.lineTo(width * 0.34, height * 0.48);
      ctx.stroke();

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main className={styles.scene}>
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div className={styles.overlay}>
        <h1 className={styles.title}>Sheltered In The Storm</h1>
        <p className={styles.subtitle}>
          Slow-motion rain, trembling whiskers, and a mother&apos;s embrace —
          an intimate moment of warmth against the chill.
        </p>
      </div>
      <div className={styles.letterboxTop} />
      <div className={styles.letterboxBottom} />
    </main>
  );
}
