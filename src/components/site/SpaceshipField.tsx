import { useEffect, useState, type CSSProperties } from "react";
import { ShipHeavyFighter, ShipInterceptor, ShipScout } from "@/components/site/Spaceship";

type Ship = {
  Icon: typeof ShipInterceptor;
  top: string;
  width: number;
  duration: number;
  delay: number;
  direction: "right" | "left";
  tilt: number;
  opacity: number;
  hull: string;
  accent?: string;
};

const SHIPS: Ship[] = [
  {
    Icon: ShipInterceptor,
    top: "10%",
    width: 150,
    duration: 27,
    delay: 0,
    direction: "right",
    tilt: -3,
    opacity: 0.85,
    hull: "var(--ship-red)",
    accent: "var(--ship-red-glow)",
  },
  {
    Icon: ShipScout,
    top: "22%",
    width: 80,
    duration: 18,
    delay: 5,
    direction: "right",
    tilt: -2,
    opacity: 0.65,
    hull: "var(--neon-purple)",
    accent: "var(--ship-purple-glow)",
  },
  {
    Icon: ShipHeavyFighter,
    top: "7%",
    width: 175,
    duration: 36,
    delay: 10,
    direction: "left",
    tilt: 3,
    opacity: 0.75,
    hull: "var(--ship-blue)",
    accent: "var(--ship-blue-glow)",
  },
  {
    Icon: ShipInterceptor,
    top: "27%",
    width: 90,
    duration: 22,
    delay: 16,
    direction: "left",
    tilt: -2,
    opacity: 0.55,
    hull: "var(--ship-blue)",
    accent: "var(--ship-blue-glow)",
  },
];

/**
 * Esquadrilha de caças estelares cruzando o topo do hero. Decorativa, atrás
 * do conteúdo. Parada (sem animação) se o usuário pediu
 * `prefers-reduced-motion`.
 */
export function SpaceshipField() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {SHIPS.map((ship, i) => {
        const style: CSSProperties = reducedMotion
          ? {
              top: ship.top,
              left: `${16 + i * 22}%`,
              width: ship.width,
              opacity: ship.opacity * 0.6,
            }
          : ({
              top: ship.top,
              width: ship.width,
              animationDuration: `${ship.duration}s`,
              animationDelay: `${ship.delay}s`,
              "--ship-tilt": `${ship.tilt}deg`,
              "--ship-opacity": ship.opacity,
            } as CSSProperties);

        return (
          <div
            key={i}
            className={`absolute ${
              reducedMotion
                ? ""
                : ship.direction === "right"
                  ? "animate-fly-right"
                  : "animate-fly-left"
            }`}
            style={style}
          >
            <ship.Icon
              style={
                {
                  color: ship.hull,
                  "--ship-accent": ship.accent,
                  filter: `drop-shadow(0 0 7px ${ship.accent ?? ship.hull})`,
                  transform: ship.direction === "left" ? "scaleX(-1)" : undefined,
                } as CSSProperties
              }
              className="w-full"
            />
          </div>
        );
      })}
    </div>
  );
}
