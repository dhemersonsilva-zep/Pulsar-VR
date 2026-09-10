import { useId, useState, type KeyboardEvent } from "react";

/**
 * Nave da central de comando pessoal.
 *
 * SVG puro + CSS: nada de Three.js/WebGL. A nave é vetorial, escala sem perda
 * em qualquer tela, não carrega asset nenhum e as animações são só transform/
 * opacity (compostas na GPU). Cada zona é um `<g>` focável e clicável — a nave
 * É a interface, não uma imagem com botões por cima.
 */

export type ZonaId =
  "ponte" | "estatisticas" | "jogos" | "conquistas" | "squad" | "cofre" | "ranking";

export type Zona = {
  id: ZonaId;
  nome: string;
  descricao: string;
  accent: "cyan" | "pink" | "purple" | "green" | "orange";
};

export const ZONAS: Zona[] = [
  {
    id: "ponte",
    nome: "PONTE DE COMANDO",
    descricao: "Ver perfil e progresso",
    accent: "cyan",
  },
  {
    id: "estatisticas",
    nome: "CENTRAL DE ESTATÍSTICAS",
    descricao: "Horas por plataforma e hábitos",
    accent: "cyan",
  },
  {
    id: "jogos",
    nome: "NÚCLEO DE JOGOS",
    descricao: "Seu jogo mais jogado",
    accent: "pink",
  },
  {
    id: "conquistas",
    nome: "HANGAR DE CONQUISTAS",
    descricao: "Seus emblemas desbloqueados",
    accent: "orange",
  },
  {
    id: "squad",
    nome: "SALA DO SQUAD",
    descricao: "Seu esquadrão na Pulsar",
    accent: "purple",
  },
  {
    id: "cofre",
    nome: "COFRE PULSAR",
    descricao: "Créditos e assinatura",
    accent: "green",
  },
  {
    id: "ranking",
    nome: "SALA DE OPERAÇÕES",
    descricao: "Sua posição na comunidade",
    accent: "cyan",
  },
];

const CORES: Record<Zona["accent"], string> = {
  cyan: "var(--neon-cyan)",
  pink: "var(--neon-pink)",
  purple: "var(--neon-purple)",
  green: "var(--neon-green)",
  orange: "var(--neon-orange)",
};

/** Geometria de cada zona no viewBox 0 0 760 620. */
const FORMAS: Record<ZonaId, { d: string; rotulo: [number, number] }> = {
  ponte: {
    d: "M380 42 L436 148 L418 196 L342 196 L324 148 Z",
    rotulo: [380, 140],
  },
  estatisticas: {
    d: "M332 208 L428 208 L440 300 L320 300 Z",
    rotulo: [380, 258],
  },
  jogos: {
    d: "M320 312 L440 312 L446 404 L314 404 Z",
    rotulo: [380, 360],
  },
  cofre: {
    d: "M314 416 L446 416 L432 502 L328 502 Z",
    rotulo: [380, 460],
  },
  conquistas: {
    d: "M306 250 L306 396 L120 452 L72 372 L148 268 Z",
    rotulo: [196, 356],
  },
  squad: {
    d: "M454 250 L612 268 L688 372 L640 452 L454 396 Z",
    rotulo: [564, 356],
  },
  ranking: {
    d: "M300 514 L460 514 L446 592 L314 592 Z",
    rotulo: [380, 552],
  },
};

type Props = {
  onSelecionar: (zona: ZonaId) => void;
  /** Zonas com algo novo para ver — ganham um pulso de destaque. */
  destaques?: ZonaId[];
};

export function NavePulsar({ onSelecionar, destaques = [] }: Props) {
  const [ativa, setAtiva] = useState<ZonaId | null>(null);
  const gradId = useId();

  const zonaAtiva = ZONAS.find((z) => z.id === ativa) ?? null;

  function teclado(e: KeyboardEvent<SVGGElement>, id: ZonaId) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelecionar(id);
    }
  }

  return (
    <div className="relative">
      <svg
        viewBox="0 0 760 620"
        className="w-full touch-manipulation select-none"
        role="group"
        aria-label="Nave da sua central de comando. Cada área abre um painel."
      >
        <defs>
          <radialGradient id={`${gradId}-casco`} cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="oklch(0.28 0.03 279)" />
            <stop offset="100%" stopColor="oklch(0.15 0.02 279)" />
          </radialGradient>
          <linearGradient id={`${gradId}-motor`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0.55" />
          </linearGradient>
          <filter id={`${gradId}-brilho`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Estrelas de fundo — puramente decorativas */}
        <g aria-hidden="true">
          {ESTRELAS.map((e, i) => (
            <circle
              key={i}
              cx={e[0]}
              cy={e[1]}
              r={e[2]}
              fill="white"
              opacity={e[3]}
              className="animate-pulse-soft"
              style={{ animationDelay: `${(i % 7) * 0.45}s` }}
            />
          ))}
        </g>

        {/* Silhueta do casco, sob as zonas */}
        <g aria-hidden="true">
          <path
            d="M380 30 L452 152 L470 244 L624 264 L700 372 L648 462 L458 404 L452 508 L470 520 L452 604 L308 604 L290 520 L308 508 L302 404 L112 462 L60 372 L136 264 L290 244 L308 152 Z"
            fill={`url(#${gradId}-casco)`}
            stroke="color-mix(in oklab, var(--neon-cyan) 30%, transparent)"
            strokeWidth="2"
          />
          <path
            d="M380 30 L380 604"
            stroke="color-mix(in oklab, white 8%, transparent)"
            strokeWidth="1.5"
          />
          {/* Rastro dos motores */}
          <path d="M314 604 L446 604 L414 620 L346 620 Z" fill={`url(#${gradId}-motor)`} />
        </g>

        {/* Zonas interativas */}
        {ZONAS.map((zona) => {
          const forma = FORMAS[zona.id];
          const cor = CORES[zona.accent];
          const selecionada = ativa === zona.id;
          const destacada = destaques.includes(zona.id);

          return (
            <g
              key={zona.id}
              role="button"
              tabIndex={0}
              aria-label={`${zona.nome}. ${zona.descricao}.`}
              className="cursor-pointer outline-none"
              onMouseEnter={() => setAtiva(zona.id)}
              onMouseLeave={() => setAtiva((v) => (v === zona.id ? null : v))}
              onFocus={() => setAtiva(zona.id)}
              onBlur={() => setAtiva((v) => (v === zona.id ? null : v))}
              onClick={() => onSelecionar(zona.id)}
              onKeyDown={(e) => teclado(e, zona.id)}
            >
              <path
                d={forma.d}
                fill={cor}
                fillOpacity={selecionada ? 0.3 : 0.09}
                stroke={cor}
                strokeWidth={selecionada ? 3 : 1.6}
                strokeOpacity={selecionada ? 1 : 0.55}
                style={{
                  transition: "fill-opacity .25s ease, stroke-width .25s ease",
                  filter: selecionada ? `drop-shadow(0 0 14px ${cor})` : undefined,
                }}
              />
              {destacada && !selecionada && (
                <circle
                  cx={forma.rotulo[0]}
                  cy={forma.rotulo[1]}
                  r="7"
                  fill={cor}
                  className="animate-pulse-soft"
                />
              )}
              <text
                x={forma.rotulo[0]}
                y={forma.rotulo[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={cor}
                fontSize="15"
                fontWeight="700"
                letterSpacing="2"
                opacity={selecionada ? 1 : 0.75}
                style={{ pointerEvents: "none", fontFamily: "var(--font-display)" }}
                filter={selecionada ? `url(#${gradId}-brilho)` : undefined}
              >
                {ICONES[zona.id]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip de HUD — só faz sentido com ponteiro fino */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-2 hidden justify-center transition-all duration-200 lg:flex ${
          zonaAtiva ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="glass-panel px-5 py-3 text-center">
          <p
            className="font-display text-xs font-bold tracking-[0.25em]"
            style={{ color: zonaAtiva ? CORES[zonaAtiva.accent] : undefined }}
          >
            [ {zonaAtiva?.nome ?? ""} ]
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{zonaAtiva?.descricao ?? ""}</p>
        </div>
      </div>
    </div>
  );
}

/** Glifo de cada zona, desenhado como texto para não pesar o SVG. */
const ICONES: Record<ZonaId, string> = {
  ponte: "◈",
  estatisticas: "▤",
  jogos: "◉",
  conquistas: "✦",
  squad: "⬡",
  cofre: "▣",
  ranking: "▲",
};

/** [cx, cy, r, opacidade] — fixas de propósito: sem Math.random no SSR. */
const ESTRELAS: [number, number, number, number][] = [
  [62, 88, 1.6, 0.5],
  [148, 44, 1.1, 0.35],
  [244, 116, 1.4, 0.45],
  [520, 62, 1.2, 0.4],
  [648, 128, 1.7, 0.55],
  [712, 232, 1.1, 0.3],
  [40, 288, 1.3, 0.4],
  [92, 508, 1.5, 0.45],
  [688, 512, 1.2, 0.35],
  [592, 584, 1.6, 0.5],
  [176, 588, 1.1, 0.3],
  [356, 18, 1.3, 0.4],
  [472, 468, 1, 0.28],
  [268, 452, 1.2, 0.32],
];
