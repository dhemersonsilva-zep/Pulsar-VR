import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

const MAX_TILT_DEG = 6;

/**
 * Inclinação 3D sutil seguindo o ponteiro. Ignorado em touch (sem pointer
 * fino) e reduzido a zero se o usuário pediu `prefers-reduced-motion`.
 */
export function TiltCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || reducedMotion.current) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--ry", `${(px * MAX_TILT_DEG * 2).toFixed(2)}deg`);
    node.style.setProperty("--rx", `${(-py * MAX_TILT_DEG * 2).toFixed(2)}deg`);
    node.style.setProperty("--glow-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    node.style.setProperty("--glow-y", `${((py + 0.5) * 100).toFixed(1)}%`);
  }

  function handlePointerLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`tilt-card ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
