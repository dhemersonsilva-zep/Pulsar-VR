import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Compass,
  Crown,
  Flame,
  Gamepad2,
  Headset,
  Lock,
  Monitor,
  Rocket,
  Shield,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  avatarPorId,
  emblemaPorId,
  formatarDuracao,
  formatarXp,
  type ConquistaComEstado,
} from "@/lib/progressao";
import { precoBRL, recompensas } from "@/lib/pulsar-data";
import type { ZonaId } from "./NavePulsar";

/* --------------------------------------------------------------------------
 * Blocos reutilizáveis
 * ----------------------------------------------------------------------- */

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="glass-card p-6 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function Metrica({
  rotulo,
  valor,
  sufixo,
  accent = "cyan",
}: {
  rotulo: string;
  valor: string;
  sufixo?: string | undefined;
  accent?: "cyan" | "pink" | "purple" | "green" | "orange";
}) {
  const cor = {
    cyan: "text-neon-cyan",
    pink: "text-neon-pink",
    purple: "text-neon-purple",
    green: "text-neon-green",
    orange: "text-neon-orange",
  }[accent];

  return (
    <div className="glass-card flex flex-col gap-1 p-4">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </span>
      <span className={`font-display text-2xl font-bold ${cor}`}>
        {valor}
        {sufixo && <span className="text-xs font-normal text-muted-foreground"> {sufixo}</span>}
      </span>
    </div>
  );
}

/** Barra horizontal estilo HUD. `valor` e `maximo` na mesma unidade. */
function Barra({
  rotulo,
  valor,
  maximo,
  texto,
  cor,
}: {
  rotulo: string;
  valor: number;
  maximo: number;
  texto: string;
  cor: string;
}) {
  const pct = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-mono uppercase tracking-widest text-muted-foreground">{rotulo}</span>
        <span className="font-display font-bold">{texto}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden bg-secondary">
        <div
          className="h-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, background: cor, boxShadow: `0 0 12px ${cor}` }}
        />
      </div>
    </div>
  );
}

const ACCENT_VAR: Record<string, string> = {
  cyan: "var(--neon-cyan)",
  pink: "var(--neon-pink)",
  green: "var(--neon-green)",
  purple: "var(--neon-purple)",
  orange: "var(--neon-orange)",
};

/* --------------------------------------------------------------------------
 * Tipos vindos de carregarHub()
 * ----------------------------------------------------------------------- */

export type HubDados = {
  perfil: {
    comandante: string;
    imperioNome: string;
    squadNome: string | null;
    avatarId: string;
    emblemaId: string;
    grupoId: string | null;
    desde: string;
  };
  estatisticas: {
    minutosJogados: number;
    reservasConcluidas: number;
    reservasTotais: number;
    reservasCanceladas: number;
    reservasFuturas: number;
    estacoesDistintas: number;
    porEstacao: { id: string; nome: string; accent: string; minutos: number }[];
  };
  progresso: {
    xp: number;
    nivel: number;
    patente: string;
    xpNoNivel: number;
    xpDoNivel: number;
    percentual: number;
    maximo: boolean;
  };
  pontos: number;
  jogos: {
    lista: { jogo: string; minutos: number; sessoes: number; estacoes: string[] }[];
    semJogo: number;
  };
  habitos: {
    diaFavorito: { nome: string | null; sessoes: number } | null;
    horarioFavorito: { faixa: string; sessoes: number } | null;
    amostraMinima: number;
  };
  conquistas: ConquistaComEstado[];
  creditos: {
    saldo: number;
    validadeDias: number;
    extrato: { delta: number; motivo: string; data: string }[];
  };
  ranking: { posicao: number | null; total: number };
  proximasReservas: {
    id: string;
    estacao: string;
    jogo: string | null;
    data: string;
    hora: string;
    duracao: number;
  }[];
};

/* --------------------------------------------------------------------------
 * Ponte de comando
 * ----------------------------------------------------------------------- */

export function PainelPonte({ dados }: { dados: HubDados }) {
  const { perfil, progresso, estatisticas, pontos, ranking } = dados;
  const avatar = avatarPorId(perfil.avatarId)!;
  const emblema = emblemaPorId(perfil.emblemaId)!;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <div className="flex size-20 shrink-0 items-center justify-center border border-neon-cyan/40 bg-neon-cyan/10">
          <span className="text-3xl text-neon-cyan">{avatar.glifo}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
            {emblema.glifo} Império
          </p>
          <h3 className="truncate font-display text-2xl font-black">{perfil.imperioNome}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comandante: <span className="text-foreground">{perfil.comandante}</span>
          </p>
          {perfil.squadNome && (
            <p className="text-sm text-muted-foreground">
              Squad: <span className="text-foreground">{perfil.squadNome}</span>
            </p>
          )}
        </div>
      </div>

      <div className="glass-card flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg font-bold">
            NÍVEL {progresso.nivel}
            <span className="ml-2 font-sans text-xs font-normal uppercase tracking-widest text-neon-purple">
              {progresso.patente}
            </span>
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {progresso.maximo
              ? "NÍVEL MÁXIMO"
              : `${formatarXp(progresso.xpNoNivel)} / ${formatarXp(progresso.xpDoNivel)} XP`}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden bg-secondary">
          <div
            className="h-full bg-gradient-accent transition-[width] duration-700 ease-out"
            style={{ width: `${progresso.percentual}%` }}
          />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {formatarXp(progresso.xp)} XP acumulado
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica rotulo="Tempo jogado" valor={formatarDuracao(estatisticas.minutosJogados)} />
        <Metrica rotulo="Pontos" valor={pontos.toLocaleString("pt-BR")} accent="pink" />
        <Metrica
          rotulo="Reservas"
          valor={String(estatisticas.reservasConcluidas)}
          sufixo="concluídas"
          accent="purple"
        />
        <Metrica
          rotulo="Ranking"
          valor={ranking.posicao ? `#${ranking.posicao}` : "—"}
          sufixo={ranking.posicao ? `de ${ranking.total}` : undefined}
          accent="green"
        />
      </div>

      {dados.proximasReservas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Próximas missões
          </p>
          {dados.proximasReservas.map((r) => (
            <div
              key={r.id}
              className="glass-card flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="truncate">
                {r.estacao}
                {r.jogo && <span className="text-muted-foreground"> · {r.jogo}</span>}
              </span>
              <span className="shrink-0 font-mono text-xs text-neon-cyan">
                {r.data.split("-").reverse().join("/")} · {r.hora}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Estatísticas
 * ----------------------------------------------------------------------- */

export function PainelEstatisticas({ dados }: { dados: HubDados }) {
  const { estatisticas, habitos } = dados;
  const maximo = Math.max(1, ...estatisticas.porEstacao.map((e) => e.minutos));
  const semDados = estatisticas.minutosJogados === 0;

  if (semDados) {
    return (
      <Vazio>
        Continue jogando para desbloquear suas estatísticas. Elas aparecem aqui assim que sua
        primeira reserva paga terminar.
      </Vazio>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
          Tempo total jogado
        </p>
        <p className="mt-2 font-display text-5xl font-black text-neon-cyan">
          {formatarDuracao(estatisticas.minutosJogados)}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {estatisticas.porEstacao.map((e) => (
          <Barra
            key={e.id}
            rotulo={e.nome}
            valor={e.minutos}
            maximo={maximo}
            texto={e.minutos > 0 ? formatarDuracao(e.minutos) : "—"}
            cor={ACCENT_VAR[e.accent] ?? "var(--neon-cyan)"}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica rotulo="Reservas totais" valor={String(estatisticas.reservasTotais)} />
        <Metrica
          rotulo="Concluídas"
          valor={String(estatisticas.reservasConcluidas)}
          accent="green"
        />
        <Metrica rotulo="Agendadas" valor={String(estatisticas.reservasFuturas)} accent="purple" />
        <Metrica
          rotulo="Canceladas"
          valor={String(estatisticas.reservasCanceladas)}
          accent="pink"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="glass-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Dia que mais joga
          </p>
          <p className="mt-1 font-display text-lg font-bold">
            {habitos.diaFavorito?.nome ?? "Sem dados suficientes"}
          </p>
          {habitos.diaFavorito && (
            <p className="text-xs text-muted-foreground">{habitos.diaFavorito.sessoes} sessões</p>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Horário preferido
          </p>
          <p className="mt-1 font-display text-lg font-bold">
            {habitos.horarioFavorito?.faixa ?? "Sem dados suficientes"}
          </p>
          {habitos.horarioFavorito && (
            <p className="text-xs text-muted-foreground">
              {habitos.horarioFavorito.sessoes} sessões
            </p>
          )}
        </div>
      </div>

      {!habitos.diaFavorito && (
        <p className="text-center text-xs text-muted-foreground">
          Hábitos aparecem a partir de {habitos.amostraMinima} sessões concluídas — abaixo disso o
          dado não significa nada.
        </p>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Jogos
 * ----------------------------------------------------------------------- */

export function PainelJogos({ dados }: { dados: HubDados }) {
  const { lista, semJogo } = dados.jogos;
  const top = lista[0];

  if (!top) {
    return (
      <Vazio>
        Ainda não temos o jogo das suas sessões. Escolha o jogo ao reservar e este painel começa a
        se montar sozinho.
        {semJogo > 0 && (
          <>
            <br />
            <span className="mt-2 block text-xs">
              {semJogo} {semJogo === 1 ? "sessão concluída não tem" : "sessões concluídas não têm"}{" "}
              jogo registrado.
            </span>
          </>
        )}
      </Vazio>
    );
  }

  const maximo = Math.max(...lista.map((j) => j.minutos));

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-pink">
          Jogo mais jogado
        </p>
        <p className="mt-2 font-display text-3xl font-black">{top.jogo}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>
            <span className="font-bold text-foreground">{formatarDuracao(top.minutos)}</span>{" "}
            jogadas
          </span>
          <span>
            <span className="font-bold text-foreground">{top.sessoes}</span>{" "}
            {top.sessoes === 1 ? "sessão" : "sessões"}
          </span>
          <span>{top.estacoes.join(" · ")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Seu ranking de jogos
        </p>
        {lista.slice(0, 8).map((j, i) => (
          <Barra
            key={j.jogo}
            rotulo={`${i + 1}. ${j.jogo}`}
            valor={j.minutos}
            maximo={maximo}
            texto={formatarDuracao(j.minutos)}
            cor={i === 0 ? "var(--neon-pink)" : "var(--neon-purple)"}
          />
        ))}
      </div>

      {semJogo > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {semJogo} {semJogo === 1 ? "sessão concluída não tem" : "sessões concluídas não têm"} jogo
          registrado e não entra nessa conta.
        </p>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Conquistas
 * ----------------------------------------------------------------------- */

const ICONES_CONQUISTA: Record<string, LucideIcon> = {
  Rocket,
  Shield,
  Compass,
  Flame,
  CalendarCheck,
  Headset,
  Crown,
};

export function PainelConquistas({ dados }: { dados: HubDados }) {
  const desbloqueadas = dados.conquistas.filter((c) => c.desbloqueada).length;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {desbloqueadas} de {dados.conquistas.length} desbloqueadas
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {dados.conquistas.map((c) => {
          const Icone = ICONES_CONQUISTA[c.icone] ?? Trophy;
          const cor = ACCENT_VAR[c.accent] ?? "var(--neon-cyan)";
          const pct = Math.round(c.progressoAtual * 100);

          return (
            <div
              key={c.id}
              className={`glass-card flex flex-col gap-3 p-4 transition-opacity ${
                c.desbloqueada ? "" : "opacity-60"
              }`}
              style={c.desbloqueada ? { borderColor: cor } : undefined}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center border"
                  style={{
                    borderColor: c.desbloqueada ? cor : "var(--border)",
                    background: c.desbloqueada
                      ? `color-mix(in oklab, ${cor} 15%, transparent)`
                      : undefined,
                  }}
                >
                  {c.desbloqueada ? (
                    <Icone className="size-5" style={{ color: cor }} />
                  ) : (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">{c.descricao}</p>
                </div>
              </div>

              {!c.desbloqueada && pct > 0 && (
                <div className="h-1.5 w-full overflow-hidden bg-secondary">
                  <div className="h-full" style={{ width: `${pct}%`, background: cor }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Cofre (créditos + Pulsar Pass + Pulsar Day)
 * ----------------------------------------------------------------------- */

export function PainelCofre({ dados }: { dados: HubDados }) {
  const { creditos } = dados;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-green">
          Créditos Pulsar
        </p>
        <p className="mt-2 font-display text-5xl font-black text-neon-green">
          {creditos.saldo.toLocaleString("pt-BR")}
          <span className="ml-2 text-lg font-normal text-muted-foreground">PLS</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          1 crédito por real gasto · válidos por {creditos.validadeDias} dias
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Trocas disponíveis
        </p>
        {recompensas.map((r) => {
          const alcancavel = creditos.saldo >= r.creditos;
          return (
            <div
              key={r.id}
              className={`glass-card flex items-center justify-between gap-3 px-4 py-3 ${
                alcancavel ? "border-neon-green/40" : "opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.titulo}</p>
                <p className="text-xs text-muted-foreground">{r.creditos} créditos</p>
              </div>
              <span
                className={`shrink-0 font-mono text-[10px] uppercase tracking-widest ${
                  alcancavel ? "text-neon-green" : "text-muted-foreground"
                }`}
              >
                {alcancavel ? "Disponível" : `faltam ${r.creditos - creditos.saldo}`}
              </span>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          O resgate ainda é feito pela equipe no WhatsApp — o botão de troca automática entra quando
          o fluxo estiver validado.
        </p>
      </div>

      {creditos.extrato.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Extrato
          </p>
          {creditos.extrato.map((t, i) => (
            <div
              key={`${t.data}-${i}`}
              className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0"
            >
              <span className="truncate text-muted-foreground">{t.motivo}</span>
              <span
                className={`shrink-0 font-mono text-xs ${
                  t.delta >= 0 ? "text-neon-green" : "text-neon-pink"
                }`}
              >
                {t.delta >= 0 ? "+" : ""}
                {t.delta}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Assinaturas — estrutura visual, sem cobrança */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="glass-card flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-neon-cyan" />
            <p className="font-display text-sm font-bold">PULSAR PASS</p>
          </div>
          <p className="font-display text-2xl font-bold text-neon-cyan">
            {precoBRL(49.9)}
            <span className="text-xs font-normal text-muted-foreground"> / mês</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Horas inclusas, cashback e créditos bônus. Assinatura recorrente ainda não está
            implementada — nada é cobrado por aqui.
          </p>
          <span className="mt-1 w-fit border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Em preparação
          </span>
        </div>

        <div className="glass-card flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2">
            <Gamepad2 className="size-4 text-neon-purple" />
            <p className="font-display text-sm font-bold">PULSAR DAY</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Passe de uso diário com tempo de jogo e créditos bônus. Estrutura pronta, regras
            comerciais ainda a definir.
          </p>
          <span className="mt-auto w-fit border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Em preparação
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Squad
 * ----------------------------------------------------------------------- */

export function PainelSquad({ dados }: { dados: HubDados }) {
  const { perfil } = dados;

  return (
    <div className="flex flex-col gap-5">
      {perfil.squadNome ? (
        <div className="glass-panel p-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-purple">
            Seu squad
          </p>
          <p className="mt-2 font-display text-3xl font-black">{perfil.squadNome}</p>
        </div>
      ) : (
        <Vazio>
          Você ainda não definiu um squad. Dá pra escolher um nome ao editar seu império.
        </Vazio>
      )}

      <div className="glass-card flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Monitor className="size-4 text-neon-purple" />
          <p className="font-display text-sm font-bold">SQUADS PÚBLICOS</p>
        </div>
        <p className="text-sm text-muted-foreground">
          A Pulsar já tem perfis públicos de squad e império, com banner, horas reais e ranking da
          cidade. O seu HUB pessoal e esses perfis ainda vivem em sistemas separados — juntar os
          dois (convite de membros, pontuação coletiva, emblema compartilhado) é o próximo passo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/squads/novo"
            className="border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-purple hover:text-neon-purple"
          >
            Criar squad público
          </Link>
          <Link
            to="/ranking"
            className="border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan hover:text-neon-cyan"
          >
            Ver ranking de squads
          </Link>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Ranking
 * ----------------------------------------------------------------------- */

export type LinhaRanking = {
  posicao: number;
  comandante: string;
  imperioNome: string;
  avatarId: string;
  emblemaId: string;
  minutos: number;
  nivel: number;
  patente: string;
  pontos: number;
};

export function PainelRanking({
  linhas,
  minhaPosicao,
  carregando,
}: {
  linhas: LinhaRanking[];
  minhaPosicao: number | null;
  carregando: boolean;
}) {
  if (carregando) {
    return <Vazio>Carregando a sala de operações…</Vazio>;
  }

  if (linhas.length === 0) {
    return (
      <Vazio>
        Ninguém tem horas concluídas ainda. O ranking se monta conforme as sessões acontecem.
      </Vazio>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {minhaPosicao && (
        <p className="text-center font-mono text-xs uppercase tracking-widest text-neon-cyan">
          Sua posição: #{minhaPosicao}
        </p>
      )}

      {linhas.map((l) => {
        const avatar = avatarPorId(l.avatarId)!;
        const podio = l.posicao <= 3;

        return (
          <div
            key={`${l.posicao}-${l.imperioNome}`}
            className={`glass-card flex items-center gap-4 p-4 ${
              l.posicao === minhaPosicao ? "border-neon-cyan/60" : ""
            }`}
          >
            <span
              className={`w-10 shrink-0 text-center font-display text-xl font-black ${
                podio ? "text-neon-cyan" : "text-muted-foreground"
              }`}
            >
              #{l.posicao}
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center border border-border text-lg text-neon-purple">
              {avatar.glifo}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold">{l.imperioNome}</p>
              <p className="truncate text-xs text-muted-foreground">
                {l.comandante} · Nível {l.nivel} · {l.patente}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-sm font-bold text-neon-cyan">
                {formatarDuracao(l.minutos)}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {l.pontos.toLocaleString("pt-BR")} pts
              </p>
            </div>
          </div>
        );
      })}

      <p className="text-center text-xs text-muted-foreground">
        Ordenado por horas concluídas. Só aparecem nome do império, comandante, avatar, nível e
        pontos — telefone e código de acesso nunca saem do servidor.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Roteador de painel
 * ----------------------------------------------------------------------- */

export function conteudoDaZona(
  zona: ZonaId,
  dados: HubDados,
  ranking: { linhas: LinhaRanking[]; carregando: boolean },
): ReactNode {
  switch (zona) {
    case "ponte":
      return <PainelPonte dados={dados} />;
    case "estatisticas":
      return <PainelEstatisticas dados={dados} />;
    case "jogos":
      return <PainelJogos dados={dados} />;
    case "conquistas":
      return <PainelConquistas dados={dados} />;
    case "cofre":
      return <PainelCofre dados={dados} />;
    case "squad":
      return <PainelSquad dados={dados} />;
    case "ranking":
      return (
        <PainelRanking
          linhas={ranking.linhas}
          minhaPosicao={dados.ranking.posicao}
          carregando={ranking.carregando}
        />
      );
  }
}
