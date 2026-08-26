import type { Produto } from "@/lib/pulsar-data";
import { precoBRL, whatsappLink } from "@/lib/pulsar-data";
import { TiltCard } from "@/components/site/TiltCard";

export function ProductCard({
  produto,
  onAdd,
}: {
  produto: Produto;
  onAdd?: (produto: Produto) => void;
}) {
  return (
    <TiltCard className="tilt-glow group">
      <div className="glass-card relative mb-4 aspect-square overflow-hidden p-4 transition-colors group-hover:border-neon-orange/40">
        <img
          src={produto.imagem}
          alt={produto.nome}
          loading="lazy"
          width={800}
          height={800}
          className="size-full object-contain"
        />
        {onAdd ? (
          <button
            type="button"
            onClick={() => onAdd(produto)}
            className="absolute inset-x-0 bottom-0 bg-neon-orange py-3 text-center font-bold text-primary-foreground opacity-90 transition-opacity hover:opacity-100"
          >
            ADICIONAR
          </button>
        ) : (
          <a
            href={whatsappLink(`Olá! Quero comprar: ${produto.nome}`)}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-x-0 bottom-0 translate-y-full bg-neon-orange py-3 text-center font-bold text-primary-foreground transition-transform group-hover:translate-y-0 focus-visible:translate-y-0"
          >
            COMPRAR
          </a>
        )}
      </div>
      <h4 className="font-medium">{produto.nome}</h4>
      <p className="text-xs text-muted-foreground">{produto.detalhe}</p>
      <p className="font-bold text-neon-orange">{precoBRL(produto.preco)}</p>
    </TiltCard>
  );
}
