import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { getDisponibilidadeDia, type StatusHorario } from "@/lib/disponibilidade.functions";
import { horarios, stations } from "@/lib/pulsar-data";

const STATUS_LABEL: Record<StatusHorario, string> = {
  disponivel: "Disponível",
  poucas_vagas: "Poucas vagas",
  lotado: "Lotado",
};

const STATUS_DOT: Record<StatusHorario, string> = {
  disponivel: "bg-neon-green",
  poucas_vagas: "bg-neon-orange",
  lotado: "bg-destructive",
};

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function TodaySection() {
  const buscar = useServerFn(getDisponibilidadeDia);
  const hoje = hojeISO();
  const horaAtual = new Date().getHours();

  const { data, isLoading } = useQuery({
    queryKey: ["disponibilidade", hoje],
    queryFn: () => buscar({ data: { data: hoje } }),
    staleTime: 60_000,
  });

  const horariosRestantes = horarios.filter((h) => Number(h.slice(0, 2)) >= horaAtual);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Ao vivo"
          title="HOJE NA PULSAR"
          subtitle="Disponibilidade em tempo real, direto do nosso sistema de reservas."
          accent="green"
        />

        {isLoading && <p className="text-sm text-muted-foreground">Carregando disponibilidade…</p>}

        {!isLoading && horariosRestantes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Encerramos por hoje. Volte amanhã ou{" "}
            <Link to="/reservar" className="text-neon-cyan underline underline-offset-4">
              reserve para outro dia
            </Link>
            .
          </p>
        )}

        {!isLoading && horariosRestantes.length > 0 && (
          <div className="space-y-6">
            {stations.map((station, i) => (
              <Reveal key={station.id} delay={i * 100} className="glass-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold uppercase tracking-widest">
                    {station.nome}
                  </h3>
                  <Link
                    to="/reservar"
                    search={{ estacao: station.id }}
                    className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-neon-cyan"
                  >
                    Reservar
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {horariosRestantes.map((h) => {
                    const status = data?.[station.id]?.[h] ?? "disponivel";
                    return (
                      <div
                        key={h}
                        className="flex shrink-0 items-center gap-2 border border-border px-3 py-2 text-xs"
                      >
                        <span className={`size-2 rounded-full ${STATUS_DOT[status]}`} />
                        <span className="font-medium">{h}</span>
                        <span className="text-muted-foreground">{STATUS_LABEL[status]}</span>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
