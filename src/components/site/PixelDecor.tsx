import type { CSSProperties, SVGProps } from "react";

type PixelIconProps = SVGProps<SVGSVGElement>;

/** Controle de videogame, estilo pixel art 26x14 — gatilhos, D-pad, botões e analógicos. */
export function PixelGamepad(props: PixelIconProps) {
  return (
    <svg viewBox="0 0 26 14" shapeRendering="crispEdges" fill="currentColor" {...props}>
      {/* corpo */}
      <rect x="8" y="2" width="10" height="1" />
      <rect x="5" y="3" width="16" height="1" />
      <rect x="3" y="4" width="20" height="1" />
      <rect x="1" y="5" width="24" height="1" />
      <rect x="0" y="6" width="6" height="1" />
      <rect x="7" y="6" width="12" height="1" />
      <rect x="20" y="6" width="6" height="1" />
      <rect x="0" y="7" width="5" height="1" />
      <rect x="8" y="7" width="10" height="1" />
      <rect x="19" y="7" width="1" height="1" />
      <rect x="21" y="7" width="5" height="1" />
      <rect x="0" y="8" width="6" height="1" />
      <rect x="7" y="8" width="12" height="1" />
      <rect x="20" y="8" width="6" height="1" />
      <rect x="0" y="9" width="26" height="1" />
      <rect x="1" y="10" width="5" height="1" />
      <rect x="9" y="10" width="8" height="1" />
      <rect x="20" y="10" width="5" height="1" />
      <rect x="2" y="11" width="4" height="1" />
      <rect x="9" y="11" width="1" height="1" />
      <rect x="16" y="11" width="1" height="1" />
      <rect x="20" y="11" width="4" height="1" />
      <rect x="3" y="12" width="3" height="1" />
      <rect x="20" y="12" width="3" height="1" />
      <rect x="4" y="13" width="4" height="1" />
      <rect x="18" y="13" width="4" height="1" />
      {/* gatilhos L1/R1 */}
      <g fillOpacity={0.55}>
        <rect x="4" y="0" width="5" height="1" />
        <rect x="17" y="0" width="5" height="1" />
      </g>
      {/* direcional */}
      <g fillOpacity={0.4}>
        <rect x="6" y="6" width="1" height="1" />
        <rect x="5" y="7" width="3" height="1" />
        <rect x="6" y="8" width="1" height="1" />
      </g>
      {/* botões de ação */}
      <g fillOpacity={0.4}>
        <rect x="19" y="6" width="1" height="1" />
        <rect x="18" y="7" width="1" height="1" />
        <rect x="20" y="7" width="1" height="1" />
        <rect x="19" y="8" width="1" height="1" />
      </g>
      {/* analógicos */}
      <g fillOpacity={0.3}>
        <rect x="6" y="10" width="3" height="1" />
        <rect x="17" y="10" width="3" height="1" />
        <rect x="6" y="11" width="3" height="1" />
        <rect x="17" y="11" width="3" height="1" />
        <rect x="6" y="12" width="3" height="1" />
        <rect x="17" y="12" width="3" height="1" />
      </g>
    </svg>
  );
}

/** Mouse gamer, estilo pixel art 14x18 — seam dos botões, scroll, laterais e luz de DPI. */
export function PixelMouse(props: PixelIconProps) {
  return (
    <svg viewBox="0 0 14 18" shapeRendering="crispEdges" fill="currentColor" {...props}>
      {/* corpo */}
      <rect x="5" y="0" width="4" height="1" />
      <rect x="3" y="1" width="3" height="1" />
      <rect x="8" y="1" width="3" height="1" />
      <rect x="2" y="2" width="4" height="1" />
      <rect x="8" y="2" width="4" height="1" />
      <rect x="1" y="3" width="5" height="1" />
      <rect x="8" y="3" width="5" height="1" />
      <rect x="0" y="4" width="6" height="1" />
      <rect x="8" y="4" width="6" height="1" />
      <rect x="0" y="5" width="6" height="1" />
      <rect x="8" y="5" width="6" height="1" />
      <rect x="0" y="6" width="6" height="1" />
      <rect x="8" y="6" width="6" height="1" />
      <rect x="0" y="7" width="14" height="1" />
      <rect x="0" y="8" width="14" height="1" />
      <rect x="1" y="9" width="13" height="1" />
      <rect x="1" y="10" width="13" height="1" />
      <rect x="0" y="11" width="14" height="1" />
      <rect x="0" y="12" width="14" height="1" />
      <rect x="1" y="13" width="5" height="1" />
      <rect x="8" y="13" width="5" height="1" />
      <rect x="1" y="14" width="12" height="1" />
      <rect x="2" y="15" width="10" height="1" />
      <rect x="3" y="16" width="8" height="1" />
      <rect x="4" y="17" width="6" height="1" />
      {/* seam entre os botões */}
      <g fillOpacity={0.4}>
        <rect x="6" y="1" width="2" height="1" />
        <rect x="6" y="2" width="2" height="1" />
        <rect x="6" y="3" width="2" height="1" />
        <rect x="6" y="4" width="2" height="1" />
      </g>
      {/* roda de scroll */}
      <g fillOpacity={0.75}>
        <rect x="6" y="5" width="2" height="1" />
        <rect x="6" y="6" width="2" height="1" />
      </g>
      {/* botões laterais */}
      <g fillOpacity={0.6}>
        <rect x="0" y="9" width="1" height="1" />
        <rect x="0" y="10" width="1" height="1" />
      </g>
      {/* luz de DPI */}
      <g fillOpacity={0.85}>
        <rect x="6" y="13" width="2" height="1" />
      </g>
    </svg>
  );
}

/** Celular, estilo pixel art 8x13. */
export function PixelPhone(props: PixelIconProps) {
  return (
    <svg viewBox="0 0 8 13" shapeRendering="crispEdges" fill="currentColor" {...props}>
      <rect x="2" y="0" width="4" height="1" />
      <rect x="1" y="1" width="6" height="10" />
      <rect x="2" y="11" width="4" height="1" />
      <g opacity={0.4}>
        <rect x="2" y="1" width="4" height="8" />
      </g>
      <g opacity={0.7}>
        <rect x="3" y="10" width="2" height="1" />
      </g>
    </svg>
  );
}

/** Molécula pixelada, anel hexagonal com grupos satélite, grade 24x22. */
export function PixelMolecule(props: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 22" shapeRendering="crispEdges" fill="currentColor" {...props}>
      {/* átomos do anel */}
      <rect x="7" y="4" width="2" height="1" />
      <rect x="13" y="4" width="2" height="1" />
      <rect x="7" y="5" width="3" height="1" />
      <rect x="13" y="5" width="3" height="1" />
      <rect x="8" y="6" width="1" height="1" />
      <rect x="14" y="6" width="1" height="1" />
      <rect x="3" y="10" width="2" height="1" />
      <rect x="17" y="10" width="2" height="1" />
      <rect x="3" y="11" width="3" height="1" />
      <rect x="17" y="11" width="3" height="1" />
      <rect x="4" y="12" width="1" height="1" />
      <rect x="18" y="12" width="1" height="1" />
      <rect x="7" y="16" width="2" height="1" />
      <rect x="13" y="16" width="2" height="1" />
      <rect x="7" y="17" width="3" height="1" />
      <rect x="13" y="17" width="3" height="1" />
      <rect x="8" y="18" width="1" height="1" />
      <rect x="14" y="18" width="1" height="1" />
      {/* átomos satélite */}
      <g fillOpacity={0.75}>
        <rect x="13" y="0" width="2" height="1" />
        <rect x="0" y="7" width="1" height="1" />
        <rect x="21" y="7" width="2" height="1" />
        <rect x="0" y="8" width="1" height="1" />
        <rect x="21" y="8" width="2" height="1" />
        <rect x="21" y="13" width="2" height="1" />
        <rect x="21" y="14" width="2" height="1" />
        <rect x="7" y="20" width="2" height="1" />
        <rect x="7" y="21" width="2" height="1" />
      </g>
      {/* ligações */}
      <g fillOpacity={0.5}>
        <rect x="10" y="5" width="3" height="1" />
        <rect x="7" y="7" width="1" height="1" />
        <rect x="15" y="7" width="1" height="1" />
        <rect x="6" y="8" width="1" height="1" />
        <rect x="16" y="8" width="1" height="1" />
        <rect x="5" y="9" width="1" height="1" />
        <rect x="17" y="9" width="1" height="1" />
        <rect x="5" y="13" width="1" height="1" />
        <rect x="17" y="13" width="1" height="1" />
        <rect x="6" y="14" width="1" height="1" />
        <rect x="16" y="14" width="1" height="1" />
        <rect x="7" y="15" width="1" height="1" />
        <rect x="15" y="15" width="1" height="1" />
        <rect x="10" y="17" width="3" height="1" />
      </g>
    </svg>
  );
}

type DecorItem = {
  icon: (props: PixelIconProps) => React.JSX.Element;
  /** posição, tamanho e cor: ex. "top-[10%] left-[6%] w-8 h-8 text-neon-cyan" */
  className: string;
  duration?: string;
  delay?: string;
  opacity?: number;
  drift?: boolean;
};

function PixelDecorIcon({
  icon: Icon,
  className,
  duration = "8s",
  delay = "0s",
  opacity = 0.16,
  drift = false,
}: DecorItem) {
  const style: CSSProperties = {
    opacity,
    animationDuration: duration,
    animationDelay: delay,
  };
  return (
    <Icon
      className={`absolute ${drift ? "animate-pixel-drift" : "animate-pixel-float"} ${className}`}
      style={style}
    />
  );
}

/**
 * Camada de ícones pixelados (controle, mouse, celular, molécula) flutuando
 * suavemente atrás do conteúdo. Coloque dentro de um container `relative`.
 *
 * `layer="back"` (padrão) fica atrás do conteúdo normal da seção — use em
 * qualquer bloco cujos filhos não tenham `position` própria. `layer="front"`
 * fica no nível z-0, útil só quando já existe uma camada de fundo (ex.: uma
 * imagem em `absolute z-0`) e o texto acima está em `z-10`.
 */
export function PixelDecor({
  items,
  layer = "back",
}: {
  items: DecorItem[];
  layer?: "back" | "front";
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        layer === "back" ? "-z-10" : "z-0"
      }`}
    >
      {items.map((item, i) => (
        <PixelDecorIcon key={i} {...item} />
      ))}
    </div>
  );
}
