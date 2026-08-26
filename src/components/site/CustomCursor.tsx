import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [data-cursor="hover"]';

/**
 * Cursor customizado (ponto + anel) para desktop. Desativado automaticamente
 * em dispositivos touch (`pointer: coarse`) e quando o usuário pediu
 * `prefers-reduced-motion`. Some do DOM nesses casos — o cursor nativo do
 * navegador continua funcionando normalmente.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("cursor-none-desktop");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let hovering = false;
    let raf = 0;

    function onMove(e: PointerEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      hovering = !!(e.target as Element | null)?.closest(INTERACTIVE_SELECTOR);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
    }

    function tick() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      const scale = hovering ? 1.6 : 1;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.borderColor = hovering
          ? "var(--neon-cyan)"
          : "color-mix(in oklab, white 40%, transparent)";
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("cursor-none-desktop");
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dotRef} className="fixed left-0 top-0 size-1.5 rounded-full bg-neon-cyan" />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 size-8 rounded-full border transition-[transform,border-color] duration-150 ease-out"
      />
    </div>
  );
}
