import type { Station } from "@/lib/pulsar-data";
import { precoBRL } from "@/lib/pulsar-data";
import { TiltCard } from "@/components/site/TiltCard";

const accentMap = {
  cyan: {
    hover: "hover:border-neon-cyan/50",
    price: "text-neon-cyan",
    button: "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-primary-foreground",
  },
  pink: {
    hover: "hover:border-neon-pink/50",
    price: "text-neon-pink",
    button: "border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-primary-foreground",
  },
  green: {
    hover: "hover:border-neon-green/50",
    price: "text-neon-green",
    button: "border-neon-green text-neon-green hover:bg-neon-green hover:text-primary-foreground",
  },
} as const;

export function StationCard({
  station,
  onSelect,
}: {
  station: Station;
  onSelect: (station: Station) => void;
}) {
  const accent = accentMap[station.accent];

  return (
    <TiltCard className="tilt-glow h-full">
      <div
        className={`glass-panel flex h-full flex-col overflow-hidden transition-colors ${accent.hover}`}
      >
        <div className="relative overflow-hidden">
          <img
            src={station.imagem}
            alt={`Estação ${station.nome} da Pulsar VR`}
            loading="lazy"
            width={1024}
            height={683}
            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-6">
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
          <p className="mb-6 flex-1 text-sm text-muted-foreground">{station.descricao}</p>
          <button
            type="button"
            onClick={() => onSelect(station)}
            className={`block border py-3 text-center font-display text-sm transition-all ${accent.button}`}
          >
            VER EXPERIÊNCIA
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
