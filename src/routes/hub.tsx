import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { NavePulsar, ZONAS, type ZonaId } from "@/components/site/hub/NavePulsar";
import { AcessoHub } from "@/components/site/hub/AcessoHub";
import { conteudoDaZona, type HubDados, type LinhaRanking } from "@/components/site/hub/PaineisHub";
import { carregarHub, listarRankingJogadores, sairDoHub } from "@/lib/hub.functions";
import { CONQUISTAS, formatarDuracao } from "@/lib/progressao";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Meu Império | Pulsar VR" },
      {
        name: "description",
        content:
          "Sua central de comando na Pulsar VR: horas jogadas, nível, conquistas, créditos e ranking, tudo a partir das suas reservas reais.",
      },
      // Área pessoal: não faz sentido em buscador.
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Hub,
});

const ACCENT_TEXT: Record<string, string> = {
  cyan: "text-neon-cyan",
  pink: "text-neon-pink",
  purple: "text-neon-purple",
  green: "text-neon-green",
  orange: "text-neon-orange",
};

function Hub() {
  const [zona, setZona] = useState<ZonaId | null>(null);
  const [novasVistas, setNovasVistas] = useState(false);
  const queryClient = useQueryClient();

  const buscarHub = useServerFn(carregarHub);
  const buscarRanking = useServerFn(listarRankingJogadores);
  const sair = useServerFn(sairDoHub);

  const {
    data: hub,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hub"],
    queryFn: () => buscarHub(),
    retry: false,
  });

  const autenticado = hub?.autenticado === true;

  const { data: ranking, isLoading: carregandoRanking } = useQuery({
    queryKey: ["hub-ranking"],
    queryFn: () => buscarRanking({ data: { limit: 20 } }),
    enabled: autenticado && zona === "ranking",
  });

  const conquistasNovas = autenticado ? (hub.conquistasNovas ?? []) : [];

  // A notificação de conquista some sozinha; não bloqueia navegação.
  useEffect(() => {
    if (conquistasNovas.length === 0 || novasVistas) return;
    const t = setTimeout(() => setNovasVistas(true), 9000);
    return () => clearTimeout(t);
  }, [conquistasNovas.length, novasVistas]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <div className="glass-card animate-pulse p-16 text-center text-sm text-muted-foreground">
          Estabelecendo conexão com a nave…
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-32">
        <div className="glass-panel p-8 text-center">
          <h1 className="font-display text-2xl font-black">NAVE INDISPONÍVEL</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Não conseguimos falar com o servidor do HUB. Se isso acabou de ser publicado, a migração
            do banco (<code className="text-foreground">20260910120000_hub_pulsar.sql</code>) ainda
            pode não ter sido aplicada.
          </p>
        </div>
      </main>
    );
  }

  if (!autenticado) {
    return (
      <main className="relative overflow-hidden pb-24 pt-32">
        <div className="halo-cyan absolute left-1/2 top-20 size-[600px] -translate-x-1/2" />
        <div className="relative px-6">
          <AcessoHub onEntrou={() => queryClient.invalidateQueries({ queryKey: ["hub"] })} />
        </div>
      </main>
    );
  }

  const dados = hub as unknown as HubDados;
  const zonaAtual = ZONAS.find((z) => z.id === zona) ?? null;

  // Zonas que merecem um pulso: conquista nova, créditos disponíveis.
  const destaques: ZonaId[] = [
    ...(conquistasNovas.length > 0 && !novasVistas ? (["conquistas"] as ZonaId[]) : []),
    ...(dados.creditos.saldo > 0 ? (["cofre"] as ZonaId[]) : []),
  ];

  return (
    <main className="relative overflow-hidden pb-24 pt-28">
      <div className="halo-purple absolute right-0 top-40 size-[520px] translate-x-1/3" />
      <div className="halo-cyan absolute left-0 top-96 size-[460px] -translate-x-1/2" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Cabeçalho */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
              Central de comando
            </p>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-5xl">
              {dados.perfil.imperioNome.toUpperCase()}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Comandante {dados.perfil.comandante} · Nível {dados.progresso.nivel} ·{" "}
              {dados.progresso.patente} · {formatarDuracao(dados.estatisticas.minutosJogados)} em
              voo
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await sair({ data: undefined });
              await queryClient.invalidateQueries({ queryKey: ["hub"] });
            }}
            className="flex items-center gap-2 border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-neon-pink hover:text-neon-pink"
          >
            <LogOut className="size-3.5" />
            Sair da nave
          </button>
        </header>

        {/* Barra de XP sempre visível */}
        <div className="glass-card mb-10 flex flex-col gap-2 p-5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-mono uppercase tracking-widest text-muted-foreground">
              Progressão
            </span>
            <span className="font-display font-bold">
              {dados.progresso.maximo
                ? "NÍVEL MÁXIMO"
                : `${dados.progresso.xpNoNivel.toLocaleString("pt-BR")} / ${dados.progresso.xpDoNivel.toLocaleString("pt-BR")} XP`}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden bg-secondary">
            <div
              className="h-full bg-gradient-accent transition-[width] duration-1000 ease-out"
              style={{ width: `${dados.progresso.percentual}%` }}
            />
          </div>
        </div>

        {/* A nave */}
        <div className="mx-auto max-w-3xl">
          <NavePulsar onSelecionar={setZona} destaques={destaques} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground lg:hidden">
          Toque em uma área da nave — ou escolha abaixo.
        </p>
        <p className="mt-4 hidden text-center text-xs text-muted-foreground lg:block">
          Passe o mouse pelas áreas da nave e clique para abrir o painel.
        </p>

        {/* Acesso alternativo — é o layout principal no celular */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ZONAS.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setZona(z.id)}
              className="glass-card flex flex-col gap-1 p-4 text-left transition-all hover:border-neon-cyan/50"
            >
              <span
                className={`font-display text-xs font-bold tracking-widest ${ACCENT_TEXT[z.accent]}`}
              >
                {z.nome}
              </span>
              <span className="text-xs text-muted-foreground">{z.descricao}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Painel holográfico */}
      <Dialog open={zona !== null} onOpenChange={(aberto) => !aberto && setZona(null)}>
        <DialogContent className="glass-panel max-h-[85vh] max-w-2xl overflow-y-auto border-neon-cyan/40 bg-card/95">
          <DialogTitle
            className={`font-display text-lg font-black tracking-widest ${
              zonaAtual ? ACCENT_TEXT[zonaAtual.accent] : ""
            }`}
          >
            [ {zonaAtual?.nome ?? ""} ]
          </DialogTitle>
          <DialogDescription className="sr-only">
            {zonaAtual?.descricao ?? "Painel do HUB Pulsar"}
          </DialogDescription>

          <div className="mt-4">
            {zona &&
              conteudoDaZona(zona, dados, {
                linhas: (ranking ?? []) as LinhaRanking[],
                carregando: carregandoRanking,
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notificação de conquista nova */}
      {conquistasNovas.length > 0 && !novasVistas && (
        <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm sm:left-auto sm:right-6">
          <button
            type="button"
            onClick={() => {
              setZona("conquistas");
              setNovasVistas(true);
            }}
            className="glass-panel flex w-full items-center gap-4 border-neon-orange/60 p-4 text-left"
            style={{ animation: "pulse-soft 2.4s ease-in-out 3" }}
          >
            <Trophy className="size-8 shrink-0 text-neon-orange" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neon-orange">
                Conquista desbloqueada
              </p>
              <p className="truncate font-display text-sm font-bold">
                {CONQUISTAS.find((c) => c.id === conquistasNovas[0])?.nome ?? "Nova conquista"}
                {conquistasNovas.length > 1 && ` +${conquistasNovas.length - 1}`}
              </p>
            </div>
          </button>
        </div>
      )}
    </main>
  );
}
