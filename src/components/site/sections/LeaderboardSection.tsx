import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trophy } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { listarRanking } from "@/lib/grupos.functions";

const ABAS = [
  { tipo: "squad" as const, label: "Squads", criarHref: "/squads/novo" as const },
  { tipo: "imperio" as const, label: "Impérios", criarHref: "/imperios/novo" as const },
];

function formatarHoras(minutos: number) {
  const horas = Math.floor(minutos / 60);
  if (horas === 0) return `${minutos} min`;
  return `${horas}h`;
}

export function LeaderboardSection() {
  const [aba, setAba] = useState<"squad" | "imperio">("squad");
  const atual = ABAS.find((a) => a.tipo === aba)!;
  const buscar = useServerFn(listarRanking);

  const { data: lista, isLoading } = useQuery({
    queryKey: ["ranking", aba, "home"],
    queryFn: () => buscar({ data: { tipo: aba, limit: 5 } }),
  });

  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionHeading
          eyebrow="Ranking da cidade"
          title="PULSAR LEADERBOARD"
          subtitle="Squads e impérios com mais horas jogadas — calculado só a partir de reservas realmente pagas."
          align="center"
          accent="cyan"
        />

        <Reveal delay={100} className="flex justify-center gap-2">
          {ABAS.map((a) => (
            <button
              key={a.tipo}
              type="button"
              onClick={() => setAba(a.tipo)}
              className={`border px-6 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all ${
                aba === a.tipo
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                  : "border-border text-muted-foreground hover:border-neon-cyan/40"
              }`}
            >
              {a.label}
            </button>
          ))}
        </Reveal>

        <div className="mt-8">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

          {!isLoading && lista?.length === 0 && (
            <div className="glass-panel space-y-4 p-10">
              <Trophy className="mx-auto size-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
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
            <ol className="space-y-2 text-left">
              {lista.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={aba === "squad" ? "/squads/$slug" : "/imperios/$slug"}
                    params={{ slug: g.slug }}
                    className="glass-card flex items-center gap-4 p-3 transition-colors hover:border-neon-cyan/40"
                  >
                    <span className="w-7 shrink-0 text-center font-display text-sm font-bold text-neon-cyan">
                      #{g.posicao}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">{g.nome}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatarHoras(g.total_minutos_jogados)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        <Link
          to="/ranking"
          className="mt-8 inline-block text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-neon-cyan"
        >
          Ver ranking completo
        </Link>
      </div>
    </section>
  );
}
