import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { generateEditKey, hashSecret, verifySecret } from "@/lib/secret";
import type { JogadorRow } from "@/integrations/supabase/hub-types";
import {
  ESTATISTICAS_VAZIAS,
  avaliarConquistas,
  calcularPontos,
  calcularProgresso,
  calcularXp,
  conquistasPendentes,
  AVATAR_IDS,
  EMBLEMA_IDS,
  type EstatisticasJogador,
} from "@/lib/progressao";
import { CREDITOS_POR_REAL, CREDITOS_VALIDADE_DIAS, stations } from "@/lib/pulsar-data";

/* --------------------------------------------------------------------------
 * Sessão
 * ----------------------------------------------------------------------- */

const COOKIE_SESSAO = "pulsar_hub";
const SESSAO_DIAS = 60;

/**
 * O cookie guarda um token opaco e aleatório; o banco guarda só o hash. O
 * navegador nunca vê o id do jogador, então não há como forjar identidade
 * mexendo no cookie — o token precisa existir e não estar expirado.
 */
async function abrirSessao(jogadorId: string) {
  const { hubDb } = await import("@/integrations/supabase/hub-types");
  const db = await hubDb();

  const token = await generateEditKey();
  const tokenHash = await hashSecret(token);
  const expiraEm = new Date(Date.now() + SESSAO_DIAS * 24 * 60 * 60 * 1000);

  await db.from("jogador_sessoes").insert({
    token_hash: tokenHash,
    jogador_id: jogadorId,
    expira_em: expiraEm.toISOString(),
  });

  setCookie(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: SESSAO_DIAS * 24 * 60 * 60,
  });
}

/** Devolve o jogador da sessão atual, ou null. Nunca lança. */
async function jogadorDaSessao() {
  const token = getCookie(COOKIE_SESSAO);
  if (!token) return null;

  const { hubDb } = await import("@/integrations/supabase/hub-types");
  const db = await hubDb();

  const tokenHash = await hashSecret(token);
  const { data: sessao } = await db
    .from("jogador_sessoes")
    .select("jogador_id, expira_em")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!sessao) return null;
  if (new Date(sessao.expira_em).getTime() < Date.now()) {
    await db.from("jogador_sessoes").delete().eq("token_hash", tokenHash);
    return null;
  }

  const { data: jogador } = await db
    .from("jogadores")
    .select("*")
    .eq("id", sessao.jogador_id)
    .maybeSingle();

  return jogador ?? null;
}

/* --------------------------------------------------------------------------
 * Telefone
 * ----------------------------------------------------------------------- */

/**
 * Mesma normalização da coluna gerada `reservas.cliente_telefone_norm`:
 * só dígitos, últimos 11. Precisa continuar espelhando o SQL.
 */
export function normalizarTelefone(valor: string): string {
  return valor.replace(/\D/g, "").slice(-11);
}

const telefoneSchema = z
  .string()
  .min(8)
  .max(25)
  .transform(normalizarTelefone)
  .refine((v) => v.length >= 10, { message: "Telefone incompleto." });

/* --------------------------------------------------------------------------
 * Estatísticas derivadas das reservas
 * ----------------------------------------------------------------------- */

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;

type ReservaBruta = {
  id: string;
  estacao_id: string;
  estacao_nome: string;
  jogo: string | null;
  data: string;
  hora: string;
  duracao_horas: number;
  total_centavos: number;
  status: string;
};

type ReservaConcluida = {
  id: string;
  estacao_id: string;
  estacao_nome: string;
  jogo: string | null;
  data: string;
  hora: string;
  duracao_horas: number;
  total_centavos: number;
};

/**
 * Constrói o retrato do jogador a partir das reservas reais. `concluidas` vem
 * da view `reservas_concluidas` (paga E horário de término já passou), então
 * reserva futura nunca vira hora jogada — que é a regra pedida.
 */
function montarEstatisticas(
  todas: ReservaBruta[],
  concluidas: ReservaConcluida[],
  conquistasDesbloqueadas: number,
): EstatisticasJogador {
  const minutosPorEstacao: Record<string, number> = {};
  let minutosJogados = 0;

  for (const r of concluidas) {
    const minutos = r.duracao_horas * 60;
    minutosJogados += minutos;
    minutosPorEstacao[r.estacao_id] = (minutosPorEstacao[r.estacao_id] ?? 0) + minutos;
  }

  const idsConcluidas = new Set(concluidas.map((r) => r.id));
  const canceladas = todas.filter((r) =>
    ["cancelado", "recusado", "estornado"].includes(r.status),
  ).length;
  const futuras = todas.filter((r) => r.status === "pago" && !idsConcluidas.has(r.id)).length;

  return {
    minutosJogados,
    reservasConcluidas: concluidas.length,
    reservasTotais: todas.length,
    reservasCanceladas: canceladas,
    reservasFuturas: futuras,
    minutosPorEstacao,
    estacoesDistintas: Object.keys(minutosPorEstacao).length,
    conquistasDesbloqueadas,
  };
}

/** Ranking de jogos a partir das reservas concluídas que têm jogo informado. */
function montarJogos(concluidas: ReservaConcluida[]) {
  const mapa = new Map<
    string,
    { jogo: string; minutos: number; sessoes: number; estacoes: Set<string> }
  >();

  for (const r of concluidas) {
    if (!r.jogo) continue;
    const atual = mapa.get(r.jogo) ?? { jogo: r.jogo, minutos: 0, sessoes: 0, estacoes: new Set() };
    atual.minutos += r.duracao_horas * 60;
    atual.sessoes += 1;
    atual.estacoes.add(r.estacao_nome);
    mapa.set(r.jogo, atual);
  }

  const lista = [...mapa.values()]
    .map((j) => ({
      jogo: j.jogo,
      minutos: j.minutos,
      sessoes: j.sessoes,
      estacoes: [...j.estacoes],
    }))
    .sort((a, b) => b.minutos - a.minutos || b.sessoes - a.sessoes);

  const semJogo = concluidas.filter((r) => !r.jogo).length;
  return { lista, semJogo };
}

/** Dia da semana e horário mais frequentes — só com amostra suficiente. */
function montarHabitos(concluidas: ReservaConcluida[]) {
  const MINIMO = 3;
  if (concluidas.length < MINIMO) {
    return { diaFavorito: null, horarioFavorito: null, amostraMinima: MINIMO };
  }

  const porDia = new Map<number, number>();
  const porHora = new Map<string, number>();

  for (const r of concluidas) {
    const [ano, mes, dia] = r.data.split("-").map(Number);
    // Meio-dia UTC evita que o fuso empurre a data para o dia anterior.
    const d = new Date(Date.UTC(ano!, (mes ?? 1) - 1, dia ?? 1, 12));
    porDia.set(d.getUTCDay(), (porDia.get(d.getUTCDay()) ?? 0) + 1);
    const faixa = r.hora.slice(0, 2) + "h";
    porHora.set(faixa, (porHora.get(faixa) ?? 0) + 1);
  }

  const topDia = [...porDia.entries()].sort((a, b) => b[1] - a[1])[0];
  const topHora = [...porHora.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    diaFavorito: topDia ? { nome: DIAS_SEMANA[topDia[0]] ?? null, sessoes: topDia[1] } : null,
    horarioFavorito: topHora ? { faixa: topHora[0], sessoes: topHora[1] } : null,
    amostraMinima: MINIMO,
  };
}

/* --------------------------------------------------------------------------
 * Créditos
 * ----------------------------------------------------------------------- */

/**
 * Reconcilia o livro-razão: toda reserva paga vira um lançamento de crédito,
 * uma única vez (o índice único em `referencia` garante idempotência).
 * Créditos NUNCA são calculados nem enviados pelo cliente.
 */
async function reconciliarCreditos(jogadorId: string, telefoneNorm: string) {
  const { hubDb } = await import("@/integrations/supabase/hub-types");
  const db = await hubDb();

  const { data: pagas } = await db
    .from("reservas")
    .select("id, total_centavos, created_at")
    .eq("cliente_telefone_norm", telefoneNorm)
    .eq("status", "pago");

  if (!pagas?.length) return;

  const { data: existentes } = await db
    .from("creditos_transacoes")
    .select("referencia")
    .eq("jogador_id", jogadorId)
    .not("referencia", "is", null);

  const jaLancadas = new Set((existentes ?? []).map((t) => t.referencia));
  const novas = pagas
    .filter((r) => !jaLancadas.has(`reserva:${r.id}`))
    .map((r) => ({
      jogador_id: jogadorId,
      delta: Math.floor((r.total_centavos / 100) * CREDITOS_POR_REAL),
      motivo: "Reserva paga",
      referencia: `reserva:${r.id}`,
    }))
    .filter((t) => t.delta > 0);

  if (novas.length > 0) {
    await db.from("creditos_transacoes").insert(novas);
  }
}

async function carregarCreditos(jogadorId: string) {
  const { hubDb } = await import("@/integrations/supabase/hub-types");
  const db = await hubDb();

  const { data: transacoes } = await db
    .from("creditos_transacoes")
    .select("delta, motivo, created_at")
    .eq("jogador_id", jogadorId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: todas } = await db
    .from("creditos_transacoes")
    .select("delta")
    .eq("jogador_id", jogadorId);

  const saldo = (todas ?? []).reduce((acc, t) => acc + t.delta, 0);

  return {
    saldo,
    validadeDias: CREDITOS_VALIDADE_DIAS,
    extrato: (transacoes ?? []).map((t) => ({
      delta: t.delta,
      motivo: t.motivo,
      data: t.created_at,
    })),
  };
}

/* --------------------------------------------------------------------------
 * Server functions
 * ----------------------------------------------------------------------- */

/**
 * Primeiro passo do acesso: dado um telefone, diz se já existe império e se
 * há reservas para reivindicar. Não devolve nenhum dado pessoal.
 */
export const verificarTelefone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ telefone: telefoneSchema }).parse(input))
  .handler(async ({ data }) => {
    const { hubDb } = await import("@/integrations/supabase/hub-types");
    const db = await hubDb();

    const { data: jogador } = await db
      .from("jogadores")
      .select("id, imperio_nome")
      .eq("telefone_norm", data.telefone)
      .maybeSingle();

    const { count } = await db
      .from("reservas")
      .select("id", { count: "exact", head: true })
      .eq("cliente_telefone_norm", data.telefone);

    return {
      existe: Boolean(jogador),
      imperioNome: jogador?.imperio_nome ?? null,
      reservasEncontradas: count ?? 0,
    };
  });

const PALAVRAS_BLOQUEADAS = [
  "admin",
  "pulsar vr",
  "moderador",
  "puta",
  "merda",
  "caralho",
  "buceta",
  "viado",
  "nazi",
  "hitler",
];

const nomeSchema = z
  .string()
  .trim()
  .min(3, "Mínimo de 3 caracteres.")
  .max(28, "Máximo de 28 caracteres.")
  .regex(/^[\p{L}\p{N} '._-]+$/u, "Use apenas letras, números e espaços.")
  .refine(
    (v) => !PALAVRAS_BLOQUEADAS.some((p) => v.toLowerCase().includes(p)),
    "Esse nome não é permitido.",
  );

const fundarSchema = z.object({
  telefone: telefoneSchema,
  comandante: z.string().trim().min(2).max(40),
  imperioNome: nomeSchema,
  squadNome: nomeSchema.optional().or(z.literal("")),
  avatarId: z.string().refine((v) => AVATAR_IDS.includes(v)),
  emblemaId: z.string().refine((v) => EMBLEMA_IDS.includes(v)),
});

/**
 * Funda o império e abre a sessão. Devolve o código de acesso UMA única vez —
 * mesmo contrato do `editKey` dos grupos: não é recuperável depois.
 */
export const fundarImperio = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => fundarSchema.parse(input))
  .handler(async ({ data }) => {
    const { hubDb } = await import("@/integrations/supabase/hub-types");
    const db = await hubDb();

    const { data: existente } = await db
      .from("jogadores")
      .select("id")
      .eq("telefone_norm", data.telefone)
      .maybeSingle();

    if (existente) {
      throw new Error("Esse telefone já tem um império. Entre com o código de acesso.");
    }

    const codigo = await generateEditKey();
    const hash = await hashSecret(codigo);

    const { data: jogador, error } = await db
      .from("jogadores")
      .insert({
        telefone_norm: data.telefone,
        comandante: data.comandante,
        imperio_nome: data.imperioNome,
        squad_nome: data.squadNome || null,
        avatar_id: data.avatarId,
        emblema_id: data.emblemaId,
        grupo_id: null,
        access_key_hash: hash,
      })
      .select("id")
      .single();

    if (error || !jogador) {
      // 23505 = unique_violation (nome de império já usado)
      if ((error as { code?: string } | null)?.code === "23505") {
        throw new Error("Já existe um império com esse nome. Escolha outro.");
      }
      console.error("Erro ao fundar império", error);
      throw new Error("Não foi possível fundar o império agora. Tente de novo.");
    }

    await abrirSessao(jogador.id);
    return { codigo };
  });

/** Entra com telefone + código de acesso. */
export const entrarNoHub = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ telefone: telefoneSchema, codigo: z.string().trim().min(4).max(30) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { hubDb } = await import("@/integrations/supabase/hub-types");
    const db = await hubDb();

    const { data: jogador } = await db
      .from("jogadores")
      .select("id, access_key_hash")
      .eq("telefone_norm", data.telefone)
      .maybeSingle();

    if (!jogador) throw new Error("Não encontramos um império com esse telefone.");

    const valido = await verifySecret(data.codigo, jogador.access_key_hash);
    if (!valido) throw new Error("Código de acesso inválido.");

    await abrirSessao(jogador.id);
    return { ok: true };
  });

export const sairDoHub = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie(COOKIE_SESSAO);
  if (token) {
    const { hubDb } = await import("@/integrations/supabase/hub-types");
    const db = await hubDb();
    await db
      .from("jogador_sessoes")
      .delete()
      .eq("token_hash", await hashSecret(token));
  }
  deleteCookie(COOKIE_SESSAO, { path: "/" });
  return { ok: true };
});

/**
 * Carrega o HUB inteiro em uma chamada. TODO valor sensível (horas, XP,
 * créditos, conquistas, ranking) é derivado aqui no servidor — o cliente só
 * recebe o resultado pronto e não tem como influenciá-lo.
 */
export const carregarHub = createServerFn({ method: "GET" }).handler(async () => {
  const jogador = await jogadorDaSessao();
  if (!jogador) return { autenticado: false as const };

  const { hubDb } = await import("@/integrations/supabase/hub-types");
  const db = await hubDb();

  await reconciliarCreditos(jogador.id, jogador.telefone_norm);

  const [{ data: todas }, { data: concluidas }, { data: desbloqueadasRaw }] = await Promise.all([
    db
      .from("reservas")
      .select(
        "id, estacao_id, estacao_nome, jogo, data, hora, duracao_horas, total_centavos, status",
      )
      .eq("cliente_telefone_norm", jogador.telefone_norm)
      .order("data", { ascending: false }),
    db
      .from("reservas_concluidas")
      .select("id, estacao_id, estacao_nome, jogo, data, hora, duracao_horas, total_centavos")
      .eq("cliente_telefone_norm", jogador.telefone_norm),
    db
      .from("jogador_conquistas")
      .select("conquista_id, desbloqueada_em")
      .eq("jogador_id", jogador.id),
  ]);

  const desbloqueadas: Record<string, string> = {};
  for (const c of desbloqueadasRaw ?? []) desbloqueadas[c.conquista_id] = c.desbloqueada_em;

  const listaTodas = (todas ?? []) as ReservaBruta[];
  const listaConcluidas = (concluidas ?? []) as ReservaConcluida[];

  // Primeira passada: sem contar conquistas, para não haver dependência circular.
  const base = montarEstatisticas(listaTodas, listaConcluidas, 0);

  // Grava as conquistas recém-atingidas e devolve quais são novas, para animar.
  const pendentes = conquistasPendentes(base, desbloqueadas);
  if (pendentes.length > 0) {
    await db
      .from("jogador_conquistas")
      .insert(pendentes.map((id) => ({ jogador_id: jogador.id, conquista_id: id })));
    const agora = new Date().toISOString();
    for (const id of pendentes) desbloqueadas[id] = agora;
  }

  const stats = montarEstatisticas(listaTodas, listaConcluidas, Object.keys(desbloqueadas).length);
  const xp = calcularXp(stats);
  const progresso = calcularProgresso(xp);

  const { data: agregados } = await db
    .from("jogador_estatisticas")
    .select("jogador_id, minutos_concluidos")
    .order("minutos_concluidos", { ascending: false });

  const posicao = (agregados ?? []).findIndex((a) => a.jogador_id === jogador.id) + 1 || null;

  const creditos = await carregarCreditos(jogador.id);

  return {
    autenticado: true as const,
    perfil: {
      comandante: jogador.comandante,
      imperioNome: jogador.imperio_nome,
      squadNome: jogador.squad_nome,
      avatarId: jogador.avatar_id,
      emblemaId: jogador.emblema_id,
      grupoId: jogador.grupo_id,
      desde: jogador.created_at,
    },
    estatisticas: {
      ...stats,
      porEstacao: stations.map((s) => ({
        id: s.id,
        nome: s.nome,
        accent: s.accent,
        minutos: stats.minutosPorEstacao[s.id] ?? 0,
      })),
    },
    progresso,
    pontos: calcularPontos(stats),
    jogos: montarJogos(listaConcluidas),
    habitos: montarHabitos(listaConcluidas),
    conquistas: avaliarConquistas(stats, desbloqueadas),
    conquistasNovas: pendentes,
    creditos,
    ranking: { posicao, total: (agregados ?? []).length },
    proximasReservas: listaTodas
      .filter((r) => r.status === "pago")
      .filter((r) => !listaConcluidas.some((c) => c.id === r.id))
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        estacao: r.estacao_nome,
        jogo: r.jogo,
        data: r.data,
        hora: r.hora,
        duracao: r.duracao_horas,
      })),
  };
});

const atualizarSchema = z.object({
  imperioNome: nomeSchema.optional(),
  squadNome: nomeSchema.optional().or(z.literal("")),
  avatarId: z
    .string()
    .refine((v) => AVATAR_IDS.includes(v))
    .optional(),
  emblemaId: z
    .string()
    .refine((v) => EMBLEMA_IDS.includes(v))
    .optional(),
});

/**
 * Só campos cosméticos. Horas, XP, créditos, pontos, conquistas e status de
 * reserva NÃO estão aqui de propósito — não existe caminho pelo frontend
 * capaz de alterá-los.
 */
export const atualizarImperio = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => atualizarSchema.parse(input))
  .handler(async ({ data }) => {
    const jogador = await jogadorDaSessao();
    if (!jogador) throw new Error("Sessão expirada. Entre no HUB de novo.");

    const { hubDb } = await import("@/integrations/supabase/hub-types");
    const db = await hubDb();

    const updates: Partial<JogadorRow> = {};
    if (data.imperioNome) updates.imperio_nome = data.imperioNome;
    if (data.squadNome !== undefined) updates.squad_nome = data.squadNome || null;
    if (data.avatarId) updates.avatar_id = data.avatarId;
    if (data.emblemaId) updates.emblema_id = data.emblemaId;

    if (Object.keys(updates).length === 0) return { ok: true };

    const { error } = await db.from("jogadores").update(updates).eq("id", jogador.id);
    if (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new Error("Já existe um império com esse nome.");
      }
      throw new Error("Não foi possível salvar agora.");
    }

    return { ok: true };
  });

/**
 * Ranking público da comunidade. Devolve SÓ o que é público: império,
 * comandante, avatar, emblema, horas, nível e pontos. Telefone, código de
 * acesso e id nunca saem daqui.
 */
export const listarRankingJogadores = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(50).optional().default(20) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { hubDb } = await import("@/integrations/supabase/hub-types");
    const db = await hubDb();

    const { data: agregados, error } = await db
      .from("jogador_estatisticas")
      .select("jogador_id, minutos_concluidos, reservas_concluidas, estacoes_distintas")
      .order("minutos_concluidos", { ascending: false })
      .limit(data.limit);

    if (error || !agregados?.length) return [];

    const { data: perfis } = await db
      .from("jogadores")
      .select("id, comandante, imperio_nome, avatar_id, emblema_id")
      .in(
        "id",
        agregados.map((a) => a.jogador_id),
      );

    const porId = new Map((perfis ?? []).map((p) => [p.id, p]));

    return agregados
      .map((a, i) => {
        const perfil = porId.get(a.jogador_id);
        if (!perfil) return null;

        const stats = {
          ...ESTATISTICAS_VAZIAS,
          minutosJogados: a.minutos_concluidos,
          reservasConcluidas: a.reservas_concluidas,
          estacoesDistintas: a.estacoes_distintas,
        };
        const progresso = calcularProgresso(calcularXp(stats));

        return {
          posicao: i + 1,
          comandante: perfil.comandante,
          imperioNome: perfil.imperio_nome,
          avatarId: perfil.avatar_id,
          emblemaId: perfil.emblema_id,
          minutos: a.minutos_concluidos,
          nivel: progresso.nivel,
          patente: progresso.patente,
          pontos: calcularPontos(stats),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  });
