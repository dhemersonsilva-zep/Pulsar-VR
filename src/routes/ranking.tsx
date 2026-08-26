import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trophy } from "lucide-react";
import { listarRanking } from "@/lib/grupos.functions";
import { BUSINESS } from "@/lib/pulsar-data";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking da Cidade | Pulsar VR" },
      {
        name: "description",
        content:
          "Squads e impérios com mais horas jogadas na Pulsar VR, direto do sistema de reservas.",
      },
    ],
  }),
  component: Ranking,
});

const ABAS = [
  { tipo: "squad" as const, label: "Squads", criarHref: "/squads/novo" as const },
  { tipo: "imperio" as const, label: "Impérios", criarHref: "/imperios/novo" as const },
];

function formatarHoras(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h ${resto}min`;
}

function Ranking() {
  const [aba, setAba] = useState<"squad" | "imperio">("squad");
  const buscar = useServerFn(listarRanking);
  const atual = ABAS.find((a) => a.tipo === aba)!;

  const { data: lista, isLoading } = useQuery({
    queryKey: ["ranking", aba],
    queryFn: () => buscar({ data: { tipo: aba, limit: 20 } }),
  });

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <h1 className="font-display text-4xl font-black">
        RANKING DE <span className="text-neon-cyan">{BUSINESS.cidade.toUpperCase()}</span>
      </h1>
      <p className="mt-3 text-muted-foreground">
        Ordenado pelas horas jogadas em reservas realmente pagas na Pulsar VR.
      </p>

      <div className="mt-10 flex gap-2">
        {ABAS.map((a) => (
          <button
            key={a.tipo}
            type="button"
            onClick={() => setAba(a.tipo)}
            className={`border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all ${
              aba === a.tipo
                ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                : "border-border text-muted-foreground hover:border-neon-cyan/40"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

        {!isLoading && lista?.length === 0 && (
          <div className="glass-card space-y-4 p-10 text-center">
            <Trophy className="mx-auto size-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Ninguém no ranking de {atual.label.toLowerCase()} ainda. Seja o primeiro da cidade!
            </p>
            <Link
              to={atual.criarHref}
              className="inline-block border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan hover:text-neon-cyan"
            >
              {aba === "squad" ? "Criar squad" : "Fundar império"}
            </Link>
          </div>
        )}

        {!isLoading && lista && lista.length > 0 && (
          <ol className="space-y-3">
            {lista.map((g) => (
              <li key={g.slug}>
                <Link
                  to={aba === "squad" ? "/squads/$slug" : "/imperios/$slug"}
                  params={{ slug: g.slug }}
                  className="glass-card flex items-center gap-4 p-4 transition-colors hover:border-neon-cyan/40"
                >
                  <span className="w-8 shrink-0 text-center font-display text-lg font-bold text-neon-cyan">
                    #{g.posicao}
                  </span>
                  {g.bannerUrl ? (
                    <img src={g.bannerUrl} alt="" className="size-12 shrink-0 object-cover" />
                  ) : (
                    <div className="bg-void size-12 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold">{g.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatarHoras(g.total_minutos_jogados)} · {g.jogos_realizados}{" "}
                      {g.jogos_realizados === 1 ? "sessão" : "sessões"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
