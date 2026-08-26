import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  hue: "white" | "cyan" | "purple";
};

const COLORS: Record<Particle["hue"], string> = {
  white: "255 255 255",
  cyan: "125 231 245",
  purple: "173 121 245",
};

/**
 * Campo de partículas discreto em canvas — profundidade cinematográfica sem
 * custar frames: pausa fora da viewport, com a aba oculta, e vira uma imagem
 * estática (sem rAF) quando `prefers-reduced-motion` está ativo.
 */
export function Starfield({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let intersecting = true;
    let visible = true;

    function syncVisible() {
      visible = intersecting && !document.hidden;
    }

    function resize() {
      if (!canvas || !parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(140, Math.round((width * height) / 9000));
      particles = Array.from({ length: count }, () => {
        const hue: Particle["hue"] =
          Math.random() < 0.14 ? "cyan" : Math.random() < 0.24 ? "purple" : "white";
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.3,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          baseAlpha: Math.random() * 0.5 + 0.25,
          twinkleSpeed: Math.random() * 0.0015 + 0.0004,
          phase: Math.random() * Math.PI * 2,
          hue,
        };
      });
    }

    function draw(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }
        const twinkle = reducedMotion
          ? p.baseAlpha
          : p.baseAlpha * (0.6 + 0.4 * Math.sin(time * p.twinkleSpeed + p.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgb(${COLORS[p.hue]} / ${twinkle.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(time: number) {
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    }

    resize();
    draw(0);

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(parent);

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              intersecting = !!entry?.isIntersecting;
              syncVisible();
            },
            { threshold: 0 },
          )
        : null;
    intersectionObserver?.observe(canvas);

    function onVisibilityChange() {
      syncVisible();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (!reducedMotion) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
