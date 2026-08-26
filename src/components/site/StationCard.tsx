import { Link } from "@tanstack/react-router";
import type { Station } from "@/lib/pulsar-data";
import { precoBRL } from "@/lib/pulsar-data";

const accentMap = {
  cyan: {
    hover: "hover:border-neon-cyan/50",
    price: "text-neon-cyan",
    button:
      "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-primary-foreground",
  },
  pink: {
    hover: "hover:border-neon-pink/50",
    price: "text-neon-pink",
    button:
      "border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-primary-foreground",
  },
  green: {
    hover: "hover:border-neon-green/50",
    price: "text-neon-green",
    button:
      "border-neon-green text-neon-green hover:bg-neon-green hover:text-primary-foreground",
  },
} as const;

export function StationCard({ station }: { station: Station }) {
  const accent = accentMap[station.accent];

  return (
    <div className={`glass-card overflow-hidden transition-all ${accent.hover}`}>
      <img
        src={station.imagem}
        alt={`Estação ${station.nome} da Pulsar VR`}
        loading="lazy"
        width={1024}
        height={683}
        className="aspect-video w-full object-cover"
      />
      <div className="p-6">
        <div className="mb-1 flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold">{station.nome}</h3>
          <span className={`shrink-0 font-bold ${accent.price}`}>
            {precoBRL(station.precoHora)}
            <span className="text-xs font-normal text-muted-foreground">/h</span>
          </span>
        </div>
        <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          {station.specs}
        </p>
        <p className="mb-6 text-sm text-muted-foreground">{station.descricao}</p>
        <Link
          to="/reservar"
          search={{ estacao: station.id }}
          className={`block border py-3 text-center font-display text-sm transition-all ${accent.button}`}
        >
          AGENDAR HORÁRIO
        </Link>
      </div>
    </div>
  );
}
