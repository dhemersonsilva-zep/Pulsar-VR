/**
 * Capacidade gráfica do dispositivo e níveis de qualidade da nave 3D.
 *
 * Tudo aqui roda só no navegador — nada é chamado durante o SSR.
 */

export type Qualidade = "auto" | "baixo" | "medio" | "alto";
export type QualidadeEfetiva = Exclude<Qualidade, "auto">;

export type PerfilQualidade = {
  nivel: QualidadeEfetiva;
  /** Teto de devicePixelRatio — o que mais custa em GPU de celular. */
  pixelRatio: number;
  /** Quantidade de estrelas na cena. */
  estrelas: number;
  /** Sombras dinâmicas ligadas. */
  sombras: boolean;
  /** Antialiasing no contexto WebGL. */
  antialias: boolean;
  /** Subdivisões das geometrias da nave procedural. */
  segmentos: number;
};

export const PERFIS: Record<QualidadeEfetiva, PerfilQualidade> = {
  baixo: {
    nivel: "baixo",
    pixelRatio: 1,
    estrelas: 240,
    sombras: false,
    antialias: false,
    segmentos: 12,
  },
  medio: {
    nivel: "medio",
    pixelRatio: 1.5,
    estrelas: 700,
    sombras: false,
    antialias: true,
    segmentos: 24,
  },
  alto: {
    nivel: "alto",
    pixelRatio: 2,
    estrelas: 1400,
    sombras: true,
    antialias: true,
    segmentos: 48,
  },
};

/**
 * Testa WebGL de verdade: tenta criar o contexto. Não dá para confiar só na
 * existência de `window.WebGLRenderingContext` — navegador com aceleração
 * desligada tem a classe e falha na criação.
 */
export function temWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Libera o contexto imediatamente: navegadores limitam quantos existem.
    const perda = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    perda?.loseContext();
    return true;
  } catch (erro) {
    console.warn("[Nave3D] WebGL indisponível:", erro);
    return false;
  }
}

export function prefereMenosMovimento(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Escolhe o nível quando a qualidade está em AUTO. Heurística conservadora:
 * na dúvida, entrega menos — travar é pior que ficar menos bonito.
 */
export function detectarQualidade(): QualidadeEfetiva {
  if (typeof window === "undefined") return "medio";

  const nucleos = navigator.hardwareConcurrency ?? 4;
  const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const toque = window.matchMedia("(pointer: coarse)").matches;
  const telaPequena = window.innerWidth < 768;

  if (nucleos <= 4 || memoria <= 2) return "baixo";
  if (toque || telaPequena) return "medio";
  if (nucleos >= 8 && memoria >= 8) return "alto";
  return "medio";
}

export function resolverPerfil(escolha: Qualidade): PerfilQualidade {
  const nivel = escolha === "auto" ? detectarQualidade() : escolha;
  return PERFIS[nivel];
}
