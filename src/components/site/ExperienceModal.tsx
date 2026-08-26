import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Station } from "@/lib/pulsar-data";
import { jogosPorEstacao, precoBRL } from "@/lib/pulsar-data";

const accentText: Record<Station["accent"], string> = {
  cyan: "text-neon-cyan",
  pink: "text-neon-pink",
  green: "text-neon-green",
};

const accentBg: Record<Station["accent"], string> = {
  cyan: "bg-neon-cyan",
  pink: "bg-neon-pink",
  green: "bg-neon-green",
};

export function ExperienceModal({
  station,
  onClose,
}: {
  station: Station | null;
  onClose: () => void;
}) {
  const jogos = station ? (jogosPorEstacao[station.id] ?? []) : [];

  return (
    <Dialog open={station !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card p-0 sm:rounded-none">
        {station && (
          <>
            <DialogTitle className="sr-only">{station.nome}</DialogTitle>
            <div className="relative">
              <img
                src={station.imagem}
                alt={`Estação ${station.nome} da Pulsar VR`}
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            </div>
            <div className="space-y-6 p-8 pt-2">
              <div>
                <span
                  className={`font-mono text-xs uppercase tracking-[0.3em] ${accentText[station.accent]}`}
                >
                  Entre no jogo
                </span>
                <h3 className="mt-2 font-display text-2xl font-black">{station.nome}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{station.descricao}</p>
              </div>

              <dl className="grid grid-cols-2 gap-4 border-y border-border py-6 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">Specs</dt>
                  <dd className="mt-1 font-medium">{station.specs}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">Idade</dt>
                  <dd className="mt-1 font-medium">{station.idadeRecomendada}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                    Duração
                  </dt>
                  <dd className="mt-1 font-medium">A partir de 1h</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">Preço</dt>
                  <dd className={`mt-1 font-display font-bold ${accentText[station.accent]}`}>
                    {precoBRL(station.precoHora)}/h
                  </dd>
                </div>
              </dl>

              {jogos.length > 0 && (
                <div>
                  <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                    Alguns jogos disponíveis
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {jogos.map((jogo) => (
                      <span
                        key={jogo}
                        className="border border-border px-3 py-1 text-xs text-muted-foreground"
                      >
                        {jogo}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to="/reservar"
                search={{ estacao: station.id }}
                onClick={onClose}
                className={`btn-skew block w-full py-4 text-center font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110 ${accentBg[station.accent]}`}
              >
                <span className="btn-skew-inner">RESERVAR {station.nome.toUpperCase()}</span>
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
