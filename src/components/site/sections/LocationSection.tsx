import { Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { BUSINESS, whatsappLink } from "@/lib/pulsar-data";

const itens = [
  {
    icone: MapPin,
    titulo: "Endereço",
    texto:
      BUSINESS.enderecoCompleto ??
      `${BUSINESS.cidade}, ${BUSINESS.estado} — endereço completo em breve`,
  },
  { icone: Clock, titulo: "Horário", texto: BUSINESS.horario },
  { icone: MessageCircle, titulo: "WhatsApp", texto: BUSINESS.telefoneExibicao },
  { icone: Instagram, titulo: "Instagram", texto: BUSINESS.instagram },
];

export function LocationSection({ asPage = false }: { asPage?: boolean }) {
  return (
    <section
      id="localizacao"
      className={`relative scroll-mt-24 ${asPage ? "" : "bg-card/30 py-24"}`}
    >
      <div className={asPage ? "" : "mx-auto max-w-7xl px-6"}>
        <SectionHeading
          eyebrow="Onde estamos"
          title="ENCONTRE A PULSAR"
          subtitle="Estamos te esperando. Chame no WhatsApp ou apareça direto na loja."
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {itens.map((item, i) => (
                <Reveal key={item.titulo} delay={i * 80} className="glass-card flex gap-4 p-6">
                  <item.icone className="size-6 shrink-0 text-neon-cyan" />
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-widest">
                      {item.titulo}
                    </h3>
                    <p className="mt-1 text-muted-foreground">{item.texto}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={whatsappLink("Olá! Queria saber mais sobre a Pulsar VR.")}
                target="_blank"
                rel="noreferrer"
                className="btn-skew inline-block bg-neon-cyan px-8 py-4 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
              >
                <span className="btn-skew-inner">CHAMAR NO WHATSAPP</span>
              </a>
              <a
                href={BUSINESS.googleMapsBuscaUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-skew inline-block border border-border px-8 py-4 font-display text-sm font-bold transition-all hover:border-neon-cyan hover:text-neon-cyan"
              >
                <span className="btn-skew-inner">COMO CHEGAR</span>
              </a>
            </div>
          </div>

          <Reveal delay={200} className="glass-card overflow-hidden">
            <iframe
              title={`Mapa aproximado de ${BUSINESS.cidade}/${BUSINESS.estado}`}
              src={BUSINESS.osmEmbedUrl}
              className="h-80 w-full grayscale invert-[0.92] contrast-[1.1] lg:h-full"
              loading="lazy"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
