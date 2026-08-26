import { useId, type SVGProps } from "react";

type ShipProps = SVGProps<SVGSVGElement>;

/**
 * Caças estelares vistos de cima — cascos com sombreamento (gradiente),
 * canopy de cockpit e propulsores com brilho real (radial gradient), não
 * silhuetas planas. `useId()` evita colisão de ids de gradiente quando a
 * mesma nave é renderizada várias vezes (ver SpaceshipField.tsx).
 */

/** Interceptador vermelho, casco esguio e asas delta varridas. */
export function ShipInterceptor(props: ShipProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 160 60" fill="none" {...props}>
      <defs>
        <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ship-hull-light, #fff)" stopOpacity="0.35" />
          <stop offset="45%" stopColor="currentColor" />
          <stop offset="100%" stopColor="black" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="35%" stopColor="var(--ship-accent, currentColor)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--ship-accent, currentColor)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* rastro do propulsor */}
      <ellipse cx="14" cy="30" rx="22" ry="5" fill={`url(#${id}-glow)`} />
      <ellipse cx="20" cy="30" rx="8" ry="2.6" fill="white" opacity="0.85" />

      {/* asas */}
      <path
        d="M96 30 60 8 42 10 58 27 34 24 30 30 34 36 58 33 42 50 60 52 96 30Z"
        fill={`url(#${id}-hull)`}
        opacity="0.92"
      />

      {/* fuselagem */}
      <path d="M150 30 118 21 100 18 88 22 88 38 100 42 118 39 150 30Z" fill={`url(#${id}-hull)`} />
      {/* linha de painel */}
      <path d="M92 30 148 30" stroke="black" strokeOpacity="0.25" strokeWidth="1" />

      {/* canopy do cockpit */}
      <ellipse cx="112" cy="28" rx="7" ry="3.2" fill="#bfe9ff" opacity="0.9" />
      <ellipse
        cx="112"
        cy="28"
        rx="7"
        ry="3.2"
        fill="var(--ship-accent, currentColor)"
        opacity="0.25"
      />

      {/* bicos das asas */}
      <circle cx="42" cy="10" r="1.6" fill="var(--ship-accent, currentColor)" />
      <circle cx="42" cy="50" r="1.6" fill="var(--ship-accent, currentColor)" />
    </svg>
  );
}

/** Caça pesado, casco robusto com quatro asas em X e motor central. */
export function ShipHeavyFighter(props: ShipProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 180 70" fill="none" {...props}>
      <defs>
        <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ship-hull-light, #fff)" stopOpacity="0.3" />
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="100%" stopColor="black" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="35%" stopColor="var(--ship-accent, currentColor)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--ship-accent, currentColor)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* rastro dos dois motores */}
      <ellipse cx="18" cy="20" rx="18" ry="4.4" fill={`url(#${id}-glow)`} />
      <ellipse cx="18" cy="50" rx="18" ry="4.4" fill={`url(#${id}-glow)`} />

      {/* asas superiores/inferiores em X */}
      <path d="M90 30 40 6 24 8 50 26 90 30Z" fill={`url(#${id}-hull)`} opacity="0.9" />
      <path d="M90 40 40 64 24 62 50 44 90 40Z" fill={`url(#${id}-hull)`} opacity="0.9" />

      {/* nacelles dos motores */}
      <path d="M46 14 20 17 16 20 20 23 46 26 54 20Z" fill={`url(#${id}-hull)`} />
      <path d="M46 44 20 47 16 50 20 53 46 56 54 50Z" fill={`url(#${id}-hull)`} />

      {/* fuselagem central */}
      <path d="M170 35 128 24 98 20 86 26 86 44 98 50 128 46 170 35Z" fill={`url(#${id}-hull)`} />
      <path d="M92 35 166 35" stroke="black" strokeOpacity="0.25" strokeWidth="1" />

      {/* canopy */}
      <ellipse cx="130" cy="35" rx="8" ry="3.6" fill="#bfe9ff" opacity="0.9" />
      <ellipse
        cx="130"
        cy="35"
        rx="8"
        ry="3.6"
        fill="var(--ship-accent, currentColor)"
        opacity="0.25"
      />

      {/* canhão de nariz */}
      <rect
        x="168"
        y="32.5"
        width="10"
        height="5"
        rx="1.5"
        fill="var(--ship-accent, currentColor)"
      />
    </svg>
  );
}

/** Batedor pequeno, formato bala com motor único bem luminoso. */
export function ShipScout(props: ShipProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 110 40" fill="none" {...props}>
      <defs>
        <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ship-hull-light, #fff)" stopOpacity="0.35" />
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="100%" stopColor="black" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="35%" stopColor="var(--ship-accent, currentColor)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--ship-accent, currentColor)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="12" cy="20" rx="15" ry="4.2" fill={`url(#${id}-glow)`} />
      <ellipse cx="17" cy="20" rx="5" ry="2" fill="white" opacity="0.9" />

      <path d="M34 20 16 14 16 26 34 20Z" fill={`url(#${id}-hull)`} opacity="0.85" />
      <path d="M100 20 66 10 40 14 40 26 66 30 100 20Z" fill={`url(#${id}-hull)`} />

      <ellipse cx="70" cy="20" rx="5" ry="2.4" fill="#e9d6ff" opacity="0.9" />
      <ellipse
        cx="70"
        cy="20"
        rx="5"
        ry="2.4"
        fill="var(--ship-accent, currentColor)"
        opacity="0.3"
      />
    </svg>
  );
}
