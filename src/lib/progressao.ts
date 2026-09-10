/**
 * Configuração central de progressão do HUB Pulsar.
 *
 * TODO número de XP, curva de nível, patente e conquista vive AQUI. Nada de
 * valor solto espalhado por componente ou server function — para mudar o
 * balanceamento do jogo, mexa só neste arquivo.
 *
 * Tudo aqui é função pura sobre `EstatisticasJogador`, que por sua vez sai
 * exclusivamente das reservas reais (ver `src/lib/hub.functions.ts`).
 */

/* --------------------------------------------------------------------------
 * XP
 * ----------------------------------------------------------------------- */

/** Quanto cada ação vale de XP. Ajuste livremente. */
export const XP_CONFIG = {
  /** Por reserva concluída (paga e já jogada). */
  porReservaConcluida: 50,
  /** Por hora efetivamente jogada. */
  porHoraJogada: 100,
  /** Bônus único por estação diferente já experimentada (VR, PS5, PC). */
  porEstacaoDiferente: 150,
  /** Por conquista desbloqueada. */
  porConquista: 75,
  /** Reservado para torneios/eventos — ainda não há fonte de dados. */
  porEvento: 200,
} as const;

/** Custo do nível N para o N+1: XP_BASE * N^XP_EXPOENTE. */
export const XP_BASE = 400;
export const XP_EXPOENTE = 1.25;

/** Nível máximo alcançável. */
export const NIVEL_MAXIMO = 50;

/** Patentes por faixa de nível — o título exibido na ponte de comando. */
export const PATENTES = [
  { nivel: 1, titulo: "Recruta" },
  { nivel: 5, titulo: "Piloto" },
  { nivel: 10, titulo: "Comandante" },
  { nivel: 25, titulo: "Almirante" },
  { nivel: 50, titulo: "Lenda Pulsar" },
] as const;

/** XP necessário para sair do nível informado. */
export function custoDoNivel(nivel: number): number {
  return Math.round(XP_BASE * Math.pow(nivel, XP_EXPOENTE));
}

/** XP acumulado necessário para ATINGIR o nível informado. */
export function xpAcumuladoAteNivel(nivel: number): number {
  let total = 0;
  for (let n = 1; n < nivel; n++) total += custoDoNivel(n);
  return total;
}

export type Progresso = {
  xp: number;
  nivel: number;
  patente: string;
  /** XP já conquistado dentro do nível atual. */
  xpNoNivel: number;
  /** XP necessário para fechar o nível atual. */
  xpDoNivel: number;
  /** 0–100, para a barra de progresso. */
  percentual: number;
  /** XP total acumulado necessário para o próximo nível. */
  xpProximoNivel: number;
  maximo: boolean;
};

export function patenteDoNivel(nivel: number): string {
  let titulo: string = PATENTES[0]!.titulo;
  for (const p of PATENTES) if (nivel >= p.nivel) titulo = p.titulo;
  return titulo;
}

/** Converte XP bruto em nível, patente e barra de progresso. */
export function calcularProgresso(xp: number): Progresso {
  const xpSeguro = Math.max(0, Math.floor(xp));

  let nivel = 1;
  let acumulado = 0;
  while (nivel < NIVEL_MAXIMO && xpSeguro >= acumulado + custoDoNivel(nivel)) {
    acumulado += custoDoNivel(nivel);
    nivel++;
  }

  const maximo = nivel >= NIVEL_MAXIMO;
  const xpDoNivel = maximo ? custoDoNivel(NIVEL_MAXIMO) : custoDoNivel(nivel);
  const xpNoNivel = maximo ? xpDoNivel : xpSeguro - acumulado;

  return {
    xp: xpSeguro,
    nivel,
    patente: patenteDoNivel(nivel),
    xpNoNivel,
    xpDoNivel,
    percentual: xpDoNivel > 0 ? Math.min(100, Math.round((xpNoNivel / xpDoNivel) * 100)) : 100,
    xpProximoNivel: acumulado + xpDoNivel,
    maximo,
  };
}

/* --------------------------------------------------------------------------
 * Estatísticas
 * ----------------------------------------------------------------------- */

/**
 * Retrato do jogador derivado das reservas. É a entrada de TODO o resto —
 * XP, conquistas e ranking. Nenhum campo aqui é editável pelo cliente.
 */
export type EstatisticasJogador = {
  minutosJogados: number;
  reservasConcluidas: number;
  reservasTotais: number;
  reservasCanceladas: number;
  reservasFuturas: number;
  /** Minutos por estação: { vr: 90, ps5: 120, pc: 0 }. */
  minutosPorEstacao: Record<string, number>;
  /** Quantas estações diferentes já foram jogadas. */
  estacoesDistintas: number;
  conquistasDesbloqueadas: number;
};

export const ESTATISTICAS_VAZIAS: EstatisticasJogador = {
  minutosJogados: 0,
  reservasConcluidas: 0,
  reservasTotais: 0,
  reservasCanceladas: 0,
  reservasFuturas: 0,
  minutosPorEstacao: {},
  estacoesDistintas: 0,
  conquistasDesbloqueadas: 0,
};

/**
 * XP total do jogador. Determinístico: as mesmas reservas sempre produzem o
 * mesmo XP, então não precisamos guardar XP no banco e ele nunca diverge.
 */
export function calcularXp(stats: EstatisticasJogador): number {
  const horas = stats.minutosJogados / 60;
  return Math.floor(
    stats.reservasConcluidas * XP_CONFIG.porReservaConcluida +
      horas * XP_CONFIG.porHoraJogada +
      stats.estacoesDistintas * XP_CONFIG.porEstacaoDiferente +
      stats.conquistasDesbloqueadas * XP_CONFIG.porConquista,
  );
}

/**
 * Pontuação exibida na ponte. Hoje é uma leitura mais "arcade" do XP; separada
 * de propósito para poder evoluir (torneios, desafios) sem mexer no XP.
 */
export function calcularPontos(stats: EstatisticasJogador): number {
  return Math.floor(stats.minutosJogados / 60) * 10 + stats.reservasConcluidas * 5;
}

/* --------------------------------------------------------------------------
 * Conquistas
 * ----------------------------------------------------------------------- */

export type Conquista = {
  id: string;
  nome: string;
  descricao: string;
  /** Nome do ícone lucide usado pela UI (ver ICONES_CONQUISTA). */
  icone: string;
  accent: "cyan" | "pink" | "purple" | "green" | "orange";
  /** Regra de desbloqueio. Roda só no servidor. */
  condicao: (s: EstatisticasJogador) => boolean;
  /** Progresso 0–1 para mostrar o quanto falta. */
  progresso: (s: EstatisticasJogador) => number;
};

function razao(atual: number, meta: number) {
  if (meta <= 0) return 1;
  return Math.min(1, atual / meta);
}

export const CONQUISTAS: Conquista[] = [
  {
    id: "primeiro-voo",
    nome: "PRIMEIRO VOO",
    descricao: "Faça sua primeira reserva.",
    icone: "Rocket",
    accent: "cyan",
    condicao: (s) => s.reservasConcluidas >= 1,
    progresso: (s) => razao(s.reservasConcluidas, 1),
  },
  {
    id: "veterano",
    nome: "VETERANO",
    descricao: "Jogue 10 horas.",
    icone: "Shield",
    accent: "cyan",
    condicao: (s) => s.minutosJogados >= 600,
    progresso: (s) => razao(s.minutosJogados, 600),
  },
  {
    id: "explorador",
    nome: "EXPLORADOR",
    descricao: "Jogue em PS5, PC e VR.",
    icone: "Compass",
    accent: "pink",
    condicao: (s) => s.estacoesDistintas >= 3,
    progresso: (s) => razao(s.estacoesDistintas, 3),
  },
  {
    id: "maratonista",
    nome: "MARATONISTA",
    descricao: "Jogue 25 horas.",
    icone: "Flame",
    accent: "orange",
    condicao: (s) => s.minutosJogados >= 1500,
    progresso: (s) => razao(s.minutosJogados, 1500),
  },
  {
    id: "frequente",
    nome: "TRIPULAÇÃO FIXA",
    descricao: "Complete 10 reservas.",
    icone: "CalendarCheck",
    accent: "purple",
    condicao: (s) => s.reservasConcluidas >= 10,
    progresso: (s) => razao(s.reservasConcluidas, 10),
  },
  {
    id: "imersao",
    nome: "IMERSÃO TOTAL",
    descricao: "Jogue 5 horas de Realidade Virtual.",
    icone: "Headset",
    accent: "purple",
    condicao: (s) => (s.minutosPorEstacao["vr"] ?? 0) >= 300,
    progresso: (s) => razao(s.minutosPorEstacao["vr"] ?? 0, 300),
  },
  {
    id: "lenda",
    nome: "LENDA",
    descricao: "Jogue 100 horas.",
    icone: "Crown",
    accent: "green",
    condicao: (s) => s.minutosJogados >= 6000,
    progresso: (s) => razao(s.minutosJogados, 6000),
  },
];

/**
 * Versão serializável da conquista — sem as funções `condicao`/`progresso`,
 * que não atravessam a fronteira servidor→cliente.
 */
export type ConquistaComEstado = Omit<Conquista, "condicao" | "progresso"> & {
  desbloqueada: boolean;
  desbloqueadaEm: string | null;
  progressoAtual: number;
};

/** Avalia o catálogo inteiro contra as estatísticas atuais. */
export function avaliarConquistas(
  stats: EstatisticasJogador,
  desbloqueadas: Record<string, string>,
): ConquistaComEstado[] {
  return CONQUISTAS.map((c) => ({
    id: c.id,
    nome: c.nome,
    descricao: c.descricao,
    icone: c.icone,
    accent: c.accent,
    desbloqueada: Boolean(desbloqueadas[c.id]),
    desbloqueadaEm: desbloqueadas[c.id] ?? null,
    progressoAtual: c.progresso(stats),
  }));
}

/** Ids que a pessoa acabou de atingir e ainda não estão gravados no banco. */
export function conquistasPendentes(
  stats: EstatisticasJogador,
  desbloqueadas: Record<string, string>,
): string[] {
  return CONQUISTAS.filter((c) => !desbloqueadas[c.id] && c.condicao(stats)).map((c) => c.id);
}

/* --------------------------------------------------------------------------
 * Identidade visual do comandante
 * ----------------------------------------------------------------------- */

export const AVATARES = [
  { id: "nova", nome: "Nova", glifo: "◆" },
  { id: "orion", nome: "Órion", glifo: "✦" },
  { id: "vega", nome: "Vega", glifo: "▲" },
  { id: "lyra", nome: "Lyra", glifo: "❖" },
  { id: "atlas", nome: "Atlas", glifo: "⬢" },
  { id: "zenit", nome: "Zênite", glifo: "✵" },
] as const;

export const EMBLEMAS = [
  { id: "pulsar", nome: "Pulsar", glifo: "◉" },
  { id: "cometa", nome: "Cometa", glifo: "☄" },
  { id: "orbita", nome: "Órbita", glifo: "◍" },
  { id: "nebulosa", nome: "Nebulosa", glifo: "❂" },
] as const;

export const AVATAR_IDS: string[] = AVATARES.map((a) => a.id);
export const EMBLEMA_IDS: string[] = EMBLEMAS.map((e) => e.id);

export function avatarPorId(id: string) {
  return AVATARES.find((a) => a.id === id) ?? AVATARES[0];
}

export function emblemaPorId(id: string) {
  return EMBLEMAS.find((e) => e.id === id) ?? EMBLEMAS[0];
}

/* --------------------------------------------------------------------------
 * Formatação
 * ----------------------------------------------------------------------- */

export function formatarDuracao(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  if (horas === 0) return `${resto}min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h ${String(resto).padStart(2, "0")}min`;
}

export function formatarXp(xp: number): string {
  return xp.toLocaleString("pt-BR");
}
